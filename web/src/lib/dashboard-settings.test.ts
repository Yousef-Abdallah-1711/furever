import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import {
  enrollOwnTotp,
  listOwnTotpFactors,
  removeOwnTotp,
  updateOwnDisplayName,
  updateOwnPassword,
} from "./dashboard-settings";

function fakeClient(auth: Record<string, unknown>, from?: unknown) {
  return { auth, from } as unknown as SupabaseClient;
}

describe("dashboard personal settings", () => {
  it("updates only the signed-in user's profile name and requires a returned row", async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: "u1" }, error: null });
    const select = vi.fn(() => ({ maybeSingle }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    const client = fakeClient(
      {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "u1" } }, error: null }),
      },
      vi.fn(() => ({ update })),
    );
    await expect(updateOwnDisplayName(client, "Amina")).resolves.toBe(true);
    expect(update).toHaveBeenCalledWith({ full_name: "Amina" });
    expect(eq).toHaveBeenCalledWith("id", "u1");

    maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(updateOwnDisplayName(client, "Amina")).resolves.toBe(false);
  });

  it("uses Supabase Auth password update and enforces the configured minimum", async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    const client = fakeClient({ updateUser });
    await expect(updateOwnPassword(client, "short")).resolves.toBe(false);
    expect(updateUser).not.toHaveBeenCalled();
    await expect(updateOwnPassword(client, "sixsix")).resolves.toBe(true);
    expect(updateUser).toHaveBeenCalledWith({ password: "sixsix" });
  });

  it("lists only TOTP factors and preserves status for the UI", async () => {
    const client = fakeClient({
      mfa: {
        listFactors: vi.fn().mockResolvedValue({
          data: {
            all: [
              {
                id: "t1",
                factor_type: "totp",
                friendly_name: "Phone",
                status: "verified",
              },
              {
                id: "p1",
                factor_type: "phone",
                friendly_name: "SMS",
                status: "verified",
              },
            ],
          },
          error: null,
        }),
      },
    });
    await expect(listOwnTotpFactors(client)).resolves.toEqual([
      { id: "t1", friendly_name: "Phone", status: "verified" },
    ]);
  });

  it("enrolls TOTP through Auth and returns its local QR and secret", async () => {
    const enroll = vi.fn().mockResolvedValue({
      data: {
        id: "t1",
        totp: { qr_code: "data:image/svg+xml,qr", secret: "secret" },
      },
      error: null,
    });
    const client = fakeClient({
      mfa: {
        listFactors: vi
          .fn()
          .mockResolvedValue({ data: { all: [] }, error: null }),
        enroll,
      },
    });
    await expect(enrollOwnTotp(client)).resolves.toEqual({
      factorId: "t1",
      qrCode: "data:image/svg+xml,qr",
      secret: "secret",
    });
    expect(enroll).toHaveBeenCalledWith({
      factorType: "totp",
      friendlyName: "FurEver dashboard authenticator",
    });
  });

  it("requires a six-digit proof before removing a verified TOTP factor", async () => {
    const challenge = vi
      .fn()
      .mockResolvedValue({ data: { id: "c1" }, error: null });
    const verify = vi.fn().mockResolvedValue({ error: null });
    const unenroll = vi.fn().mockResolvedValue({ error: null });
    const client = fakeClient({
      mfa: {
        listFactors: vi.fn().mockResolvedValue({
          data: {
            all: [{ id: "t1", factor_type: "totp", status: "verified" }],
          },
          error: null,
        }),
        challenge,
        verify,
        unenroll,
      },
    });
    await expect(removeOwnTotp(client, "t1", "12x456")).resolves.toBe(false);
    expect(challenge).not.toHaveBeenCalled();
    await expect(removeOwnTotp(client, "t1", "123456")).resolves.toBe(true);
    expect(verify).toHaveBeenCalledWith({
      factorId: "t1",
      challengeId: "c1",
      code: "123456",
    });
    expect(unenroll).toHaveBeenCalledWith({ factorId: "t1" });
  });
});
