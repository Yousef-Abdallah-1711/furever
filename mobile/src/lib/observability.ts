type RuntimeEnv = Record<string, string | undefined>;
type SdkAdapters = {
  sentryInit: (options: { dsn: string }) => void;
  createPostHog: (key: string, host: string) => unknown;
};

export async function startMobileObservability(env: RuntimeEnv = process.env, sdk?: SdkAdapters): Promise<void> {
  if (env.EXPO_PUBLIC_ENABLE_SENTRY === 'true' && env.EXPO_PUBLIC_SENTRY_DSN) {
    if (sdk) sdk.sentryInit({ dsn: env.EXPO_PUBLIC_SENTRY_DSN });
    else (await import('@sentry/react-native')).init({ dsn: env.EXPO_PUBLIC_SENTRY_DSN });
  }
  if (env.EXPO_PUBLIC_ENABLE_POSTHOG === 'true' && env.EXPO_PUBLIC_POSTHOG_KEY) {
    const host = env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
    if (sdk) sdk.createPostHog(env.EXPO_PUBLIC_POSTHOG_KEY, host);
    else {
      const { default: PostHog } = await import('posthog-react-native');
      new PostHog(env.EXPO_PUBLIC_POSTHOG_KEY, { host });
    }
  }
}
