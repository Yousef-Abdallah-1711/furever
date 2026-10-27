import { describe, expect, it } from '@jest/globals';
import { petQueryKeys } from './query-keys';

describe('pet query ownership scope', () => {
  it('uses separate cache entries for different owners', () => {
    expect(petQueryKeys.list('owner-a')).not.toEqual(petQueryKeys.list('owner-b'));
    expect(petQueryKeys.detail('owner-a', 'pet-1')).not.toEqual(petQueryKeys.detail('owner-b', 'pet-1'));
  });
});
