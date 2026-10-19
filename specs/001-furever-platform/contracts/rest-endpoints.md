# Contract: REST (PostgREST) endpoints and Realtime channels (Phase 1)

All requests carry `apikey: <anon key>` and, for signed-in users, `Authorization: Bearer <access token>`.
Every client also sends `x-app-version` and `x-platform` so `app-config` can enforce minimum versions.
RLS is the only real access gate (constitution III); the endpoint list below exists for discoverability and
contract testing, not as an additional permission layer.

**Owner auth note (2026-10-18)**: owners sign in via email + a 6-digit code (Google and, on iOS, Apple
remain available) — never via `POST /auth/v1/otp` with a phone number, and mobile never calls Supabase
Auth's phone or email OTP endpoints directly at all. Every send/verify call goes through
`POST /functions/v1/verify-otp-guard` (`send-code`/`verify-code` actions — see
[edge-functions.md](./edge-functions.md)), which enforces the lockout, throttling, and no-enumeration
rules before ever touching Supabase Auth. There is no SMS path anywhere in Phase 1; Twilio is not
integrated. Dashboard sign-in (clinic staff/admins) is unaffected and still uses email + password directly
against Supabase Auth, with TOTP (`aal2`) for admins.

## Table API (direct PostgREST)

| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET, PATCH | `/rest/v1/profiles?id=eq.{uid}` | owner | Read/edit own profile |
| GET | `/rest/v1/breeds?species=eq.{species}&order=name_en` | any | Breed picker |
| GET | `/rest/v1/vaccine_types?species=eq.{species}` | any | Vaccine picker |
| GET, POST | `/rest/v1/pets` | owner | List/create pets |
| GET, PATCH, DELETE | `/rest/v1/pets?id=eq.{id}` | owner | Read/edit/soft-delete |
| GET, POST, PATCH | `/rest/v1/vaccinations?pet_id=eq.{id}` | owner, clinic staff | Vaccination timeline (edit restricted by `created_by_clinic_id`, Clarification 4) |
| GET, POST, PATCH | `/rest/v1/health_records?pet_id=eq.{id}` | owner, clinic staff | Health records (same edit restriction) |
| GET | `/rest/v1/clinics?id=eq.{id}&select=*,doctors(*),services(*)` | any | Clinic detail |
| GET | `/rest/v1/clinics?supports_emergency=eq.true&status=eq.active` | any | Emergency directory |
| GET | `/rest/v1/appointments?owner_id=eq.{uid}&order=starts_at.desc` | owner | My bookings |
| POST | `/rest/v1/reviews` | owner | Review a completed visit |
| GET, PATCH | `/rest/v1/notifications` | owner | Inbox / mark read |
| POST | `/rest/v1/push_tokens` (upsert on `token`) | owner | Register a device |

Dashboard calls reuse the same endpoints with staff/admin tokens; admin-only CRUD (clinics, reference data,
flags) uses the table API directly under RLS + `aal2`.

## RPC endpoints

See [rpc-functions.md](./rpc-functions.md); each is called as `POST /rest/v1/rpc/<function>`.

## Edge Function endpoints

See [edge-functions.md](./edge-functions.md); each is called as `POST /functions/v1/<name>` (or `GET` for
`app-config`).

## Realtime channels

| Channel | Type | Used by | Content |
| --- | --- | --- | --- |
| `queue:clinic:{clinic_id}` | Postgres Changes on `queue_tickets`, filtered by `clinic_id` | Clinic dashboard (`/clinic/queue`) | Every ticket change for the live board |
| `queue:doctor:{doctor_id}:{yyyy-mm-dd}` | Private channel (`realtime.messages`, RLS-authorized), broadcast via `realtime.broadcast_changes()` trigger | Owner app (`/bookings/[id]`) | Only `{ current_number, waiting_count }` — never another owner's identity or ticket (research.md §7) |
| `notifications:{user_id}` | Postgres Changes on `notifications` | Mobile + web | New inbox item, badge count |

Clients call `supabase.realtime.setAuth()` with the current JWT before subscribing to any private channel,
subscribe only while the relevant screen is open, and unsubscribe on blur. If a Realtime connection drops,
the queue card falls back to polling `get_queue_status` every 15 seconds (PRD section 14; research.md §7
risk note) — this fallback is a build requirement, not optional.

## Notification kinds and routing

| Kind | Trigger | Routes to |
| --- | --- | --- |
| `vaccination_due` | 7 days, 1 day, due date | `/pets/{pet_id}` Vaccinations tab |
| `booking_confirmed` | After booking | `/bookings/{id}` |
| `booking_reminder` | 24h and 2h before | `/bookings/{id}` |
| `queue_next` | Ticket called, or two ahead | `/bookings/{id}` |
| `booking_cancelled` | Cancelled by either side | `/bookings/{id}` |
| `review_prompt` | After completion | `/bookings/{id}/review` |
| `broadcast` | Admin message | `/notifications` or the payload's link |
