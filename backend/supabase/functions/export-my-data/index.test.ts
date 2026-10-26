import { createHandler } from "./index.ts";

const userId = "91b6c50f-8b43-4a68-8120-8f9049f0a321";
const token = "verified-user-access-token";
const env = (values: Record<string, string>) => (name: string) => values[name];

function ownerRows(table: string): unknown[] {
  if (table === "profiles") {
    return [
      {
        id: userId,
        role: "owner",
        email: "owner@example.test",
        full_name: "Furever Owner",
      },
    ];
  }
  if (table === "consents") {
    return [
      {
        id: "consent-1",
        type: "terms",
        version: "1",
        accepted_at: "2026-10-01T00:00:00Z",
      },
    ];
  }
  return [
    {
      id: "device-1",
      platform: "ios",
      locale: "en",
      last_seen_at: "2026-10-26T00:00:00Z",
    },
  ];
}

function authResponse(id = userId): Response {
  return Response.json({ id });
}

Deno.test("export-my-data supports OPTIONS and applies configured exact-origin CORS", async () => {
  const handler = createHandler({
    getEnv: env({ DASHBOARD_ORIGINS: "https://dashboard.example" }),
    fetch,
    now: () => new Date("2026-10-27T12:00:00Z"),
  });
  const response = await handler(
    new Request("https://function.example", {
      method: "OPTIONS",
      headers: { origin: "https://dashboard.example" },
    }),
  );

  if (response.status !== 204) {
    throw new Error(`Expected 204, got ${response.status}`);
  }
  if (
    response.headers.get("access-control-allow-origin") !==
    "https://dashboard.example"
  ) {
    throw new Error("Expected configured dashboard origin");
  }
});

Deno.test("export-my-data rejects methods other than GET", async () => {
  const handler = createHandler({
    getEnv: () => undefined,
    fetch,
    now: () => new Date(),
  });
  const response = await handler(
    new Request("https://function.example", { method: "POST" }),
  );
  const body = await response.json();

  if (response.status !== 405 || body.error?.code !== "METHOD_NOT_ALLOWED") {
    throw new Error("Expected a structured 405 response");
  }
});

Deno.test("export-my-data requires a bearer token", async () => {
  const handler = createHandler({
    getEnv: () => undefined,
    fetch,
    now: () => new Date(),
  });
  const response = await handler(new Request("https://function.example"));
  const body = await response.json();

  if (response.status !== 401 || body.error?.code !== "UNAUTHENTICATED") {
    throw new Error("Expected an unauthenticated response");
  }
});

Deno.test("export-my-data validates the session and exports only the owner's visible rows", async () => {
  const requests: Request[] = [];
  const handler = createHandler({
    getEnv: env({
      SUPABASE_URL: "https://project.example/",
      SUPABASE_ANON_KEY: "public-key",
    }),
    fetch: async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      if (request.url.endsWith("/auth/v1/user")) return authResponse();
      return Response.json(
        ownerRows(new URL(request.url).pathname.split("/").at(-1) ?? ""),
      );
    },
    now: () => new Date("2026-10-27T12:00:00Z"),
  });
  const response = await handler(
    new Request("https://function.example", {
      headers: {
        authorization: `Bearer ${token}`,
        origin: "http://localhost:3100",
      },
    }),
  );
  const body = await response.json();

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }
  if (
    body.schema_version !== 1 ||
    body.exported_at !== "2026-10-27T12:00:00.000Z"
  ) {
    throw new Error("Expected versioned export metadata");
  }
  if (
    body.data?.profile?.email !== "owner@example.test" ||
    body.data.consents?.length !== 1 ||
    body.data.push_token_devices?.length !== 1
  ) {
    throw new Error("Expected the current-schema owner data sections");
  }
  if (JSON.stringify(body).includes("secret-push-token")) {
    throw new Error("The archive must not expose push credentials");
  }
  if (
    !body.unavailable_sections?.includes("pets") ||
    !body.unavailable_sections.includes("health_records") ||
    !body.unavailable_sections.includes("appointments")
  ) {
    throw new Error(
      "Expected data sections absent from the current schema to be identified",
    );
  }
  if (
    response.headers.get("content-disposition") !==
    'attachment; filename="furever-data-export.json"'
  ) {
    throw new Error("Expected a downloadable JSON archive");
  }
  if (response.headers.get("cache-control") !== "private, no-store") {
    throw new Error("Personal data exports must not be cached");
  }
  if (requests.length !== 4) {
    throw new Error(
      `Expected Auth plus three RLS reads, got ${requests.length}`,
    );
  }
  for (const request of requests) {
    if (
      request.headers.get("authorization") !== `Bearer ${token}` ||
      request.headers.get("apikey") !== "public-key"
    ) {
      throw new Error(
        "Every request must use the verified caller token and public key",
      );
    }
  }
  for (const request of requests.filter((item) =>
    item.url.includes("/rest/v1/"),
  )) {
    const url = new URL(request.url);
    const filter =
      url.searchParams.get("id") ?? url.searchParams.get("user_id");
    if (filter !== `eq.${userId}`) {
      throw new Error(
        "Each data query must be restricted to the verified user ID",
      );
    }
  }
});

Deno.test("export-my-data rejects invalid Auth sessions without querying user data", async () => {
  let dataQueryCount = 0;
  const handler = createHandler({
    getEnv: env({
      SUPABASE_URL: "https://project.example",
      SUPABASE_ANON_KEY: "public-key",
    }),
    fetch: async (input) => {
      if (String(input).endsWith("/auth/v1/user")) {
        return new Response("{}", { status: 401 });
      }
      dataQueryCount += 1;
      return Response.json([]);
    },
    now: () => new Date(),
  });
  const response = await handler(
    new Request("https://function.example", {
      headers: { authorization: `Bearer ${token}` },
    }),
  );

  if (response.status !== 401 || dataQueryCount !== 0) {
    throw new Error(
      "Invalid sessions must be rejected before querying exported data",
    );
  }
});

Deno.test("export-my-data denies non-owner profiles", async () => {
  let dataQueryCount = 0;
  const handler = createHandler({
    getEnv: env({
      SUPABASE_URL: "https://project.example",
      SUPABASE_ANON_KEY: "public-key",
    }),
    fetch: async (input, init) => {
      const request = new Request(input, init);
      if (request.url.endsWith("/auth/v1/user")) return authResponse();
      dataQueryCount += 1;
      return Response.json([{ id: userId, role: "clinic_staff" }]);
    },
    now: () => new Date(),
  });
  const response = await handler(
    new Request("https://function.example", {
      headers: { authorization: `Bearer ${token}` },
    }),
  );

  if (response.status !== 403 || dataQueryCount !== 1) {
    throw new Error(
      "Only owner profiles may export, and role rejection must precede other reads",
    );
  }
});

Deno.test("export-my-data returns a generic error when a RLS query fails", async () => {
  const handler = createHandler({
    getEnv: env({
      SUPABASE_URL: "https://project.example",
      SUPABASE_ANON_KEY: "public-key",
    }),
    fetch: async (input) => {
      if (String(input).endsWith("/auth/v1/user")) return authResponse();
      return new Response("database details", { status: 500 });
    },
    now: () => new Date(),
  });
  const response = await handler(
    new Request("https://function.example", {
      headers: { authorization: `Bearer ${token}` },
    }),
  );
  const body = await response.json();

  if (
    response.status !== 503 ||
    body.error?.code !== "EXPORT_UNAVAILABLE" ||
    JSON.stringify(body).includes("database details")
  ) {
    throw new Error(
      "Export failures must be generic and must not disclose backend details",
    );
  }
});
