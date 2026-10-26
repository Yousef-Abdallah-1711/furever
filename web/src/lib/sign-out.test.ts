import { describe, expect, it, vi } from "vitest";
import { signOutAndReturnToLogin } from "./sign-out";

describe("signOutAndReturnToLogin", () => {
  it("navigates only after Supabase signs the session out", async () => {
    const navigate = vi.fn();
    await expect(
      signOutAndReturnToLogin(
        { auth: { signOut: async () => ({ error: null }) } },
        navigate,
      ),
    ).resolves.toBe(true);
    expect(navigate).toHaveBeenCalledOnce();
  });

  it("does not navigate when Supabase reports a sign-out failure", async () => {
    const navigate = vi.fn();
    await expect(
      signOutAndReturnToLogin(
        { auth: { signOut: async () => ({ error: new Error("failed") }) } },
        navigate,
      ),
    ).resolves.toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("fails safely if the sign-out call throws", async () => {
    const navigate = vi.fn();
    await expect(
      signOutAndReturnToLogin(
        {
          auth: {
            signOut: async () => {
              throw new Error("offline");
            },
          },
        },
        navigate,
      ),
    ).resolves.toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
