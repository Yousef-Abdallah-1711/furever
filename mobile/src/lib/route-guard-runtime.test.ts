import { describe, expect, it, jest } from "@jest/globals";
import {
  loadProtectedRouteRedirect,
  type RouteGuardDependencies,
} from "./route-guard-runtime";

function createDependencies(
  overrides: Partial<RouteGuardDependencies> = {},
): RouteGuardDependencies {
  return {
    currentVersion: "1.0.0",
    getUser: async () => ({ user: { id: "owner-1" }, failed: false }),
    getProfile: async () => ({
      profile: {
        status: "active",
        deleted_at: null,
        full_name: "Owner",
        city_id: "city-cairo",
      },
      failed: false,
    }),
    getConsentTypes: async () => ({
      types: ["terms", "privacy"],
      failed: false,
    }),
    getConfiguration: async () => ({
      response: {
        app_config: {
          min_mobile_version: { version: "1.0.0" },
          maintenance: { enabled: false },
        },
      },
      failed: false,
    }),
    ...overrides,
  };
}

describe("mobile route guard data loading", () => {
  it("allows a complete authenticated profile after all checks pass", async () => {
    await expect(
      loadProtectedRouteRedirect(createDependencies()),
    ).resolves.toBeNull();
  });

  it("routes a missing session away from private screens", async () => {
    const getProfile = jest.fn(async () => ({ profile: null, failed: true }));
    const dependencies = createDependencies({
      getUser: async () => ({ user: null, failed: false }),
      getProfile,
    });
    await expect(loadProtectedRouteRedirect(dependencies)).resolves.toBe(
      "/welcome",
    );
    expect(getProfile).not.toHaveBeenCalled();
  });

  it("routes an Auth error away from private screens", async () => {
    const getProfile = jest.fn(async () => ({ profile: null, failed: true }));
    const dependencies = createDependencies({
      getUser: async () => ({ user: null, failed: true }),
      getProfile,
    });
    await expect(loadProtectedRouteRedirect(dependencies)).resolves.toBe(
      "/welcome",
    );
    expect(getProfile).not.toHaveBeenCalled();
  });

  it("routes incomplete profiles to the completion screen", async () => {
    const dependencies = createDependencies({
      getConsentTypes: async () => ({ types: ["terms"], failed: false }),
    });
    await expect(loadProtectedRouteRedirect(dependencies)).resolves.toBe(
      "/complete-profile",
    );
  });

  it("fails closed on profile, consent, or configuration errors", async () => {
    await expect(
      loadProtectedRouteRedirect(
        createDependencies({
          getProfile: async () => ({ profile: null, failed: true }),
        }),
      ),
    ).resolves.toBe("/welcome");
    await expect(
      loadProtectedRouteRedirect(
        createDependencies({
          getConsentTypes: async () => ({ types: [], failed: true }),
        }),
      ),
    ).resolves.toBe("/welcome");
    await expect(
      loadProtectedRouteRedirect(
        createDependencies({
          getConfiguration: async () => ({ response: null, failed: true }),
        }),
      ),
    ).resolves.toBe("/welcome");
  });

  it("preserves maintenance and minimum-version destinations", async () => {
    await expect(
      loadProtectedRouteRedirect(
        createDependencies({
          getConfiguration: async () => ({
            response: {
              app_config: {
                min_mobile_version: { version: "1.0.0" },
                maintenance: { enabled: true },
              },
            },
            failed: false,
          }),
        }),
      ),
    ).resolves.toBe("/maintenance");
    await expect(
      loadProtectedRouteRedirect(
        createDependencies({
          currentVersion: "1.0.0",
          getConfiguration: async () => ({
            response: {
              app_config: {
                min_mobile_version: { version: "1.1.0" },
                maintenance: { enabled: false },
              },
            },
            failed: false,
          }),
        }),
      ),
    ).resolves.toBe("/force-update");
  });
});
