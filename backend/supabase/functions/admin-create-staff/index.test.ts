import { createHandler } from "./index.ts";

const actorId = "91b6c50f-8b43-4a68-8120-8f9049f0a321";
const invitationId = "b17ddcc0-616a-46a1-85a6-88c4c03e6881";
const clinicId = "38cd1e28-bb37-47e6-aef3-fc7ad41b4294";
const publicKey = "public-test-key";
const serviceKey = "service-role-test-key";

function bearerFor(subject: string): string {
  const payload = btoa(JSON.stringify({ sub: subject }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `header.${payload}.signature`;
}

const token = bearerFor(actorId);
const baseEnv: Record<string, string> = {
  SUPABASE_URL: "https://project.example/",
  SUPABASE_ANON_KEY: publicKey,
  SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  DASHBOARD_URL: "https://dashboard.example",
};
const getEnv = (name: string) => baseEnv[name];

function inviteRequest(
  body: unknown = {
    email: "vet@example.test",
    full_name: "Test Vet",
    clinic_id: clinicId,
    staff_level: "vet",
  },
): Request {
  return new Request("https://function.example", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

Deno.test("admin-create-staff supports exact-origin CORS preflight", async () => {
  const handler = createHandler({
    getEnv: (name) =>
      name === "DASHBOARD_ORIGINS"
        ? "https://dashboard.example"
        : baseEnv[name],
    fetch,
  });
  const response = await handler(
    new Request("https://function.example", {
      method: "OPTIONS",
      headers: { origin: "https://dashboard.example" },
    }),
  );
  if (
    response.status !== 204 ||
    response.headers.get("access-control-allow-origin") !==
      "https://dashboard.example"
  ) {
    throw new Error("Expected configured origin on preflight response");
  }
});

Deno.test("admin-create-staff rejects malformed requests before network access", async () => {
  let calls = 0;
  const handler = createHandler({
    getEnv,
    fetch: async () => {
      calls += 1;
      return Response.json({});
    },
  });
  const response = await handler(
    inviteRequest({
      email: "not-an-email",
      clinic_id: clinicId,
      staff_level: "manager",
    }),
  );
  const body = await response.json();

  if (
    response.status !== 400 ||
    body.error?.code !== "INVALID_REQUEST" ||
    calls !== 0
  ) {
    throw new Error("Malformed input must be rejected before backend calls");
  }
});

Deno.test("admin-create-staff validates the user before creating a staff invitation", async () => {
  let rpcCalls = 0;
  const handler = createHandler({
    getEnv,
    fetch: async (input) => {
      if (String(input).endsWith("/auth/v1/user")) {
        return new Response("{}", { status: 401 });
      }
      rpcCalls += 1;
      return Response.json(invitationId);
    },
  });
  const response = await handler(inviteRequest());

  if (response.status !== 401 || rpcCalls !== 0) {
    throw new Error("An invalid session must not create an invitation");
  }
});

Deno.test("admin-create-staff rejects an unsafe dashboard callback before network access", async () => {
  let calls = 0;
  const handler = createHandler({
    getEnv: (name) =>
      name === "DASHBOARD_URL"
        ? "https://dashboard.example/path"
        : baseEnv[name],
    fetch: async () => {
      calls += 1;
      return Response.json({});
    },
  });
  const response = await handler(inviteRequest());
  if (response.status !== 503 || calls !== 0) {
    throw new Error(
      "An unsafe dashboard callback must be rejected before backend requests",
    );
  }
});

Deno.test("admin-create-staff uses caller authorization for policy RPC and service key only for Auth invite", async () => {
  const requests: Request[] = [];
  const handler = createHandler({
    getEnv,
    fetch: async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      if (request.url.endsWith("/auth/v1/user")) {
        return Response.json({ id: actorId });
      }
      if (request.url.endsWith("/rpc/create_staff_invitation")) {
        return Response.json(invitationId);
      }
      if (new URL(request.url).pathname.endsWith("/auth/v1/invite")) {
        return Response.json(
          { id: "8d68ed72-8d7d-45b1-8f79-1e61423e4ad2" },
          {
            status: 200,
          },
        );
      }
      throw new Error(`Unexpected request: ${request.url}`);
    },
  });
  const response = await handler(inviteRequest());
  const body = await response.json();

  if (
    response.status !== 201 ||
    body.status !== "sent" ||
    body.invitation_id !== invitationId
  ) {
    throw new Error("Expected successful staff invitation");
  }
  const rpc = requests.find((request) =>
    request.url.endsWith("/rpc/create_staff_invitation"),
  );
  const authInvite = requests.find((request) =>
    new URL(request.url).pathname.endsWith("/auth/v1/invite"),
  );
  if (!rpc || !authInvite) {
    throw new Error("Expected RPC and Auth invite requests");
  }
  if (
    rpc.headers.get("authorization") !== `Bearer ${token}` ||
    rpc.headers.get("apikey") !== publicKey
  ) {
    throw new Error(
      "Authorization RPC must carry the caller session, not the service key",
    );
  }
  if (
    authInvite.headers.get("authorization") !== `Bearer ${serviceKey}` ||
    authInvite.headers.get("apikey") !== serviceKey
  ) {
    throw new Error(
      "Only the Auth Admin invite request may use the service key",
    );
  }
  const rpcBody = await rpc.json();
  const emailBody = await authInvite.json();
  if (
    rpcBody.p_email !== "vet@example.test" ||
    rpcBody.p_staff_level !== "vet" ||
    rpcBody.p_clinic_id !== clinicId
  ) {
    throw new Error("RPC should receive normalized, validated invite values");
  }
  if (
    emailBody.email !== "vet@example.test" ||
    emailBody.data.staff_invitation_id !== invitationId
  ) {
    throw new Error(
      "The Auth invite should carry the already-authorized invitation reference",
    );
  }
  if (
    new URL(authInvite.url).searchParams.get("redirect_to") !==
    "https://dashboard.example/api/auth/confirm?next=%2Fen%2Faccept-invite"
  ) {
    throw new Error(
      "The invite link must return through the server-side token-hash callback",
    );
  }
});

Deno.test("admin-create-staff preserves the invited locale in the SSR callback", async () => {
  let redirectTo = "";
  const handler = createHandler({
    getEnv,
    fetch: async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/v1/user") return Response.json({ id: actorId });
      if (url.pathname === "/rest/v1/rpc/create_staff_invitation") {
        return Response.json(invitationId);
      }
      if (url.pathname === "/auth/v1/invite") {
        redirectTo = url.searchParams.get("redirect_to") ?? "";
        return Response.json({ id: actorId });
      }
      throw new Error(`Unexpected request ${url.pathname} ${init?.method ?? "GET"}`);
    },
  });
  const response = await handler(inviteRequest({
    email: "vet@example.test",
    full_name: "Test Vet",
    clinic_id: clinicId,
    staff_level: "vet",
    locale: "ar",
  }));

  if (
    response.status !== 201 ||
    new URL(redirectTo).searchParams.get("next") !== "/ar/accept-invite"
  ) {
    throw new Error("The invited locale must be preserved through the SSR callback");
  }
});

Deno.test("admin-create-staff does not send email after policy RPC rejects the caller", async () => {
  let authInviteCalls = 0;
  const handler = createHandler({
    getEnv,
    fetch: async (input) => {
      if (String(input).endsWith("/auth/v1/user")) {
        return Response.json({ id: actorId });
      }
      if (String(input).endsWith("/rpc/create_staff_invitation")) {
        return new Response("forbidden", { status: 403 });
      }
      authInviteCalls += 1;
      return Response.json({});
    },
  });
  const response = await handler(
    inviteRequest({
      email: "manager@example.test",
      clinic_id: clinicId,
      staff_level: "manager",
    }),
  );

  if (response.status !== 403 || authInviteCalls !== 0) {
    throw new Error(
      "A policy rejection must happen before any invite email is sent",
    );
  }
});

Deno.test("admin-create-staff cancels its pending invitation after a definite Auth delivery failure", async () => {
  const requests: Request[] = [];
  const handler = createHandler({
    getEnv,
    fetch: async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      if (request.url.endsWith("/auth/v1/user")) {
        return Response.json({ id: actorId });
      }
      if (request.url.endsWith("/rpc/create_staff_invitation")) {
        return Response.json(invitationId);
      }
      if (new URL(request.url).pathname.endsWith("/auth/v1/invite")) {
        return new Response("mail not configured", { status: 500 });
      }
      if (request.url.endsWith("/rpc/cancel_staff_invitation")) {
        return new Response(null, { status: 204 });
      }
      throw new Error(`Unexpected request: ${request.url}`);
    },
  });
  const response = await handler(inviteRequest());
  const cancel = requests.find((request) =>
    request.url.endsWith("/rpc/cancel_staff_invitation"),
  );

  if (
    response.status !== 503 ||
    !cancel ||
    cancel.headers.get("authorization") !== `Bearer ${token}`
  ) {
    throw new Error(
      "Definite delivery failure should cancel the invitation through caller-authorized RPC",
    );
  }
  if ((await cancel.json()).p_invitation_id !== invitationId) {
    throw new Error(
      "Cancellation must target only the newly created invitation",
    );
  }
});

Deno.test("admin-create-staff leaves an invitation usable when delivery outcome is ambiguous", async () => {
  const handler = createHandler({
    getEnv,
    fetch: async (input) => {
      if (String(input).endsWith("/auth/v1/user")) {
        return Response.json({ id: actorId });
      }
      if (String(input).endsWith("/rpc/create_staff_invitation")) {
        return Response.json(invitationId);
      }
      throw new Error("simulated network loss after invite request began");
    },
  });
  const response = await handler(inviteRequest());
  const body = await response.json();

  if (
    response.status !== 503 ||
    body.error?.code !== "INVITATION_DELIVERY_UNCONFIRMED"
  ) {
    throw new Error(
      "Ambiguous email delivery should be reported without revoking a possibly sent invite",
    );
  }
});
