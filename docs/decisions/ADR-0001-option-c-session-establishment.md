# ADR-0001: Option C Supabase Session Establishment

- **Date:** 2026-10-27
- **Status:** Blocked; preserve the approved Option C contract
- **Scope:** D02 T120, T138, T139, T155, T194, T195, T213, T216
- **Owner policy:** Option C is approved; the owner explicitly directed that it remain blocked until
  a supported session path and bypass resistance are proven. This ADR records technical findings and
  does not request a new product decision.

## Context

Option C requires server-generated email codes, protected verification state, five wrong attempts per
code before cancellation, three cancellations per email in 60 minutes before a 15-minute lockout,
throttling, no account enumeration, resistance to public Auth endpoint bypass, and a normal refreshable
Supabase Auth session. The installed local Auth image is `public.ecr.aws/supabase/gotrue:v2.197.0`.

The existing local T120 probe used a synthetic email and the public anon key: three direct
`POST /auth/v1/otp` requests were accepted, while six deliberately invalid verification requests returned
`otp_expired`. Because the local email template was link-only, that probe did not establish five wrong
numeric-code attempts, cancellation of a live code, or lockout bypass. These are historical observations,
not tests rerun in this session.

## Options evaluated

| Architecture | Supported behavior | Security fit for Option C | Finding |
| --- | --- | --- | --- |
| A. Supabase-native email OTP | Auth issues and verifies its own OTP and creates the Auth session. Documented send/verify limits are primarily per user for sends and per IP for verification. | Does not enforce the product's per-code wrong-attempt limit or three-cancellation email lockout against calls made directly to the public Auth endpoints. | Rejected as a complete fit; changing the lockout contract requires owner authorization. |
| B. Auth hooks / server-side enforcement | Current documented hooks include custom access-token, send-email, send-SMS, MFA verification-attempt, and password verification-attempt. | No email-OTP verification-attempt hook is documented. Delivery hooks do not intercept verification; the access-token hook runs during token issuance. | Does not close the bypass. |
| C. Custom code then Supabase session | The Edge Function verifies a custom code and would need an Auth-supported exchange that returns a refreshable Auth session. | No documented API accepts an independently verified custom code and returns a normal Supabase session. `generateLink()` creates action links/tokens; redeeming one through `/auth/v1/verify` returns to the public verifier. | No supported bridge is established. Do not implement custom session or refresh-token issuance. |
| D. Self-hosted Supabase Auth | Self-hosting exposes Auth configuration and the same supported hooks. | Self-hosting changes deployment control, but the installed GoTrue verifier and hook inventory still expose no email-OTP attempt hook or supported custom-code session exchange. It would not close the gap without unsupported GoTrue changes or a product-contract change. | Does not solve the problem; deployment architecture remains unchanged. |

The Auth maintainers' open issue [#2819](https://github.com/supabase/auth/issues/2819) proposes a per-token
failed-attempt limit and describes current verification as IP-throttled without a per-token failed-attempt
counter. It is corroborating upstream evidence, not a shipped capability or a guarantee for a future
release. The local CLI reports Supabase CLI 2.121.0, and Docker reports the actual running GoTrue image
above. No Auth image or deployment configuration was changed.

## Decision and consequences

Keep Option C blocked and preserve the current D02 gate. Do not call `signInWithOtp` or `verifyOtp` as a
workaround, mint JWTs or refresh tokens, or treat service-role credentials as a user session. T120 remains
open until its live wrong-code/cancellation experiment is performed with a valid disposable numeric OTP;
T138/T139 remain blocked until supported session establishment and bypass resistance are proven. T216
continues to fail. D03 remains limited to its owner-approved exception, and D04 remains blocked.

The safest supported path is to retain Supabase Auth as the session issuer. Any change from the approved
Option C contract (including accepting Supabase-native limits instead) still needs an explicit owner
decision and a security review of the revised lockout semantics.

## Sources

- [Supabase Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)
- [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)
- [Supabase user sessions](https://supabase.com/docs/guides/auth/sessions)
- [Supabase Admin `generateLink()`](https://supabase.com/docs/reference/javascript/auth-admin-generatelink)
- [Supabase self-hosted Auth hooks](https://supabase.com/docs/guides/self-hosting/self-hosted-auth-hooks)
- [GoTrue v2.197.0 verification implementation](https://github.com/supabase/auth/blob/v2.197.0/internal/api/verify.go)
- [GoTrue proposal for per-token OTP failed-attempt limits](https://github.com/supabase/auth/issues/2819)
