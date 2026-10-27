import { requireRecentAuthentication } from "../_shared/recent-auth.ts";

type Dependencies = {
  getEnv: (name: string) => string | undefined;
  fetch: typeof fetch;
  now: () => number;
};

const defaults: Dependencies = {
  getEnv: (name) => Deno.env.get(name),
  fetch: (input, init) => fetch(input, init),
  now: () => Date.now(),
};

type JsonRecord = Record<string, unknown>;

const localOrigins = ["http://localhost:3100", "http://127.0.0.1:3100"];

function headersFor(request: Request, getEnv: Dependencies["getEnv"]) {
  const headers: Record<string, string> = {
    "access-control-allow-headers":
      "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "cache-control": "private, no-store",
    "content-type": "application/json; charset=utf-8",
    vary: "Origin",
  };
  const origin = request.headers.get("origin");
  if (!origin) return headers;
  let origins = localOrigins;
  try {
    const configured = getEnv("DASHBOARD_ORIGINS");
    if (configured !== undefined) {
      origins = configured.split(",").map((value) => value.trim()).filter(Boolean);
    }
  } catch {
    return headers;
  }
  if (origins.includes(origin)) headers["access-control-allow-origin"] = origin;
  return headers;
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers });
}

function publicKey(getEnv: Dependencies["getEnv"]): string {
  const legacy = getEnv("SUPABASE_ANON_KEY")?.trim();
  if (legacy) return legacy;
  const raw = getEnv("SUPABASE_PUBLISHABLE_KEYS");
  if (!raw) throw new Error("Public API key is not configured");
  const keys: unknown = JSON.parse(raw);
  if (typeof keys !== "object" || keys === null) {
    throw new Error("Invalid public API key map");
  }
  const key = (keys as JsonRecord).default;
  if (typeof key !== "string" || !key.trim()) {
    throw new Error("Default public API key is missing");
  }
  return key.trim();
}

function decodeClaims(token: string): JsonRecord | null {
  try {
    const encoded = token.split(".")[1];
    if (!encoded) return null;
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const value: unknown = JSON.parse(
      atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")),
    );
    return typeof value === "object" && value !== null
      ? value as JsonRecord
      : null;
  } catch {
    return null;
  }
}

function validUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function failure(
  headers: Record<string, string>,
  code: string,
  message: string,
  status: number,
) {
  return json({ error: { code, message } }, status, headers);
}

export function createHandler(dependencies: Dependencies = defaults) {
  return async (request: Request): Promise<Response> => {
    const headers = headersFor(request, dependencies.getEnv);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") {
      return failure(headers, "METHOD_NOT_ALLOWED", "Method not allowed.", 405);
    }

    const token = /^Bearer\s+(.+)$/i.exec(
      request.headers.get("authorization") ?? "",
    )?.[1];
    if (!token) {
      return failure(headers, "UNAUTHENTICATED", "Authentication required.", 401);
    }

    try {
      const baseUrl = dependencies.getEnv("SUPABASE_URL")?.trim().replace(/\/+$/, "");
      const key = publicKey(dependencies.getEnv);
      const serviceKey = dependencies.getEnv("SUPABASE_SERVICE_ROLE_KEY")?.trim();
      if (!baseUrl || !serviceKey) throw new Error("Backend configuration is incomplete");

      // Verify the bearer through Supabase Auth before trusting its signed AMR claims.
      const authResponse = await dependencies.fetch(`${baseUrl}/auth/v1/user`, {
        headers: { apikey: key, authorization: `Bearer ${token}` },
      });
      if (!authResponse.ok) {
        return failure(headers, "UNAUTHENTICATED", "Authentication required.", 401);
      }
      const authUser: unknown = await authResponse.json();
      if (typeof authUser !== "object" || authUser === null) {
        return failure(headers, "UNAUTHENTICATED", "Authentication required.", 401);
      }
      const userId = (authUser as JsonRecord).id;
      const claims = decodeClaims(token);
      if (!validUuid(userId) || claims?.sub !== userId) {
        return failure(headers, "UNAUTHENTICATED", "Authentication required.", 401);
      }

      const recentAuth = requireRecentAuthentication(
        claims,
        userId,
        userId,
        dependencies.now(),
      );
      if (!recentAuth.ok) {
        const status = recentAuth.reason === "authentication_too_old" ? 403 : 401;
        return failure(
          headers,
          "RECENT_AUTH_REQUIRED",
          "Sign in again before requesting account deletion.",
          status,
        );
      }

      // No target id is accepted from the caller. The RPC atomically records
      // the durable request and blocks this verified user's application access.
      const rpcResponse = await dependencies.fetch(
        `${baseUrl}/rest/v1/rpc/request_account_deletion`,
        {
          method: "POST",
          headers: {
            apikey: serviceKey,
            authorization: `Bearer ${serviceKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ p_user_id: userId }),
        },
      );
      if (!rpcResponse.ok) {
        return failure(
          headers,
          "DELETION_REQUEST_UNAVAILABLE",
          "Unable to request account deletion.",
          503,
        );
      }
      const result: unknown = await rpcResponse.json();
      if (
        typeof result !== "object" || result === null ||
        !validUuid((result as JsonRecord).request_id) ||
        (result as JsonRecord).state !== "access_blocked"
      ) {
        return failure(
          headers,
          "DELETION_REQUEST_UNAVAILABLE",
          "Unable to request account deletion.",
          503,
        );
      }
      return json({ request_id: (result as JsonRecord).request_id, state: "access_blocked" }, 202, headers);
    } catch {
      return failure(
        headers,
        "DELETION_REQUEST_UNAVAILABLE",
        "Unable to request account deletion.",
        503,
      );
    }
  };
}

export const handler = createHandler();
if (import.meta.main) Deno.serve(handler);
