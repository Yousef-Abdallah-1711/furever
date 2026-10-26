import { describe, expect, it } from "vitest";
import { authProfileSchema } from "./auth";

describe("authProfileSchema", () => {
  it("requires and normalizes an email while normalizing an optional local phone", () => {
    expect(
      authProfileSchema.parse({
        email: "  OWNER@EXAMPLE.COM ",
        phone: "01012345678",
      }),
    ).toEqual({ email: "owner@example.com", phone: "+201012345678" });
  });

  it("accepts an omitted or empty optional phone", () => {
    expect(authProfileSchema.parse({ email: "owner@example.com" })).toEqual({
      email: "owner@example.com",
    });
    expect(
      authProfileSchema.parse({ email: "owner@example.com", phone: "" }),
    ).toEqual({ email: "owner@example.com", phone: undefined });
  });

  it("rejects an invalid phone and a missing email", () => {
    expect(
      authProfileSchema.safeParse({
        email: "owner@example.com",
        phone: "+441234567890",
      }).success,
    ).toBe(false);
    expect(authProfileSchema.safeParse({ phone: "01012345678" }).success).toBe(
      false,
    );
  });
});
