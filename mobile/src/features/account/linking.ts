import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "@/lib/supabase";
import { createGoogleIdentityLink } from "./linking-core";

export type { GoogleIdentityLinkResult } from "./linking-core";
export { createGoogleIdentityLink } from "./linking-core";

export const linkGoogleAccount = createGoogleIdentityLink({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  configure: (options) => GoogleSignin.configure(options),
  isAuthenticated: async () => {
    const { data, error } = await supabase.auth.getUser();
    return !error && Boolean(data.user);
  },
  signIn: async () => {
    const response = await GoogleSignin.signIn();
    if (response.type === "cancelled") return { type: "cancelled", data: null };
    return { type: "success", data: { idToken: response.data.idToken } };
  },
  linkIdToken: async (token) => {
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      token,
    });
    return { error: error ? { code: error.code } : null };
  },
});
