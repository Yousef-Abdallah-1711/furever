# Implementation Plan: FurEver Platform (Phase 1)

**Branch**: `001-furever-platform` | **Date**: 2026-10-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-furever-platform/spec.md`, product-phase-1 scope only.
Phase 2-4 content lives in `docs/future-phases.md` and is explicitly out of scope for this plan.

**Naming note**: "Delivery Phase D00" through "D08" below are implementation-sequencing stages for Phase 1
only — they are not the product's Phase 1-4 scope tiers (constitution VI), and they are not Spec Kit's own
internal "Phase 0 research / Phase 1 design" (Phase 0/Phase 1 keep their usual Spec Kit meaning inside this
document's own workflow sections).

## Summary

Build the FurEver Phase 1 product — bilingual (Arabic RTL/English LTR), light/dark, owner mobile app +
clinic/admin web dashboard on one Supabase backend — as nine sequential delivery phases (D00-D08) on top of
a pnpm/Turborepo monorepo. D00 stands up the whole stack (repo, Docker, CI, design tokens, i18n, RTL/theme
shells) so every later phase only adds features. D01 ports the design system into real mobile/web
components. D02-D07 deliver the 59 Phase 1 user stories and their 70 screens in PRD sprint order
(auth → pets → vaccinations/notifications → clinics/admin → booking → queue/operations). D08 hardens and
launches. Nine PRD/design decisions that have since changed are recorded below as **PRD amendments** rather
than silently reconciled.

## Technical Context

**Language/Version**: TypeScript (strict mode everywhere, constitution X) across all four workspaces.

**Primary Dependencies**:
- Monorepo: pnpm workspaces + Turborepo, Biome (lint/format), commitlint + husky + lint-staged.
- `backend/`: Supabase (Postgres + RLS, Auth, PostgREST, Realtime, Storage, Edge Functions/Deno,
  `pg_cron`), a custom SMTP email provider for Auth emails (login code, staff invite, password reset — the
  built-in Supabase email service is explicitly not for production use, `research.md` §4-rewrite; provider
  chosen from official pricing/docs pages, no price invented here), Expo Push, Sentry, PostHog. Local
  development uses Supabase's local email inbox — no real email is sent outside staging/production.
- `mobile/`: Expo (version pinned by D00a from official sources only — `research.md` §1; do not assume a
  number here) + `expo-router` + `expo-dev-client`, NativeWind (version pinned by D00a alongside Expo),
  i18next, React Query, Zustand, react-hook-form + Zod.
- `web/`: Next.js (version pinned by D00a from nextjs.org only — `research.md` §2) App Router + Turbopack,
  shadcn/ui, next-intl, next-themes, React Query, react-hook-form + Zod.
- `packages/shared` (Zod schemas + generated DB types), `packages/i18n` (`ar.json`/`en.json`),
  `packages/design-tokens` (generated from `design/system/tokens/*.css`).

**Storage**: Supabase Postgres (RLS on every table), Supabase Storage (private buckets, signed URLs ≤ 60
min) for pet documents and media.

**Testing**: pgTAP (`supabase test db`), Jest (mobile unit), Vitest (web/shared unit), Testing Library
(component), Maestro (mobile E2E), Playwright (web E2E), k6 (load).

**Target Platform**: iOS 15+ and Android (Expo managed + EAS Build; iOS cannot be built locally —
`research.md` §5/§11), modern evergreen browsers for the web dashboard (desktop + tablet widths — reception
desks use tablets, PRD section 10).

**Project Type**: Mobile app + web dashboard + shared backend (three deployable apps, PRD section 4;
constitution "Project Scope").

**Performance Goals** (PRD section 14, unchanged): API p95 reads < 300 ms / writes < 500 ms; slot
search/booking p95 < 400 ms / < 600 ms; queue update visible to the owner < 3 s; mobile cold start < 2.5 s on
a mid-range Android phone; 60 fps on 500-item lists (FlashList); dashboard LCP < 2.5 s.

**Constraints**: Arabic RTL + English LTR + light/dark = 4 combinations, all mandatory (constitution II);
offline-tolerant mobile reads (PLT-03); Windows developer machine with Docker Desktop/WSL2
(`research.md` §10-§11); no raw hex/px/non-token styling (constitution I); Phase 4 hooks must compile and
stay inert (constitution VI).

**Scale/Scope**: 59 Phase 1 user stories, 70 Phase 1 screens (owner mobile 41, clinic dashboard 12, admin
dashboard 17 — the 70th, Setup Summary, was a gap found during task generation and has since been added to
`spec.md`'s Screen Coverage) — see Coverage Table below; designed for the PRD's 1M-registered-user capacity plan
(section 13) without a rewrite.

## Constitution Check

*GATE: checked before Phase 0 research below, and re-checked after Phase 1 design.* Walking
`.specify/memory/constitution.md` v1.1.0 principle by principle; ✅ = this plan satisfies it as designed, no
deviation needed.

| # | Principle | Status | Notes |
| --- | --- | --- | --- |
| I | Design Fidelity | ✅ | D01 ports `design/system/components/**/*.d.ts` prop-for-prop; `design/screens/<ID>.md` + `design/screen-map.md` generated in D00 (PRD amendment 7) |
| II | Localization, RTL, Themes | ✅ | D00 builds the RTL/theme/i18n shell before any feature; every delivery phase's exit criteria require all 4 combinations |
| III | Security and Privacy | ✅ | RLS in the same migration as every table (D00 CI check); signed URLs ≤ 60 min; `service_role` only in Supabase/CI secrets, never in app code; admin reads of health data have **no direct `SELECT`** path at all — only `admin_get_pet`/`admin_get_pet_timeline` RPCs, each writing its own `audit_logs` row in the same call (D07) |
| IV | Database and API Discipline | ✅ | Migrations-only, expand/contract, RPC transactions, keyset pagination, outbox — all unchanged from PRD sections 7-8, 13. **Remediation pass (finding C1)**: the soft-delete-with-a-purge-job bullet had no implementing task; `tasks.md` T217/T218/T237 now build `purge_soft_deleted()`, its `pg_cron` schedule, and the Storage-object cleanup queue |
| V | Architecture and Scaling | ✅ | `backend/`/`mobile/`/`web/` share only `packages/*`; Realtime restricted to queue channel, private + RLS-authorized (`research.md` §7) |
| VI | Phases and Feature Flags | ✅ | All five flags seeded `false` in D00; Phase 4 hooks (`price_minor`, `payment_status`, `video` enum value, reserved function namespaces) created inert in D00/D06 migrations, never wired to UI; `docs/future-phases.md` content is **not** scaffolded anywhere in D00-D08 |
| VII | Quality Gates | ✅ | Each delivery phase's exit criteria distinguish task-level checks (lint/types/unit) from story-level checks (E2E + pgTAP + 4-combination) per the amended principle |
| VIII | Operations | ✅ | D00 sets up local/staging/production Supabase projects + Sentry/PostHog scaffolding; D08 adds the production cutover and PITR restore drill |
| IX | Traceability | ✅ | Coverage Table below cites every story ID and screen ID against its delivery phase; `design/screen-map.md` (D00) is the screen-ID source once it exists |
| X | Engineering Standards | ✅ | TypeScript strict, Biome, pnpm+Turborepo, conventional commits, pinned deps (D00); Zod at every boundary (D00 base schemas, extended per phase) |

**No deviations are recorded.** Complexity Tracking (below) is therefore empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-furever-platform/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output — Phase 1 (product) tables only
├── quickstart.md         # Phase 1 output
├── contracts/            # Phase 1 output
│   ├── rpc-functions.md
│   ├── edge-functions.md
│   ├── rest-endpoints.md
│   └── error-codes.md
└── tasks.md              # /speckit-tasks output — NOT created by this plan
```

### Source code (repository root — created by Delivery Phase D00)

This is the PRD section 4 layout, reproduced exactly (no changes); `docs/PRD.md` and `design/system/` below
are the canonical paths the constitution and spec.md already reference — D00 places the current root-level
PRD and `FurEver Design System/` content into them.

```text
furever/
├── backend/
│   └── supabase/
│       ├── config.toml
│       ├── migrations/            # timestamped, immutable once merged
│       ├── functions/             # _shared/, app-config/, verify-otp-guard/, send-push/, admin-*, delete-account/, export-my-data/
│       ├── seed.sql
│       └── tests/                 # pgTAP
├── mobile/                        # Expo app for owners
│   ├── app/                       # expo-router: (auth), (tabs), clinics, pets, bookings...
│   ├── src/{features,components,lib,hooks,i18n}/
│   └── assets/
├── web/                           # Next.js dashboard (admin + clinic portal)
│   ├── app/[locale]/{(auth),(admin),(clinic)}/
│   ├── src/{features,components,lib,i18n}/
│   ├── middleware.ts
│   └── Dockerfile
├── packages/
│   ├── shared/                    # Zod schemas, enums, generated DB types
│   ├── i18n/                      # ar.json, en.json
│   └── design-tokens/             # generated from design/system/tokens/*.css
├── design/
│   ├── system/                    # ← placed here from `FurEver Design System/` in D00
│   │   ├── tokens/ components/ ui_kits/ guidelines/
│   ├── screens/<ID>.md            # generated by D00's extraction script
│   └── screen-map.md              # generated by D00's extraction script
├── docs/
│   ├── PRD.md                     # ← placed here from the root-level PRD in D00
│   └── future-phases.md           # already exists; not touched by D00-D08
├── .github/workflows/             # ci.yml, deploy-web.yml, eas-build.yml, db-migrate.yml
├── docker-compose.yml, web/Dockerfile, .dockerignore
├── biome.json  turbo.json  pnpm-workspace.yaml  package.json  .gitattributes  .nvmrc
└── README.md, quickstart.md
```

**Structure Decision**: Web-application-plus-mobile-plus-backend (PRD Option: three deployable apps sharing
only `packages/*`); matches constitution V exactly. No `src/` single-project layout applies here.

## PRD amendments

The PRD (root-level `FurEver — PRD...md`, to be exported as `docs/PRD.md` in D00) is outdated on the
following 10 points (was 9 before the 2026-10-18 sign-in method change added amendment 10); this plan
supersedes it on each, per the constitution's precedence rule (Constitution > PRD > design). These are
**not** silent corrections — the PRD text itself should be updated to match the next time it's touched.

1. **Queue ticket shape**: integer `ticket_number` per doctor per day (unique per `(doctor_id, queue_date)`)
   plus a one-letter `queue_prefix` per doctor (unique per clinic); apps display `A-14`-style strings
   client-side. See `data-model.md`.
2. **Light secondary text token**: `#6B6B6B`, not `#737373` (the PRD's own contrast note already flagged
   this; the design system's `tokens/colors.css` already ships `#6B6B6B` — only the PRD prose is stale).
3. **Verification lockout** *(rewritten 2026-10-18 — was phone-based, now email-based, see amendment 10)*:
   a code cancels after 5 wrong attempts (new code required, after the 60-second resend wait); 3 cancelled
   codes within 60 minutes locks that **email address** for 15 minutes with the unlock time shown. Sending
   codes is throttled per email address and per IP, with identical responses whether or not the email
   already has an account (no enumeration). Implemented via the `verify-otp-guard` Edge Function +
   `otp_attempts` table (keyed by a normalized `identifier`, not `phone_number`), since Supabase Auth has no
   native per-identifier lockout (`research.md` §3).
4. **Cancellation policy**: free cancellation until 2 hours before the visit; inside that window the owner
   sees the policy message + Call clinic button instead of a Cancel action; clinic staff may cancel any
   booking at any time with a required reason. Enforced inside `cancel_appointment` (RPC), never only in the
   UI.
5. **Onboarding**: follows the `mobile-entry` prototype exactly — pet creation is part of first-run
   onboarding (skippable), not a separate post-onboarding step.
6. **Platform specifics**: Sign in with Apple shown on iOS only (hidden entirely on Android, not just
   de-emphasized); Western digits in both languages; all times in `Africa/Cairo`.
7. **Design system as visual source of truth**: ported components keep the exact prop names/variants of
   `design/system/components/**/*.d.ts`; the kits are web prototypes to **port**, not copy — React Native
   cannot execute `color-mix()` or read CSS classes, so D00's token generator precomputes tint/shadow hex
   values per theme ahead of time.
8. **Clinic-verified record edit rights**: clinic vets/managers may add and edit records/vaccinations only
   for pets with an appointment at their clinic, and may edit only entries their own clinic created — never
   another clinic's entries, never the owner's. See `data-model.md`'s `created_by_clinic_id` column.
9. **Phase 4 hooks stay inert** (unchanged from the PRD, restated for emphasis per constitution VI):
   `price_minor`/`currency`, `payment_status`, the `video` `appointment_type` value, the reserved
   `payments-*`/`video-*` function namespaces, a `PaymentMethodSelector` that only ever renders "Pay at
   clinic," and all five feature flags defaulting to `false`.
10. **Sign-in methods** *(new, 2026-10-18)*: Phase 1 owner sign-in is Google (all platforms), email with a
    6-digit code (all platforms, typed into the app — no magic link), and Sign in with Apple (iOS only,
    unchanged from amendment 6). **Phone/SMS sign-in is removed entirely** — Twilio Verify is dropped from
    the stack. The PRD's phone-OTP-first framing (section 6) is now stale on this point. A phone number is
    kept only as an optional, unverified contact field on the profile, validated with the existing Egyptian
    format only when a value is present. Dashboard sign-in for clinic staff/admins is unaffected.

## Delivery Phases

Phase numbering is implementation sequencing only (see Naming note above). D00 is specified in full; D01-D08
are specified at story/deliverable level and get refined with their own task breakdown when `/speckit-tasks`
runs for that phase.

### D00 — Foundation, structure, Docker

**Goal**: from a clean clone, one command (`pnpm install && pnpm stack:up`) brings up the whole development
stack; every later phase only adds features, never re-plumbs infrastructure. Split into seven ordered
sub-batches so `/speckit-tasks` can generate them as small, independently-checkable tasks; each sub-batch's
exit check must pass before the next one starts.

#### D00a — Repo and tooling

Root `pnpm-workspace.yaml`, `turbo.json`, `biome.json`, base `tsconfig.json`s (strict mode, constitution X);
`commitlint` + `husky` + `lint-staged` (conventional commits); `.editorconfig`; `.gitattributes` forcing LF
on all text (CRLF vs LF on Windows, `research.md` §10). **First task in this sub-batch**: verify current
stable versions directly from official sources only — expo.dev, reactnative.dev, nativewind.dev for the
mobile side, nextjs.org for the web side — build a compatibility matrix (Expo SDK ↔ React Native ↔
Reanimated ↔ NativeWind ↔ Node), and pin the exact resulting versions into `package.json` and `.nvmrc`
(`research.md` §1-2 — do not reuse any version number from `research.md` itself; verify fresh).
**Exit check**: `pnpm install` succeeds from a clean clone; the compatibility matrix and its official-source
citations are committed (e.g. as a short note in this sub-batch's own PR description or a `COMPATIBILITY.md`
scratch file); `git check-attr text -- '*.ts'` confirms LF normalization is active.

#### D00b — Backend init and CI RLS check

`backend/supabase/config.toml` with the local email inbox enabled (Supabase's local dev SMTP catcher — no
real email sent locally) and SMTP settings placeholders for staging/production (provider TBD, `research.md`
§4-rewrite) — no phone test OTP numbers, since Phase 1 no longer signs owners in by phone;
`pgcrypto`/`postgis`/`pg_trgm`/`btree_gist`/`pg_cron`/`pg_net`/`pg_stat_statements` extensions migration; a
first migration with the shared `updated_at` trigger function and the `custom_access_token_hook` skeleton
(`research.md` §8); `seed.sql` skeleton (empty, populated per later phase); the CI query that fails the
build when any `public` table lacks RLS (constitution III, VII); `.env.example` per app (no Twilio
variables; SMTP placeholders instead) + a validated env-loading module (fails fast on a missing var,
constitution X); placeholder configs for the three environments (local/staging/production, PRD section 8).
**Exit check**: `supabase start` succeeds locally; the RLS-check script runs against a deliberately
RLS-disabled dummy table fixture and fails as expected, then passes once RLS is enabled on it (proving the
check itself works, not just that there's nothing yet to catch).

#### D00c — Packages: tokens, i18n, shared

`packages/shared` with `supabase gen types typescript` wiring + base Zod primitives (phone regex, money,
enums from `data-model.md`); `packages/i18n` with the `ar.json`/`en.json` key-parity check script;
`packages/design-tokens` with a generator reading `design/system/tokens/*.css` and emitting a
Tailwind/NativeWind preset, web CSS variables, and **precomputed hex tints/shadows per theme** (light/dark)
to replace every `color-mix()` use from the kits (PRD amendment 7).
**Exit check**: `pnpm types:gen`, `pnpm tokens:build`, and `pnpm i18n:check` each run successfully against
the skeleton state (empty schema, seed translation files, the kit's token CSS).

#### D00d — Design extraction scripts

Scripts producing `design/screens/<ID>.md` (one per screen, route + kit source + states + components +
translation keys) and `design/screen-map.md` (screen ID ↔ route ↔ kit file ↔ feature ↔ task), plus a script
pulling every kit's `t('EN','AR')` pair into `packages/i18n`'s `en.json`/`ar.json` seed keys, so no delivery
phase ever hand-writes a translation key from scratch.
**Exit check**: running the extraction script against `design/system/ui_kits/` produces a non-empty
`design/screen-map.md` covering all Phase 1 screens this plan's Coverage Table lists (70, as of this
revision — D00d's own check script compares against the Coverage Table directly, never a hardcoded number)
and seeds a non-trivial translation key set; `pnpm i18n:check` still passes afterward.

#### D00e — App shells and RTL/theme

Theme/language/RTL infrastructure in both apps — system/light/dark; Arabic/English with a single reload on
direction change (mobile, `I18nManager` + `expo-updates`); Cairo (AR) + Inter (EN) fonts loaded before
splash hides; an `.ltr` isolate helper for phones/codes/prices inside Arabic text. Empty but fully themed
shells: a mobile "hello" screen and a web login-page placeholder, each provable in all 4 language/theme
combinations. Sentry + PostHog wired behind env flags (no events sent locally by default). A lint
rule/script rejecting raw hex colors and raw px values in app code (mirrors the kit's own
`_adherence.oxlintrc.json` pattern, constitution I).
**Exit check**: the mobile hello screen and the web placeholder each render correctly in all 4 combinations
(manual or screenshot-tested); the raw-hex/px lint rule fails on an intentionally-bad test snippet and
passes on the real shell code.

#### D00f — Docker and compose

`web/Dockerfile` (multi-stage: deps → dev → build → runner; Next `standalone` output; non-root user;
healthcheck); root `docker-compose.yml` with `dev`/`tools`/`ci` profiles — `web` dev server (hot reload via
polling for Windows bind mounts, `research.md` §10), tool containers for lint/typecheck/unit test/pgTAP;
`.dockerignore`s; named volumes for the pnpm store and `node_modules`. The local Supabase stack is started
by the Supabase CLI (which drives its own Docker containers) and orchestrated alongside the rest by root
scripts: `stack:up`, `stack:down`, `stack:reset`, `db:test`, `types:gen`, `tokens:build`, `i18n:check` — each
waits on health checks before returning. A production `web` image target. **Not** run in Docker: the
Android emulator and Metro bundler (host-side, `research.md` §11), and all EAS builds (cloud).
**Exit check**: `pnpm stack:up` brings up `web` + local Supabase with passing health checks; `pnpm stack:down`
and `pnpm stack:reset` both work; the production `web` Docker image builds and starts and passes its own
healthcheck.

#### D00g — CI and docs

GitHub Actions for pull requests — Biome, types, unit tests, `pgTAP` against local Supabase, `i18n:check`,
`tokens:build`, the RLS check, web build; deploy-skeleton workflows for staging/production (no real deploy
targets wired yet — that's D08); Renovate config; `README.md` + `quickstart.md` with exact Windows setup
steps and the one-command run (see [quickstart.md](./quickstart.md), already produced by this plan).
**Exit check**: CI is green on a trivial PR; Renovate's config validates (`renovate-config-validator` or
equivalent); following `quickstart.md` from a genuinely fresh clone reproduces the one-command run.

**D00 overall exit criteria** (rollup of all seven sub-batches, all runnable):
- Clean clone → `pnpm install && pnpm stack:up` → running stack, on Windows, in one command.
- Web shows the themed placeholder in all 4 language/theme combinations; mobile shows the themed hello
  screen in all 4.
- `pnpm db:test`, `pnpm i18n:check`, `pnpm tokens:build` all pass; the RLS-check CI step correctly fails an
  RLS-disabled fixture and passes once fixed.
- CI is green on a trivial PR; the production `web` Docker image builds and starts.

### D01 — Design system port

**Deliverables**: all 18 existing components (`design/system/components/core/*`,
`design/system/components/domain/*`) ported prop-for-prop (PRD amendment 7) into `mobile/src/components/`
(React Native + NativeWind) and `web/src/components/` (shadcn/ui-based, same CSS variable tokens); the 10
missing components named in `readme.md` (PhoneInput, OtpInput, SearchBar, Select, DateField, CategoryCard,
DoctorCard, ListRow, Toast, ScreenHeader), built from the local kit code and PRD section 9's UI-kit list;
the dashboard shell (sidebar at inline-start, top bar, data table, modal, restricted-state wrapper, stat
card) per PRD section 10; a component-gallery screen in each app; automated four-combination screenshot
checks wired into CI for the gallery.

**Stories/screens**: none directly (component infrastructure only) — every later phase's screens depend on
this phase's output.

**Exit criteria**: the component gallery renders every component (28 total) correctly in all 4 combinations
in both apps; the no-raw-hex/px CI check (from D00) passes against the new component code; a pgTAP-style
lint test confirms no ported component's prop set drifted from its `.d.ts` source.

### D02 — Auth and roles

**Stories**: AUTH-01 to 10, AD-01, CS-01, PLT-01, PLT-02, PLT-03 (moved here from D08, remediation pass
finding H3 — this phase now builds the offline infrastructure; D08 still verifies it).
**Screens**: Splash, Language, Onboarding, Welcome, Sign-in, Verify code, Complete profile (design change
needed on all four: email instead of phone — `spec.md` Screen Coverage, `design/overrides.md`), **Setup
Summary**, Permissions primer (shell only — full behavior in D04), Home (shell only),
Profile/Settings/Account (design change needed: email instead of phone)/Edit profile/Help/About, Legal,
Force-update, Maintenance (owner mobile); `/login`+`/mfa`, Admin team, `/accept-invite`, `/forgot-password`,
`/no-access`, Settings (clinic+admin shells) — see Coverage Table.
**First task (new, this fix pass, 2026-10-18)**: a **spike** — attempt to call Supabase Auth's email-OTP
send/verify endpoints directly with the public anon key, bypassing `verify-otp-guard` entirely, and confirm
whether the resulting gap matters (`research.md` §17, "Is the email-code guard bypassable?"). Its result,
plus the owner's choice among §17's three options, must land before `verify-otp-guard` is built — see
this phase's Open Question below.
**Backend**: `cities`, `clinics` (slim — identity + `status` only, extended in D05), `clinic_staff` tables
+ RLS moved here from D05 because they are FK targets for `vaccinations`/`health_records`/`appointments`/
`queue_tickets`/`reviews`; `audit_logs` table + RLS and the shared `write_audit_log()` helper moved here
from D07 for the same reason, **created before `feature_flags`/`app_config`** (this fix pass — those two
tables' audit triggers call `write_audit_log()`, so it must exist first) — every later admin-write
RPC/Edge Function calls this one function instead of inserting into `audit_logs` directly;
`custom_access_token_hook` (full), RLS foundation policies on `profiles` (`phone` now nullable); a
hardening step closing or restricting the direct Auth path per the spike above, then the
`verify-otp-guard` Edge Function — **rewritten for email, not phone** (PRD amendment 10): exposes
`send-code` and `verify-code` actions keyed by a normalized email `identifier`, with per-email and per-IP
send throttling and an identical response for known vs. unknown emails (no account enumeration) — mobile
never calls Supabase Auth's OTP endpoints directly; `otp_attempts`
table (column renamed `phone_number` → `identifier`) + `record_otp_attempt`/`get_otp_lock_status` RPCs
(PRD amendment 3, rewritten); custom SMTP configuration + the bilingual (AR/EN in one email), RTL-safe
login-code/staff-invite/password-reset email templates (using Supabase's `{{ .Token }}` template variable,
never `{{ .ConfirmationURL }}`, so the code is typed, not clicked — `research.md` §4-rewrite);
`admin-create-staff` (now sends its invite through the same SMTP setup), `admin-set-user-status` (calling
`write_audit_log()`), `delete-account`, `export-my-data` Edge Functions; `app-config` Edge Function (flags
always false). **Twilio Verify is not configured anywhere in this phase** (PRD amendment 10). pgTAP: role
self-promotion blocked, suspended-user API rejection, RLS on `profiles`/`consents`/`push_tokens`, the
generic audit mechanism itself, the rewritten OTP-lockout behavior under the `identifier` column, and the
new `check-policy-coverage.ts` CI gate (fails if any RLS policy has no matching pgTAP test — a standing
check from here through D08).
**Packages**: `packages/shared` auth/profile Zod schemas (email required, phone optional with the
Egyptian-format check applied only when present); `packages/i18n` auth/onboarding keys plus the three
bilingual email templates (Arabic marked draft, needs native review).
**New, remediation pass (finding M1, AUTH-06)**: a spike confirming Supabase's automatic identity-linking
behavior and whether Manual Linking needs enabling (resolves Open Question 2); the Account screen's new
"Add Google"/"Add email sign-in" actions, their conflict path (`IDENTITY_ALREADY_LINKED`, 409), and an
E2E link test.
**New, remediation pass (finding H3, PLT-03)**: a shared `useNetworkStatus` hook, an `OfflineBanner`
(composed from the existing `Banner` component), and a "disabled with a reason" pattern for
network-dependent actions, plus React Query cache persistence on mobile — this phase now *builds* PLT-03
infrastructure rather than deferring it to D08 verification (see the Coverage Table's Stories section).
**Manual prerequisites** (replaces Twilio/Egypt-geo-permission from the previous revision): an **SMTP
provider account** and a **verified sending domain** (SPF, DKIM, DMARC records live) — **both block D02**,
since no email-code sign-in can be tested end to end without them (local development uses Supabase's local
email inbox instead and does not need this). Google/Apple OAuth clients and the EAS dev build remain
blocking as before.
**Tests**: Maestro — email sign-up happy path + wrong-code + lockout, reading the code from Supabase's
local email inbox via a shared test helper (no real email sent); Playwright — dashboard login + MFA enroll;
unit — OTP guard logic (email identifier), role hook; a dedicated send-throttle test (per email, per IP,
identical response for an unknown email — no enumeration); a rendering check for the three bilingual
RTL-safe email templates.
**Exit criteria**: a brand-new email address can complete AUTH-01→04 end to end on a dev build, including
receiving and typing the code from the local email inbox; an admin can sign in with MFA and reach
`/admin`; a suspended test user is rejected; force-update and maintenance screens are reachable by flag;
all in the 4 combinations. **Added, remediation pass (C2)**: the guard-enforceability decision
(`research.md` §17; `tasks.md` T120/T138) is recorded in writing — which of Option A/A+/B/C was chosen
and why — before this phase is considered exited; `verify-otp-guard` (T139) must not ship on an
unresolved placeholder.

### D03 — Pets and passport

**Stories**: PET-01 to 03, PET-05.
**Screens**: My pets, Add pet (4 steps), Edit pet, Document viewer (owner mobile).
**Backend**: `pets` table + RLS; `pet-photos`/`pet-documents` storage buckets + path-prefix policies; breeds
seed (40+ cat/dog breeds, bilingual) wired into onboarding's pet step (PRD amendment 5 — pet creation is
part of first-run onboarding here, reusing the Add pet screens); `delete_pet` RPC (soft-delete only in this
phase — no `appointments` table exists yet to cancel; extended in D06). **New, remediation pass (finding
C1)**: `purge_soft_deleted()` (`pg_cron`, daily, off-peak Cairo) hard-deletes `pets`/`profiles` rows 30
days after `deleted_at`, plus a `storage_cleanup_queue` + Edge Function since Storage objects can only be
removed through the Storage API, never SQL (official Supabase docs) — D04 extends the cascade to
`vaccinations`/`health_records`/`record_attachments`; `appointments` (D06) is excluded, since it has no
`deleted_at` column.
**Tests**: pgTAP — owner-only pet access, soft-delete behavior via `delete_pet`, the purge job's 30-day
boundary and its audit row; Maestro — add/edit/delete a pet including during onboarding, plus a new
offline-mode case (My pets renders from cache, Add pet's submit is disabled with a reason).
**Exit criteria**: a pet can be created during onboarding or from My Pets, edited, and soft-deleted with its
upcoming-bookings warning (booking cancellation itself lands in D06 — this phase just proves the warning
text and the soft-delete timing).

### D04 — Vaccinations and notifications

**Stories**: PET-04, 06, 07, 08, 09; NTF-01 to 03. (Permissions primer's full behavior and Home's
vaccines-due banner also land here, per the Coverage Table rule.)
**Screens**: Pet passport (Vaccinations/Timeline tabs), Add vaccination, Add record, Passport share,
Permissions primer (full), Home (vaccines-due banner), Inbox (owner mobile).
**Backend**: `vaccinations`, `health_records`, `record_attachments` tables + RLS (including the
`created_by_clinic_id` edit restriction, PRD amendment 8 — enforced here even though clinic staff can't
write yet until D05/D07, so the policy is tested with a seeded clinic role); `notifications`,
`notification_outbox` tables; `generate_vaccination_reminders` cron job; `send-push` Edge Function.
**New, remediation pass (finding C1)**: extends D03's `purge_soft_deleted()` cascade to these three
tables, enqueueing their file paths into the storage-cleanup queue before the cascade fires. **New,
remediation pass (finding H1, NTF-02)**: a `notif_prefs` Zod schema matching `profiles.notif_prefs jsonb`
(`data-model.md`); `generate_vaccination_reminders` and `send-push` both check it before
enqueueing/sending a push (the inbox item is always created regardless).
**Tests**: pgTAP — reminder dedupe on double-run, clinic-entry edit restriction, the purge cascade removes
child rows and queues their storage paths; unit — reminder-window math (7-day/1-day/due-date), each
`notif_prefs` category suppresses its push but never the inbox item, and `booking_cancelled` is never
suppressible.
**Exit criteria**: a seeded vaccine with a due date in the next 7 days produces exactly one push + one inbox
item even if the cron job runs twice; the pet timeline shows "Added by you" / "Verified by `<clinic>`"
labels correctly (Clarification 4) using a seeded clinic-authored row.

### D05 — Clinics and admin operations

**Stories**: AD-02, AD-04, CS-02 to 05, CLN-01 to 03, EMG-01.
**Screens**: Clinics, Clinic detail, Doctor, Emergency (owner mobile); Services, Clinic profile, Staff
(deferred to D07's CS-10 for the actual invite/remove logic — this phase builds the shell), `/clinic/doctors`
+ schedule editor, `/clinic/settings` (clinic dashboard); `/admin/clinics`, Clinic detail+wizard,
`/admin/reference-data` (admin dashboard).
**Backend**: `specialties` table + RLS (created before `doctors`, which references it); **extends**
`clinics` (created slim in D02) with location/hours/media/rating columns and the GiST/trigram search
indexes — does not re-create the table; `doctors` (incl. `queue_prefix`, PRD amendment 1), `services`,
`doctor_services`, `doctor_schedules`, `schedule_exceptions` tables + RLS; `nearby_clinics` RPC;
`set_clinic_status` RPC (approve/suspend, calling the shared `write_audit_log()` helper from D02; the
owner-notification-on-suspend half is a no-op in this phase — no `appointments` table yet — extended in
D06); `set_schedule_exception` RPC (schedule editor's backing function; its conflict-flagging half is also
a no-op until D06); demo seed data (3 clinics with doctors, services, schedules) for local and staging.
**Tests**: pgTAP — public-only-sees-active-clinics, manager-can't-change-status, `set_clinic_status` writes
an audit row; Playwright — admin creates and approves a clinic end to end, manager edits a doctor's
schedule; Maestro — browse/search/filter clinics.
**Exit criteria**: an admin can onboard and approve one real clinic with a doctor (with a unique
`queue_prefix`), a service, and a schedule; that clinic is immediately visible and searchable in the mobile
app.

### D06 — Booking

**Stories**: BKG-01 to 06, CS-06.
**Screens**: all 5 booking steps + Confirmation, My bookings, Booking detail (shell — live queue card itself
is D07), `/clinic` Today (shell), `/clinic/appointments`, Admin "Appointments (admin view)".
**Backend**: `appointments` table (incl. `booking_code`, `cancelled_by_role`, `flagged_for_staff`) + the
no-double-booking exclusion constraint + idempotency unique constraint; `get_available_slots`,
`book_appointment`, `cancel_appointment` (2-hour rule + staff-anytime rule, PRD amendment 4),
`reschedule_appointment` (same 2-hour rule assumption — see Open Questions) RPCs; `booking_confirmed`/
`booking_reminder`/`booking_cancelled` outbox rows; `appointment_reminders` (**extended, remediation pass
finding H1**: checks `notif_prefs.booking_updates` before enqueueing a push; `booking_cancelled` itself
stays non-suppressible) and `mark_no_shows` cron jobs;
**extends** `delete_pet` (D03) to cancel upcoming appointments + notify the clinic now that `appointments`
exists; **extends** `set_clinic_status` (D05) so suspending a clinic notifies owners with upcoming bookings;
**extends/tests** `set_schedule_exception` (D05) so its conflict-flagging (`appointments.flagged_for_staff`)
actually fires against real bookings.
**Tests**: pgTAP — the exclusion constraint actually prevents a double booking under concurrent inserts,
idempotent retry returns one row, cancel RPC enforces the 2-hour rule for `owner` but not `clinic_staff`,
`delete_pet` cancels upcoming appointments and notifies the clinic, `set_clinic_status` suspend notifies
affected owners, `set_schedule_exception` flags an overlapping booking; Maestro/Playwright — full booking
happy path, a forced `SLOT_TAKEN` race, a cancellation inside vs. outside the window. (`booking_code` is
generated here but exercised by `check_in_appointment` in D07.)
**Exit criteria**: two concurrent booking attempts for the same slot resolve to exactly one success; an
owner cancelling at 1h59m before a visit sees the policy message + Call clinic button, not a cancel
confirmation; clinic staff can cancel the same booking anyway with a reason.

### D07 — Live queue and operations

**Stories**: QUE-01 to 03, CS-07 to 10, REV-01, AD-03, AD-05 to 09.
**Screens**: Booking detail (live queue card), Rate visit (owner mobile); `/clinic/queue`, `/clinic/staff`,
Patients+detail, Reviews, Reports (clinic dashboard); Admin Overview, Users, Broadcast, Flags, Audit log,
User detail, Pets support view, Reviews moderation (admin dashboard).
**Backend**: `queue_tickets` table (integer `ticket_number`, PRD amendment 1) + RLS; `check_in_appointment`
(validates the signed QR payload or the typed `booking_code`, enforces the check-in rules — confirmed
status, same-day, once only, caller is the owner or that clinic's staff — `contracts/rpc-functions.md`),
`call_next_ticket`, `complete_appointment`, `get_queue_status` RPCs (the wait-estimate formula from
Clarification 3); Realtime private channels for the queue (`research.md` §7) with the 15-second polling
fallback; `reviews` table + RLS; `recompute_clinic_rating` trigger on `reviews` insert/hide/unhide;
`admin_get_pet`/`admin_get_pet_timeline` RPCs (admins get **no direct `SELECT`** on
`pets`/`vaccinations`/`health_records`/`record_attachments` — every admin read of health data goes through
one of these two RPCs, each calling the shared `write_audit_log()` helper from D02 — `audit_logs` itself
was created in D02, not here); `admin-broadcast` Edge
Function; KPI SQL views for the admin overview (refreshed hourly, per PRD section 10 — not live
aggregation). **New, remediation pass (finding H2, CS-09)**: clinic-scoped reporting RPCs/SQL views
(bookings-per-day, no-show rate, busiest hours, top services; a date-range parameter; RLS restricting a
caller to their own clinic — CS-09 had a Reports screen task but no backend before this pass) + a CSV
export via a dependency-free Next.js Route Handler.
**Tests**: pgTAP — owners never see another owner's queue data, audit log is append-only, review-once
constraint, `recompute_clinic_rating` recalculates correctly on hide/unhide, `admin_get_pet`/
`admin_get_pet_timeline` write an audit row on every call and a direct table `SELECT` by an admin role is
rejected, **a clinic manager's reporting query never returns another clinic's data (new)**; Playwright —
full clinic queue cycle (check-in by QR, check-in by typed code, call → complete) with two staff racing
the same ticket; load (k6) — slots/booking/queue RPCs at several times expected peak (full load test is
D08, but a smoke-level k6 run here catches gross regressions early).
**Exit criteria**: a checked-in owner sees their queue card update within 3 seconds of a staff action; the
same action never produces two different outcomes when two staff members press the same button at once; the
Realtime-drop fallback actually polls every 15 seconds when the channel is forcibly closed in a test.

### D08 — Hardening and launch

**Deliverables**: PLT-03 (offline behavior) and PLT-04 (full RTL) **verification** across every screen built
in D01-D07 (not new stories — confirming what was already built); full accessibility pass (WCAG 2.1 AA);
performance verification against every PRD section 14 target; full k6 load test at 3-5× expected peak on
booking/slots/queue; a security review (RLS, storage, auth, secrets) per constitution VIII/PRD section 14;
app/dashboard store-readiness checklist (privacy labels, Apple/Google deletion flow, screenshots in both
languages); staging → production cutover with a tested PITR restore drill; beta with 2-3 pilot clinics.
**Exit criteria**: every PRD section 14 performance target is met under k6 load; a PITR restore drill
succeeds on staging; the security review's findings are all closed or explicitly accepted in writing; the
app is submitted to both stores.

## Coverage Table

Every Phase 1 story ID and every Phase 1 screen (per `spec.md`'s Screen Coverage) is mapped to exactly one
**introducing** delivery phase — the earliest phase that needs it to exist as a real, working feature. Some
screens (Home, Booking detail, `/clinic` Today) gain additional content in later phases; that's noted
inline rather than listed twice. D00 and D01 build infrastructure and components, not individual
stories/screens, so they don't appear as a "phase" value below — every row has a D02-D08 value.
**No story and no Phase 1 screen is unmapped** — this is a completeness gate, not a preference.

### Stories (59/59 mapped)

| Delivery Phase | Story IDs |
| --- | --- |
| D02 | AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, AUTH-10, AD-01, CS-01, PLT-01, PLT-02, PLT-03 |
| D03 | PET-01, PET-02, PET-03, PET-05 |
| D04 | PET-04, PET-06, PET-07, PET-08, PET-09, NTF-01, NTF-02, NTF-03 |
| D05 | AD-02, AD-04, CS-02, CS-03, CS-04, CS-05, CLN-01, CLN-02, CLN-03, EMG-01 |
| D06 | BKG-01, BKG-02, BKG-03, BKG-04, BKG-05, BKG-06, CS-06 |
| D07 | QUE-01, QUE-02, QUE-03, CS-07, CS-08, CS-09, CS-10, REV-01, AD-03, AD-05, AD-06, AD-07, AD-08, AD-09 |
| D08 | PLT-04 (verification) |

**PLT-03 moved from D08 to D02 (remediation pass, finding H3)**: it used to be listed as "D08
(verification)" because nothing built the offline behavior earlier — only a D08 task checked it. Now
`tasks.md` T165-T167 build the actual offline infrastructure in D02, and T227/T228 (D03) wire the first
reference screens, so D02 is the phase that "needs it to exist as a real, working feature," matching this
table's own rule. D08's T376 still verifies it everywhere; that is unchanged.

Count check: 15 + 4 + 8 + 10 + 7 + 14 + 1 = **59**, matching `spec.md`'s 59 Phase 1 stories exactly.

### Screens (70/70 mapped)

**Owner mobile (41 — was 40)**

| Delivery Phase | Screens |
| --- | --- |
| D02 | Splash, Language, Onboarding, Welcome, Sign-in, Verify code, Complete profile, **Setup Summary**, Profile, Settings, Account, Edit profile, Help, About, Legal (terms/privacy), Force-update, Maintenance |
| D03 | My pets, Add pet, Edit pet, Document viewer |
| D04 | Permissions primer, Home, Pet passport, Add vaccination, Add record, Passport share, Inbox |
| D05 | Clinics, Clinic detail, Doctor, Emergency |
| D06 | Book service/doctor/time/details/summary, Confirmation, My bookings, Booking detail |
| D07 | Rate visit |

**Clinic dashboard (12)**

| Delivery Phase | Screens |
| --- | --- |
| D02 | Sign in (`/login`, `/mfa`) |
| D05 | Services, Clinic profile, Doctors + schedule editor, Settings |
| D06 | Today, Appointments |
| D07 | Live queue board, Staff, Patients + detail, Reviews, Reports |

**Admin dashboard (17)**

| Delivery Phase | Screens |
| --- | --- |
| D02 | Admin team, Settings, `/accept-invite`, `/forgot-password`, `/no-access` |
| D05 | Clinics, Clinic detail + creation wizard, Reference data |
| D06 | Appointments (admin view) |
| D07 | Overview, Users, Broadcast, Flags, Audit log, User detail, Pets (support view), Reviews moderation |

Count check: owner mobile 17+4+7+4+8+1 = 41; clinic dashboard 1+4+2+5 = 12; admin dashboard 5+3+1+8 = 17.
Total = **70**, matching `spec.md`'s Screen Coverage exactly (the Setup Summary row was added there in the
2026-10-18 documentation-sync pass — see `spec.md`'s Clarifications section).

## Open Questions

Recorded here, not guessed, and not written into `spec.md` (that file is not edited by this plan update).

1. **Owner reschedule window**: `spec.md` BKG-05 doesn't state whether an owner's reschedule is subject to
   the same 2-hour cancellation rule as BKG-04. **This plan's working assumption** (used in
   `reschedule_appointment`'s contract, D06): yes — an owner reschedule inside 2 hours of the original visit
   is rejected the same way a cancellation would be; `clinic_staff` may reschedule at any time, same as
   cancel. Confirm this assumption (ideally via `/speckit-clarify` against `spec.md`) before D06
   implementation locks it in; if the real answer differs, only `reschedule_appointment`'s contract and its
   pgTAP tests need to change — no other function depends on this assumption.
2. **Email/Google automatic identity-linking behavior** *(new, 2026-10-18 sign-in method change)*:
   `research.md` §identity-linking-rewrite describes Supabase Auth's documented automatic-linking behavior
   for a shared verified email across providers, but this has not been exercised against this project's
   own Supabase project settings (manual linking is off by default and may need to stay off — automatic
   linking is what AUTH-06 relies on). **Addressed, remediation pass (M1)**: `tasks.md` T121 is now the
   task that confirms this against the real project settings, and also checks whether Manual Linking
   (a separate, also-off-by-default mechanism) needs enabling for AUTH-06's new "Add Google"/"Add email
   sign-in" actions (T174-T176) — both must be confirmed before D02 reaches those tasks.
3. **Is the email-code guard bypassable, and if so, which fix?** *(new, this fix pass, 2026-10-18)*:
   Supabase Auth's email-OTP send/verify endpoints are reachable directly with the public anon key, so a
   client could skip `verify-otp-guard` and its lockout rules entirely — confirmed against official
   Supabase docs in `research.md` §17. Neither a Send Email hook nor `auth.admin.generateLink()` closes
   this; the only option that fully does is having the guard generate/hash/verify its own code instead of
   using Supabase's OTP primitives for the security-sensitive part, then mint the session through an
   admin-only path. **Remediation pass, 2026-10-19**: §17 also evaluated CAPTCHA protection and a longer
   OTP length (both from official docs) as "Option A+" — real mitigations, but neither closes the gap on
   its own either. **Owner approved Option C on 2026-10-27.** T138/T139 remain gated on proving a supported
   session-establishment path that does not reopen direct public-OTP bypass; if none exists, request a
   narrow technical decision without weakening the lockout policy.

**Coverage counts, re-confirmed after this change**: still **59 Phase 1 stories** and **70 Phase 1
screens** (owner mobile 41, clinic dashboard 12, admin dashboard 17) — the sign-in method change rewrote
story *content* (AUTH-01, AUTH-04, AUTH-06) and added manual-prerequisite items, but did not add, remove,
or move any story or screen. The Coverage Table below is unchanged from the prior revision.

## Complexity Tracking

*Empty — the Constitution Check above recorded no deviations requiring justification.*
