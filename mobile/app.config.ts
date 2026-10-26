import type { ConfigContext, ExpoConfig } from "expo/config";

const googleIOSUrlScheme =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME?.trim();

if (
  googleIOSUrlScheme &&
  !googleIOSUrlScheme.startsWith("com.googleusercontent.apps.")
) {
  throw new Error(
    "EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME must be the reversed Google iOS client ID.",
  );
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins: NonNullable<ExpoConfig["plugins"]> = [
    ...(config.plugins ?? []),
  ];
  if (googleIOSUrlScheme) {
    plugins.push([
      "@react-native-google-signin/google-signin",
      { iosUrlScheme: googleIOSUrlScheme },
    ]);
  }
  return {
    ...config,
    name: config.name ?? "FurEver",
    slug: config.slug ?? "furever",
    version: config.version ?? "1.0.0",
    plugins,
  };
};
