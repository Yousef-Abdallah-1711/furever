export type RouteGuardState = {
  session: "valid" | "missing" | "expired" | "unknown";
  profile: "complete" | "incomplete" | "suspended" | "deleted" | "unknown";
  configuration: "loaded" | "failed";
  currentVersion: string;
  minimumVersion?: unknown;
  maintenanceEnabled?: unknown;
};

export type GuardRoute =
  | "/welcome"
  | "/complete-profile"
  | "/force-update"
  | "/maintenance"
  | null;

export type GuardProfile = {
  status: unknown;
  deleted_at?: unknown;
  full_name?: unknown;
  city_id?: unknown;
};

/** Treat soft-deleted or malformed profile state as unavailable. */
export function getProfileGuardState(
  profile: GuardProfile | null,
  consentTypes: Iterable<string>,
): RouteGuardState["profile"] {
  if (!profile) return "unknown";
  if (profile.status === "suspended") return "suspended";
  if (profile.status === "deleted" || profile.deleted_at != null)
    return "deleted";
  if (profile.status !== "active") return "unknown";
  const consents = new Set(consentTypes);
  return typeof profile.full_name === "string" &&
      profile.full_name.trim().length > 0 &&
      typeof profile.city_id === "string" &&
      profile.city_id.length > 0 &&
      consents.has("terms") &&
      consents.has("privacy")
    ? "complete"
    : "incomplete";
}

function parseVersion(value: unknown): [number, number, number] | null {
  if (typeof value !== "string" || !/^\d+\.\d+\.\d+$/.test(value)) return null;
  const parts = value.split(".").map(Number);
  if (parts.some((part) => !Number.isSafeInteger(part))) return null;
  return parts as [number, number, number];
}

function isBelowMinimum(current: string, minimum: unknown): boolean {
  const currentParts = parseVersion(current);
  const minimumValue =
    typeof minimum === "object" && minimum !== null
      ? (minimum as Record<string, unknown>).version
      : undefined;
  const minimumParts = parseVersion(minimumValue);
  if (!currentParts || !minimumParts) return false;
  for (let index = 0; index < 3; index += 1) {
    if (currentParts[index] !== minimumParts[index]) {
      return currentParts[index] < minimumParts[index];
    }
  }
  return false;
}

function hasInvalidMinimumVersion(minimum: unknown): boolean {
  if (minimum === undefined || minimum === null) return false;
  if (
    typeof minimum !== "object" ||
    minimum === null ||
    !("version" in minimum)
  )
    return true;
  return parseVersion((minimum as Record<string, unknown>).version) === null;
}

/** Resolve access to the protected mobile tabs. Unknown state fails closed. */
export function getProtectedRouteRedirect(state: RouteGuardState): GuardRoute {
  if (state.session !== "valid") return "/welcome";
  if (state.profile === "suspended" || state.profile === "deleted")
    return "/welcome";
  if (state.profile === "unknown") return "/welcome";
  if (state.profile === "incomplete") return "/complete-profile";
  if (state.configuration !== "loaded") return "/welcome";
  if (!parseVersion(state.currentVersion)) return "/welcome";
  if (hasInvalidMinimumVersion(state.minimumVersion)) return "/welcome";
  if (state.maintenanceEnabled === true) return "/maintenance";
  if (isBelowMinimum(state.currentVersion, state.minimumVersion))
    return "/force-update";
  return null;
}
