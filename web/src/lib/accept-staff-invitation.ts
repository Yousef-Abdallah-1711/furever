export interface InvitationAcceptanceClient {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: unknown | null;
    }>;
    updateUser: (attributes: {
      password: string;
    }) => Promise<{ error: unknown | null }>;
    refreshSession: () => Promise<{ error: unknown | null }>;
    getClaims: () => Promise<{
      data: { claims: Record<string, unknown> } | null;
      error: unknown | null;
    }>;
  };
  rpc: (name: string) => PromiseLike<{ data: unknown; error: unknown | null }>;
}

export type InvitationAcceptanceResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "password_mismatch"
        | "password_too_short"
        | "session_missing"
        | "acceptance_failed";
    };

/**
 * Accept a staff invitation only after changing the invited account's password.
 * The role claim is refreshed and checked before the caller may navigate to the portal.
 */
export async function acceptStaffInvitation(
  client: InvitationAcceptanceClient,
  password: string,
  confirmation: string,
  onAccepted: () => void,
): Promise<InvitationAcceptanceResult> {
  if (password !== confirmation)
    return { ok: false, reason: "password_mismatch" };
  if (password.length < 6) return { ok: false, reason: "password_too_short" };

  try {
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user)
      return { ok: false, reason: "session_missing" };

    const { error: passwordError } = await client.auth.updateUser({ password });
    if (passwordError) return { ok: false, reason: "acceptance_failed" };

    const { data, error } = await client.rpc("accept_staff_invitation");
    if (
      error ||
      !data ||
      typeof data !== "object" ||
      (data as { status?: unknown }).status !== "accepted"
    ) {
      return { ok: false, reason: "acceptance_failed" };
    }

    const { error: refreshError } = await client.auth.refreshSession();
    if (refreshError) return { ok: false, reason: "acceptance_failed" };

    const { data: claimsData, error: claimsError } =
      await client.auth.getClaims();
    if (claimsError || claimsData?.claims?.user_role !== "clinic_staff") {
      return { ok: false, reason: "acceptance_failed" };
    }

    onAccepted();
    return { ok: true };
  } catch {
    return { ok: false, reason: "acceptance_failed" };
  }
}
