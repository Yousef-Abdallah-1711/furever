export type LegalDocument = {
  version: string;
  content_en: string;
  content_ar: string;
};

export type LegalDocuments = {
  terms: LegalDocument;
  privacy: LegalDocument;
};

function isLegalDocument(value: unknown): value is LegalDocument {
  if (typeof value !== "object" || value === null) return false;
  const document = value as Record<string, unknown>;
  return (
    typeof document.version === "string" &&
    document.version.trim().length > 0 &&
    typeof document.content_en === "string" &&
    document.content_en.trim().length > 0 &&
    typeof document.content_ar === "string" &&
    document.content_ar.trim().length > 0
  );
}

/** Accept only complete bilingual documents with a stable version identifier. */
export function getLegalDocuments(value: unknown): LegalDocuments | null {
  if (typeof value !== "object" || value === null) return null;
  const config = value as Record<string, unknown>;
  if (!isLegalDocument(config.terms) || !isLegalDocument(config.privacy)) {
    return null;
  }
  return { terms: config.terms, privacy: config.privacy };
}
