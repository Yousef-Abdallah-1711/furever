import { createHash } from "node:crypto";
import { describe, expect, it, jest } from "@jest/globals";
import type * as AppleAuthentication from "expo-apple-authentication";
import { createAppleSignIn } from "./apple-signin-core";

describe("Apple native sign-in", () => {
  it("sends the hashed nonce to Apple and the raw nonce to Supabase, then saves first-sign-in name", async () => {
    let appleNonce = "";
    let supabaseNonce = "";
    let savedName = "";
    const name = { givenName: "Mona", familyName: "Hassan" };
    const run = createAppleSignIn({
      randomBytes: async () => new Uint8Array(32).fill(5),
      sha256: async (value) => createHash("sha256").update(value).digest("hex"),
      isAvailable: async () => true,
      scopes: ["FULL_NAME", "EMAIL"],
      signIn: async ({ nonce }) => {
        appleNonce = nonce;
        return { identityToken: "apple-id-token", fullName: name };
      },
      formatFullName: () => "Mona Hassan",
      exchangeIdToken: async (_token, nonce) => {
        supabaseNonce = nonce;
        return { error: null };
      },
      saveFullName: async (fullName) => {
        savedName = fullName;
        return { error: null };
      },
    });

    await expect(run()).resolves.toEqual({ status: "signed-in" });
    const rawNonce = "05".repeat(32);
    expect(appleNonce).toBe(
      createHash("sha256").update(rawNonce).digest("hex"),
    );
    expect(supabaseNonce).toBe(rawNonce);
    expect(savedName).toBe("Mona Hassan");
  });

  it("stops before Apple sign-in when the native capability is unavailable", async () => {
    const signIn = jest.fn(async () => ({
      identityToken: "unused",
      fullName: null as AppleAuthentication.AppleAuthenticationFullName | null,
    }));
    const run = createAppleSignIn({
      randomBytes: () => new Uint8Array(32),
      sha256: async (value) => value,
      isAvailable: async () => false,
      scopes: ["FULL_NAME", "EMAIL"],
      signIn,
      formatFullName: () => "",
      exchangeIdToken: async () => ({ error: null }),
      saveFullName: async () => ({ error: null }),
    });

    await expect(run()).resolves.toEqual({ status: "unavailable" });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("reports token and exchange errors without returning provider details", async () => {
    const run = createAppleSignIn({
      randomBytes: () => new Uint8Array(32),
      sha256: async (value) => value,
      isAvailable: async () => true,
      scopes: ["FULL_NAME", "EMAIL"],
      signIn: async () => ({ identityToken: null, fullName: null }),
      formatFullName: () => "",
      exchangeIdToken: async () => ({ error: new Error("private detail") }),
      saveFullName: async () => ({ error: null }),
    });
    await expect(run()).resolves.toEqual({
      status: "error",
      code: "TOKEN_MISSING",
    });
  });
});
