import { describe, expect, it, jest } from "@jest/globals";
import { createGoogleSignIn } from "./google-signin-core";

describe("Google native sign-in", () => {
  it("exchanges the Google ID token using the web client configuration", async () => {
    const configure = jest.fn();
    const signIn = jest.fn(async () => ({
      type: "success" as const,
      data: { idToken: "google-id-token" },
    }));
    const exchangeIdToken = jest.fn(async () => ({ error: null }));
    const run = createGoogleSignIn({
      webClientId: "web-id",
      iosClientId: "ios-id",
      configure,
      signIn,
      exchangeIdToken,
    });

    await expect(run()).resolves.toEqual({ status: "signed-in" });
    expect(configure).toHaveBeenCalledWith({
      webClientId: "web-id",
      iosClientId: "ios-id",
    });
    expect(exchangeIdToken).toHaveBeenCalledWith("google-id-token");
  });

  it("treats a cancelled account picker as a quiet cancellation", async () => {
    const exchangeIdToken = jest.fn(async () => ({ error: null }));
    const run = createGoogleSignIn({
      webClientId: "web-id",
      iosClientId: undefined,
      configure: jest.fn(),
      signIn: async () => ({ type: "cancelled", data: null }),
      exchangeIdToken,
    });

    await expect(run()).resolves.toEqual({ status: "cancelled" });
    expect(exchangeIdToken).not.toHaveBeenCalled();
  });

  it("fails safely when configuration or the identity token is missing", async () => {
    const configure = jest.fn();
    const signIn = jest.fn(async () => ({
      type: "success" as const,
      data: { idToken: null },
    }));
    const exchangeIdToken = jest.fn(async () => ({ error: null }));
    const missingConfig = createGoogleSignIn({
      webClientId: undefined,
      iosClientId: undefined,
      configure,
      signIn,
      exchangeIdToken,
    });
    const missingToken = createGoogleSignIn({
      webClientId: "web-id",
      iosClientId: undefined,
      configure,
      signIn,
      exchangeIdToken,
    });

    await expect(missingConfig()).resolves.toEqual({
      status: "error",
      code: "CONFIGURATION_MISSING",
    });
    await expect(missingToken()).resolves.toEqual({
      status: "error",
      code: "TOKEN_MISSING",
    });
    expect(exchangeIdToken).not.toHaveBeenCalled();
  });
});
