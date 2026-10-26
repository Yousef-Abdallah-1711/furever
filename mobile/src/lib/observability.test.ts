import { startMobileObservability, trackMobileEvent } from './observability';
import { expect, jest, test } from '@jest/globals';

test('flags off produce no Sentry or PostHog initialization', async () => {
  const sentryInit = jest.fn();
  const createPostHog = jest.fn<(key: string, host: string) => undefined>();
  await startMobileObservability({}, { sentryInit, createPostHog });
  expect(sentryInit).not.toHaveBeenCalled();
  expect(createPostHog).not.toHaveBeenCalled();
  trackMobileEvent('language_changed', 'ar');
  trackMobileEvent('theme_changed', 'dark');
  trackMobileEvent('sign_up_completed');
  expect(createPostHog).not.toHaveBeenCalled();
});

test('tracks allowlisted mobile events without identity properties', async () => {
  const capture = jest.fn();
  await startMobileObservability(
    { EXPO_PUBLIC_ENABLE_POSTHOG: 'true', EXPO_PUBLIC_POSTHOG_KEY: 'test-key' },
    { sentryInit: jest.fn(), createPostHog: jest.fn(() => ({ capture })) },
  );

  trackMobileEvent('language_changed', 'ar');
  trackMobileEvent('theme_changed', 'dark');
  trackMobileEvent('sign_up_completed');

  expect(capture).toHaveBeenNthCalledWith(1, 'language_changed', { locale: 'ar' });
  expect(capture).toHaveBeenNthCalledWith(2, 'theme_changed', { theme: 'dark' });
  expect(capture).toHaveBeenNthCalledWith(3, 'sign_up_completed');
});
