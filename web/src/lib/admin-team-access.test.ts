import { describe, expect, it } from "vitest";
import { canViewPlatformAdminDirectory } from "./admin-team-access";

describe("platform admin directory access", () => {
  it("requires an authenticated super admin in both the JWT and current profile", () => {
    expect(
      canViewPlatformAdminDirectory({
        jwtRole: "super_admin",
        profileRole: "super_admin",
        hasAuthenticatedUser: true,
      }),
    ).toBe(true);
  });

  it.each([
    { jwtRole: "admin", profileRole: "admin", hasAuthenticatedUser: true },
    { jwtRole: "super_admin", profileRole: "admin", hasAuthenticatedUser: true },
    { jwtRole: "super_admin", profileRole: "super_admin", hasAuthenticatedUser: false },
  ])("rejects stale or insufficient identity state: %o", (input) => {
    expect(canViewPlatformAdminDirectory(input)).toBe(false);
  });
});
