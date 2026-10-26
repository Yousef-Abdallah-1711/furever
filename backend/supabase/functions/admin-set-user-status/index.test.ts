import { createHandler } from "./index.ts";

const adminId = "11000000-0000-4000-8000-000000000001";
const targetId = "11000000-0000-4000-8000-000000000002";
const env = (values: Record<string, string>) => (name: string) => values[name];

function jwt(sub: string, user_role: string) {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  return `${encode({ alg: "none" })}.${encode({ sub, user_role })}.signature`;
}

function setup(fetchImpl: typeof fetch) {
  return createHandler({
    getEnv: env({
      SUPABASE_URL: "https://project.example",
      SUPABASE_ANON_KEY: "public-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-secret",
    }),
    fetch: fetchImpl,
  });
}

function request(action: string, fields: Record<string, unknown> = {}) {
  return new Request(
    "https://project.example/functions/v1/admin-set-user-status",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${jwt(adminId, "admin")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ user_id: targetId, action, ...fields }),
    },
  );
}

function mockFetch(
  options: {
    userStatus?: number;
    banStatus?: number;
    rpcStatus?: number;
    rollbackStatus?: number;
    failUser?: boolean;
  } = {},
) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.endsWith("/auth/v1/user")) {
      return options.userStatus
        ? new Response("{}", { status: options.userStatus })
        : Response.json({ id: adminId });
    }
    if (url.includes("/auth/v1/admin/users/")) {
      const isRollback =
        calls.filter((call) => call.url.includes("/auth/v1/admin/users/"))
          .length > 1;
      const status = isRollback
        ? (options.rollbackStatus ?? 200)
        : (options.banStatus ?? 200);
      return new Response(options.failUser ? "unknown auth user" : "{}", {
        status: options.failUser ? 404 : status,
      });
    }
    if (url.endsWith("/rpc/admin_set_user_status")) {
      return options.rpcStatus
        ? new Response("internal detail", { status: options.rpcStatus })
        : Response.json({
            user_id: targetId,
            old_status: "active",
            new_status: "suspended",
          });
    }
    throw new Error(`Unexpected request: ${url}`);
  };
  return { fetchImpl, calls };
}

Deno.test("admin-set-user-status rejects missing or invalid bearer credentials", async () => {
  const { fetchImpl, calls } = mockFetch({ userStatus: 401 });
  const handler = setup(fetchImpl);
  const missing = await handler(
    new Request("https://project.example", { method: "POST", body: "{}" }),
  );
  const invalid = await handler(request("suspend", { reason: "policy" }));
  if (missing.status !== 401 || invalid.status !== 401 || calls.length !== 1)
    throw new Error("Expected auth rejection before privileged calls");
});

Deno.test("admin-set-user-status rejects non-admin and self-target requests", async () => {
  const fetchImpl: typeof fetch = async (input) => {
    if (String(input).endsWith("/auth/v1/user"))
      return Response.json({ id: adminId });
    throw new Error("Privileged endpoint must not be called");
  };
  const handler = setup(fetchImpl);
  const ownerRequest = new Request("https://project.example", {
    method: "POST",
    headers: {
      authorization: `Bearer ${jwt(adminId, "owner")}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ user_id: targetId, action: "restore" }),
  });
  const selfRequest = new Request("https://project.example", {
    method: "POST",
    headers: {
      authorization: `Bearer ${jwt(adminId, "admin")}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ user_id: adminId, action: "restore" }),
  });
  if (
    (await handler(ownerRequest)).status !== 403 ||
    (await handler(selfRequest)).status !== 403
  )
    throw new Error("Expected admin and self-target checks");
});

Deno.test("admin-set-user-status rejects invalid action, target, and missing suspension reason", async () => {
  const { fetchImpl, calls } = mockFetch();
  const handler = setup(fetchImpl);
  const invalidAction = await handler(request("delete"));
  const invalidTarget = await handler(request("restore", { user_id: "bad" }));
  const missingReason = await handler(request("suspend", { reason: "  " }));
  if (
    invalidAction.status !== 400 ||
    invalidTarget.status !== 400 ||
    missingReason.status !== 400 ||
    calls.length !== 0
  )
    throw new Error("Expected validation before backend calls");
});

Deno.test("suspension applies an Auth ban then calls the caller-scoped audited RPC", async () => {
  const { fetchImpl, calls } = mockFetch();
  const response = await setup(fetchImpl)(
    request("suspend", { reason: "Repeated abuse" }),
  );
  const ban = calls.find((call) => call.url.includes("/auth/v1/admin/users/"));
  const rpc = calls.find((call) =>
    call.url.endsWith("/rpc/admin_set_user_status"),
  );
  const banBody = JSON.parse(String(ban?.init?.body));
  const rpcBody = JSON.parse(String(rpc?.init?.body));
  if (
    response.status !== 200 ||
    banBody.ban_duration !== "876000h" ||
    rpcBody.p_status !== "suspended" ||
    rpcBody.p_reason !== "Repeated abuse"
  )
    throw new Error("Expected suspend ban and status RPC");
  const rpcHeaders = rpc?.init?.headers as Record<string, string> | undefined;
  if (rpcHeaders?.authorization !== `Bearer ${jwt(adminId, "admin")}`)
    throw new Error("RPC must use caller bearer context");
});

Deno.test("restore removes the Auth ban and requests active status", async () => {
  const { fetchImpl, calls } = mockFetch();
  const response = await setup(fetchImpl)(request("restore"));
  const ban = calls.find((call) => call.url.includes("/auth/v1/admin/users/"));
  const rpc = calls.find((call) =>
    call.url.endsWith("/rpc/admin_set_user_status"),
  );
  if (
    response.status !== 200 ||
    JSON.parse(String(ban?.init?.body)).ban_duration !== "none" ||
    JSON.parse(String(rpc?.init?.body)).p_status !== "active"
  )
    throw new Error("Expected restore unban and active status");
});

Deno.test("RPC failure compensates the Auth ban and hides backend details", async () => {
  const { fetchImpl, calls } = mockFetch({ rpcStatus: 500 });
  const response = await setup(fetchImpl)(
    request("suspend", { reason: "policy" }),
  );
  const body = await response.text();
  const bans = calls.filter((call) =>
    call.url.includes("/auth/v1/admin/users/"),
  );
  if (
    response.status !== 502 ||
    !body.includes("STATUS_UPDATE_FAILED") ||
    body.includes("internal detail") ||
    bans.length !== 2 ||
    JSON.parse(String(bans[1].init?.body)).ban_duration !== "none"
  )
    throw new Error("Expected clean failure with ban rollback");
});

Deno.test("failed compensation returns an explicit partial-failure code", async () => {
  const { fetchImpl } = mockFetch({ rpcStatus: 500, rollbackStatus: 503 });
  const response = await setup(fetchImpl)(
    request("suspend", { reason: "policy" }),
  );
  const body = await response.text();
  if (
    response.status !== 502 ||
    !body.includes("STATUS_UPDATE_PARTIAL_FAILURE")
  )
    throw new Error("Expected partial failure response");
});
