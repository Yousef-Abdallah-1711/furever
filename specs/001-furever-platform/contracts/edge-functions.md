# Contract: Edge Functions (Phase 1)

All Edge Functions live in `backend/supabase/functions/`, validate input with the shared Zod schemas from
`packages/shared`, use `_shared/` helpers for CORS/auth/error formatting, and never embed the `service_role`
key anywhere a client can read it (constitution III).

| Function | Caller | Purpose | Notes |
| --- | --- | --- | --- |
| `app-config` | anyone (anon key) | Returns feature flags for the platform, minimum app version, support contacts | Phase 1 flags are always `false` for `shop_enabled`/`mating_enabled`/`adoption_enabled`/`payments_enabled`/`video_enabled` |
| `verify-otp-guard` *(rewritten 2026-10-18 — was phone-keyed, now email-keyed)* | mobile app, during email sign-in | Exposes two actions, both keyed by a normalized email **identifier**: **`send-code`** checks `get_otp_lock_status` first (returns `OTP_LOCKED` with `unlock_at` if locked), enforces per-email and per-IP send throttling, returns an **identical response whether or not the email already has an account** (no enumeration), then calls `auth.signInWithOtp({ email })`. **`verify-code`** wraps `auth.verifyOtp`: on a wrong code, calls `record_otp_attempt(identifier, 'wrong')` and, on the 5th wrong attempt for that code, calls it again with `'cancelled'` and returns `CODE_CANCELLED` instead of forwarding to Auth; on success, calls `record_otp_attempt(identifier, 'success')` to clear counters, then proxies to `auth.verifyOtp` | Closes the gap in research.md §3; this is the **only** path mobile uses to send or verify an email OTP — it is never called directly against Supabase Auth from the client. Phone/SMS sign-in and Twilio Verify are removed from Phase 1 entirely (PRD amendment 10). **Enforceability note, added this fix pass (2026-10-18)**: this table describes the *intended* path, but Supabase Auth's `/auth/v1/otp` and `/auth/v1/verify` endpoints are public and reachable with the anon key regardless of this function's existence — the lockout above is enforced **only if the direct path is closed or rate-limited to match it** (`research.md` §17, "Is the email-code guard bypassable?"; `tasks.md` T120/T138, an open owner decision — §17 was extended this remediation pass with two more researched options, CAPTCHA and a longer OTP length, still not chosen). Until that decision is made and built, treat this guard as enforced for compliant clients only, not as a security boundary against a client that skips it |
| `send-push` | `pg_cron` / service role | Drains `notification_outbox` through Expo Push, marks `sent`/`failed`, retries with backoff (up to 5 attempts), deletes push tokens Expo reports invalid | **Extended, 2026-10-19 (finding H1)**: re-checks the recipient's `notif_prefs` before sending, as a backstop — see `rpc-functions.md` |
| `admin-create-staff` | `admin`, clinic manager | Creates the auth user, sets `profiles.role = 'clinic_staff'`, inserts `clinic_staff`, sends the invite email | CS-01, CS-10 |
| `admin-set-user-status` | `admin` | Suspends/restores a user: sets `profiles.status` and applies/removes the Auth ban so refresh stops immediately too; **calls `write_audit_log()`** (`rpc-functions.md`) rather than inserting into `audit_logs` directly | AUTH-10, AD-03 |
| `admin-broadcast` | `admin` | Queues a push broadcast to a segment (all / city / species owned / language) | AD-06 |
| `delete-account` | `owner` | Re-auth required; removes pets/files/tokens/profile; anonymizes appointments/reviews clinics must retain; deletes the auth user | AUTH-08 |
| `export-my-data` | `owner` | Returns a JSON archive of the caller's own data | AUTH-09 |
| `purge-storage-objects` *(new, 2026-10-19, finding C1)* | `pg_cron` + `pg_net` (service role), every 15 minutes | Drains `storage_cleanup_queue` through the Storage API's `remove()` in batches of ≤1000 — Supabase's own docs say a SQL `DELETE` never removes the underlying object, so `purge_soft_deleted()` (`rpc-functions.md`) only enqueues paths here rather than deleting them itself | PET-03/FR-013 |

## Reserved (Phase 4, inert — constitution VI)

`payments-create-intent`, `payments-webhook`, `payments-refund`, `video-create-room`, `video-token` are
**namespace-reserved** (the names must not be reused for anything else) but **not implemented** in Phase 1.
No code for them exists under `backend/supabase/functions/` until Phase 4 starts.
