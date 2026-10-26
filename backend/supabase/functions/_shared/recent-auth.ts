const MAX_AGE_SECONDS = 5 * 60;
const CLOCK_SKEW_SECONDS = 30;
const REAUTHENTICATION_METHODS = new Set([
  "oauth",
  "password",
  "otp",
  "totp",
  "recovery",
  "magiclink",
  "sso/saml",
  "email/signup",
]);

export type RecentAuthFailure =
  | "invalid_claims"
  | "expired_session"
  | "cross_account"
  | "missing_authentication_time"
  | "authentication_too_old";

export type RecentAuthResult =
  | { ok: true; authenticatedAt: number }
  | { ok: false; reason: RecentAuthFailure };

/**
 * Validate a signed access-token payload only after the caller has verified the
 * bearer with Supabase Auth. AMR timestamps are preserved across access-token
 * refreshes, unlike `iat`, so refreshing an old session cannot make it recent.
 */
export function requireRecentAuthentication(
  claims: unknown,
  verifiedUserId: string,
  targetUserId: string,
  nowMs = Date.now(),
): RecentAuthResult {
  if (typeof claims !== "object" || claims === null)
    return { ok: false, reason: "invalid_claims" };
  const token = claims as Record<string, unknown>;
  if (token.sub !== verifiedUserId || typeof token.sub !== "string") {
    return { ok: false, reason: "invalid_claims" };
  }
  if (targetUserId !== verifiedUserId)
    return { ok: false, reason: "cross_account" };
  const nowSeconds = Math.floor(nowMs / 1000);
  if (
    typeof token.exp !== "number" ||
    !Number.isFinite(token.exp) ||
    token.exp <= nowSeconds
  ) {
    return { ok: false, reason: "expired_session" };
  }
  if (!Array.isArray(token.amr))
    return { ok: false, reason: "missing_authentication_time" };
  const timestamps = token.amr
    .filter(
      (entry): entry is Record<string, unknown> =>
        typeof entry === "object" && entry !== null,
    )
    .filter(
      (entry) =>
        typeof entry.method === "string" &&
        REAUTHENTICATION_METHODS.has(entry.method),
    )
    .map((entry) => entry.timestamp)
    .filter(
      (timestamp): timestamp is number =>
        typeof timestamp === "number" && Number.isSafeInteger(timestamp),
    );
  if (timestamps.length === 0)
    return { ok: false, reason: "missing_authentication_time" };
  const authenticatedAt = Math.max(...timestamps);
  const ageSeconds = nowSeconds - authenticatedAt;
  if (ageSeconds < -CLOCK_SKEW_SECONDS || ageSeconds > MAX_AGE_SECONDS) {
    return { ok: false, reason: "authentication_too_old" };
  }
  return { ok: true, authenticatedAt };
}
