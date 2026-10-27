import type { SupabaseClient } from "@supabase/supabase-js";

export type DashboardRole = "clinic_staff" | "admin" | "super_admin";
export type DashboardDestination = "/clinic" | "/admin" | "/no-access";

const dashboardRoles = new Set<DashboardRole>([
  "clinic_staff",
  "admin",
  "super_admin",
]);

export async function signInDashboard(
  client: SupabaseClient,
  email: string,
  password: string,
): Promise<{ ok: true; destination: DashboardDestination } | { ok: false }> {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) return { ok: false };

  const claimsResult = await client.auth.getClaims();
  const role = claimsResult.data?.claims?.user_role;
  if (typeof role !== "string") return { ok: true, destination: "/no-access" };
  if (role === "clinic_staff") return { ok: true, destination: "/clinic" };
  if (dashboardRoles.has(role as DashboardRole))
    return { ok: true, destination: "/admin" };
  return { ok: true, destination: "/no-access" };
}

export async function requestDashboardPasswordReset(
  client: SupabaseClient,
  email: string,
  redirectTo: string,
): Promise<boolean> {
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  return !error;
}

export type TotpSetup =
  | { kind: "verify"; factorId: string }
  | { kind: "enroll"; factorId: string; qrCode: string; secret: string };

export async function prepareTotp(
  client: SupabaseClient,
): Promise<TotpSetup | null> {
  const listed = await client.auth.mfa.listFactors();
  if (listed.error) return null;
  const totpFactors = listed.data.all.filter(
    (factor) => factor.factor_type === "totp",
  );
  const verified = totpFactors.find((factor) => factor.status === "verified");
  if (verified) return { kind: "verify", factorId: verified.id };

  // An unverified factor has no retrievable secret after its enrollment call.
  // Remove abandoned unverified TOTP factors before issuing a fresh secret.
  for (const factor of totpFactors.filter(
    (item) => item.status === "unverified",
  )) {
    const removed = await client.auth.mfa.unenroll({ factorId: factor.id });
    if (removed.error) return null;
  }

  const enrolled = await client.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "FurEver dashboard authenticator",
  });
  if (
    enrolled.error ||
    !enrolled.data.totp?.qr_code ||
    !enrolled.data.totp.secret
  )
    return null;
  return {
    kind: "enroll",
    factorId: enrolled.data.id,
    qrCode: enrolled.data.totp.qr_code,
    secret: enrolled.data.totp.secret,
  };
}

export async function verifyTotp(
  client: SupabaseClient,
  factorId: string,
  code: string,
): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  const challenge = await client.auth.mfa.challenge({ factorId });
  if (challenge.error) return false;
  const verified = await client.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code,
  });
  return !verified.error && Boolean(verified.data.access_token);
}
