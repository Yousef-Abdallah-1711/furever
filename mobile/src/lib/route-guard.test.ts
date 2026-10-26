import { describe, expect, it } from "@jest/globals";
import { getProtectedRouteRedirect, type RouteGuardState } from "./route-guard";

const valid: RouteGuardState = {
  session: "valid",
  profile: "complete",
  configuration: "loaded",
  currentVersion: "1.0.0",
  minimumVersion: { version: "1.0.0" },
  maintenanceEnabled: false,
};

describe("mobile protected route guard", () => {
  it("allows an active, complete profile when configuration is available", () => {
    expect(getProtectedRouteRedirect(valid)).toBeNull();
  });

  it.each(["missing", "expired", "unknown"] as const)(
    "routes %s sessions to welcome",
    (session) => {
      expect(getProtectedRouteRedirect({ ...valid, session })).toBe("/welcome");
    },
  );

  it.each(["suspended", "deleted", "unknown"] as const)(
    "routes %s profiles to welcome",
    (profile) => {
      expect(getProtectedRouteRedirect({ ...valid, profile })).toBe("/welcome");
    },
  );

  it("routes incomplete profiles to completion", () => {
    expect(getProtectedRouteRedirect({ ...valid, profile: "incomplete" })).toBe(
      "/complete-profile",
    );
  });

  it("fails closed when configuration cannot be loaded", () => {
    expect(
      getProtectedRouteRedirect({ ...valid, configuration: "failed" }),
    ).toBe("/welcome");
    expect(getProtectedRouteRedirect({ ...valid, currentVersion: "" })).toBe(
      "/welcome",
    );
  });

  it("routes maintenance and minimum-version states without affecting valid users", () => {
    expect(
      getProtectedRouteRedirect({ ...valid, maintenanceEnabled: true }),
    ).toBe("/maintenance");
    expect(
      getProtectedRouteRedirect({
        ...valid,
        minimumVersion: { version: "1.1.0" },
      }),
    ).toBe("/force-update");
    expect(
      getProtectedRouteRedirect({
        ...valid,
        minimumVersion: { version: "invalid" },
      }),
    ).toBe("/welcome");
  });
});
