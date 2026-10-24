import { startMobileObservability } from './observability';
import { expect, jest, test } from '@jest/globals';

test('flags off produce no Sentry or PostHog initialization', async () => {
  const sentryInit = jest.fn();
  const createPostHog = jest.fn();
  await startMobileObservability({}, { sentryInit, createPostHog });
  expect(sentryInit).not.toHaveBeenCalled();
  expect(createPostHog).not.toHaveBeenCalled();
});
