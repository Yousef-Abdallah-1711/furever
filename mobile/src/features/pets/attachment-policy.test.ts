import { describe, expect, it } from '@jest/globals';
import { validateAttachment } from './attachment-policy';

describe('validateAttachment', () => {
  it('allows only supported photo formats within 10 MiB', () => {
    expect(validateAttachment({ mimeType: 'image/jpeg', size: 1024 }, 'photo')).toBeNull();
    expect(validateAttachment({ mimeType: 'image/svg+xml', size: 1024 }, 'photo')).toBe('unsupportedFileType');
    expect(validateAttachment({ mimeType: 'image/png', size: 10 * 1024 * 1024 + 1 }, 'photo')).toBe('fileTooLarge');
  });

  it('allows PDF and supported document images within 10 MiB', () => {
    expect(validateAttachment({ mimeType: 'application/pdf', size: 1024 }, 'document')).toBeNull();
    expect(validateAttachment({ mimeType: 'image/webp', size: 1024 }, 'document')).toBe('unsupportedFileType');
    expect(validateAttachment({ mimeType: 'application/pdf', size: 0 }, 'document')).toBe('fileTooLarge');
  });
});
