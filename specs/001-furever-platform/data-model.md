# Data Model: FurEver Platform (Phase 1 only)

Source of truth for shape: `docs/PRD.md` section 7, amended per `plan.md` → PRD amendments. Phase 2-4 tables
(`docs/future-phases.md`) are **not** created in Phase 1 migrations — not even as empty stubs, per
constitution VI. Conventions (from the PRD, unchanged): `snake_case`, plural tables, singular enums; every
table has `id uuid primary key default gen_random_uuid()`, `created_at timestamptz not null default now()`,
`updated_at` via a shared trigger; all times `timestamptz` in UTC, displayed in `Africa/Cairo`; money is
`integer` piastres + `currency text default 'EGP'`; bilingual content is paired columns (`name_en`,
`name_ar`); user-owned data is soft-deleted (`deleted_at`) with a 30-day purge job (`purge_soft_deleted()`
— see "Purge mechanism" under Platform, added 2026-10-19); every table enables RLS in the same migration
that creates it (constitution III, VII).

## Enums (Phase 1)

| Enum | Values | Notes |
| --- | --- | --- |
| `app_role` | `owner`, `clinic_staff`, `admin`, `super_admin` | |
| `user_status` | `active`, `suspended`, `deleted` | |
| `staff_level` | `manager`, `vet`, `receptionist` | |
| `species` | `cat`, `dog`, `bird`, `rabbit`, `other` | |
| `pet_gender` | `male`, `female`, `unknown` | |
| `record_type` | `visit`, `allergy`, `medication`, `surgery`, `lab`, `note` | |
| `record_source` | `self`, `clinic` | Drives the "Added by you" / "Verified by `<clinic>`" label (Clarification 4) |
| `clinic_status` | `pending`, `active`, `suspended` | |
| `appointment_type` | `in_clinic`, `video` | Phase 1 writes only `in_clinic`; `video` is a Phase 4 hook kept inert — enforced by the `video_enabled` flag (always false), not by removing the enum value (constitution VI) |
| `appointment_status` | `pending`, `confirmed`, `checked_in`, `in_progress`, `completed`, `cancelled`, `no_show` | |
| `payment_status` | `unpaid`, `pay_at_clinic`, `paid`, `refunded` | Phase 1 only ever writes `pay_at_clinic` — a Phase 4 hook |
| `ticket_status` | `waiting`, `called`, `in_progress`, `done`, `skipped` | |
| `outbox_status` | `pending`, `sent`, `failed` | |
| `cancelled_by_role` | `owner`, `clinic_staff` | New: distinguishes which cancellation rule applied (Clarification 1) |

## PRD-amended fields (flagged inline below)

- **Queue display (PRD amendment 1)**: `doctors.queue_prefix` (one letter) + `queue_tickets.ticket_number`
  (integer, unique per doctor per day) — apps concatenate them as `A-14`. No `ticket_number` text format is
  stored; formatting is a display concern.
- **Verification lockout (research.md §3)**: new `otp_attempts` table backs the Edge Function guard in front
  of `auth.verifyOtp`, since Supabase Auth has no native per-identifier attempt/lockout control. Keyed by
  a normalized email `identifier` since 2026-10-18's sign-in method change (was `phone_number` — Phase 1
  no longer signs owners in by phone/SMS at all; Twilio is removed).
- **Clinic-verified edit rights (Clarification 4)**: `vaccinations` and `health_records` gain
  `created_by_clinic_id` so RLS can restrict edits to "that same clinic's staff only."
- **Cancellation enforcement (Clarification 1 / PRD amendment 4)**: `appointments.cancelled_by_role` records
  whether the 2-hour owner rule or the staff-anytime rule applied; the rule itself is enforced in the
  `cancel_appointment` RPC (see `contracts/`), not by a trigger or check constraint, because it depends on
  the caller's role at call time.
- **Check-in by code (new)**: `appointments.booking_code` is a short, human-typeable, unique code (separate
  from the UUID `id`) so a receptionist can type it when a QR scan fails; see `contracts/rpc-functions.md`
  for how `check_in_appointment` validates either input.
- **Schedule-conflict flag (new, CS-04)**: `appointments.flagged_for_staff` (boolean, default `false`) is
  set by `set_schedule_exception` when a new exception or schedule change covers an existing booking, so
  staff have something concrete to act on instead of discovering the conflict manually.
- **Clinic admin reads are RPC-only (new)**: admins have **no direct `SELECT`** on `pets`, `vaccinations`,
  `health_records`, or `record_attachments` — see the Row Level Security summary below and
  `contracts/rpc-functions.md`'s `admin_get_pet`/`admin_get_pet_timeline`, both of which call the shared
  `write_audit_log()` helper (see "Platform" below) instead of inserting into `audit_logs` directly.
