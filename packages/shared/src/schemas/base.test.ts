import { describe, expect, it } from "vitest";
import { phoneSchema } from "./base";

describe("phoneSchema", () => {
  it("rejects a local number without an international prefix", () => {
    expect(phoneSchema.safeParse("0123").success).toBe(false);
  });

  it("accepts a valid international phone number", () => {
    expect(phoneSchema.safeParse("+201012345678").success).toBe(true);
  });
});
