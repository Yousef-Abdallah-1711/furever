export type GoogleSignInResult =
  | { status: "signed-in" }
  | { status: "cancelled" }
  | {
      status: "error";
      code: "CONFIGURATION_MISSING" | "TOKEN_MISSING" | "SIGN_IN_FAILED";
    };

type SignInResponse =
  | { type: "success"; data: { idToken: string | null } }
  | { type: "cancelled"; data: null };

export type GoogleSignInDependencies = {
  webClientId: string | undefined;
  iosClientId: string | undefined;
  configure: (options: { webClientId: string; iosClientId?: string }) => void;
  signIn: () => Promise<SignInResponse>;
  exchangeIdToken: (idToken: string) => Promise<{ error: unknown | null }>;
};

export function createGoogleSignIn(dependencies: GoogleSignInDependencies) {
  return async (): Promise<GoogleSignInResult> => {
    if (!dependencies.webClientId?.trim()) {
      return { status: "error", code: "CONFIGURATION_MISSING" };
    }
    try {
      dependencies.configure({
        webClientId: dependencies.webClientId.trim(),
        ...(dependencies.iosClientId?.trim()
          ? { iosClientId: dependencies.iosClientId.trim() }
          : {}),
      });
      const response = await dependencies.signIn();
      if (response.type === "cancelled") return { status: "cancelled" };
      if (!response.data.idToken)
        return { status: "error", code: "TOKEN_MISSING" };
      const { error } = await dependencies.exchangeIdToken(
        response.data.idToken,
      );
      return error
        ? { status: "error", code: "SIGN_IN_FAILED" }
        : { status: "signed-in" };
    } catch {
      return { status: "error", code: "SIGN_IN_FAILED" };
    }
  };
}
