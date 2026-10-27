import { describe, expect, it } from "@jest/globals";
import { loadAppleSignIn } from "./apple-signin-loader";

describe("Apple sign-in module loader", () => {
  it("does not load the native Apple module on Android", async () => {
    let loaded = false;
    const loadModule = async () => {
      loaded = true;
      throw new Error("Android must not import the native Apple module");
    };
    await expect(loadAppleSignIn("android", loadModule)).resolves.toBeNull();
    expect(loaded).toBe(false);
  });

  it("loads the Apple module only for iOS", async () => {
    let loaded = false;
    const signInWithApple = async () => ({ status: "signed-in" as const });
    const loadModule = async () => {
      loaded = true;
      return { signInWithApple };
    };
    await expect(loadAppleSignIn("ios", loadModule)).resolves.toBe(
      signInWithApple,
    );
    expect(loaded).toBe(true);
  });
});
