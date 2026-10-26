import { createHandler } from "./index.ts";

const env = (values: Record<string, string>) => (name: string) => values[name];

Deno.test("app-config allows the local dashboard origin in OPTIONS", async () => {
  const handler = createHandler({ getEnv: () => undefined, fetch });
  const response = await handler(
    new Request("http://localhost", {
      method: "OPTIONS",
      headers: { origin: "http://localhost:3100" },
    }),
  );

  if (response.status !== 204)
    throw new Error(`Expected 204, got ${response.status}`);
  if (
    response.headers.get("access-control-allow-origin") !==
    "http://localhost:3100"
  ) {
    throw new Error("Expected the permitted local dashboard origin");
  }
  if (response.headers.get("vary") !== "Origin") {
    throw new Error("Expected Vary: Origin");
  }
});

Deno.test("app-config omits allow-origin for foreign OPTIONS origin", async () => {
  const handler = createHandler({ getEnv: () => undefined, fetch });
  const response = await handler(
    new Request("http://localhost", {
      method: "OPTIONS",
      headers: { origin: "https://attacker.example" },
    }),
  );

  if (response.headers.has("access-control-allow-origin")) {
    throw new Error("Expected foreign origin to be rejected");
  }
});

Deno.test("app-config only accepts GET and OPTIONS", async () => {
  const handler = createHandler({ getEnv: () => undefined, fetch });
  const response = await handler(
    new Request("http://localhost", { method: "POST" }),
  );
  const body = await response.json();

  if (response.status !== 405)
    throw new Error(`Expected 405, got ${response.status}`);
  if (body.error?.code !== "METHOD_NOT_ALLOWED")
    throw new Error("Expected structured method error");
});

Deno.test("app-config uses the legacy anon key and preserves configured data", async () => {
  const requests: Request[] = [];
  const handler = createHandler({
    getEnv: env({
      SUPABASE_URL: "https://project.example/",
      SUPABASE_ANON_KEY: "legacy-public-key",
      DASHBOARD_ORIGINS: "https://dashboard.example, http://127.0.0.1:3100",
    }),
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      const url = String(input);
      return Response.json(
        url.includes("feature_flags")
          ? [
              {
                key: "shop_enabled",
                enabled: false,
                platform: "ios",
                min_app_version: "1.2.0",
              },
            ]
          : [{ key: "support", value: { email: "configured@example.test" } }],
      );
    },
  });
  const response = await handler(
    new Request("http://localhost", {
      headers: {
        origin: "http://127.0.0.1:3100",
        "x-app-version": "1.0.0",
        "x-platform": "ios",
      },
    }),
  );
  const body = await response.json();

  if (response.status !== 200)
    throw new Error(`Expected 200, got ${response.status}`);
  if (
    response.headers.get("access-control-allow-origin") !==
    "http://127.0.0.1:3100"
  ) {
    throw new Error("Expected the permitted local dashboard origin");
  }
  if (
    body.feature_flags?.[0]?.min_app_version !== "1.2.0" ||
    body.feature_flags[0].platform !== "ios"
  ) {
    throw new Error(
      "Expected flag platform and minimum version to be preserved",
    );
  }
  if (body.app_config?.support?.email !== "configured@example.test") {
    throw new Error("Expected configured app_config value");
  }
  if (
    requests.length !== 2 ||
    requests.some(
      (request) => request.headers.get("apikey") !== "legacy-public-key",
    )
  ) {
    throw new Error("Expected both reads to use the legacy public anon key");
  }
});

Deno.test("app-config omits allow-origin for foreign GET origin", async () => {
  const handler = createHandler({
    getEnv: env({
      SUPABASE_URL: "https://project.example",
      SUPABASE_ANON_KEY: "legacy-public-key",
    }),
    fetch: async () => Response.json([]),
  });
  const response = await handler(
    new Request("http://localhost", {
      headers: { origin: "https://attacker.example" },
    }),
  );

  if (response.status !== 200)
    throw new Error(`Expected 200, got ${response.status}`);
  if (response.headers.has("access-control-allow-origin")) {
    throw new Error("Expected foreign origin to be rejected");
  }
});

Deno.test("app-config selects the default publishable key from the key map", async () => {
  const requests: Request[] = [];
  const handler = createHandler({
    getEnv: env({
      SUPABASE_URL: "https://project.example",
      SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({
        default: "default-public-key",
        dashboard: "other-public-key",
      }),
    }),
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json([]);
    },
  });
  const response = await handler(new Request("http://localhost"));

  if (response.status !== 200)
    throw new Error(`Expected 200, got ${response.status}`);
  if (
    requests.length !== 2 ||
    requests.some(
      (request) => request.headers.get("apikey") !== "default-public-key",
    )
  ) {
    throw new Error("Expected reads to use the default publishable key");
  }
});

Deno.test("app-config represents missing settings as empty collections", async () => {
  const handler = createHandler({
    getEnv: env({
      SUPABASE_URL: "https://project.example",
      SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: "publishable-key" }),
    }),
    fetch: async () => Response.json([]),
  });
  const response = await handler(new Request("http://localhost"));
  const body = await response.json();

  if (response.status !== 200)
    throw new Error(`Expected 200, got ${response.status}`);
  if (!Array.isArray(body.feature_flags) || body.feature_flags.length !== 0) {
    throw new Error("Expected no flags to be an empty array");
  }
  if (Object.keys(body.app_config ?? {}).length !== 0) {
    throw new Error("Expected missing configuration to be an empty object");
  }
});

Deno.test("app-config returns a generic error for an invalid public key map", async () => {
  const handler = createHandler({
    getEnv: env({
      SUPABASE_URL: "https://project.example",
      SUPABASE_PUBLISHABLE_KEYS: "not valid json",
    }),
    fetch: async () => {
      throw new Error("fetch should not run without a valid public key");
    },
  });
  const response = await handler(new Request("http://localhost"));
  const text = await response.text();

  if (response.status !== 503)
    throw new Error(`Expected 503, got ${response.status}`);
  if (
    !text.includes("APP_CONFIG_UNAVAILABLE") ||
    text.includes("not valid json")
  ) {
    throw new Error("Expected a generic error without key-map details");
  }
});

Deno.test("app-config hides backend errors behind a generic structured response", async () => {
  const handler = createHandler({
    getEnv: env({
      SUPABASE_URL: "https://project.example",
      SUPABASE_ANON_KEY: "legacy-public-key",
    }),
    fetch: async () => new Response("database secret details", { status: 500 }),
  });
  const response = await handler(new Request("http://localhost"));
  const text = await response.text();

  if (response.status !== 503)
    throw new Error(`Expected 503, got ${response.status}`);
  if (
    text.includes("database secret details") ||
    !text.includes("APP_CONFIG_UNAVAILABLE")
  ) {
    throw new Error("Expected a generic error without backend details");
  }
});
