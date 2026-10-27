import type { SupabaseClient } from "@supabase/supabase-js";

export type SettingsTotpFactor = {
  id: string;
  friendly_name?: string;
  status: string;
};

export async function updateOwnDisplayName(
  client: SupabaseClient,
  fullName: string,
): Promise<boolean> {
  const auth = await client.auth.getUser();
  if (auth.error || !auth.data.user) return false;
  const result = await client
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", auth.data.user.id)
    .select("id")
    .maybeSingle();
  return !result.error && Boolean(result.data);
}

export async function updateOwnPassword(
  client: SupabaseClient,
  password: string,
): Promise<boolean> {
  if (password.length < 6) return false;
  const result = await client.auth.updateUser({ password });
  return !result.error;
}

export async function listOwnTotpFactors(
  client: SupabaseClient,
): Promise<SettingsTotpFactor[] | null> {
  const result = await client.auth.mfa.listFactors();
  if (result.error) return null;
  return result.data.all
    .filter((factor) => factor.factor_type === "totp")
    .map((factor) => ({
      id: factor.id,
      friendly_name: factor.friendly_name,
      status: factor.status,
    }));
}

export async function enrollOwnTotp(
  client: SupabaseClient,
): Promise<{ factorId: string; qrCode: string; secret: string } | null> {
  const listed = await client.auth.mfa.listFactors();
  if (listed.error) return null;
  for (const factor of listed.data.all.filter(
    (item) => item.factor_type === "totp" && item.status === "unverified",
  )) {
    const removed = await client.auth.mfa.unenroll({ factorId: factor.id });
    if (removed.error) return null;
  }
  const result = await client.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "FurEver dashboard authenticator",
  });
  if (result.error || !result.data.totp?.qr_code || !result.data.totp.secret)
    return null;
  return {
    factorId: result.data.id,
    qrCode: result.data.totp.qr_code,
    secret: result.data.totp.secret,
  };
}

export async function removeOwnTotp(
  client: SupabaseClient,
  factorId: string,
  code: string,
): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  const factors = await listOwnTotpFactors(client);
  const factor = factors?.find(
    (item) => item.id === factorId && item.status === "verified",
  );
  if (!factor) return false;

  const challenge = await client.auth.mfa.challenge({ factorId });
  if (challenge.error) return false;
  const verified = await client.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code,
  });
  if (verified.error) return false;

  const removed = await client.auth.mfa.unenroll({ factorId });
  return !removed.error;
}
