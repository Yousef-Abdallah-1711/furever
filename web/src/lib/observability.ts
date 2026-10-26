type RuntimeEnv = Record<string, string | undefined>;
type SdkAdapters = {
  sentryInit: (options: { dsn: string }) => void;
  posthogInit: (key: string, options: { api_host: string }) => void;
  posthogCapture?: (event: string, properties: Record<string, string>) => void;
};

type WebPreferenceEvent = 'language_changed' | 'theme_changed';
let posthogCapture: ((event: string, properties: Record<string, string>) => void) | undefined;

/** Track only the allowlisted preference events and their single value property. */
export function trackWebEvent(event: WebPreferenceEvent, value: string): void {
  if (!posthogCapture) return;
  if (event === 'language_changed' && (value === 'ar' || value === 'en')) {
    posthogCapture(event, { locale: value });
  } else if (event === 'theme_changed' && (value === 'dark' || value === 'light')) {
    posthogCapture(event, { theme: value });
  }
}

export async function startWebObservability(env: RuntimeEnv = process.env, sdk?: SdkAdapters): Promise<void> {
  posthogCapture = undefined;
  if (env.NEXT_PUBLIC_ENABLE_SENTRY === 'true' && env.NEXT_PUBLIC_SENTRY_DSN) {
    if (sdk) sdk.sentryInit({ dsn: env.NEXT_PUBLIC_SENTRY_DSN });
    else (await import('@sentry/nextjs')).init({ dsn: env.NEXT_PUBLIC_SENTRY_DSN });
  }
  if (env.NEXT_PUBLIC_ENABLE_POSTHOG === 'true' && env.NEXT_PUBLIC_POSTHOG_KEY) {
    const options = { api_host: env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com' };
    if (sdk) {
      sdk.posthogInit(env.NEXT_PUBLIC_POSTHOG_KEY, options);
      posthogCapture = sdk.posthogCapture;
    } else {
      const posthog = (await import('posthog-js')).default;
      posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, options);
      posthogCapture = (event, properties) => posthog.capture(event, properties);
    }
  }
}
