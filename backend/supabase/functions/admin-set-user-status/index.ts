const localDashboardOrigins = [
  "http://localhost:3100",
  "http://127.0.0.1:3100",
];

type Dependencies = {
  getEnv: (name: string) => string | undefined;
  fetch: typeof fetch;
};

const defaultDependencies: Dependencies = {
  getEnv: (name) => Deno.env.get(name),
  fetch: (input, init) => fetch(input, init),
};

function corsHeaders(request: Request, getEnv: Dependencies["getEnv"]) {
  const headers: Record<string, string> = {
    "access-control-allow-headers":
      "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "content-type": "application/json; charset=utf-8",
    vary: "Origin",
  };
  const origin = request.headers.get("origin");
  if (!origin) return headers;
  let origins = localDashboardOrigins;
  try {
    const configured = getEnv("DASHBOARD_ORIGINS");
    if (configured !== undefined) {
      origins = configured
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
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
  const anon = getEnv("SUPABASE_ANON_KEY")?.trim();
  if (anon) return anon;
  const raw = getEnv("SUPABASE_PUBLISHABLE_KEYS");
  if (!raw) throw new Error("Public key is not configured");
  const keys: unknown = JSON.parse(raw);
  if (typeof keys !== "object" || keys === null)
    throw new Error("Invalid key map");
  const value = (keys as Record<string, unknown>).default;
  if (typeof value !== "string" || !value.trim())
    throw new Error("Invalid default key");
  return value.trim();
}

function tokenClaims(token: string): { sub: string; user_role: string } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(
      atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")),
    );
    if (typeof claims.sub !== "string" || typeof claims.user_role !== "string")
      return null;
    return { sub: claims.sub, user_role: claims.user_role };
  } catch {
    return null;
  }
}

function validUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

async function authRequest(
  fetchImpl: typeof fetch,
  url: string,
  key: string,
  bearer: string,
): Promise<Response> {
  return await fetchImpl(url, {
    method: "GET",
    headers: { apikey: key, authorization: `Bearer ${bearer}` },
  });
}