- **Rating maintenance (new, REV-01/AD-09)**: `clinics.rating_avg`/`rating_count` are recomputed by a
  trigger function (`recompute_clinic_rating`, see `contracts/rpc-functions.md`) on every `reviews` insert
  and every `is_hidden` change — never computed ad hoc on read.

## Creation order by delivery phase

Tables are created in this order so every foreign key points at a table that already exists (constitution
III, IV); the base D02 tables follow `tasks.md` T120-T132, with `staff_invitations` added later by T140
for the approved invitation lifecycle. Later phases follow T199-T200 (D03), T215-T220 (D04), T244-T250
(D05), T278 (D06), and T314/T321 (D07).

| Phase | Tables created, in order | Count |
| --- | --- | --- |
| D02 | `cities` -> `profiles` -> `clinics` (slim: `name_en`, `name_ar`, `city_id`, `status`) -> `clinic_staff`, `staff_invitations` -> `push_tokens`, `consents` -> `feature_flags`, `app_config` -> `audit_logs` -> `otp_attempts` | 11 |
| D03 | `breeds` → `pets` | 2 |
| D04 | `vaccine_types` → `vaccinations` → `health_records` → `record_attachments` → `notifications`, `notification_outbox` | 6 |
| D05 | `specialties` → **extends** `clinics` (adds `description_*`, `phone`, `whatsapp`, `address_*`, `location geography(Point)`, `logo_path`, `cover_path`, `opening_hours jsonb`, `is_24h`, `supports_emergency`, `rating_avg`, `rating_count` + the GiST/trigram search indexes — no new table) → `doctors` → `services` → `doctor_services` → `doctor_schedules` → `schedule_exceptions` | 6 |
| D06 | `appointments` | 1 |
| D07 | `queue_tickets` → `reviews` | 2 |
| **Total** | | **28** |

**28 tables, not 27** -- the D02 staff-invitation ledger was added for the approved T140 invitation flow.

## Reference and configuration

| Table | Purpose | Key columns |
| --- | --- | --- |
| `cities` | Launch cities | `name_en`, `name_ar`, `is_active` |
| `breeds` | Breed list per species | `species`, `name_en`, `name_ar` |
| `vaccine_types` | Vaccines and their rules | `species`, `name_en`, `name_ar`, `interval_days`, `is_core` |
| `specialties` | Doctor specialties | `name_en`, `name_ar` |
| `feature_flags` | Server-controlled flags | `key` (pk), `enabled`, `platform`, `min_app_version` — Phase 1 seeds `shop_enabled`, `mating_enabled`, `adoption_enabled`, `payments_enabled`, `video_enabled`, all `false` (constitution VI) |
| `app_config` | Key-value settings | `key` (pk), `value jsonb` |

## Identity

| Table | Purpose | Key columns |
| --- | --- | --- |
| `profiles` | One row per auth user | `full_name`, `email` (required — the sign-in identifier, stored normalized lowercase), **`phone`** *(changed 2026-10-18: nullable/optional — not used for sign-in or verification in Phase 1; see `auth.users.phone` note below)*, `avatar_path`, `city_id`, `role` (`app_role`), `status` (`user_status`), `locale`, `theme`, **`notif_prefs jsonb`** *(now wired, 2026-10-19 — three
booleans: `vaccination_reminders`/`booking_updates`/`offers`, default `true`; previously present in the
model but read by nothing, `/speckit-analyze` finding H1)*, `deleted_at` |
| `clinic_staff` | Who works where | `clinic_id`, `user_id`, `staff_level` (pk on both ids) |
| `staff_invitations` | Pending/accepted/revoked staff invitations and the server-bound clinic/level | `email`, `clinic_id`, `staff_level`, `invited_by`, `accepted_at`, `accepted_user_id`, `revoked_at` |
| `push_tokens` | Device tokens | `user_id`, `token` (unique), `platform`, `locale`, `last_seen_at` |
| `consents` | Legal acceptance log | `user_id`, `type`, `version`, `accepted_at` |
| `otp_attempts` *(new; column renamed 2026-10-18)* | Backs the verification-lockout rule | `identifier` (unique, normalized lowercase email — **was `phone_number`**), `wrong_count` (resets per code), `cancelled_count` (window-scoped), `window_started_at`, `locked_until`, `updated_at` |

