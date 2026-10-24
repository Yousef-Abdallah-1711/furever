type RuntimeEnv = Record<string, string | undefined>;
type SdkAdapters = {
  sentryInit: (options: { dsn: string }) => void;
  posthogInit: (key: string, options: { api_host: string }) => void;
};

export async function startWebObservability(env: RuntimeEnv = process.env, sdk?: SdkAdapters): Promise<void> {
  if (env.NEXT_PUBLIC_ENABLE_SENTRY === 'true' && env.NEXT_PUBLIC_SENTRY_DSN) {
    if (sdk) sdk.sentryInit({ dsn: env.NEXT_PUBLIC_SENTRY_DSN });
    else (await import('@sentry/nextjs')).init({ dsn: env.NEXT_PUBLIC_SENTRY_DSN });
  }
  if (env.NEXT_PUBLIC_ENABLE_POSTHOG === 'true' && env.NEXT_PUBLIC_POSTHOG_KEY) {
    const options = { api_host: env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com' };
    if (sdk) sdk.posthogInit(env.NEXT_PUBLIC_POSTHOG_KEY, options);
    else (await import('posthog-js')).default.init(env.NEXT_PUBLIC_POSTHOG_KEY, options);
  }
}
