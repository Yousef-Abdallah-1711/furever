import { describe, expect, it } from '@jest/globals';
import { shouldClearPrivateCacheOnAuthChange, shouldPersistQuery } from './query-cache-policy';

describe('private query cache policy', () => {
  it('persists only successful queries explicitly marked for offline use', () => {
    expect(shouldPersistQuery({ state: { status: 'success' }, meta: { persist: true } })).toBe(true);
    expect(shouldPersistQuery({ state: { status: 'success' } })).toBe(false);
    expect(shouldPersistQuery({ state: { status: 'success' }, meta: { persist: false } })).toBe(false);
    expect(shouldPersistQuery({ state: { status: 'error' }, meta: { persist: true } })).toBe(false);
  });

  it('clears cache on sign out, fresh sign in, or owner change', () => {
    expect(shouldClearPrivateCacheOnAuthChange({ event: 'SIGNED_OUT', previousUserId: 'a', nextUserId: null })).toBe(true);
    expect(shouldClearPrivateCacheOnAuthChange({ event: 'SIGNED_IN', previousUserId: null, nextUserId: 'a' })).toBe(true);
    expect(shouldClearPrivateCacheOnAuthChange({ event: 'TOKEN_REFRESHED', previousUserId: 'a', nextUserId: 'b' })).toBe(true);
    expect(shouldClearPrivateCacheOnAuthChange({ event: 'TOKEN_REFRESHED', previousUserId: 'a', nextUserId: 'a' })).toBe(false);
    expect(shouldClearPrivateCacheOnAuthChange({ event: 'INITIAL_SESSION', previousUserId: undefined, nextUserId: 'a' })).toBe(false);
  });
});
