export type GoogleIdentityLinkResult =
  | { status: "linked" }
  | { status: "cancelled" }
  | { status: "conflict"; code: "IDENTITY_ALREADY_LINKED" }
  | {
      status: "error";
      code:
        | "CONFIGURATION_MISSING"
        | "AUTH_REQUIRED"
        | "TOKEN_MISSING"
        | "LINK_FAILED";
    };

type GoogleResponse =
  | { type: "success"; data: { idToken: string | null } }
  | { type: "cancelled"; data: null };

export type GoogleIdentityLinkDependencies = {
  webClientId: string | undefined;
  iosClientId: string | undefined;
  configure: (options: { webClientId: string; iosClientId?: string }) => void;
  isAuthenticated: () => Promise<boolean>;
  signIn: () => Promise<GoogleResponse>;
  linkIdToken: (token: string) => Promise<{ error: { code?: string } | null }>;
};

export function createGoogleIdentityLink(
  dependencies: GoogleIdentityLinkDependencies,
) {
  return async (): Promise<GoogleIdentityLinkResult> => {
    if (!dependencies.webClientId?.trim())
      return { status: "error", code: "CONFIGURATION_MISSING" };
    try {
      if (!(await dependencies.isAuthenticated()))
        return { status: "error", code: "AUTH_REQUIRED" };
      dependencies.configure({
        webClientId: dependencies.webClientId.trim(),
        ...(dependencies.iosClientId?.trim()
          ? { iosClientId: dependencies.iosClientId.trim() }
          : {}),
      });
      const response = await dependencies.signIn();
      if (response.type === "cancelled") return { status: "cancelled" };
      const idToken = response.data.idToken;
      if (!idToken) return { status: "error", code: "TOKEN_MISSING" };
      const { error } = await dependencies.linkIdToken(idToken);
      if (!error) return { status: "linked" };
      if (error.code === "identity_already_exists")
        return { status: "conflict", code: "IDENTITY_ALREADY_LINKED" };
      return { status: "error", code: "LINK_FAILED" };
    } catch {
      return { status: "error", code: "LINK_FAILED" };
    }
  };
}
