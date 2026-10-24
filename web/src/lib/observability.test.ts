import { describe, expect, it, vi } from 'vitest';
import { startWebObservability } from './observability';
import { initEdgeSentry } from '../../../backend/supabase/functions/_shared/sentry';

describe('web observability', () => {
  it('does not initialize SDKs or make network-capable calls while flags are off', async () => {
    const sentryInit = vi.fn();
    const posthogInit = vi.fn();
    await startWebObservability({}, { sentryInit, posthogInit });
    expect(sentryInit).not.toHaveBeenCalled();
    expect(posthogInit).not.toHaveBeenCalled();
  });

  it('does not load the Edge Sentry SDK while its flag is off', async () => {
    const init = vi.fn();
    const loadSdk = vi.fn(async () => ({ init }));
    await initEdgeSentry({ get: () => undefined }, loadSdk);
    expect(loadSdk).not.toHaveBeenCalled();
    expect(init).not.toHaveBeenCalled();
  });
});
