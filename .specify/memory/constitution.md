<!--
Sync Impact Report
Version change: 1.0.0 → 1.1.0 (MINOR: principle added + materially expanded Quality Gates guidance)
Modified principles:
  - VII. Quality Gates — redefined "done" by task level vs. user-story/slice level; moved
    "missing Sentry setup in new surfaces" out of the CI-blocking list into the review checklist
    for new surfaces.
  - IX. Traceability — `design/screen-map` → `design/screen-map.md`.
Added sections:
  - X. Engineering Standards (new Core Principle)
Removed sections: none
Deferred placeholders: none
Follow-up TODOs: none
Note: per the amended Governance section below, this report is now kept at the top of the file
across amendments instead of being removed after commit.
-->

# FurEver Constitution

FurEver is a bilingual (Arabic RTL / English LTR) pet-care product made of three apps —
backend (Supabase), mobile (Expo/React Native), and web (Next.js dashboard) — plus shared
packages. This constitution governs how all of them are built.

## Core Principles

### I. Design Fidelity
- Every screen MUST match its file in `design/screens/<ID>.md` and the matching kit source in
  `design/system/ui_kits/`. Every task that builds UI MUST name its screen ID.
- Tokens come only from `design/system/tokens/` via `packages/design-tokens`. App code MUST NOT
  use raw hex colors, raw px values, or fonts other than Inter (English) and Cairo (Arabic).
- Components MUST keep the prop names and variants from `design/system/components/**/*.d.ts`.
  Do not add props or variants without updating the design contract first.
- The design kits are web prototypes: port them, do not copy them. React Native cannot use
  `color-mix()` or CSS classes, so tints and shadows are precomputed per theme in the token
  generator.
- A screen is not done until it has loading, empty, error, and content states.

### II. Localization, RTL, Themes
- Arabic and English, light and dark are first-class. Every screen MUST work in all four
  combinations.
- No hard-coded user-facing strings. All text uses keys from `packages/i18n` (`ar.json` and
  `en.json` with identical key sets). Arabic copy sourced from the kits is draft until reviewed.
- Layout uses logical properties only (start/end, `ms`/`me`, `ps`/`pe`, `marginStart`/
  `paddingEnd`), never left/right.
- Mirror direction icons (back, chevrons, progress). Do not mirror phone, check, stars, logos,
  or charts.
- Phones, codes, prices, and times stay LTR inside Arabic text. Use Western digits 0-9 in both
  languages through one shared formatter.
- All times are stored as `timestamptz` in UTC and shown in the named zone `Africa/Cairo`,
  never a fixed offset.

### III. Security and Privacy
- Row level security MUST be enabled on every table in the same migration that creates it, and
  every policy MUST have a pgTAP test. CI fails if any public table has RLS off.
- Policies use `(select auth.uid())` and `(select auth.jwt() ->> 'user_role')` and index the
  columns they filter on.
- The `service_role` key MUST NOT appear in mobile, web, or any client env. Privileged work
  runs in Edge Functions that re-check the caller's role.
- Roles are `owner`, `clinic_staff`, `admin`, `super_admin`. Users MUST NOT be able to change
  their own role or status. Admin writes require `aal2`.
- Medical files live in private buckets and open only through short-lived signed URLs.
- Account deletion, data export, consent logging, and an audit log for admin actions and admin
  reads of health data are required.

### IV. Database and API Discipline
- Schema changes are timestamped SQL migrations in `backend/supabase/migrations`, reviewed in
  a pull request. No edits in the Supabase dashboard. Applied migrations are never edited.
- Changes follow expand, migrate, contract: old app versions stay in the wild, so columns and
  RPC parameters are added, never renamed or removed in one release.
- Multi-step writes are one RPC function in a single transaction. Anything a retry could
  duplicate takes an idempotency key.
- List endpoints use keyset pagination with a default limit of 20 and a maximum of 100. No
  offset on growing tables. No unbounded selects.
- Every foreign key column is indexed. Money is integer piastres plus a currency, never floats.
  User data uses soft delete with a purge job.
- Side effects (push, email) go through `notification_outbox` with dedupe and retry, never
  fire-and-forget from a client.
- API errors are stable upper-case codes, translated on the client. Raw server text never
  reaches users.

### V. Architecture and Scaling
- `backend/`, `mobile/`, `web/` never import from each other. They share only
  `packages/shared` (Zod schemas, generated DB types), `packages/i18n`, and
  `packages/design-tokens`.
- Mobile and web talk only to Supabase through `supabase-js`. The same Zod schemas validate
  inputs in the apps and in Edge Functions.
- Dashboard numbers come from SQL views or materialized views, not live scans of large tables.
- Design for 1M registered users: fast RLS, pooled connections, partition-ready high-growth
  tables (`created_at` in every index, no foreign keys into them), read-replica-ready reporting
  queries.