**Auth phone note (2026-10-18)**: Supabase's own `auth.users.phone` column (used for Phase 1's original
phone-OTP sign-in) is **not used** in Phase 1 at all now — `profiles.phone` is a plain, unverified,
optional contact-info column populated from the Complete profile / Edit profile screens, unrelated to
Supabase Auth's identity system.

## Pets and health passport

| Table | Purpose | Key columns |
| --- | --- | --- |
| `pets` | Pet profile | `owner_id`, `name`, `species`, `breed_id`, `gender`, `birth_date`, `weight_kg`, `color`, `microchip_no`, `is_neutered`, `photo_path`, `notes`, `deleted_at` |
| `vaccinations` | Given/planned vaccines | `pet_id`, `vaccine_type_id`, `given_on`, `next_due_on`, `batch_no`, `vet_name`, `clinic_id`, `document_path`, `source` (`record_source`), `created_by`, **`created_by_clinic_id`** *(new, nullable, set when `source = 'clinic'`)* |
| `health_records` | Timeline entries | `pet_id`, `record_type`, `title`, `description`, `recorded_on`, `clinic_id`, `created_by`, `source` (`record_source`), **`created_by_clinic_id`** *(new, nullable)* |
| `record_attachments` | Files on a record | `record_id`, `path`, `mime`, `size_bytes` |

**D03 pet Storage layout:** `pet-photos` and `pet-documents` are private buckets with a 10 MiB per-object
limit and bucket-specific MIME allowlists. Client object names use `{authenticated owner UUID}/{pet UUID}/
{random filename}`. Storage RLS verifies the authenticated owner segment, references a live pet row owned by
that user, and calls the same active-profile/current-consent guard as pet-table access. Authenticated owners
can read, add, and remove only objects under their active pets; anonymous access and overwrite/update are
denied. A soft-deleted pet or suspended/deleted/incomplete account loses Storage access immediately. Future
D04 clinic access must extend these policies against appointment and record ownership before clinic reads
are enabled.

## Clinics and booking

| Table | Purpose | Key columns |
| --- | --- | --- |
| `clinics` | Partner clinics | **Created slim in D02** (FK target for `clinic_staff`/`vaccinations`/`health_records`/`appointments`/`queue_tickets`/`reviews`): `name_en`, `name_ar`, `city_id`, `status` (`clinic_status`). **Extended in D05**: adds `description_*`, `phone`, `whatsapp`, `address_*`, `location geography(Point)`, `logo_path`, `cover_path`, `opening_hours jsonb`, `is_24h`, `supports_emergency`, `rating_avg`, `rating_count` |
| `doctors` | Vets at a clinic | `clinic_id`, `user_id` (nullable), `full_name`, `specialty_id`, `bio`, `years_experience`, `photo_path`, `is_active`, **`queue_prefix`** *(new, 1 char, unique per clinic — PRD amendment 1)* |
| `services` | Offered services | `clinic_id`, `name_en`, `name_ar`, `duration_min`, `price_minor`, `currency`, `species[]`, `is_active` |
| `doctor_services` | Doctor ↔ service | `doctor_id`, `service_id` |
| `doctor_schedules` | Weekly hours | `doctor_id`, `weekday` (0-6), `start_time`, `end_time`, `slot_minutes` |
| `schedule_exceptions` | Days off / special hours | `doctor_id`, `date`, `is_closed`, `start_time`, `end_time`, `reason` |
| `appointments` | Bookings | `owner_id`, `pet_id`, `clinic_id`, `doctor_id`, `service_id`, `type` (`appointment_type`), `starts_at`, `ends_at`, `status` (`appointment_status`), `payment_status`, `price_minor`, `notes`, `cancel_reason`, `cancelled_by`, **`cancelled_by_role`** *(new)*, **`booking_code`** *(new, short unique check-in code)*, **`flagged_for_staff`** *(new, boolean, schedule-conflict flag)*, `idempotency_key` (unique per owner) |
| `queue_tickets` | Live queue | `appointment_id`, `clinic_id`, `doctor_id`, `queue_date`, `ticket_number` (integer), `status` (`ticket_status`), `called_at` |
| `reviews` | One review per visit | `appointment_id` (unique), `owner_id`, `clinic_id`, `rating` (1-5), `comment`, `is_hidden` |

## Platform

| Table | Purpose | Key columns |
| --- | --- | --- |
| `notifications` | In-app inbox | `user_id`, `kind`, `title_key`, `body_key`, `params jsonb`, `data jsonb`, `read_at` |
| `notification_outbox` | Pending pushes | `user_id`, `kind`, `payload jsonb`, `dedupe_key` (unique), `status` (`outbox_status`), `attempts`, `send_after` |
| `audit_logs` | Admin/clinic actions + admin health-data reads | `actor_id`, `action`, `entity`, `entity_id`, `diff jsonb` |
| `storage_cleanup_queue` *(new, 2026-10-19, `/speckit-analyze` finding C1)* | Paths awaiting deletion through the Storage API | `bucket`, `path`, `queued_at`, `done_at` — service-role only; see "Purge mechanism" below |

