import { describe, expect, it } from '@jest/globals';
import { uploadProgressPercent } from './upload-progress';

describe('attachment upload progress', () => {
  it('converts byte counts to a bounded percentage', () => {
    expect(uploadProgressPercent(1, 4)).toBe(25);
    expect(uploadProgressPercent(100, 100)).toBe(99);
    expect(uploadProgressPercent(120, 100)).toBe(99);
  });

  it('does not report progress when the transfer total is unknown or invalid', () => {
    expect(uploadProgressPercent(1, 0)).toBeNull();
    expect(uploadProgressPercent(-1, 10)).toBeNull();
    expect(uploadProgressPercent(Number.NaN, 10)).toBeNull();
  });
});
