# Contract: Edge Functions (Phase 1)

All Edge Functions live in `backend/supabase/functions/`, validate input with the shared Zod schemas from
`packages/shared`, use `_shared/` helpers for CORS/auth/error formatting, and never embed the `service_role`
key anywhere a client can read it (constitution III).

| Function | Caller | Purpose | Notes |
| --- | --- | --- | --- |
| `app-config` | anyone (anon key) | Returns feature flags for the platform, minimum app version, support contacts | Phase 1 flags are always `false` for `shop_enabled`/`mating_enabled`/`adoption_enabled`/`payments_enabled`/`video_enabled` |
| `verify-otp-guard` *(planned; not implemented)* | mobile app, during email sign-in | **Approved Option C contract:** the future handler must generate and verify its own code, store only protected verification material, enforce server-side expiry/attempt/cancellation/lockout and per-email/per-IP send throttles, avoid account enumeration, and establish a normal refreshable Supabase session through a supported server-only path. It must not use Supabase's public email OTP primitives for this flow. | The owner approved Option C on 2026-10-27. No handler currently exists. T120/T138/T139 remain open because the supported custom-code-to-session path has not been proven and Supabase's public `/auth/v1/otp` and `/auth/v1/verify` endpoints remain callable with the anon key. Do not ship the handler until non-bypassability and session issuance are demonstrated; see `research.md` §17 and `tasks.md`. |
| `send-push` | `pg_cron` / service role | Drains `notification_outbox` through Expo Push, marks `sent`/`failed`, retries with backoff (up to 5 attempts), deletes push tokens Expo reports invalid | **Extended, 2026-10-19 (finding H1)**: re-checks the recipient's `notif_prefs` before sending, as a backstop — see `rpc-functions.md` |
| `admin-create-staff` | `admin`, clinic manager | Creates a pending invitation through `create_staff_invitation`, then sends the Auth invite; on acceptance, `accept_staff_invitation()` creates the profile and clinic assignment from the stored invitation. Managers are scoped to their own clinic and may invite vet/receptionist only; only platform admins may grant manager level. Definite email-send failures call `cancel_staff_invitation`; uncertain delivery leaves the invitation pending. | CS-01, CS-10; Owner decision T140 Option B (2026-10-27) |
| `admin-set-user-status` | `admin` | Suspends/restores a user: sets `profiles.status` and applies/removes the Auth ban so refresh stops immediately too; **calls `write_audit_log()`** (`rpc-functions.md`) rather than inserting into `audit_logs` directly | AUTH-10, AD-03 |
| `admin-broadcast` | `admin` | Queues a push broadcast to a segment (all / city / species owned / language) | AD-06 |
| `delete-account` | `owner` | Re-auth required; removes pets/files/tokens/profile; anonymizes appointments/reviews clinics must retain; deletes the auth user | AUTH-08 |
| `export-my-data` | `owner` | Returns a JSON archive of the caller's own data | AUTH-09 |
| `purge-storage-objects` *(new, 2026-10-19, finding C1)* | `pg_cron` + `pg_net` (service role), every 15 minutes | Drains `storage_cleanup_queue` through the Storage API's `remove()` in batches of ≤1000 — Supabase's own docs say a SQL `DELETE` never removes the underlying object, so `purge_soft_deleted()` (`rpc-functions.md`) only enqueues paths here rather than deleting them itself | PET-03/FR-013 |

## Reserved (Phase 4, inert — constitution VI)

`payments-create-intent`, `payments-webhook`, `payments-refund`, `video-create-room`, `video-token` are
**namespace-reserved** (the names must not be reused for anything else) but **not implemented** in Phase 1.
No code for them exists under `backend/supabase/functions/` until Phase 4 starts.