export function createHandler(
  dependencies: Dependencies = defaultDependencies,
) {
  return async (request: Request): Promise<Response> => {
    const headers = corsHeaders(request, dependencies.getEnv);
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (request.method !== "POST") {
      return json(
        {
          error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." },
        },
        405,
        headers,
      );
    }

    const authorization = request.headers.get("authorization") ?? "";
    const bearerMatch = /^Bearer\s+(.+)$/i.exec(authorization);
    if (!bearerMatch)
      return json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication required.",
          },
        },
        401,
        headers,
      );
    const bearer = bearerMatch[1];

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "Request body must be valid JSON.",
          },
        },
        400,
        headers,
      );
    }
    if (typeof payload !== "object" || payload === null) {
      return json(
        { error: { code: "INVALID_REQUEST", message: "Invalid request." } },
        400,
        headers,
      );
    }
    const body = payload as Record<string, unknown>;
    if (
      !validUuid(body.user_id) ||
      !["suspend", "restore"].includes(String(body.action))
    ) {
      return json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "A valid user_id and action are required.",
          },
        },
        400,
        headers,
      );
    }
    const action = body.action as "suspend" | "restore";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (action === "suspend" && !reason) {
      return json(
        {
          error: {
            code: "REASON_REQUIRED",
            message: "A reason is required to suspend a user.",
          },
        },
        400,
        headers,
      );
    }

    try {
      const baseUrl = dependencies
        .getEnv("SUPABASE_URL")
        ?.trim()
        .replace(/\/+$/, "");
      const key = publicKey(dependencies.getEnv);
      const serviceKey = dependencies
        .getEnv("SUPABASE_SERVICE_ROLE_KEY")
        ?.trim();
      if (!baseUrl || !serviceKey)
        throw new Error("Backend configuration is incomplete");

      const verifiedResponse = await authRequest(
        dependencies.fetch,
        `${baseUrl}/auth/v1/user`,
        key,
        bearer,
      );
      if (!verifiedResponse.ok) {
        return json(
          {
            error: {
              code: "UNAUTHENTICATED",
              message: "Authentication required.",
            },
          },
          401,
          headers,
        );
      }
      const verifiedUser: unknown = await verifiedResponse.json();
      const claims = tokenClaims(bearer);
      if (
        typeof verifiedUser !== "object" ||
        verifiedUser === null ||
        typeof (verifiedUser as Record<string, unknown>).id !== "string" ||
        !claims ||
        claims.sub !== (verifiedUser as Record<string, unknown>).id
      ) {
        return json(
          {
            error: {
              code: "UNAUTHENTICATED",
              message: "Authentication required.",
            },
          },
          401,
          headers,
        );
      }
      if (!["admin", "super_admin"].includes(claims.user_role)) {
        return json(
          {
            error: {
              code: "FORBIDDEN",
              message: "Administrator access required.",
            },
          },
          403,
          headers,
        );
      }
      if (claims.sub === body.user_id) {
        return json(
          {
            error: {
              code: "SELF_STATUS_CHANGE_FORBIDDEN",
              message: "You cannot change your own status.",
            },
          },
          403,
          headers,
        );
      }

      const banUrl = `${baseUrl}/auth/v1/admin/users/${encodeURIComponent(body.user_id)}`;
      const setBan = (duration: string) =>
        dependencies.fetch(banUrl, {
          method: "PUT",
          headers: {
            apikey: serviceKey,
            authorization: `Bearer ${serviceKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ ban_duration: duration }),
        });
      let banResponse: Response;
      try {
        banResponse = await setBan(action === "suspend" ? "876000h" : "none");
      } catch {
        try {
          const rollback = await setBan(
            action === "suspend" ? "none" : "876000h",
          );
          return json(
            {
              error: {
                code: rollback.ok
                  ? "AUTH_STATUS_UPDATE_FAILED"
                  : "STATUS_UPDATE_PARTIAL_FAILURE",
                message: rollback.ok
                  ? "Unable to update user authentication status."
                  : "Authentication state could not be confirmed or restored.",
              },
            },
            502,
            headers,
          );
        } catch {
          return json(
            {
              error: {
                code: "STATUS_UPDATE_PARTIAL_FAILURE",
                message:
                  "Authentication state could not be confirmed or restored.",
              },
            },
            502,
            headers,
          );
        }
      }
      if (!banResponse.ok) {
        return json(
          {
            error: {
              code: "AUTH_STATUS_UPDATE_FAILED",
              message: "Unable to update user authentication status.",
            },
          },
          502,
          headers,
        );
      }

      let rpcResponse: Response | undefined;
      try {
        rpcResponse = await dependencies.fetch(
          `${baseUrl}/rest/v1/rpc/admin_set_user_status`,
          {
            method: "POST",
            headers: {
              apikey: key,
              authorization: `Bearer ${bearer}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              p_user_id: body.user_id,
              p_status: action === "suspend" ? "suspended" : "active",
              p_reason: action === "suspend" ? reason : null,
            }),
          },
        );
      } catch {
        // A lost RPC response is ambiguous, so restore the Auth state and let a retry apply both.
      }
      if (!rpcResponse?.ok) {
        let rollback: Response | undefined;
        try {
          rollback = await setBan(action === "suspend" ? "none" : "876000h");
        } catch {
          // Report the partial failure below without exposing network details.
        }
        return json(
          {
            error: {
              code: rollback?.ok
                ? "STATUS_UPDATE_FAILED"
                : "STATUS_UPDATE_PARTIAL_FAILURE",
              message: rollback?.ok
                ? "Unable to update user status."
                : "User status update failed and authentication state could not be restored.",
            },
          },
          502,
          headers,
        );
      }
      return json(
        {
          data: {
            user_id: body.user_id,
            status: action === "suspend" ? "suspended" : "active",
          },
        },
        200,
        headers,
      );
    } catch {
      return json(
        {
          error: {
            code: "STATUS_UPDATE_UNAVAILABLE",
            message: "Unable to update user status.",
          },
        },
        503,
        headers,
      );
    }
  };
}

export const handler = createHandler();
if (import.meta.main) Deno.serve(handler);
