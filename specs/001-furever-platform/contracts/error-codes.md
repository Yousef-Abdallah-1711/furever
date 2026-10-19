# Contract: Error codes (Phase 1)

RPC errors raise a short upper-case code with a custom SQLSTATE so PostgREST maps the HTTP status (e.g.
`raise exception 'SLOT_TAKEN' using errcode = 'PT409'`). Edge Function errors return
`{ "error": { "code": "...", "message": "..." } }`. Clients translate `code` into the user's language via
`packages/i18n` and **never** show raw server text (constitution IV).

| Code | HTTP | When |
| --- | --- | --- |
| `UNAUTHENTICATED` | 401 | Missing or expired token |
| `NOT_ALLOWED` | 403 | Role or ownership check failed |
| `ACCOUNT_SUSPENDED` | 403 | Suspended user |
| `VALIDATION_FAILED` | 422 | Zod/check constraint failed (includes field list) |
| `PET_NOT_FOUND` | 404 | Pet missing or not owned |
| `CLINIC_NOT_ACTIVE` | 422 | Clinic not accepting bookings |
| `SLOT_TAKEN` | 409 | Slot booked by someone else (BKG-02) |
| `SLOT_IN_PAST` | 422 | Slot already started |
| `CANCEL_WINDOW_PASSED` | 422 | Owner tried to cancel inside the 2-hour window (BKG-04, Clarification 1) |
| `CODE_CANCELLED` | 422 | 5th wrong attempt on a verification code; a new code must be requested (AUTH-01, Clarification 2) |
| `OTP_LOCKED` *(renamed 2026-10-18 — was `PHONE_LOCKED`)* | 429 | 3rd cancelled code within 60 minutes for this **email address**; response includes `unlock_at` |
| `OTP_SEND_RATE_LIMITED` *(new, 2026-10-18)* | 429 | A `send-code` request exceeded the per-email or per-IP send throttle (`verify-otp-guard`); response is identical in shape whether or not the email has an account, so this code alone never reveals account existence |
| `FEATURE_DISABLED` | 422 | Flag is off (reserved for Phase 2-4 — unreachable in Phase 1 since nothing calls a Phase 2-4 path) |
| `RATE_LIMITED` | 429 | Too many requests |
| `IDENTITY_ALREADY_LINKED` *(new, 2026-10-19, `/speckit-analyze` finding M1)* | 409 | The owner tried to link a Google account or an email/code identity (AUTH-06, `tasks.md` T174-T176) that is already attached to a **different** account; the client shows the "clear message" AUTH-06 requires instead of the raw Supabase error |
