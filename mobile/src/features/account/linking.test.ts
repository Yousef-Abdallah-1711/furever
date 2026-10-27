import { describe, expect, it, jest } from "@jest/globals";
import { createGoogleIdentityLink } from "./linking-core";

function dependencies(overrides: Record<string, unknown> = {}) {
  return {
    webClientId: "web-client-id",
    iosClientId: "ios-client-id",
    configure: jest.fn(),
    isAuthenticated: jest.fn(async () => true),
    signIn: jest.fn(async () => ({
      type: "success" as const,
      data: { idToken: "google-id-token" },
    })),
    linkIdToken: jest.fn(async () => ({ error: null })),
    ...overrides,
  };
}

describe("Google account identity linking", () => {
  it("links the native Google ID token to the signed-in user", async () => {
    const deps = dependencies();
    await expect(createGoogleIdentityLink(deps)()).resolves.toEqual({
      status: "linked",
    });
    expect(deps.configure).toHaveBeenCalledWith({
      webClientId: "web-client-id",
      iosClientId: "ios-client-id",
    });
    expect(deps.linkIdToken).toHaveBeenCalledWith("google-id-token");
  });

  it("does not start provider auth if there is no current session", async () => {
    const deps = dependencies({ isAuthenticated: jest.fn(async () => false) });
    await expect(createGoogleIdentityLink(deps)()).resolves.toEqual({
      status: "error",
      code: "AUTH_REQUIRED",
    });
    expect(deps.signIn).not.toHaveBeenCalled();
  });

  it("keeps account-picker cancellation silent", async () => {
    const deps = dependencies({
      signIn: jest.fn(async () => ({ type: "cancelled" as const, data: null })),
    });
    await expect(createGoogleIdentityLink(deps)()).resolves.toEqual({
      status: "cancelled",
    });
    expect(deps.linkIdToken).not.toHaveBeenCalled();
  });

  it("maps Auth identity conflicts to the stable contract error code", async () => {
    const deps = dependencies({
      linkIdToken: jest.fn(async () => ({
        error: { code: "identity_already_exists" },
      })),
    });
    await expect(createGoogleIdentityLink(deps)()).resolves.toEqual({
      status: "conflict",
      code: "IDENTITY_ALREADY_LINKED",
    });
  });

  it("does not expose provider errors and rejects missing configuration or tokens", async () => {
    const unconfigured = dependencies({ webClientId: " " });
    await expect(createGoogleIdentityLink(unconfigured)()).resolves.toEqual({
      status: "error",
      code: "CONFIGURATION_MISSING",
    });

    const missingToken = dependencies({
      signIn: jest.fn(async () => ({
        type: "success" as const,
        data: { idToken: null },
      })),
    });
    await expect(createGoogleIdentityLink(missingToken)()).resolves.toEqual({
      status: "error",
      code: "TOKEN_MISSING",
    });

    const providerError = dependencies({
      linkIdToken: jest.fn(async () => ({ error: { code: "secret detail" } })),
    });
    await expect(createGoogleIdentityLink(providerError)()).resolves.toEqual({
      status: "error",
      code: "LINK_FAILED",
    });
  });
});
