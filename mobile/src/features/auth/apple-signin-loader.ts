import type { AppleSignInResult } from "./apple-signin-core";

type AppleSignInModule = {
  signInWithApple: () => Promise<AppleSignInResult>;
};

export async function loadAppleSignIn(
  platform: string,
  loadModule: () => Promise<AppleSignInModule> = () => import("./apple-signin"),
): Promise<AppleSignInModule["signInWithApple"] | null> {
  if (platform !== "ios") return null;
  const module = await loadModule();
  return module.signInWithApple;
}
