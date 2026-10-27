import { describe, expect, it, vi } from "vitest";
import { createHandler } from "./index.ts";

const userId = "21000000-0000-4000-8000-000000000001";
const nowMs = Date.UTC(2026, 9, 27, 12, 0, 0);
const nowSeconds = Math.floor(nowMs / 1000);

function encode(value: unknown) {
  return btoa(JSON.stringify(value))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function token(sub = userId, timestamp = nowSeconds - 10) {
  return `${encode({ alg: "none" })}.${encode({
    sub,
    exp: nowSeconds + 3600,
    amr: [{ method: "password", timestamp }],
  })}.signature`;
}

function setup(fetchImpl: typeof fetch) {
  return createHandler({
    getEnv: (name) => ({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_ANON_KEY: "local-public-key",
      SUPABASE_SERVICE_ROLE_KEY: "local-service-key",
    })[name],
    fetch: fetchImpl,
    now: () => nowMs,
  });
}

function authResponse(id = userId) {
  return Response.json({ id });
}

describe("delete-account Edge Function", () => {
  it("requires a bearer token and only accepts POST", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    const handler = setup(fetchMock);
    const missing = await handler(new Request("http://local", { method: "POST" }));
    expect(missing.status).toBe(401);
    const wrongMethod = await handler(new Request("http://local", { method: "GET" }));
    expect(wrongMethod.status).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects stale authentication before calling the privileged RPC", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(authResponse());
    const handler = setup(fetchMock);
    const response = await handler(new Request("http://local", {
      method: "POST",
      headers: { authorization: `Bearer ${token(userId, nowSeconds - 301)}` },
    }));
    expect(response.status).toBe(403);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects a verified-user subject mismatch and makes no RPC call", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(authResponse());
    const handler = setup(fetchMock);
    const response = await handler(new Request("http://local", {
      method: "POST",
      headers: { authorization: `Bearer ${token("21000000-0000-4000-8000-000000000002")}` },
    }));
    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uses only the Auth-verified subject and service credentials for the idempotent RPC", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(authResponse())
      .mockResolvedValueOnce(Response.json({
        request_id: "22000000-0000-4000-8000-000000000001",
        state: "access_blocked",
      }));
    const handler = setup(fetchMock);
    const response = await handler(new Request("http://local", {
      method: "POST",
      headers: { authorization: `Bearer ${token()}`, "content-type": "application/json" },
      body: JSON.stringify({ user_id: "21000000-0000-4000-8000-000000000099" }),
    }));
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({
      request_id: "22000000-0000-4000-8000-000000000001",
      state: "access_blocked",
    });
    const [authCall, rpcCall] = fetchMock.mock.calls;
    expect(String(authCall[0])).toBe("http://127.0.0.1:54321/auth/v1/user");
    expect(String(rpcCall[0])).toBe("http://127.0.0.1:54321/rest/v1/rpc/request_account_deletion");
    expect(new Headers(rpcCall[1]?.headers).get("apikey")).toBe("local-service-key");
    expect(JSON.parse(String(rpcCall[1]?.body))).toEqual({ p_user_id: userId });
  });

  it("does not claim success when the database transition fails", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(authResponse())
      .mockResolvedValueOnce(new Response("", { status: 500 }));
    const handler = setup(fetchMock);
    const response = await handler(new Request("http://local", {
      method: "POST",
      headers: { authorization: `Bearer ${token()}` },
    }));
    expect(response.status).toBe(503);
  });
});
