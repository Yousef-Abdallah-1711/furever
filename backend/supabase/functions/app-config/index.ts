const localDashboardOrigins = [
  "http://localhost:3100",
  "http://127.0.0.1:3100",
];

function corsHeaders(
  request: Request,
  getEnv: (name: string) => string | undefined,
): Record<string, string> {
  const headers: Record<string, string> = {
    "access-control-allow-headers":
      "authorization, x-client-info, apikey, content-type, x-app-version, x-platform",
    "access-control-allow-methods": "GET, OPTIONS",
    "content-type": "application/json; charset=utf-8",
    vary: "Origin",
  };
  const origin = request.headers.get("origin");

  if (!origin) return headers;

  let allowedOrigins = localDashboardOrigins;
  try {
    const configuredOrigins = getEnv("DASHBOARD_ORIGINS");
    if (configuredOrigins !== undefined) {
      allowedOrigins = configuredOrigins
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }
  } catch {
    return headers;
  }

  if (allowedOrigins.includes(origin)) {
    headers["access-control-allow-origin"] = origin;
  }
  return headers;
}

function selectPublicKey(getEnv: (name: string) => string | undefined): string {
  const legacyKey = getEnv("SUPABASE_ANON_KEY")?.trim();
  if (legacyKey) return legacyKey;

  const publishableKeys = getEnv("SUPABASE_PUBLISHABLE_KEYS");
  if (!publishableKeys) throw new Error("Public key is not configured");

  const keyMap: unknown = JSON.parse(publishableKeys);
  if (typeof keyMap !== "object" || keyMap === null) {
    throw new Error("Public key map is invalid");
  }

  const defaultKey = (keyMap as Record<string, unknown>).default;
  if (typeof defaultKey !== "string" || !defaultKey.trim()) {
    throw new Error("Default public key is invalid");
  }
  return defaultKey.trim();
}

type FeatureFlag = {
  key: string;
  enabled: boolean;
  platform: string | null;
  min_app_version: string | null;
};

type AppConfigRow = { key: string; value: unknown };

type HandlerDependencies = {
  getEnv: (name: string) => string | undefined;
  fetch: typeof fetch;
};

const defaultDependencies: HandlerDependencies = {
  getEnv: (name) => Deno.env.get(name),
  fetch: (input, init) => fetch(input, init),
};

function jsonResponse(
  body: unknown,
  status: number,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

function isFeatureFlag(value: unknown): value is FeatureFlag {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.key === "string" &&
    typeof row.enabled === "boolean" &&
    (typeof row.platform === "string" || row.platform === null) &&
    (typeof row.min_app_version === "string" || row.min_app_version === null)
  );
}

function isAppConfigRow(value: unknown): value is AppConfigRow {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).key === "string" &&
    Object.hasOwn(value, "value")
  );
}

async function fetchRows<T>(
  fetchImpl: typeof fetch,
  baseUrl: string,
  key: string,
  table: "feature_flags" | "app_config",
  select: string,
): Promise<T[]> {
  const url = new URL(`/rest/v1/${table}`, baseUrl);
  url.searchParams.set("select", select);
  url.searchParams.set("order", "key.asc");

  const response = await fetchImpl(url, {
    method: "GET",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      accept: "application/json",
    },
  });

  if (!response.ok) throw new Error("Configuration request failed");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows))
    throw new Error("Configuration response was invalid");
  return rows as T[];
}

/**
 * Stable public response: feature flag rows (including nullable targeting metadata) and
 * app_config values indexed by their database key. Empty tables are returned as [] and {}.
 * Request platform/version headers are accepted for clients but are not interpreted here;
 * no platform matching or version comparison rule is defined by the product contract.
 */
export function createHandler(
  dependencies: HandlerDependencies = defaultDependencies,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const headers = corsHeaders(request, dependencies.getEnv);
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (request.method !== "GET") {
      return jsonResponse(
        {
          error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." },
        },
        405,
        headers,
      );
    }

    try {
      const baseUrl = dependencies.getEnv("SUPABASE_URL")?.trim();
      const publicKey = selectPublicKey(dependencies.getEnv);
      if (!baseUrl || !publicKey) {
        return jsonResponse(
          {
            error: {
              code: "APP_CONFIG_UNAVAILABLE",
              message: "Unable to load app configuration.",
            },
          },
          503,
          headers,
        );
      }

      const normalizedBaseUrl = `${baseUrl.replace(/\/+$/, "")}/`;
      const [featureFlags, configRows] = await Promise.all([
        fetchRows<unknown>(
          dependencies.fetch,
          normalizedBaseUrl,
          publicKey,
          "feature_flags",
          "key,enabled,platform,min_app_version",
        ),
        fetchRows<unknown>(
          dependencies.fetch,
          normalizedBaseUrl,
          publicKey,
          "app_config",
          "key,value",
        ),
      ]);

      if (
        !featureFlags.every(isFeatureFlag) ||
        !configRows.every(isAppConfigRow)
      ) {
        throw new Error("Configuration response was invalid");
      }

      const appConfig = Object.fromEntries(
        configRows.map(({ key, value }) => [key, value]),
      );
      return jsonResponse(
        {
          feature_flags: featureFlags,
          app_config: appConfig,
        },
        200,
        headers,
      );
    } catch {
      return jsonResponse(
        {
          error: {
            code: "APP_CONFIG_UNAVAILABLE",
            message: "Unable to load app configuration.",
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
