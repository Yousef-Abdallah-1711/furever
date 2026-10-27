import {
  getProfileGuardState,
  getProtectedRouteRedirect,
  type GuardProfile,
  type GuardRoute,
} from "./route-guard";

type AuthUser = { id: string };
type AppConfigResponse = {
  app_config?: {
    maintenance?: unknown;
    min_mobile_version?: unknown;
  };
};

export type RouteGuardDependencies = {
  currentVersion: string;
  getUser: () => Promise<{ user: AuthUser | null; failed: boolean }>;
  getProfile: (userId: string) => Promise<{
    profile: GuardProfile | null;
    failed: boolean;
  }>;
  getConsentTypes: (userId: string) => Promise<{
    types: string[];
    failed: boolean;
  }>;
  getConfiguration: () => Promise<{
    response: AppConfigResponse | null;
    failed: boolean;
  }>;
};

function configurationState(response: AppConfigResponse | null, failed: boolean) {
  const config = response?.app_config;
  const maintenance = config?.maintenance;
  const maintenanceEnabled =
    typeof maintenance === "object" && maintenance !== null
      ? (maintenance as Record<string, unknown>).enabled
      : undefined;
  const minimumVersion = config?.min_mobile_version;
  const valid =
    !failed &&
    typeof config === "object" &&
    config !== null &&
    (maintenance === undefined || typeof maintenanceEnabled === "boolean") &&
    (minimumVersion === undefined ||
      (typeof minimumVersion === "object" &&
        minimumVersion !== null &&
        typeof (minimumVersion as Record<string, unknown>).version ===
          "string"));

  return { valid, minimumVersion, maintenanceEnabled };
}

/** Resolve an authenticated route without rendering protected content on unknown state. */
export async function loadProtectedRouteRedirect(
  dependencies: RouteGuardDependencies,
): Promise<GuardRoute> {
  try {
    const auth = await dependencies.getUser();
    if (auth.failed || !auth.user) {
      return getProtectedRouteRedirect({
        session: auth.failed ? "expired" : "missing",
        profile: "unknown",
        configuration: "failed",
        currentVersion: dependencies.currentVersion,
      });
    }

    const [profileResult, consentResult, configResult] = await Promise.all([
      dependencies.getProfile(auth.user.id),
      dependencies.getConsentTypes(auth.user.id),
      dependencies.getConfiguration(),
    ]);

    if (
      profileResult.failed ||
      consentResult.failed ||
      !profileResult.profile
    ) {
      return getProtectedRouteRedirect({
        session: "valid",
        profile: "unknown",
        configuration: "failed",
        currentVersion: dependencies.currentVersion,
      });
    }

    const config = configurationState(
      configResult.response,
      configResult.failed,
    );
    return getProtectedRouteRedirect({
      session: "valid",
      profile: getProfileGuardState(profileResult.profile, consentResult.types),
      configuration: config.valid ? "loaded" : "failed",
      currentVersion: dependencies.currentVersion,
      minimumVersion: config.minimumVersion,
      maintenanceEnabled: config.maintenanceEnabled,
    });
  } catch {
    return "/welcome";
  }
}

export type { GuardRoute };
