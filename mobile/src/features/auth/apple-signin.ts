import * as AppleAuthentication from "expo-apple-authentication";
import {
  CryptoDigestAlgorithm,
  CryptoEncoding,
  digestStringAsync,
  getRandomBytesAsync,
} from "expo-crypto";
import { supabase } from "@/lib/supabase";
import { createAppleSignIn } from "./apple-signin-core";

export type { AppleNonce, AppleSignInResult } from "./apple-signin-core";
export { createAppleNonce, createAppleSignIn } from "./apple-signin-core";

export const signInWithApple = createAppleSignIn({
  randomBytes: (length) => getRandomBytesAsync(length),
  sha256: (value) =>
    digestStringAsync(CryptoDigestAlgorithm.SHA256, value, {
      encoding: CryptoEncoding.HEX,
    }),
  isAvailable: () => AppleAuthentication.isAvailableAsync(),
  scopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
  signIn: ({ requestedScopes, nonce }) =>
    AppleAuthentication.signInAsync({
      requestedScopes:
        requestedScopes as AppleAuthentication.AppleAuthenticationScope[],
      nonce,
    }),
  formatFullName: (name) =>
    AppleAuthentication.formatFullName(
      name as AppleAuthentication.AppleAuthenticationFullName,
    ),
  exchangeIdToken: async (token, nonce) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token,
      nonce,
    });
    return { error };
  },
  saveFullName: async (fullName) => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
    return { error };
  },
});