- Realtime is used only for the live queue (and chat later), scoped by filter and removed on
  unmount. Owners MUST NOT receive other owners' data through Realtime.

### VI. Phases and Feature Flags
- Only Phase 1 (core) is built now. Shop (2), Community (3), Payments and video (4) are
  additive and ship dark behind flags.
- Flags default to false: `shop_enabled`, `mating_enabled`, `adoption_enabled`,
  `payments_enabled`, `video_enabled`.
- Phase 4 hooks exist from day one but stay inert: `price_minor` and `currency` columns,
  `appointments.payment_status`, `appointment_type` value `video`, reserved Edge Function
  namespaces `payments-*` and `video-*`, and a `PaymentMethodSelector` showing only "Pay at
  clinic".
- Later-phase screens may exist in the design but MUST NOT be built or routed until their phase
  starts.

### VII. Quality Gates
- **Task level**: lint, types, and unit tests pass; for UI tasks, the screen matches its design
  file in the relevant language and theme combination.
- **User story or slice level**: E2E tests for the main path plus one failure path (Maestro for
  mobile, Playwright for web), pgTAP tests for any new policy or RPC, the four language and
  theme combinations checked, and the story's acceptance criteria met.
- CI blocks merges on: failing tests, a table without RLS, raw hex or px in app code, and
  mismatched translation keys. Missing Sentry setup in a new surface is checked in the review
  checklist for new surfaces, not a CI-blocking condition.
- Targets: server API p95 under 300 ms for reads and 500 ms for writes, mobile cold start under
  2.5 s on a mid-range Android phone, 60 fps lists on 500 items (FlashList), touch targets of at
  least 44 pt, WCAG 2.1 AA.
- Before launch, load-test booking, slots, and queue RPCs with k6 at several times the expected
  peak.

### VIII. Operations
- Three environments from day one (local, staging, production), each with its own Supabase
  project, keys, and push credentials. Secrets live only in EAS, Vercel, and Supabase secrets.
- Sentry in mobile, web, and Edge Functions. `app-config` provides feature flags and a minimum
  app version with force-update and maintenance screens.
- Production has point-in-time recovery and a tested restore.

### IX. Traceability
- Every spec, plan, and task cites PRD user-story IDs (`AUTH-`, `PET-`, `CLN-`, `BKG-`, `QUE-`,
  `CS-`, `AD-`, ...) and design screen IDs from `design/screen-map.md`.
- Work is split into vertical slices (database, API, mobile, dashboard, tests) in the PRD
  sprint order.
- Open decisions are recorded, not silently resolved.

### X. Engineering Standards
- TypeScript strict mode everywhere. No `any` without a written justification in the code.
- Biome for lint and format. pnpm workspaces with Turborepo. Conventional commits.
- Dependency versions are pinned; Renovate proposes upgrades. A new dependency needs a one-line
  justification in the plan.
- Zod validates every input at app, Edge Function, and RPC boundaries, using the shared schemas.
- Specs, plans, tasks, code, and commit messages are written in English. User-facing Arabic and
  English text lives only in `packages/i18n`.

## Precedence and Source of Truth
- Precedence order: this Constitution > `docs/PRD.md` for behavior and data >
  `design/system/` for visuals and copy.
- When two sources conflict, or a decision is missing, work MUST STOP and the gap MUST be
  recorded for `/speckit.clarify`. Never guess, and never invent screens, fields, or copy.

## Project Scope
- Three deployable apps share one backend and never import from each other: `backend/`
  (Supabase: Auth, Postgres+RLS, RPC, Realtime, Storage, Edge Functions), `mobile/` (Expo,
  pet owners), and `web/` (Next.js, clinic portal + admin portal).
- Shared contracts live in `packages/` (`shared`, `i18n`, `design-tokens`) and are the only
  thing the three apps have in common.
- Sources of truth for all planning and implementation work: `docs/PRD.md` (behavior, data,
  phases) and `design/system/` (visuals, tokens, components, copy).

## Governance
- This constitution supersedes conflicting practices in specs, plans, tasks, and ad hoc
  decisions. Every spec, plan, and task MUST be checked against it before being approved.
- Amending this constitution needs a written reason and a version bump:
  - **MAJOR**: backward-incompatible governance or principle removals/redefinitions.
  - **MINOR**: a new principle or section added, or materially expanded guidance.
  - **PATCH**: clarifications, wording, typo fixes, non-semantic refinements.
- Amendments are recorded with a Sync Impact Report (version change, modified/added/removed
  sections, deferred TODOs). The report is kept at the top of this file; each amendment's report
  replaces the previous one rather than being removed after commit.
- Complexity (new dependencies, new layers, deviations from these principles) must be justified
  in the relevant plan before implementation starts.

**Version**: 1.1.0 | **Ratified**: 2026-10-18 | **Last Amended**: 2026-10-18