**Purge mechanism (new, 2026-10-19; activation gated by owner amendment 2026-10-27)**: the planned
`security definer` function `purge_soft_deleted()` hard-deletes `pets`/`profiles` rows (and, from D04
onward, `vaccinations`/`health_records`/`record_attachments`, via cascade) where `deleted_at` is more than
30 days old, writing one `audit_logs` row per run via `write_audit_log()`; its planned daily `pg_cron` job
(03:00 `Africa/Cairo`, off-peak) must remain disabled until the proposed retention policy receives
Egyptian legal review and final owner approval. T222/T223 may implement idempotent cleanup and dry-run tests;
they are not complete while irreversible scheduling remains disabled. The 30-day period is not approved
as a legal requirement. The function also plans to delete
`otp_attempts` rows older than 7 days (an assumption — `spec.md`'s Assumptions). Because Supabase's own
docs state that Storage objects can only be removed through the Storage API, never a SQL `DELETE`, the
purge function does not touch `storage.objects` directly — it enqueues the `photo_path`/`document_path`/
attachment paths of every row it purges into `storage_cleanup_queue`, and a separate Edge Function
(`purge-storage-objects/`, planned for every 15 minutes via `pg_cron`+`pg_net`, but disabled until legal
review and owner approval) drains that queue through `storage.remove()` in batches of ≤1000.
`appointments` is **not** covered — it has no `deleted_at` column
(its lifecycle is the `status` enum), so there is nothing for this mechanism to purge there.

**Generic audit mechanism (new)**: a shared `security definer` function
`write_audit_log(p_actor_id, p_action, p_entity, p_entity_id, p_diff)` inserts into `audit_logs`; every
admin-write RPC/Edge Function calls this instead of inserting directly — `admin_get_pet`,
`admin_get_pet_timeline`, `set_clinic_status`, and the `admin-set-user-status` Edge Function all call it
(see `contracts/rpc-functions.md`). In addition, an `AFTER INSERT OR UPDATE OR DELETE` trigger calling the
same function is attached directly to `feature_flags`, `app_config`, and every reference table (`cities`,
`breeds`, `vaccine_types`, `specialties`) — these tables are admin-only-written, so every write to them is
audited automatically without each admin screen needing to remember to call the helper itself. Tables with
mixed writers (`profiles`, `clinics`) are **not** blanket-triggered — only their explicit RPC/Edge-Function
write paths call `write_audit_log()`, so an owner editing their own profile is never accidentally logged.

**Clinic reporting (new, 2026-10-19, `/speckit-analyze` finding H2)**: four RPCs/SQL views —
`clinic_report_bookings_per_day`, `clinic_report_no_show_rate`, `clinic_report_busiest_hours`,
`clinic_report_top_services` — each takes `(p_clinic_id, p_from, p_to)` and is RLS-gated so a caller only
ever sees their own `clinic_staff` row's clinic; these back CS-09 and are distinct from AD-05's
cross-clinic admin KPI views. See `contracts/rpc-functions.md`.

## Constraints that protect the data

- **No double booking**: `exclude using gist (doctor_id with =, tstzrange(starts_at, ends_at) with &&) where (status in ('pending','confirmed','checked_in','in_progress'))` on `appointments` (unchanged from PRD; serves BKG-02/FR-024).
- **Idempotent booking**: unique `(owner_id, idempotency_key)` on `appointments` (serves BKG-03/FR-025).
- **One review per visit**: unique `reviews.appointment_id`; insert policy requires `status = 'completed'` and ownership.
- **One ticket per appointment, no duplicate numbers**: unique `queue_tickets.appointment_id`; unique `(doctor_id, queue_date, ticket_number)` (serves QUE-01/FR-029, amended per PRD amendment 1).
- **Unique doctor prefix per clinic**: unique `(clinic_id, queue_prefix)` on `doctors`, so two doctors at the same clinic never produce the same displayed ticket (e.g., two `A-14`s).
- **Sane values**: `rating between 1 and 5`, `weight_kg > 0`, `ends_at > starts_at`, `birth_date <= current_date`, `price_minor >= 0`.
- **Phone format (optional field only)**: `profiles.phone`, when present, matches
  `^\+[1-9][0-9]{7,14}$` — the field is nullable and this check only applies to a non-null value.
- **Email format and normalization**: `profiles.email` and `otp_attempts.identifier` are stored lowercase
  and matched against a standard email-format check; `otp_attempts.identifier` is unique.
- **Notification dedupe**: unique `notification_outbox.dedupe_key` (e.g. `vaccination:<id>:7d`).
- **Clinic-only edit of clinic entries**: enforced in RLS (below), not a constraint — a check constraint
  cannot see the caller's clinic membership.
- **Unique check-in code**: unique `appointments.booking_code`.

## Indexes (day one)

| Table | Index | Serves |
| --- | --- | --- |
| `pets` | `(owner_id) where deleted_at is null` | My Pets, RLS |
| `vaccinations` | `(pet_id, next_due_on)`; partial `(next_due_on) where next_due_on is not null` | Timeline, reminder job |
| `clinics` | GiST on `location`; `(city_id, status)`; trigram on `name_en`, `name_ar` | Nearby, filters, search |
| `doctors`, `services` | `(clinic_id) where is_active` | Clinic page |
| `appointments` | `(owner_id, starts_at desc)`; `(clinic_id, starts_at)`; `(doctor_id, starts_at)` | My bookings, clinic day view, slots |
| `queue_tickets` | `(clinic_id, queue_date, status)` | Live board |
| `notifications` | `(user_id, created_at desc)`; partial `(user_id) where read_at is null` | Inbox, badge |
| `notification_outbox` | `(status, send_after)` | Worker |
| `audit_logs` | `(entity, entity_id)`; `(actor_id, created_at desc)` | Investigations |
| `otp_attempts` | `(identifier)` unique; partial `(locked_until) where locked_until is not null` | Verify-OTP guard lookups |

Every list endpoint paginates by keyset on `(created_at, id)` or `(starts_at, id)`, never `offset`
(constitution IV, PRD section 13).

## Row Level Security summary

Policies use `(select auth.uid())` and `(select auth.jwt() ->> 'user_role')`, evaluated once per query.

| Table | Select | Insert / update / delete |
| --- | --- | --- |
| `profiles` | Own row; admin all; clinic staff see owners with an appointment at their clinic (name/phone only) | Own row, excluding `role`/`status` |
| `pets`, `vaccinations`, `health_records`, `record_attachments` | Owner; clinic staff for pets with an appointment at their clinic; **no direct admin `SELECT`** — admins read only through `admin_get_pet`/`admin_get_pet_timeline` RPCs, each of which writes its own `audit_logs` row inside the same transaction before returning data | Owner for own pets, own entries only (`source = 'self'`). Clinic staff may insert with `source = 'clinic'` and their own `created_by_clinic_id` for pets with an appointment at their clinic; clinic staff may **update/delete only rows where `created_by_clinic_id` = their own clinic** (Clarification 4) |
| `clinics`, `doctors`, `services`, `doctor_schedules`, `schedule_exceptions` | Everyone for `status = 'active'` rows; that clinic's staff + admins for all | Clinic manager for own clinic (not `status`); admin all |
| `appointments`, `queue_tickets` | Owner for own; clinic staff for own clinic; admin | Only through RPC (direct writes revoked) — the cancel RPC checks the 2-hour rule for `owner` callers and allows `clinic_staff` at any time with a required reason (Clarification 1) |
| `reviews` | Everyone for `is_hidden = false` | Owner once per completed visit; admin may hide |
| `notifications`, `push_tokens` | Own rows | Own rows; `notifications` inserted only by the service role |
| `notification_outbox`, `audit_logs`, `otp_attempts` | Admin only (`otp_attempts`: service role only, not even admin — it's a security control, not an audit view) | Service role / Edge Functions only — `audit_logs` is written exclusively through `write_audit_log()` (direct calls and the `feature_flags`/`app_config`/reference-table triggers), never a raw `INSERT` from a client |
| Reference tables, `feature_flags`, `app_config` | Everyone (flags filtered by platform) | `admin`/`super_admin` write; flags and config: `super_admin` only |

CI fails the build if any `public` table has RLS disabled; every policy above gets a pgTAP test
(constitution III, VII).

## Out of scope here

Phase 2-4 tables (`products`, `orders`, `listings`, `payments`, `subscriptions`, `video_sessions`, etc.) are
not created in Phase 1 migrations. `docs/future-phases.md` lists them for continuity; they are consulted
only to confirm the Phase 4 **hooks** already baked into Phase 1 tables above (`appointment_type.video`,
`payment_status`, `price_minor`/`currency`) stay inert.
