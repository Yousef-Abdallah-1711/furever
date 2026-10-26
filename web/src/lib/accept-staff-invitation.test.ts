import { describe, expect, it, vi } from "vitest";
import {
  acceptStaffInvitation,
  type InvitationAcceptanceClient,
} from "./accept-staff-invitation";

function setup(
  overrides: Partial<{
    getUser: InvitationAcceptanceClient["auth"]["getUser"];
    updateUser: InvitationAcceptanceClient["auth"]["updateUser"];
    rpc: InvitationAcceptanceClient["rpc"];
    refreshSession: InvitationAcceptanceClient["auth"]["refreshSession"];
    getClaims: InvitationAcceptanceClient["auth"]["getClaims"];
  }> = {},
) {
  const calls: string[] = [];
  const client: InvitationAcceptanceClient = {
    auth: {
      getUser:
        overrides.getUser ??
        (async () => {
          calls.push("user");
          return { data: { user: { id: "user-1" } }, error: null };
        }),
      updateUser:
        overrides.updateUser ??
        (async () => {
          calls.push("password");
          return { error: null };
        }),
      refreshSession:
        overrides.refreshSession ??
        (async () => {
          calls.push("refresh");
          return { error: null };
        }),
      getClaims:
        overrides.getClaims ??
        (async () => {
          calls.push("claims");
          return {
            data: { claims: { user_role: "clinic_staff" } },
            error: null,
          };
        }),
    },
    rpc:
      overrides.rpc ??
      (async (name) => {
        calls.push(name);
        return { data: { status: "accepted" }, error: null };
      }),
  };
  return { client, calls };
}

describe("acceptStaffInvitation", () => {
  it("sets the password, accepts, refreshes and verifies the role before navigation", async () => {
    const { client, calls } = setup();
    const navigate = vi.fn(() => calls.push("navigate"));
    await expect(
      acceptStaffInvitation(client, "correct horse", "correct horse", navigate),
    ).resolves.toEqual({ ok: true });
    expect(calls).toEqual([
      "user",
      "password",
      "accept_staff_invitation",
      "refresh",
      "claims",
      "navigate",
    ]);
  });

  it("rejects a password mismatch before making auth requests", async () => {
    const { client, calls } = setup();
    await expect(
      acceptStaffInvitation(
        client,
        "one-password",
        "another-password",
        vi.fn(),
      ),
    ).resolves.toEqual({ ok: false, reason: "password_mismatch" });
    expect(calls).toEqual([]);
  });

  it("requires an authenticated invite session", async () => {
    const { client, calls } = setup({
      getUser: async () => ({ data: { user: null }, error: null }),
    });
    await expect(
      acceptStaffInvitation(client, "correct horse", "correct horse", vi.fn()),
    ).resolves.toEqual({ ok: false, reason: "session_missing" });
    expect(calls).toEqual([]);
  });

  it("does not accept the invitation if updating the password fails", async () => {
    const { client, calls } = setup({
      updateUser: async () => ({ error: new Error("weak password") }),
    });
    await expect(
      acceptStaffInvitation(client, "correct horse", "correct horse", vi.fn()),
    ).resolves.toEqual({ ok: false, reason: "acceptance_failed" });
    expect(calls).toEqual(["user"]);
  });

  it("does not navigate if invitation acceptance fails", async () => {
    const { client, calls } = setup({
      rpc: async () => ({ data: null, error: new Error("expired") }),
    });
    const navigate = vi.fn();
    await expect(
      acceptStaffInvitation(client, "correct horse", "correct horse", navigate),
    ).resolves.toEqual({ ok: false, reason: "acceptance_failed" });
    expect(navigate).not.toHaveBeenCalled();
    expect(calls).toEqual(["user", "password"]);
  });

  it("does not navigate until the refreshed session contains the staff role", async () => {
    const { client } = setup({
      getClaims: async () => ({
        data: { claims: { user_role: "owner" } },
        error: null,
      }),
    });
    const navigate = vi.fn();
    await expect(
      acceptStaffInvitation(client, "correct horse", "correct horse", navigate),
    ).resolves.toEqual({ ok: false, reason: "acceptance_failed" });
    expect(navigate).not.toHaveBeenCalled();
  });
});
