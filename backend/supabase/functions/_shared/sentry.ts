/** Sentry initialization is opt-in so local Edge Functions do not make network calls by default. */
export async function initEdgeSentry(
  env: { get: (key: string) => string | undefined },
  loadSdk: () => Promise<{ init: (options: { dsn: string }) => void }> = async () => {
    // @ts-expect-error Deno's npm: resolver handles this specifier at Edge runtime.
    return await import('npm:@sentry/deno@11.8.0');
  },
): Promise<void> {
  const dsn = env.get('SENTRY_DSN');
  if (env.get('ENABLE_SENTRY') !== 'true' || !dsn) return;
  const sentry = await loadSdk();
  sentry.init({ dsn });
}
