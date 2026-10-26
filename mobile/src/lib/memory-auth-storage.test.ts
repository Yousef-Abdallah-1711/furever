import { describe, expect, it } from "@jest/globals";
import { MemoryAuthStorage } from "./memory-auth-storage";

describe("MemoryAuthStorage", () => {
  it("stores values only in the current runtime and supports Supabase storage operations", async () => {
    const storage = new MemoryAuthStorage();
    expect(await storage.getItem("session")).toBeNull();
    await storage.setItem("session", "volatile-session");
    expect(await storage.getItem("session")).toBe("volatile-session");
    await storage.removeItem("session");
    expect(await storage.getItem("session")).toBeNull();
  });
});
