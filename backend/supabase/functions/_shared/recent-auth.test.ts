import { requireRecentAuthentication } from "./recent-auth.ts";

function assertEquals(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

const now = 1_800_000_000_000;
const nowSeconds = Math.floor(now / 1000);
const recentClaims = {
  sub: "user-a",
  exp: nowSeconds + 3600,
  iat: nowSeconds,
  amr: [{ method: "otp", timestamp: nowSeconds - 60 }],
};

Deno.test("accepts an authentication event within five minutes", () => {
  assertEquals(
    requireRecentAuthentication(recentClaims, "user-a", "user-a", now),
    {
      ok: true,
      authenticatedAt: nowSeconds - 60,
    },
  );
});

Deno.test("rejects an authentication event older than five minutes even if iat is fresh", () => {
  assertEquals(
    requireRecentAuthentication(
      {
        ...recentClaims,
        amr: [{ method: "oauth", timestamp: nowSeconds - 301 }],
      },
      "user-a",
      "user-a",
      now,
    ),
    { ok: false, reason: "authentication_too_old" },
  );
});

Deno.test("rejects missing or malformed authentication timestamps", () => {
  assertEquals(
    requireRecentAuthentication(
      { sub: "user-a", exp: nowSeconds + 10 },
      "user-a",
      "user-a",
      now,
    ),
    {
      ok: false,
      reason: "missing_authentication_time",
    },
  );
  assertEquals(
    requireRecentAuthentication(
      {
        ...recentClaims,
        amr: [{ method: "token_refresh", timestamp: nowSeconds }],
      },
      "user-a",
      "user-a",
      now,
    ),
    { ok: false, reason: "missing_authentication_time" },
  );
});

Deno.test("ignores any client-supplied timestamp and reads freshness only from verified claims", () => {
  const request = {
    client_timestamp: nowSeconds,
    claims: {
      ...recentClaims,
      amr: [{ method: "otp", timestamp: nowSeconds - 600 }],
    },
  };
  assertEquals(
    requireRecentAuthentication(request.claims, "user-a", "user-a", now),
    {
      ok: false,
      reason: "authentication_too_old",
    },
  );
});

Deno.test("rejects expired sessions and future timestamps", () => {
  assertEquals(
    requireRecentAuthentication(
      { ...recentClaims, exp: nowSeconds },
      "user-a",
      "user-a",
      now,
    ),
    {
      ok: false,
      reason: "expired_session",
    },
  );
  assertEquals(
    requireRecentAuthentication(
      { ...recentClaims, amr: [{ method: "otp", timestamp: nowSeconds + 31 }] },
      "user-a",
      "user-a",
      now,
    ),
    { ok: false, reason: "authentication_too_old" },
  );
});

Deno.test("rejects cross-account deletion requests and subject mismatches", () => {
  assertEquals(
    requireRecentAuthentication(recentClaims, "user-a", "user-b", now),
    {
      ok: false,
      reason: "cross_account",
    },
  );
  assertEquals(
    requireRecentAuthentication(
      { ...recentClaims, sub: "user-b" },
      "user-a",
      "user-a",
      now,
    ),
    {
      ok: false,
      reason: "invalid_claims",
    },
  );
});
