export interface SignOutClient {
  auth: { signOut: () => Promise<{ error: unknown | null }> };
}

export async function signOutAndReturnToLogin(
  client: SignOutClient,
  navigateToLogin: () => void,
): Promise<boolean> {
  try {
    const { error } = await client.auth.signOut();
    if (error) return false;
    navigateToLogin();
    return true;
  } catch {
    return false;
  }
}
