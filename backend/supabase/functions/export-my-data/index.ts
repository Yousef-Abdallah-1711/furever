type Dependencies = {
  getEnv: (name: string) => string | undefined;
  fetch: typeof fetch;
  now: () => Date;
};

const defaultDependencies: Dependencies = {
  getEnv: (name) => Deno.env.get(name),
  fetch: (input, init) => fetch(input, init),
  now: () => new Date(),
};

type JsonRecord = Record<string, unknown>;

const localDashboardOrigins = [
  "http://localhost:3100",
  "http://127.0.0.1:3100",
];

function corsHeaders(
  request: Request,
  getEnv: Dependencies["getEnv"],
): Record<string, string> {
  const headers: Record<string, string> = {
    "access-control-allow-headers":
      "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": "GET, OPTIONS",
    "cache-control": "private, no-store",
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

function response(
  body: unknown,
  status: number,
  headers: Record<string, string>,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, ...extraHeaders },
  });
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

function parseUser(value: unknown): { id: string } | null {
  if (typeof value !== "object" || value === null) return null;
  const id = (value as JsonRecord).id;
  return typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
    ? { id }
    : null;
}

async function getRows(
  fetchImpl: typeof fetch,
  baseUrl: string,
  table: "profiles" | "consents" | "push_tokens",
  select: string,
  userId: string,
  publicApiKey: string,
  bearer: string,
): Promise<JsonRecord[]> {
  const url = new URL(`/rest/v1/${table}`, baseUrl);
  url.searchParams.set("select", select);
  url.searchParams.set(table === "profiles" ? "id" : "user_id", `eq.${userId}`);
  const result = await fetchImpl(url, {
    method: "GET",
    headers: {
      apikey: publicApiKey,
      authorization: `Bearer ${bearer}`,
      accept: "application/json",
    },
  });
  if (!result.ok) throw new Error("Export query failed");
  const value: unknown = await result.json();
  if (
    !Array.isArray(value) ||
    value.some((row) => typeof row !== "object" || row === null)
  ) {
    throw new Error("Export query returned invalid data");
  }
  return value as JsonRecord[];
}

export function createHandler(
  dependencies: Dependencies = defaultDependencies,
) {
  return async (request: Request): Promise<Response> => {
    const headers = corsHeaders(request, dependencies.getEnv);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "GET") {
      return response(
        {
          error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." },
        },
        405,
        headers,
      );
    }
    const authorization = request.headers.get("authorization") ?? "";
    const token = /^Bearer\s+(.+)$/i.exec(authorization)?.[1];
    if (!token) {
      return response(
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

    try {
      const baseUrl = dependencies
        .getEnv("SUPABASE_URL")
        ?.trim()
        .replace(/\/+$/, "");
      const key = publicKey(dependencies.getEnv);
      if (!baseUrl) throw new Error("Backend URL is not configured");

      const authResponse = await dependencies.fetch(`${baseUrl}/auth/v1/user`, {
        headers: { apikey: key, authorization: `Bearer ${token}` },
      });
      if (!authResponse.ok) {
        return response(
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
      const user = parseUser(await authResponse.json());
      if (!user) {
        return response(
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

      const profiles = await getRows(
        dependencies.fetch,
        baseUrl,
        "profiles",
        "id,full_name,email,phone,avatar_path,city_id,role,status,locale,theme,notif_prefs,deleted_at,created_at,updated_at",
        user.id,
        key,
        token,
      );
      const profile = profiles[0];
      if (!profile) {
        return response(
          {
            error: {
              code: "PROFILE_NOT_FOUND",
              message: "Unable to export account data.",
            },
          },
          404,
          headers,
        );
      }
      if (profile.role !== "owner") {
        return response(
          { error: { code: "FORBIDDEN", message: "Owner access required." } },
          403,
          headers,
        );
      }

      const [consents, pushTokens] = await Promise.all([
        getRows(
          dependencies.fetch,
          baseUrl,
          "consents",
          "id,type,version,accepted_at,created_at,updated_at",
          user.id,
          key,
          token,
        ),
        getRows(
          dependencies.fetch,
          baseUrl,
          "push_tokens",
          "id,platform,locale,last_seen_at,created_at,updated_at",
          user.id,
          key,
          token,
        ),
      ]);

      return response(
        {
          schema_version: 1,
          exported_at: dependencies.now().toISOString(),
          data: {
            profile,
            consents,
            push_token_devices: pushTokens,
          },
          unavailable_sections: [
            "pets",
            "vaccinations",
            "health_records",
            "record_attachments",
            "appointments",
          ],
        },
        200,
        headers,
        {
          "content-disposition":
            'attachment; filename="furever-data-export.json"',
        },
      );
    } catch {
      return response(
        {
          error: {
            code: "EXPORT_UNAVAILABLE",
            message: "Unable to export account data.",
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
