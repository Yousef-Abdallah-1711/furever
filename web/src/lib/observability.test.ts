import { describe, expect, it, vi } from 'vitest';
import { startWebObservability, trackWebEvent } from './observability';
import { initEdgeSentry } from '../../../backend/supabase/functions/_shared/sentry';

describe('web observability', () => {
  it('does not initialize SDKs or make network-capable calls while flags are off', async () => {
    const sentryInit = vi.fn();
    const posthogInit = vi.fn();
    await startWebObservability({}, { sentryInit, posthogInit });
    expect(sentryInit).not.toHaveBeenCalled();
    expect(posthogInit).not.toHaveBeenCalled();
    trackWebEvent('language_changed', 'ar');
  });

  it('tracks only allowlisted preference values after opted-in initialization', async () => {
    const capture = vi.fn();
    await startWebObservability(
      { NEXT_PUBLIC_ENABLE_POSTHOG: 'true', NEXT_PUBLIC_POSTHOG_KEY: 'test-key' },
      { sentryInit: vi.fn(), posthogInit: vi.fn(), posthogCapture: capture },
    );

    trackWebEvent('language_changed', 'ar');
    trackWebEvent('language_changed', 'en');
    trackWebEvent('theme_changed', 'dark');
    trackWebEvent('theme_changed', 'light');
    trackWebEvent('language_changed', 'fr');
    trackWebEvent('theme_changed', 'system');

    expect(capture.mock.calls).toEqual([
      ['language_changed', { locale: 'ar' }],
      ['language_changed', { locale: 'en' }],
      ['theme_changed', { theme: 'dark' }],
      ['theme_changed', { theme: 'light' }],
    ]);
  });

  it('does not track when PostHog is enabled without a key', async () => {
    const capture = vi.fn();
    await startWebObservability(
      { NEXT_PUBLIC_ENABLE_POSTHOG: 'true' },
      { sentryInit: vi.fn(), posthogInit: vi.fn(), posthogCapture: capture },
    );
    trackWebEvent('theme_changed', 'dark');
    expect(capture).not.toHaveBeenCalled();
  });

  it('does not load the Edge Sentry SDK while its flag is off', async () => {
    const init = vi.fn();
    const loadSdk = vi.fn(async () => ({ init }));
    await initEdgeSentry({ get: () => undefined }, loadSdk);
    expect(loadSdk).not.toHaveBeenCalled();
    expect(init).not.toHaveBeenCalled();
  });
});
