import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { prepareTotp, signInDashboard, verifyTotp } from "./dashboard-auth";

function fakeClient(auth: Record<string, unknown>) {
  return { auth } as unknown as SupabaseClient;
}

describe("dashboard sign-in", () => {
  it("routes clinic staff to the clinic portal and admins through the MFA gate", async () => {
    const signInWithPassword = vi
      .fn()
      .mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    const getClaims = vi.fn().mockResolvedValue({
      data: { claims: { user_role: "admin" } },
      error: null,
    });
    const admin = fakeClient({ signInWithPassword, getClaims });
    expect(
      await signInDashboard(admin, "admin@example.test", "password"),
    ).toEqual({ ok: true, destination: "/admin" });

    getClaims.mockResolvedValue({
      data: { claims: { user_role: "clinic_staff" } },
      error: null,
    });
    expect(
      await signInDashboard(admin, "staff@example.test", "password"),
    ).toEqual({ ok: true, destination: "/clinic" });
  });

  it("does not reveal credentials or role details on sign-in errors", async () => {
    const client = fakeClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null },
        error: new Error("invalid"),
      }),
      getClaims: vi.fn(),
    });
    expect(await signInDashboard(client, "x@example.test", "wrong")).toEqual({
      ok: false,
    });
  });
});

describe("dashboard TOTP", () => {
  it("cleans abandoned enrollments and creates a fresh TOTP factor", async () => {
    const unenroll = vi.fn().mockResolvedValue({ error: null });
    const enroll = vi.fn().mockResolvedValue({
      data: {
        id: "new-factor",
        totp: { qr_code: "data:image/svg+xml,qr", secret: "secret" },
      },
      error: null,
    });
    const client = fakeClient({
      mfa: {
        listFactors: vi.fn().mockResolvedValue({
          data: {
            all: [
              { id: "old-factor", factor_type: "totp", status: "unverified" },
            ],
          },
          error: null,
        }),
        unenroll,
        enroll,
      },
    });
    await expect(prepareTotp(client)).resolves.toEqual({
      kind: "enroll",
      factorId: "new-factor",
      qrCode: "data:image/svg+xml,qr",
      secret: "secret",
    });
    expect(unenroll).toHaveBeenCalledWith({ factorId: "old-factor" });
    expect(enroll).toHaveBeenCalledWith({
      factorType: "totp",
      friendlyName: "FurEver dashboard authenticator",
    });
  });

  it("reuses a verified factor instead of enrolling another one", async () => {
    const enroll = vi.fn();
    const client = fakeClient({
      mfa: {
        listFactors: vi.fn().mockResolvedValue({
          data: {
            all: [
              {
                id: "verified-factor",
                factor_type: "totp",
                status: "verified",
              },
            ],
          },
          error: null,
        }),
        enroll,
      },
    });
    await expect(prepareTotp(client)).resolves.toEqual({
      kind: "verify",
      factorId: "verified-factor",
    });
    expect(enroll).not.toHaveBeenCalled();
  });

  it("requires six digits and verifies only after a server challenge", async () => {
    const challenge = vi
      .fn()
      .mockResolvedValue({ data: { id: "challenge-1" }, error: null });
    const verify = vi
      .fn()
      .mockResolvedValue({ data: { access_token: "fresh-aal2" }, error: null });
    const client = fakeClient({ mfa: { challenge, verify } });
    await expect(verifyTotp(client, "factor-1", "12345")).resolves.toBe(false);
    expect(challenge).not.toHaveBeenCalled();
    await expect(verifyTotp(client, "factor-1", "123456")).resolves.toBe(true);
    expect(challenge).toHaveBeenCalledWith({ factorId: "factor-1" });
    expect(verify).toHaveBeenCalledWith({
      factorId: "factor-1",
      challengeId: "challenge-1",
      code: "123456",
    });
  });
});
