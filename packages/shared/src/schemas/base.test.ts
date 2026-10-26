import { describe, expect, it } from "vitest";
import { optionalPhoneSchema, phoneSchema } from "./base";

describe("phoneSchema", () => {
  it.each(["01012345678", "01112345678", "01212345678", "01512345678"])(
    "accepts local Egyptian mobile %s and normalizes to E.164",
    (phone) => {
      expect(phoneSchema.parse(phone)).toBe(`+20${phone.slice(1)}`);
    },
  );

  it("accepts and preserves an already normalized Egyptian number", () => {
    expect(phoneSchema.parse("+201012345678")).toBe("+201012345678");
  });

  it.each([
    "0101234567",
    "010123456789",
    "+202123456789",
    "+201612345678",
    "+441234567890",
    "010 1234 5678",
    "+20-1012345678",
  ])("rejects invalid or non-Egyptian phone %s", (phone) => {
    expect(phoneSchema.safeParse(phone).success).toBe(false);
  });

  it("treats an empty optional value as omitted", () => {
    expect(optionalPhoneSchema.parse("")).toBeUndefined();
    expect(optionalPhoneSchema.parse(undefined)).toBeUndefined();
  });

  it("normalizes optional local input", () => {
    expect(optionalPhoneSchema.parse("01012345678")).toBe("+201012345678");
  });
});
