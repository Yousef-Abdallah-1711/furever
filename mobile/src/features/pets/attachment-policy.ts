export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

export type AttachmentKind = 'photo' | 'document';

export function validateAttachment(
  attachment: { mimeType: string; size: number },
  kind: AttachmentKind,
): 'unsupportedFileType' | 'fileTooLarge' | null {
  const allowed = kind === 'photo' ? PHOTO_MIME_TYPES : DOCUMENT_MIME_TYPES;
  if (!(allowed as readonly string[]).includes(attachment.mimeType)) return 'unsupportedFileType';
  if (!Number.isFinite(attachment.size) || attachment.size <= 0 || attachment.size > MAX_ATTACHMENT_BYTES) return 'fileTooLarge';
  return null;
}
