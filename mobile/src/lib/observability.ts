type RuntimeEnv = Record<string, string | undefined>;
type MobileAnalyticsEvent = 'sign_up_completed' | 'language_changed' | 'theme_changed';
type MobileAnalyticsValue = 'ar' | 'en' | 'dark' | 'light';
type PostHogClient = { capture: (event: string, properties?: Record<string, string>) => void };
type SdkAdapters = {
  sentryInit: (options: { dsn: string }) => void;
  createPostHog: (key: string, host: string) => PostHogClient | undefined;
};

let posthogClient: PostHogClient | undefined;

export async function startMobileObservability(env: RuntimeEnv = process.env, sdk?: SdkAdapters): Promise<void> {
  if (env.EXPO_PUBLIC_ENABLE_SENTRY === 'true' && env.EXPO_PUBLIC_SENTRY_DSN) {
    if (sdk) sdk.sentryInit({ dsn: env.EXPO_PUBLIC_SENTRY_DSN });
    else (await import('@sentry/react-native')).init({ dsn: env.EXPO_PUBLIC_SENTRY_DSN });
  }
  if (env.EXPO_PUBLIC_ENABLE_POSTHOG === 'true' && env.EXPO_PUBLIC_POSTHOG_KEY) {
    const host = env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
    if (sdk) posthogClient = sdk.createPostHog(env.EXPO_PUBLIC_POSTHOG_KEY, host);
    else {
      const { default: PostHog } = await import('posthog-react-native');
      posthogClient = new PostHog(env.EXPO_PUBLIC_POSTHOG_KEY, { host });
    }
  } else {
    posthogClient = undefined;
  }
}

/** Captures the small allowlist of mobile lifecycle and preference events. No identity properties are accepted. */
export function trackMobileEvent(event: MobileAnalyticsEvent, value?: MobileAnalyticsValue): void {
  if (!posthogClient) return;

  if (event === 'language_changed' && (value === 'ar' || value === 'en')) {
    posthogClient.capture(event, { locale: value });
  } else if (event === 'theme_changed' && (value === 'dark' || value === 'light')) {
    posthogClient.capture(event, { theme: value });
  } else if (event === 'sign_up_completed') {
    posthogClient.capture(event);
  }
}
