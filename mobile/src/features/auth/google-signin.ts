import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "@/lib/supabase";
import { createGoogleSignIn } from "./google-signin-core";

export type { GoogleSignInResult } from "./google-signin-core";
export { createGoogleSignIn } from "./google-signin-core";

export const signInWithGoogle = createGoogleSignIn({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  configure: (options) => GoogleSignin.configure(options),
  signIn: () => GoogleSignin.signIn(),
  exchangeIdToken: async (idToken) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });
    return { error };
  },
});
