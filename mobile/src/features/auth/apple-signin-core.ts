export type AppleNonce = { raw: string; hashed: string };
export type AppleSignInResult =
  | { status: "signed-in" }
  | { status: "cancelled" }
  | { status: "unavailable" }
  | { status: "error"; code: "TOKEN_MISSING" | "SIGN_IN_FAILED" };

export type AppleSignInDependencies = {
  randomBytes: (length: number) => Promise<Uint8Array> | Uint8Array;
  sha256: (value: string) => Promise<string>;
  isAvailable: () => Promise<boolean>;
  scopes: unknown[];
  signIn: (options: { requestedScopes: unknown[]; nonce: string }) => Promise<{
    identityToken: string | null;
    fullName: unknown | null;
  }>;
  formatFullName: (name: unknown) => string;
  exchangeIdToken: (
    token: string,
    rawNonce: string,
  ) => Promise<{ error: unknown | null }>;
  saveFullName: (name: string) => Promise<{ error: unknown | null }>;
};

export async function createAppleNonce(
  randomBytes: AppleSignInDependencies["randomBytes"],
  sha256: AppleSignInDependencies["sha256"],
): Promise<AppleNonce> {
  const bytes = await randomBytes(32);
  if (bytes.length !== 32) throw new Error("Secure nonce generation failed");
  const raw = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return { raw, hashed: await sha256(raw) };
}

export function createAppleSignIn(dependencies: AppleSignInDependencies) {
  return async (): Promise<AppleSignInResult> => {
    try {
      if (!(await dependencies.isAvailable())) return { status: "unavailable" };
      const nonce = await createAppleNonce(
        dependencies.randomBytes,
        dependencies.sha256,
      );
      const credential = await dependencies.signIn({
        requestedScopes: dependencies.scopes,
        nonce: nonce.hashed,
      });
      if (!credential.identityToken)
        return { status: "error", code: "TOKEN_MISSING" };
      const { error: exchangeError } = await dependencies.exchangeIdToken(
        credential.identityToken,
        nonce.raw,
      );
      if (exchangeError) return { status: "error", code: "SIGN_IN_FAILED" };
      if (credential.fullName) {
        const fullName = dependencies
          .formatFullName(credential.fullName)
          .trim();
        if (fullName) {
          const { error } = await dependencies.saveFullName(fullName);
          if (error) return { status: "error", code: "SIGN_IN_FAILED" };
        }
      }
      return { status: "signed-in" };
    } catch (error) {
      if (
        (error instanceof Error && error.message === "ERR_REQUEST_CANCELED") ||
        (typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "ERR_REQUEST_CANCELED")
      ) {
        return { status: "cancelled" };
      }
      return { status: "error", code: "SIGN_IN_FAILED" };
    }
  };
}
