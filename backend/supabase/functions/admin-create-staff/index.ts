type Dependencies = {
  getEnv: (name: string) => string | undefined;
  fetch: typeof fetch;
};

const defaultDependencies: Dependencies = {
  getEnv: (name) => Deno.env.get(name),
  fetch: (input, init) => fetch(input, init),
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
    "access-control-allow-methods": "POST, OPTIONS",
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

function json(
  body: unknown,
  status: number,
  headers: Record<string, string>,
): Response {
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

function tokenSubject(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims: unknown = JSON.parse(
      atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")),
    );
    if (typeof claims !== "object" || claims === null) return null;
    const subject = (claims as JsonRecord).sub;
    return typeof subject === "string" ? subject : null;
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

function errorBody(code: string, message: string) {
  return { error: { code, message } };
}

async function cancelInvitation(
  fetchImpl: typeof fetch,
  baseUrl: string,
  publicApiKey: string,
  bearer: string,
  invitationId: string,
): Promise<void> {
  const response = await fetchImpl(
    `${baseUrl}/rest/v1/rpc/cancel_staff_invitation`,
    {
      method: "POST",
      headers: {
        apikey: publicApiKey,
        authorization: `Bearer ${bearer}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ p_invitation_id: invitationId }),
    },
  );
  if (!response.ok) throw new Error("Invitation cancellation failed");
}

export function createHandler(
  dependencies: Dependencies = defaultDependencies,
) {
  return async (request: Request): Promise<Response> => {
    const headers = corsHeaders(request, dependencies.getEnv);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "POST") {
      return json(
        errorBody("METHOD_NOT_ALLOWED", "Method not allowed."),
        405,
        headers,
      );
    }
    const bearer = /^Bearer\s+(.+)$/i.exec(
      request.headers.get("authorization") ?? "",
    )?.[1];
    if (!bearer) {
      return json(
        errorBody("UNAUTHENTICATED", "Authentication required."),
        401,
        headers,
      );
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return json(
        errorBody("INVALID_REQUEST", "Request body must be valid JSON."),
        400,
        headers,
      );
    }
    if (typeof payload !== "object" || payload === null) {
      return json(
        errorBody("INVALID_REQUEST", "Invalid invitation request."),
        400,
        headers,
      );
    }
    const body = payload as JsonRecord;
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const clinicId = body.clinic_id;
    const staffLevel = body.staff_level;
    const fullName =
      body.full_name === undefined || body.full_name === null
        ? null
        : typeof body.full_name === "string"
          ? body.full_name.trim()
          : undefined;
    if (
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
      email.length > 254 ||
      !validUuid(clinicId) ||
      !["manager", "vet", "receptionist"].includes(String(staffLevel)) ||
      fullName === undefined ||
      (fullName !== null && fullName.length > 120)
    ) {
      return json(
        errorBody(
          "INVALID_REQUEST",
          "A valid email, clinic, and staff level are required; if supplied, the name must be valid.",
        ),
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
      if (!baseUrl || !serviceKey) {
        throw new Error("Backend configuration is incomplete");
      }

      const authResponse = await dependencies.fetch(`${baseUrl}/auth/v1/user`, {
        headers: { apikey: key, authorization: `Bearer ${bearer}` },
      });
      if (!authResponse.ok) {
        return json(
          errorBody("UNAUTHENTICATED", "Authentication required."),
          401,
          headers,
        );
      }
      const authUser: unknown = await authResponse.json();
      if (
        typeof authUser !== "object" ||
        authUser === null ||
        !validUuid((authUser as JsonRecord).id) ||
        tokenSubject(bearer) !== (authUser as JsonRecord).id
      ) {
        return json(
          errorBody("UNAUTHENTICATED", "Authentication required."),
          401,
          headers,
        );
      }

      const invitationResponse = await dependencies.fetch(
        `${baseUrl}/rest/v1/rpc/create_staff_invitation`,
        {
          method: "POST",
          headers: {
            apikey: key,
            authorization: `Bearer ${bearer}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            p_email: email,
            p_full_name: fullName,
            p_clinic_id: clinicId,
            p_staff_level: staffLevel,
          }),
        },
      );
      if (!invitationResponse.ok) {
        if (invitationResponse.status === 403) {
          return json(
            errorBody("FORBIDDEN", "You cannot invite this staff member."),
            403,
            headers,
          );
        }
        if (invitationResponse.status === 409) {
          return json(
            errorBody(
              "INVITATION_CONFLICT",
              "This account already exists or has an invitation.",
            ),
            409,
            headers,
          );
        }
        if (invitationResponse.status === 400) {
          return json(
            errorBody("INVALID_REQUEST", "Invitation details are invalid."),
            400,
            headers,
          );
        }
        return json(
          errorBody(
            "INVITATION_UNAVAILABLE",
            "Unable to create the invitation.",
          ),
          503,
          headers,
        );
      }
      const invitationId: unknown = await invitationResponse.json();
      if (!validUuid(invitationId)) {
        return json(
          errorBody(
            "INVITATION_UNAVAILABLE",
            "Unable to create the invitation.",
          ),
          503,
          headers,
        );
      }

      let emailResponse: Response;
      try {
        emailResponse = await dependencies.fetch(`${baseUrl}/auth/v1/invite`, {
          method: "POST",
          headers: {
            apikey: serviceKey,
            authorization: `Bearer ${serviceKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            email,
            data: { full_name: fullName, staff_invitation_id: invitationId },
          }),
        });
      } catch {
        // Delivery is ambiguous after a network failure, so keep the invitation usable.
        return json(
          errorBody(
            "INVITATION_DELIVERY_UNCONFIRMED",
            "Invitation delivery could not be confirmed.",
          ),
          503,
          headers,
        );
      }
      if (!emailResponse.ok) {
        try {
          await cancelInvitation(
            dependencies.fetch,
            baseUrl,
            key,
            bearer,
            invitationId,
          );
        } catch {
          return json(
            errorBody(
              "INVITATION_PARTIAL_FAILURE",
              "Unable to complete or cancel the invitation.",
            ),
            503,
            headers,
          );
        }
        return json(
          errorBody(
            "INVITATION_DELIVERY_FAILED",
            "The invitation email could not be sent.",
          ),
          503,
          headers,
        );
      }
      const invitedUser: unknown = await emailResponse.json();
      if (
        typeof invitedUser !== "object" ||
        invitedUser === null ||
        !validUuid((invitedUser as JsonRecord).id)
      ) {
        return json(
          errorBody(
            "INVITATION_DELIVERY_UNCONFIRMED",
            "Invitation delivery could not be confirmed.",
          ),
          503,
          headers,
        );
      }
      return json(
        { invitation_id: invitationId, status: "sent" },
        201,
        headers,
      );
    } catch {
      return json(
        errorBody(
          "INVITATION_UNAVAILABLE",
          "Unable to create the staff invitation.",
        ),
        503,
        headers,
      );
    }
  };
}

export const handler = createHandler();
if (import.meta.main) Deno.serve(handler);
