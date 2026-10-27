import { describe, expect, it } from "@jest/globals";
import { getLegalDocuments } from "./legal-documents";

const valid = {
  terms: {
    version: "terms-v1",
    content_en: "English terms",
    content_ar: "الشروط باللغة العربية",
  },
  privacy: {
    version: "privacy-v1",
    content_en: "English privacy notice",
    content_ar: "سياسة الخصوصية باللغة العربية",
  },
};

describe("legal documents configuration", () => {
  it("accepts versioned English and Arabic Terms and Privacy content", () => {
    expect(getLegalDocuments(valid)).toEqual(valid);
  });

  it.each([null, {}, { ...valid, terms: { ...valid.terms, version: " " } }, {
    ...valid,
    privacy: { ...valid.privacy, content_ar: " " },
  }])("fails closed when legal content or version is absent", (value) => {
    expect(getLegalDocuments(value)).toBeNull();
  });
});
