---

description: "Task list for FurEver Platform, Delivery Phases D00 through D08 (Phase 1 product scope only)"
---

# Tasks: FurEver Platform — Delivery Phases D00-D08

**Input**: `plan.md`, `data-model.md`, `contracts/`, `spec.md`, `research.md`. Screen→phase mapping uses
`plan.md`'s Coverage Table (`design/screen-map.md` doesn't exist until D00d runs).

**Scope**: Phase 1 only — nothing from `docs/future-phases.md` anywhere below.

**Prior revision's fixes** (see the end-of-file "Table creation order" note for the full FK pass):
`clinics`, `clinic_staff`, and `audit_logs` (+ the generic `write_audit_log()` mechanism) moved into D02,
ahead of anything that references them; `breeds` reordered before `pets` (D03); `vaccine_types` reordered
before `vaccinations` (D04); `specialties` reordered before `doctors` (D05); D05 now **extends** `clinics`
(adds location/hours/media/rating columns + search indexes) rather than creating it. A genuinely missing
screen was found — the mobile-entry kit's post-onboarding **Summary** step has no row in `spec.md`'s Screen
Coverage — added to D02, now also present in `spec.md`'s Screen Coverage itself. Screen total is **70**;
story total is **59**.

**The sign-in method change (2026-10-18)**: Phase 1 owner sign-in is Google + email-code + Apple (iOS
only); phone/SMS sign-in and Twilio are removed entirely; the phone field becomes optional on the
profile. D00's T013/T021/T100 changed content only (no renumbering).

**The 2026-10-18 fix pass** (same day): fixed a stale dependency, audited every "Depends on Txxx"
reference, reordered D02's migrations so `audit_logs`/`write_audit_log()` precede `feature_flags`/
`app_config`, and added a guard-bypass spike + hardening placeholder ahead of `verify-otp-guard`.

**This remediation pass (2026-10-19 — `/speckit-analyze` findings C1/C2/H1/H2/H3/M1/L1)**: added a
`purge_soft_deleted()` cron job + Storage-cleanup queue (constitution IV, C1); flagged FR-001's lockout
guarantee as contingent on a still-open owner decision and added two more researched options to
`research.md` §17 (C2); gave NTF-02 a real preference schema + enqueue-time checks (H1); gave CS-09
reporting RPCs + a CSV export (H2); gave PLT-03 real offline infrastructure instead of a verify-only task
(H3); gave AUTH-06 its linking actions, conflict error, and E2E test (M1); de-duplicated two PRD
amendments (L1).

**This fix pass (same day, 2026-10-19)**: gave AUTH-02/AUTH-03 their own implementation tasks (Google and
Apple native sign-in modules, provider config, Expo config entries, nonce/platform-gating unit tests —
T147-T151; Welcome/Sign-in screens clarified to delegate, not duplicate, the wiring; the combined Maestro
task enriched for per-platform cases); added 5 missing story tags to backend tasks that already
implemented them (`write_audit_log` → AD-08; the `vaccinations`/`health_records` migrations →
PET-09; `nearby_clinics` → CLN-02; the `appointments` migration's exclusion and idempotency constraints →
BKG-02/BKG-03); re-confirmed PLT-03's D02/D08 split is consistent everywhere (fixed one stale
"PLT-03/04→D08 (verify)" statement in the Coverage verification section below).

**Current numbering** (after all passes): D00 = T001-T080 (80), D01 = T081-T119 (39),
D02 = T120-T216 (97), D03 = T217-T237 (21), D04 = T238-T268 (31), D05 = T269-T301 (33),
D06 = T302-T338 (37), D07 = T339-T380 (42), D08 = T381-T409 (29). **Total = 409, T001-T409.** No story
ID, FR number, or delivery phase has ever been renumbered through any pass — only task IDs from D02
onward.

**Consolidation notes carried over**: D01's component ports remain one task per component (both platforms).
PostHog event instrumentation (PRD section 14's list) is one task per phase where those events naturally
fire, not one task per event.

## Format: `[ID] [P?] [D0n/Story] Description`

---

# Delivery Phase D00 — Foundation, structure, Docker

## D00a — Repo and tooling

- [x] T001 [D00a] Verify current stable Expo SDK, React Native, Reanimated, and NativeWind versions from
  expo.dev / reactnative.dev / nativewind.dev, and current stable Next.js + React from nextjs.org; write
  the compatibility matrix with source URLs and today's date to `COMPATIBILITY.md` at the repo root. No
  other task may pin a version before this one (research.md §1-2; constitution X).
- [x] T002 [D00a] Pin the exact versions from `COMPATIBILITY.md` into `package.json` (root),
  `backend/package.json`, `mobile/package.json`, `web/package.json`, `packages/shared/package.json`,
  `packages/i18n/package.json`, `packages/design-tokens/package.json`, and set `.nvmrc` to the matrix's
  Node version. Depends on T001.
- [x] T003 [P] [D00a] Create `pnpm-workspace.yaml` at the repo root listing `backend`, `mobile`, `web`,
  `packages/*`.
- [x] T004 [P] [D00a] Create `turbo.json` at the repo root with `build`/`dev`/`lint`/`test`/`typecheck`
  pipeline tasks.
- [x] T005 [P] [D00a] Create `biome.json` at the repo root (lint + format rules; constitution X).
- [x] T006 [P] [D00a] Create the base `tsconfig.json` at the repo root with `"strict": true`, plus
  `backend/tsconfig.json`, `mobile/tsconfig.json`, `web/tsconfig.json`, `packages/shared/tsconfig.json`
  extending it (constitution X).
- [x] T007 [P] [D00a] Create `.editorconfig` at the repo root (UTF-8, LF, 2-space indent, trim trailing
  whitespace).
- [x] T008 [P] [D00a] Create `.gitattributes` at the repo root forcing `* text=auto eol=lf`
  (research.md §10 — CRLF vs LF on Windows).
- [x] T009 [P] [D00a] Configure `commitlint.config.cjs`, `.husky/commit-msg`, and `lint-staged.config.js`
  for conventional commits (constitution X).
- [x] T010 [D00a] Copy the current root-level PRD (`FurEver — PRD (Mobile + Web Dashboard + Backend) (1).md`)
  to `docs/PRD.md` as a **placeholder** — it must be replaced by the amended PRD before D02 starts
  (blocking task T078 in D00g).
- [x] T011 [D00a] Copy `FurEver Design System/` (tokens, components, ui_kits, guidelines) into
  `design/system/` per the constitution's "Precedence and Source of Truth" and PRD amendment 7.
- [x] T012 [D00a] **Checkpoint**: run D00a's exit check — `pnpm install` succeeds from a clean clone;
  `COMPATIBILITY.md` is committed with source URLs and a date; `git check-attr text -- '*.ts'` reports
  `eol: lf`. Do not start D00b until this passes.

## D00b — Backend init and CI RLS check

No product tables are created here — only extensions, the shared trigger, and the access-token hook
skeleton (constitution III, VII; D00 scope rule).

- [x] T013 [D00b] Initialize `backend/supabase/config.toml` with the **local email inbox** enabled (no
  real email sent locally) — owners sign in by email code in Phase 1, not phone/SMS (2026-10-18 sign-in
  method change; Twilio is not configured anywhere in this project).
- [x] T014 [P] [D00b] Write migration `backend/supabase/migrations/<timestamp>_extensions.sql` enabling
  `pgcrypto`, `postgis`, `pg_trgm`, `btree_gist`, `pg_cron`, `pg_net`, `pg_stat_statements`.
- [x] T015 [P] [D00b] Write migration `backend/supabase/migrations/<timestamp>_shared_trigger.sql`
  creating the shared `set_updated_at()` trigger function (constitution IV). Depends only on T014.
- [x] T016 [P] [D00b] Write migration `backend/supabase/migrations/<timestamp>_access_token_hook_skeleton.sql`
  creating `custom_access_token_hook(event jsonb)` as `security definer`, `set search_path = ''`, returning
  `event` unchanged for now (real `user_role` injection lands in D02 — research.md §8). Depends only on
  T014.
- [x] T017 [P] [D00b] Create `backend/supabase/seed.sql` as an empty skeleton with a header comment
  noting it is populated per later delivery phase.
- [x] T018 [D00b] Write the RLS-check script `backend/supabase/scripts/check-rls.sql` (fails the build if
  any `public` table lacks RLS — constitution III, VII).
- [x] T019 [D00b] Write the RLS-check test **first**, as a failing fixture:
  `backend/supabase/tests/000_rls_check.test.sql` creates a scratch table inside a transaction **without**
  RLS enabled, runs `check-rls.sql`'s query, asserts it flags that table, then `ROLLBACK`s. Depends on T018.
- [x] T020 [D00b] Extend `000_rls_check.test.sql` with the positive case: the same scratch table with RLS
  enabled, in its own transaction, asserting zero violations before `ROLLBACK`. Depends on T019.
- [x] T021 [P] [D00b] Create `backend/.env.example` (SMTP host/port/user/password/sender placeholders —
  **no Twilio variables**, since Phase 1 has no SMS path), `mobile/.env.example`, `web/.env.example`, and
  the validated env-loader `packages/shared/src/env.ts` (Zod schema, fails fast on a missing var —
  constitution X).
- [x] T022 [P] [D00b] Write `docs/environments.md` documenting local/staging/production (PRD section 8,
  constitution VIII), each with its intended Supabase project-reference placeholder.
- [x] T023 [D00b] **Checkpoint**: run D00b's exit check — `supabase start` succeeds locally;
  `supabase test db` passes `000_rls_check.test.sql`'s negative case (T019) and positive case (T020). Do
  not start D00c until this passes.

## D00c — Packages: tokens, i18n, shared, test runners

- [x] T024 [P] [D00c] Scaffold `packages/shared/` (`package.json`, `src/index.ts`) and the
  `supabase gen types typescript` wiring script `packages/shared/scripts/gen-types.ts` writing to
  `packages/shared/src/database.types.ts`.
- [x] T025 [P] [D00c] Add base Zod primitives to `packages/shared/src/schemas/base.ts`: phone regex
  `^\+[1-9][0-9]{7,14}$`, money (`price_minor: z.number().int().nonnegative()`, `currency: z.literal('EGP')`),
  and the Phase 1 enums from `data-model.md`, plus a unit test
  `packages/shared/src/schemas/base.test.ts` asserting the phone schema rejects `"0123"` and accepts
  `"+201012345678"`.
- [x] T026 [D00c] Write the i18n key-parity check `packages/i18n/scripts/check-parity.ts` comparing
  `packages/i18n/ar.json` and `packages/i18n/en.json`'s key sets, exiting non-zero and naming the missing
  key on mismatch.
- [x] T027 [D00c] Seed `packages/i18n/en.json` and `packages/i18n/ar.json` with an identical placeholder
  key set (e.g. `common.appName`) so T026 has something real to check against. Depends on T026.
- [x] T028 [D00c] Write the design-tokens generator `packages/design-tokens/scripts/build.ts` reading
  `design/system/tokens/*.css`, resolving each variable per theme (`:root` = light,
  `[data-theme="dark"]` = dark), and **precomputing every `color-mix()` expression to a static hex value
  for both themes** (`--success-bg`, `--warning-bg`, `--danger-bg`, `--info-bg`, `--primary-bg`,
  `--shadow-card`, `--shadow-sheet` — PRD amendment 7). Depends on T011.
- [x] T029 [D00c] Extend `packages/design-tokens/scripts/build.ts` to emit
  `packages/design-tokens/dist/tailwind-preset.js` (NativeWind/Tailwind preset) and
  `packages/design-tokens/dist/variables.css` (web CSS variables) from the resolved values. Depends on
  T028.
- [x] T030 [D00c] Add a snapshot test `packages/design-tokens/scripts/build.test.ts` asserting the
  generator's output for `design/system/tokens/colors.css` matches a committed snapshot, for every
  precomputed tint/shadow in both themes. Depends on T029.
- [x] T031 [P] [D00c] Configure Vitest for `web/` and every `packages/*` workspace (`vitest.config.ts`
  each) with one trivial passing test per workspace.
- [x] T032 [P] [D00c] Configure `jest-expo` for `mobile/` (`mobile/jest.config.js`) with one trivial
  passing test.
- [x] T033 [D00c] **Checkpoint**: run D00c's exit check — `pnpm types:gen`, `pnpm tokens:build`, and
  `pnpm i18n:check` each succeed against the current skeleton state; `pnpm vitest run` and
  `pnpm --filter mobile test` each report ≥1 passing test. Do not start D00d until this passes.

## D00d — Design extraction scripts

- [x] T034 [D00d] Write the Built-screen extractor `design/scripts/extract-built.ts`: for each screen
  marked **Built** in `FurEver Design System/guidelines/screen-inventory.md`, read its `.babel`/
  `index.html` kit source and emit `design/screens/<ID>.md` (route, kit source file, states present,
  components used). Depends on T011.
- [ ] T035 [D00d] Write the Spec-screen stub generator `design/scripts/extract-spec-stubs.ts`: for every
  **Spec** row in `spec.md`'s Screen Coverage (Phase 1 only), emit `design/screens/<ID>.md` with
  `status: spec` and a `pattern:` field naming the nearest Built screen (per `spec.md`'s Design Gaps
  section). Depends on T034.
- [ ] T036 [D00d] Write `design/scripts/build-screen-map.ts` combining T034+T035's outputs into
  `design/screen-map.md` with columns: screen ID, route, kit source or pattern, delivery phase (looked up
  from `plan.md`'s Coverage Table). Depends on T035.
- [ ] T037 [D00d] Write the i18n extractor `design/scripts/extract-i18n.ts`: pull every `t('EN','AR')`
  call out of the `.babel` kit files, generate a key per screen (e.g. `screens.addPet.title`) grouped
  under that screen in `packages/i18n/en.json`/`ar.json`, and record every Arabic key's draft status as an
  entry in `packages/i18n/draft-keys.json` (a flat list of keys), not as a sibling marker inside
  `en.json`/`ar.json` (handoff.md: Arabic copy is draft). Depends on T034.
- [ ] T038 [D00d] Write `design/scripts/verify-screen-count.ts` comparing `design/screen-map.md`'s row
  count against `plan.md`'s Coverage Table total (70, including D02's T197 Setup Summary screen task; the
  script compares against whatever `plan.md` currently states, not a hardcoded number). Depends on T036.
- [ ] T039 [D00d] **Checkpoint**: run D00d's exit check — `design/screen-map.md` covers every Phase 1
  screen `plan.md`'s Coverage Table lists (T038 reports a match); `pnpm i18n:check` still passes after
  T037's extraction. Do not start D00e until this passes.

## D00e — App shells, RTL/theme, observability

### Mobile app scaffold

- [ ] T040 [D00e] Scaffold the Expo app in `mobile/`: `expo-router` + `expo-dev-client` installed and
  configured (`mobile/app/_layout.tsx` root).
- [ ] T041 [D00e] Configure NativeWind with the generated preset: `mobile/babel.config.js` +
  `mobile/metro.config.js` wired to `packages/design-tokens/dist/tailwind-preset.js`. Depends on T029,
  T040.
- [ ] T042 [P] [D00e] Configure `mobile/app.json`: `scheme: "furever"`, RTL support flags.
- [ ] T043 [P] [D00e] Write `mobile/eas.json` with `development`/`preview`/`production` build profiles.

### Web app scaffold

- [ ] T044 [D00e] Scaffold the Next.js App Router app in `web/`: `web/src/app/layout.tsx`,
  `web/src/app/[locale]/` routing skeleton, `web/middleware.ts` stub.
- [ ] T045 [D00e] Configure `next-intl` for `ar`/`en` in `web/src/i18n/`, wired to `packages/i18n`.
  Depends on T044, T027.
- [ ] T046 [D00e] Configure `next-themes` + Tailwind in `web/` against
  `packages/design-tokens/dist/variables.css` + `tailwind-preset.js`. Depends on T029, T044.
- [ ] T047 [D00e] Initialize `shadcn/ui` in `web/`; set `web/next.config.js` `output: 'standalone'`.
  Depends on T044.

### i18n wiring

- [ ] T048 [D00e] Wire `i18next` in `mobile/src/i18n/` to `packages/i18n`, persisting locale to
  `AsyncStorage`. Depends on T040, T027.
- [ ] T049 [D00e] Test: switching language in the mobile shell changes a rendered string
  (`mobile/src/i18n/__tests__/locale-switch.test.tsx`). Depends on T048.
- [ ] T050 [D00e] Wire `next-intl` locale persistence (cookie-based) in `web/middleware.ts`. Depends on
  T045.
- [ ] T051 [D00e] Test: switching language in the web shell changes a rendered string
  (`web/src/i18n/__tests__/locale-switch.test.tsx`). Depends on T050.

### Observability behind env flags

- [ ] T052 [P] [D00e] Wire Sentry + PostHog in `mobile/src/lib/observability.ts` behind env flags (no
  init call when off). Depends on T040.
- [ ] T053 [P] [D00e] Wire Sentry + PostHog in `web/src/lib/observability.ts` behind env flags. Depends
  on T044.
- [ ] T054 [P] [D00e] Wire Sentry in `backend/supabase/functions/_shared/sentry.ts` behind an env flag.
  Depends on T016.
- [ ] T055 [D00e] Test: with flags off, no network call fires from any of mobile/web/Edge-Function
  observability init (mocked network layer, one test file per surface or one combined test). Depends on
  T052, T053, T054.

### Theme/RTL/fonts/lint/shells

- [ ] T056 [D00e] Implement `mobile/src/hooks/useTheme.ts` + `useLocale.ts` (Zustand + `AsyncStorage`,
  reads the NativeWind preset). Depends on T029, T041.
- [ ] T057 [D00e] Implement the one-reload RTL switch `mobile/src/lib/rtl.ts`:
  `I18nManager.allowRTL(true)` + `forceRTL(isArabic)` then exactly one `expo-updates` reload (PRD
  amendment 6). Depends on T056.
- [ ] T058 [P] [D00e] Implement font preloading `mobile/src/lib/fonts.ts` (Cairo + Inter via `expo-font`
  before `SplashScreen.hideAsync()`).
- [ ] T059 [P] [D00e] Implement the `.ltr` isolate helper `mobile/src/components/LtrText.tsx` and
  `web/src/components/LtrText.tsx` (PRD amendment 6).
- [ ] T060 [P] [D00e] Implement the raw-hex/raw-px lint rule/script `scripts/lint-design-tokens.ts`
  (mirrors `design/system/_adherence.oxlintrc.json` — constitution I). Write the **failing fixture
  first**: `scripts/__fixtures__/bad-raw-hex.tsx` containing a raw hex color and a raw px value.
- [ ] T061 [D00e] Build the mobile themed hello screen `mobile/app/_dev/hello.tsx` using only
  `packages/design-tokens` values and the hooks from T056. Depends on T056, T060.
- [ ] T062 [D00e] Build the web themed login-page placeholder `web/src/app/[locale]/(auth)/login/page.tsx`
  using `next-themes` + `next-intl`, token-only styling. Depends on T046, T047, T060.
- [ ] T063 [D00e] Record the four-combination screenshot baseline: capture the mobile hello screen and
  web placeholder each in Arabic/English × light/dark into `design/screenshots/d00e-baseline/` (8 PNGs
  total, named `<surface>-<lang>-<theme>.png`). Depends on T061, T062.
- [ ] T064 [D00e] **Checkpoint**: run D00e's exit check — T063's 8 screenshots exist and are visually
  correct; `scripts/lint-design-tokens.ts` reports violations against T060's bad fixture and zero
  violations against T061/T062's real shell code. Do not start D00f until this passes.

## D00f — Docker and compose

- [ ] T065 [D00f] Write `web/Dockerfile` with `deps`/`dev`/`build`/`runner` stages, Next.js
  `output: 'standalone'`, a non-root user, and a `HEALTHCHECK` instruction. Depends on T044, T047.
- [ ] T066 [D00f] Write root `docker-compose.yml` with `dev`/`tools`/`ci` profiles: a `web` service (dev
  target, `WATCHPACK_POLLING=true` for Windows bind-mount file watching — research.md §10) and tool
  containers for lint/typecheck/unit-test/pgTAP under `tools`. Depends on T065.
- [ ] T067 [P] [D00f] Add `.dockerignore` at the repo root and under `web/`, excluding `node_modules`,
  `.next`, `.turbo`, local env files.
- [ ] T068 [D00f] Add named Docker volumes for the pnpm store and `node_modules` to `docker-compose.yml`
  (research.md §10). Depends on T066.
- [ ] T069 [D00f] Write the orchestration scripts as root `package.json` scripts **and**
  PowerShell-compatible wrappers `scripts/stack-up.ps1`, `scripts/stack-down.ps1`,
  `scripts/stack-reset.ps1`: `stack:up` (starts local Supabase via the Supabase CLI, then
  `docker compose --profile dev up`, waiting for both health checks), `stack:down`, `stack:reset`. Depends
  on T068.
- [ ] T070 [P] [D00f] Write `db:test`/`types:gen`/`tokens:build`/`i18n:check` as root `package.json`
  scripts plus PowerShell-compatible wrappers in `scripts/`, each wrapper noting that
  `-ExecutionPolicy Bypass` may be required on Windows and that script files stay LF-encoded
  (`.gitattributes`, T008) even though they run on Windows.
- [ ] T071 [D00f] Add `scripts/build-prod-web.ps1` + npm equivalent: build the `runner` target, run it
  once, confirm the `HEALTHCHECK` reports `healthy`. Depends on T065.
- [ ] T072 [P] [D00f] Document in `README.md`'s Docker section what explicitly does **not** run in
  Docker: the Metro bundler, the Android emulator, and all EAS builds (research.md §11), each with the
  host-side command to use instead.
- [ ] T073 [D00f] **Checkpoint**: run D00f's exit check — `pnpm stack:up` brings up `web` + local Supabase
  with passing health checks; `pnpm stack:down`/`pnpm stack:reset` both work (including the PowerShell
  wrappers); the production `web` image builds and passes its healthcheck (T071). Do not start D00g until
  this passes.

## D00g — CI and docs

- [ ] T074 [D00g] Write `.github/workflows/ci.yml` (PR checks: Biome, typecheck, unit tests, `pgTAP`
  against local Supabase, `i18n:check`, `tokens:build`, the RLS check, web build).
- [ ] T075 [P] [D00g] Write deploy-skeleton workflows `.github/workflows/deploy-web.yml`,
  `.github/workflows/eas-build.yml`, `.github/workflows/db-migrate.yml` (triggers/job shells only — real
  targets land in D08).
- [ ] T076 [P] [D00g] Add `renovate.json` at the repo root.
- [ ] T077 [D00g] Write `README.md` covering repo layout, the one-command run, and a link to
  `quickstart.md`.
- [ ] T078 [D00g] **Blocking task**: replace the placeholder `docs/PRD.md` (from T010) with the amended
  PRD — fold `plan.md`'s 10 PRD amendments (queue ticket shape, `#6B6B6B`, verification lockout,
  cancellation policy, onboarding, platform specifics, design system as source of truth, clinic-verified
  edit rights, Phase 4 hooks, and the 2026-10-18 sign-in method change) directly into the PRD's prose at
  their respective sections. **D02 must not start until this is checked off.**
- [ ] T079 [D00g] Run `quickstart.md` end to end from a genuinely fresh clone (a new directory, not this
  working copy) on the Windows machine, following every step verbatim; fix `quickstart.md` itself if any
  step needed an undocumented manual correction. Depends on T074, T075, T076, T077, T078.
- [ ] T080 [D00g] **Checkpoint** (D00 overall): CI is green on a trivial PR; `renovate.json` validates;
  `quickstart.md` reproduces the one-command run from a fresh clone (T079); `docs/PRD.md` is the amended
  version (T078), not the placeholder. **Delivery Phase D00 is complete; D01 may begin.**

**Manual (human) prerequisites — not automated tasks.** Needed before later phases; the ones marked
**blocks D02** must exist before D02's first screen/auth task can be tested end to end:
- Expo/EAS account + organization — **blocks D02** (dev builds needed for Google/Apple sign-in).
- Supabase staging and production projects — does not block D02, blocks D08's cutover.
- Google Cloud OAuth clients: Web, Android (+ SHA-1 per EAS keystore), iOS — **blocks D02** (AUTH-02).
- Apple Developer account + Sign in with Apple capability + Services ID — **blocks D02** (AUTH-03).
- Google Play Console account — does not block D02, blocks D08's store submission.
- Sentry project + PostHog project (DSN/API keys into `.env`) — does not block D02 functionally, but
  T052-T055's "no network when off" tests need *some* keys present to prove they're correctly withheld.
- GitHub repository secrets for all of the above, plus Supabase service-role keys per environment —
  blocks D00g's real CI runs.
- **An SMTP provider account and a verified sending domain** (SPF, DKIM, DMARC records live) — **this is
  the replacement for the removed Twilio/Egypt-geo-permission item**: 2026-10-18's sign-in method change
  makes owner sign-in itself depend on email delivery (login codes), not just invites/password-reset, so
  this now **blocks D02 entirely**, not just a corner of it (T145, T182).
- **Push credentials** (FCM server key for Android, APNs key for iOS) registered with Expo Push — does
  not block D02's own tasks, blocks D04's push registration (T247) from doing anything real.

---

# Delivery Phase D01 — Design system port

## Component ports (one task per component, both platforms)

- [ ] T081 [P] [D01] Port `Avatar`: `mobile/src/components/Avatar.tsx` + `web/src/components/Avatar.tsx`,
  matching `design/system/components/core/Avatar.d.ts` prop-for-prop.
- [ ] T082 [P] [D01] Port `Banner` (same pattern, `Banner.d.ts`).
- [ ] T083 [P] [D01] Port `Button` (`Button.d.ts`: `variant`, `size`, `block`, `loading`, `disabled`,
  `icon`, `onClick`, `style`, `type`).
- [ ] T084 [P] [D01] Port `Card` (`Card.d.ts`: `children`, `onClick`, `pad`, `tint`, `style`).
- [ ] T085 [P] [D01] Port `Chip` (`Chip.d.ts`: `on`, `icon`, `onClick`).
- [ ] T086 [P] [D01] Port `EmptyState` (`EmptyState.d.ts`: `icon`, `title`, `body`, `action`, `onAction`,
  `tone`).
- [ ] T087 [P] [D01] Port `Icon` (`Icon.d.ts`: `name`, `size`, `flip`, `label`).
- [ ] T088 [P] [D01] Port `IconButton` (`IconButton.d.ts`: `icon`, `label`, `badge`, `plain`, `flip`,
  `onClick`).
- [ ] T089 [P] [D01] Port `Input` (`Input.d.ts`: `label`, `hint`, `error`, `icon`, `value`,
  `defaultValue`, `placeholder`, `disabled`, `type`, `inputMode`, `ltr`, `prefix`, `onChange`).
- [ ] T090 [P] [D01] Port `PhaseTag` (`PhaseTag.d.ts`: `phase`, `children`).
- [ ] T091 [P] [D01] Port `Rating` (`Rating.d.ts`: `value`, `size`, `onChange`).
- [ ] T092 [P] [D01] Port `Skeleton` (`Skeleton.d.ts`: `w`, `h`, `r`).
- [ ] T093 [P] [D01] Port `StatusBadge` (`StatusBadge.d.ts`: `status` enum, `children`).
- [ ] T094 [P] [D01] Port `ClinicCard` (`ClinicCard.d.ts`: `name`, `distance`, `rating`, `next`,
  `nextLabel`, `badge`, `onClick`).
- [ ] T095 [P] [D01] Port `ConfirmSheet` (`ConfirmSheet.d.ts`: `title`, `body`, `confirm`, `cancel`,
  `destructive`, `onConfirm`, `onCancel`).
- [ ] T096 [P] [D01] Port `PetCard` (`PetCard.d.ts`: `name`, `breed`, `age`, `status` enum,
  `statusLabel`, `onClick`).
- [ ] T097 [P] [D01] Port `SlotChip` (`SlotChip.d.ts`: `time`, `on`, `disabled`, `onClick`).
- [ ] T098 [P] [D01] Port `Stepper` (`Stepper.d.ts`: `steps`, `current`).
- [ ] T099 [P] [D01] Build the missing `PhoneInput` (country prefix + `Input` composition, from the
  kits' local usage pattern).
- [ ] T100 [P] [D01] Build the missing `OtpInput` (6-box code entry; used for the email sign-in code, not
  SMS — no SMS autofill applies).
- [ ] T101 [P] [D01] Build the missing `SearchBar`.
- [ ] T102 [P] [D01] Build the missing `Select` (bottom-sheet picker on mobile, popover on web).
- [ ] T103 [P] [D01] Build the missing `DateField` (`@react-native-community/datetimepicker` on mobile,
  `react-day-picker` on web).
- [ ] T104 [P] [D01] Build the missing `CategoryCard` (tinted `Card` variant per PRD section 9).
- [ ] T105 [P] [D01] Build the missing `DoctorCard`.
- [ ] T106 [P] [D01] Build the missing `ListRow`.
- [ ] T107 [P] [D01] Build the missing `Toast`.
- [ ] T108 [P] [D01] Build the missing `ScreenHeader`.

## Dashboard shell (web only)

- [ ] T109 [P] [D01] Build the sidebar shell `web/src/components/dashboard/Sidebar.tsx` (inline-start,
  collapsible, right in Arabic).
- [ ] T110 [P] [D01] Build the top bar `web/src/components/dashboard/TopBar.tsx` (clinic switcher,
  search, language/theme toggle, user menu).
- [ ] T111 [P] [D01] Build the data table `web/src/components/dashboard/DataTable.tsx` (server-side
  pagination/sorting props, URL state via `nuqs`).
- [ ] T112 [P] [D01] Build the modal/dialog shell `web/src/components/dashboard/Modal.tsx`.
- [ ] T113 [P] [D01] Build the restricted-state wrapper `web/src/components/dashboard/RestrictedState.tsx`
  (locked-page pattern for non-managers/non-super-admins).
- [ ] T114 [P] [D01] Build the stat card `web/src/components/dashboard/StatCard.tsx`.

## Gallery and verification

- [ ] T115 [P] [D01] Build the mobile component gallery `mobile/app/_dev/gallery.tsx` rendering all 28
  components. Depends on T081-T108.
- [ ] T116 [P] [D01] Build the web component gallery `web/src/app/_dev/gallery/page.tsx` rendering all
  28 components + the 6 dashboard-shell pieces. Depends on T081-T114.
- [ ] T117 [D01] Automated 4-combination screenshot check for both galleries. Depends on T115, T116.
- [ ] T118 [D01] Write the prop-drift check `scripts/check-component-props.ts` comparing every ported
  component's exported prop types against `design/system/components/**/*.d.ts`. Depends on T081-T098.
- [ ] T119 [D01] **Checkpoint**: both galleries render all components correctly in all 4 combinations
  (T117); the raw-hex/px rule (D00e) reports 0 violations against the new component code; the prop-drift
  check (T118) passes. Gate for D02.

---

# Delivery Phase D02 — Auth and roles

**Manual prerequisites** (expands the D00g checklist): Expo/EAS dev build, Google OAuth clients, Apple
Developer + SIWA, and — **replacing Twilio entirely (2026-10-18 sign-in method change)** — an **SMTP
provider account and a verified sending domain** (SPF/DKIM/DMARC live) — all **block this phase**: owner
sign-in now runs on email codes, so no email delivery means no sign-in to test at all. **Push credentials**
(FCM server key, APNs key) registered with Expo — does not block D02's own tasks but blocks D04's push
registration from doing anything real. **Manual Linking dashboard toggle** (new, remediation pass): if
T121 finds it's needed and T122 enables it locally, the equivalent "Enable Manual Linking" toggle in
the staging/production Supabase dashboard must be turned on too — blocks T179/T180/T181 in those
environments only, not local dev.

## Guard-bypass spike (new, this fix pass)

- [ ] T120 [D02] **Spike**: attempt to call Supabase Auth's email-OTP `signInWithOtp`/`verifyOtp` endpoints
  directly with the public anon key, bypassing `verify-otp-guard` entirely, and record whether the
  5-wrong-attempt/3-cancelled-code lockout can be bypassed this way — see `research.md`'s new "Is the
  email-code guard bypassable?" section. **Also evaluate Option A+ this remediation pass added to that
  section** (CAPTCHA protection on the Auth endpoints from a React Native client; a longer email OTP
  length) and record findings there too, without choosing between A/A+/B/C — that stays an owner decision.
  No dependency; run first in D02 so the result shapes T140/T141 below.
- [ ] T121 [D02] **Spike (new, remediation pass)**: confirm Supabase Auth's automatic email/Google
  identity-linking behavior against this project's actual Auth settings (resolves `plan.md` Open Question
  2), and confirm whether **Manual Linking** needs enabling for the Account screen's "Add Google"/"Add
  email sign-in" actions (T179 below) — per official Supabase docs, Manual Linking is **disabled by
  default** and is a different mechanism from the automatic linking AUTH-06 otherwise relies on. [AUTH-06]
- [ ] T122 [D02] **New, remediation pass**: if T121 found Manual Linking is off, enable it in
  `backend/supabase/config.toml` (`auth.enable_manual_linking = true`) for local dev; add the staging/
  production dashboard toggle to the manual-prerequisites list below. Depends on T121. [AUTH-06]

## Migrations (FK-safe creation order)

- [ ] T123 [D02] Migration: `cities` table + RLS + seed. Needed before `profiles` (city picker).
- [ ] T124 [D02] Migration: `profiles` table + RLS (`email` required; `phone` nullable/optional — 2026-10-18
  sign-in method change). Depends on T123.
- [ ] T125 [D02] Migration: `clinics` table (slim: identity + `status` only — `name_en/ar`, `city_id`,
  `status`) + RLS. Moved here from D05 because `clinic_staff`/`vaccinations`/`health_records`/
  `appointments`/`queue_tickets`/`reviews` all FK into it. D05 **extends** this table later (location,
  hours, media, rating, search indexes); D05 does not re-create it.
- [ ] T126 [D02] Migration: `clinic_staff` table + RLS. Depends on T124, T125 (FKs to both).
- [ ] T127 [P] [D02] Migration: `push_tokens` table + RLS. Depends on T124.
- [ ] T128 [P] [D02] Migration: `consents` table + RLS. Depends on T124.
- [ ] T129 [D02] Migration: `audit_logs` table + RLS (append-only: no `UPDATE`/`DELETE` grant to any
  role). Moved here from D07 because the generic audit mechanism (next task) needs it to exist first.
  **Created before `feature_flags`/`app_config` (this fix pass)** — both tables' audit triggers call
  `write_audit_log()`, which itself needs `audit_logs` to exist, so the two tables can no longer come
  first.
- [ ] T130 [D02] Write the shared helper function `write_audit_log(p_actor_id, p_action, p_entity,
  p_entity_id, p_diff)` — `security definer`, insert-only into `audit_logs`. Every admin-write RPC/Edge
  Function in every later phase calls this instead of inserting directly. Depends on T129. **Tag added,
  this fix pass**: this is the generic mechanism behind AD-08's "immutable audit entry for every admin
  write and every admin read of health data." [AD-08]
- [ ] T131 [P] [D02] Migration: `feature_flags` table + RLS + seed (5 flags, all `false` — constitution
  VI) + an `AFTER INSERT OR UPDATE OR DELETE` trigger calling `write_audit_log()`, **attached in this same
  migration** (this fix pass removes the old forward-reference and its separate follow-up task —
  `write_audit_log()` already exists by this point, T130). Depends on T130.
- [ ] T132 [P] [D02] Migration: `app_config` table + RLS + the same audit trigger as T131, attached
  directly in this migration. Depends on T130. [PLT-01][PLT-02]
- [ ] T133 [D02] REVOKE direct `UPDATE` of `clinics.status` from `authenticated` (only `set_clinic_status`,
  D05, may change it). Depends on T125.
- [ ] T134 [D02] Migration: `otp_attempts` table + RLS (service-role only), **keyed by a normalized email
  `identifier`** (2026-10-18 — was `phone_number`). [AUTH-01]

## Role claim, OTP guard, Edge Functions

- [ ] T135 [D02] Extend `custom_access_token_hook` (D00b skeleton) to inject `profiles.role` as
  `user_role` (research.md §8). Depends on T124. [AD-01]
- [ ] T136 [P] [D02] RPC `record_otp_attempt(p_identifier, p_outcome)` (2026-10-18 — was
  `p_phone`). Depends on T134. [AUTH-01]
- [ ] T137 [P] [D02] RPC `get_otp_lock_status(p_identifier)` (2026-10-18 — was `p_phone`). Depends on
  T134. [AUTH-01]
- [ ] T138 [D02] **New (this fix pass)**: harden the direct-Auth path per T120's spike result and the
  owner decision recorded in `research.md`'s "Is the email-code guard bypassable?" section (a Send Email
  hook, a custom-code generate/hash/verify design, or Auth rate-limit/captcha configuration — whichever was
  chosen). Depends on T120. If the owner decision is still pending when D02 reaches this point, stop and
  escalate rather than building T139 on a guard that the direct path can bypass.
- [ ] T139 [D02] Edge Function `verify-otp-guard/`, **rewritten for email (2026-10-18)**: exposes
  `send-code` and `verify-code` actions keyed by a normalized email identifier, with per-email and per-IP
  send throttling and an identical response for a known vs. unknown email (no account enumeration). Only
  enforceable once T138 closes or restricts the direct path (`contracts/edge-functions.md`). Depends on
  T136, T137, T138. [AUTH-01]
- [ ] T140 [P] [D02] Edge Function `admin-create-staff/` (sends the invite email — needs SMTP, T145).
  [CS-01][CS-10]
- [ ] T141 [P] [D02] Edge Function `admin-set-user-status/`, calling `write_audit_log()` for every status
  change. Depends on T130. [AUTH-10][AD-03]
- [ ] T142 [P] [D02] Edge Function `delete-account/`. [AUTH-08]
- [ ] T143 [P] [D02] Edge Function `export-my-data/`. [AUTH-09]
- [ ] T144 [P] [D02] Edge Function `app-config/`. [PLT-01][PLT-02]
- [ ] T145 [D02] **Replaces the Twilio provider task (2026-10-18)**: configure custom SMTP and the
  login-code email template (`{{ .Token }}`, not `{{ .ConfirmationURL }}` — research.md §12) in
  `config.toml` and in the staging and production projects. [AUTH-01]
- [ ] T146 [D02] Document and wire required Supabase secrets for every Edge Function above
  (`supabase secrets set` — SMTP credentials, Sentry DSN) in `docs/environments.md`.

## Google and Apple sign-in (new, this fix pass — AUTH-02/AUTH-03 had no implementation task before)

- [ ] T147 [D02] Build the Google sign-in module `mobile/src/features/auth/google-signin.ts`: configure
  `@react-native-google-signin/google-signin` with the **web** OAuth client ID (`webClientId` — Supabase's
  own Google guide: Android uses the web client ID even though a separate Android client exists for the
  SHA-1 fingerprint; iOS uses the iOS client's own `iosClientId`), call `GoogleSignin.signIn()`, extract
  the `idToken`, and exchange it via `supabase.auth.signInWithIdToken({ provider: 'google', token:
  idToken })`. If the user cancels the account picker (`statusCodes.SIGN_IN_CANCELLED`), return to Sign in
  **with no error toast** (AUTH-02's Given/When/Then). Depends on T184 (EAS dev build — this module needs
  a development build, not Expo Go). [AUTH-02]
- [ ] T148 [D02] Build the Apple sign-in module `mobile/src/features/auth/apple-signin.ts` (**iOS only**;
  on Android, the caller must not even import this module — see T193/T194's platform check): generate a
  raw nonce (`supabase.auth.generateRawNonce()` or an equivalent secure random string), SHA-256-hash it,
  pass the **hashed** nonce to `AppleAuthentication.signInAsync({ requestedScopes: [FULL_NAME, EMAIL],
  nonce: hashedNonce })` (`expo-apple-authentication`), then call `supabase.auth.signInWithIdToken({
  provider: 'apple', token: identityToken, nonce: rawNonce })` with the **raw** (unhashed) nonce — Supabase
  hashes it again server-side to verify it matches the claim inside Apple's token. On the **first**
  sign-in only, Apple returns `fullName`; persist it via `supabase.auth.updateUser()` immediately, since
  every later sign-in returns `null` for it (confirmed from Supabase's own Apple guide). A hidden
  (private-relay) email from Apple is accepted and stored as the account's email, same as any other
  address (research.md §14). Depends on T184. [AUTH-03]
- [ ] T149 [D02] Supabase Google/Apple provider configuration: `backend/supabase/config.toml`'s
  `[auth.external.google]` and `[auth.external.apple]` blocks (client ID + secret env-var references) for
  local dev, plus a `docs/environments.md` note on enabling and configuring the same two providers in the
  staging/production project dashboards (Authentication → Providers). [AUTH-02][AUTH-03]
- [ ] T150 [D02] Expo config entries both native modules need in `mobile/app.json`/`app.config.ts` —
  verified against each library's own docs, not assumed: the Google Sign-In config plugin with
  `iosUrlScheme` (the reversed iOS client ID) under `plugins`, and `ios.usesAppleSignIn: true` plus the
  `expo-apple-authentication` config plugin. **Both require a development build** (native modules, not
  available in Expo Go) — confirms the dependency on T184 above is real, not incidental. [AUTH-02][AUTH-03]
- [ ] T151 [P] [D02] Unit tests: Apple nonce round-trip (the SHA-256 hash of the raw nonce sent to
  `signInWithIdToken` matches the hashed nonce sent to `AppleAuthentication.signInAsync`); the Apple
  module is never reachable on Android (`Platform.OS === 'ios'` gate, asserted by mocking `Platform.OS`
  both ways and checking the module import/render path). [AUTH-03]

## Email templates (new, 2026-10-18)

- [ ] T152 [D02] Author the 3 bilingual (Arabic and English in the same email, RTL-safe) email templates —
  login code, staff invite, password reset — in `backend/supabase/templates/` (Arabic marked draft, needs
  native review per `spec.md` Open Decisions item 11). Depends on T145.
- [ ] T153 [D02] Rendering check test for the 3 templates (T152): both languages render correctly in one
  email, RTL markup is valid, no broken layout in common email clients' preview panes.

## Local email inbox test helper (new, 2026-10-18)

- [ ] T154 [D02] Build the shared test helper `packages/shared/src/testing/read-local-inbox.ts`: fetches
  the latest email sent to a given address from Supabase's local dev email inbox and extracts the 6-digit
  code, for use by both Maestro and Playwright (research.md §15).

## Send-throttle test (new, 2026-10-18)

- [ ] T155 [D02] Integration test: `send-code` is throttled per email address and per IP address, and
  returns an identical response for a known vs. an unknown email (no account enumeration). **Fixed (this
  fix pass — was pointed at T138, which used to be `verify-otp-guard` before this pass inserted a new
  placeholder at that number)**: depends on T139 (`verify-otp-guard`, where the throttling is
  implemented). [AUTH-01]

## pgTAP (auth/roles/audit policy coverage)

- [ ] T156 [P] [D02] pgTAP: `authenticated` cannot update `profiles.role`/`status`. [AUTH-10]
- [ ] T157 [P] [D02] pgTAP: a suspended user's API call is rejected. [AUTH-10]
- [ ] T158 [P] [D02] pgTAP: RLS coverage for `profiles`/`consents`/`push_tokens` (owner-only). [AUTH-04][AUTH-09]
- [ ] T159 [P] [D02] pgTAP: `write_audit_log()` inserts a correct, immutable row.
- [ ] T160 [P] [D02] pgTAP: writing to `feature_flags`/`app_config` auto-produces an `audit_logs` row via
  the trigger attached directly in T131/T132.
- [ ] T161 [P] [D02] pgTAP: only `super_admin` can write `feature_flags`/`app_config`.
- [ ] T162 [P] [D02] pgTAP: `otp_attempts` has zero `authenticated`-role access (service-role only).
- [ ] T163 [P] [D02] pgTAP: `clinics.status` cannot be updated directly by `admin` (confirms T133's
  revoke).

## Supabase clients

- [ ] T164 [D02] Mobile Supabase client + encrypted session storage adapter in
  `mobile/src/lib/supabase.ts` (AES key in `expo-secure-store`, ciphertext in `AsyncStorage`, a migration
  path from any legacy plaintext value — research.md §6).
- [ ] T165 [D02] Mobile: `AppState` foreground session refresh + `detectSessionInUrl: false` in
  `mobile/src/lib/supabase.ts`. Depends on T164.
- [ ] T166 [D02] Web `@supabase/ssr` browser + server clients in `web/src/lib/supabase/{browser,server}.ts`.
- [ ] T167 [D02] Web middleware session refresh + role-based redirect in `web/middleware.ts` (extends
  D00e's T050 locale persistence). Depends on T166.
- [ ] T168 [D02] Web: enforce `aal2` for every `/admin` route in `web/middleware.ts` — redirect to MFA
  enroll/verify otherwise. Depends on T167. [AD-01]
- [ ] T169 [P] [D02] React Query providers in `mobile/src/app/_providers.tsx` and
  `web/src/app/providers.tsx`. **Extended, remediation pass (PLT-03/FR-058)**: configure cache persistence
  on mobile via `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister`
  (`AsyncStorage`-backed — same React Query family already chosen, no new framework) so a cached list
  still renders when the app opens offline.

## Offline infrastructure (new, remediation pass — PLT-03/FR-058)

- [ ] T170 [D02] Build the shared `mobile/src/hooks/useNetworkStatus.ts` (wraps
  `@react-native-community/netinfo`) returning `{ isOnline }`, plus a unit test asserting it flips on a
  mocked connectivity change. [PLT-03]
- [ ] T171 [D02] Build `OfflineBanner` — `mobile/src/components/OfflineBanner.tsx` +
  `web/src/components/OfflineBanner.tsx` — composed from the existing `Banner` component (T082) +
  `useNetworkStatus` (T170), showing the explanatory offline text from `packages/i18n` when offline and
  nothing when online. Depends on T170. [PLT-03]
- [ ] T172 [D02] Build the shared "disabled with a reason" pattern for network-dependent actions — a
  `useOfflineGuardedAction` hook wrapping a handler so the bound `Button`/`IconButton` renders `disabled`
  with a reason sub-label when offline (`useNetworkStatus`, T170) — and wire it into one representative
  action (`/pets/new` Add pet's submit button is the first screen to use it; the real wiring task is D03's
  My pets/Add pet screens below). Depends on T170. [PLT-03]

## Route guards, onboarding orchestration, shells (infrastructure — not counted as Screen Coverage rows)

- [ ] T173 [D02] Mobile route guard `mobile/src/lib/route-guard.ts`: redirects on signed-out, profile
  incomplete, suspended, force-update, maintenance. Depends on T135, T164, T144.
- [ ] T174 [D02] Web route guard (extends T167/T168): same five states for the dashboard. Depends on T167.
- [ ] T175 [D02] Onboarding flow orchestration `mobile/src/features/onboarding/router.ts` — new-user path
  (Language→Onboarding→Welcome→**Email**→Verify→Profile→pet steps→Permissions→Summary→Home, 2026-10-18 —
  was Phone) and the returning-user path (Welcome→Sign-in **by email or Google**→Verify (email path
  only)→Home). [AUTH-01]
- [ ] T176 [D02] Build the Home tab shell `mobile/app/(tabs)/index.tsx` (empty shell — D04 adds the
  vaccines-due banner). Infrastructure; Home's Screen Coverage credit stays with D04.
- [ ] T177 [D02] Build `mobile/app/(tabs)/_layout.tsx` (tab bar: Home, Pets, Bookings, Profile). Depends on
  T176.
- [ ] T178 [D02] Build the Permissions primer shell `mobile/app/permissions.tsx` (empty shell — D04 adds
  the real permission-request logic). Infrastructure; credit stays with D04.

## Account linking (new, remediation pass — AUTH-06/FR-006)

- [ ] T179 [D02] Build the Account-screen linking actions in `mobile/src/features/account/linking.ts`:
  "Add Google account" calls Supabase's `linkIdentity({ provider: 'google' })` (Manual Linking, gated on
  T122); "Add email sign-in" re-uses `verify-otp-guard`'s `send-code`/`verify-code` actions for the
  owner's chosen email while already signed in (it must **not** call Supabase Auth's OTP endpoints
  directly, same rule as AUTH-01) — confirm against official Supabase Identity Linking docs which call
  shape actually attaches the resulting identity to the already-signed-in user, since manual linking of a
  non-OAuth (email) identity is not fully documented and may need the Admin API instead of a plain client
  call; record the finding as a one-line note in `research.md` §13 if it differs from this description.
  Depends on T121, T122. [AUTH-06]
- [ ] T180 [D02] Map a link-conflict response (the identity already belongs to a different account) to
  the new `IDENTITY_ALREADY_LINKED` error code (`contracts/error-codes.md`) and show the "clear message"
  AUTH-06 requires; wire this into T179's two actions. Depends on T179. [AUTH-06]
- [ ] T181 [D02] Maestro: link Google to an email-only account and link email to a Google-only account,
  both succeeding without creating a second account; then repeat linking the same Google identity to a
  second account and confirm `IDENTITY_ALREADY_LINKED` (T180) shows the clear message. Depends on
  T180. [AUTH-06]

## Smaller items (point 9)

- [ ] T182 [D02] Cloudflare Turnstile on web login and password reset (`web/src/app/[locale]/(auth)/
  {login,forgot-password}/page.tsx`). **Fixed (this fix pass — the previous revision wrongly pointed this
  at an E2E task and a D03 migration, two unrelated tasks)**: depends on T207 (`/login`) and T211
  (`/forgot-password`) below, the actual screens whose files this task edits.
- [ ] T183 [D02] Maintenance banner in the dashboard shell `web/src/components/dashboard/
  MaintenanceBanner.tsx`, reading `app_config` via T144. [PLT-02]
- [ ] T184 [D02] Produce the first EAS development build (`eas build --profile development`) and confirm
  it launches past Splash on a device/emulator. Depends on D00e's T043 and the manual-prerequisites EAS
  account.
- [ ] T185 [D02] PostHog instrumentation for `sign_up_completed`, `language_changed`, `theme_changed`
  (PRD section 14).
- [ ] T186 [D02] Write `backend/supabase/scripts/check-policy-coverage.ts`: lists every policy from
  `pg_policies` and fails CI if a policy has no matching pgTAP test reference (grep the test suite for the
  policy/table name). Add to `ci.yml`. This becomes a standing CI gate from here through D08.

## Shared schemas, i18n, test tooling

- [ ] T187 [D02] Add auth/profile Zod schemas to `packages/shared/src/schemas/auth.ts` (email required;
  phone optional, Egyptian-format check applied only when present). [AUTH-01..05]
- [ ] T188 [D02] Add auth/onboarding keys to `packages/i18n`. [AUTH-01..10]
- [ ] T189 [D02] Install and configure Maestro (`mobile/.maestro/`) and Playwright
  (`web/playwright.config.ts`).

## Screens (23 counted + 3 infrastructure, listed above)

- [ ] T190 [P] [D02] Build `/` Splash — `mobile/app/index.tsx` (Built). [PLT-01][PLT-02]
- [ ] T191 [P] [D02] Build `/language` Language — `mobile/app/language.tsx` (Built). [AUTH-05]
- [ ] T192 [P] [D02] Build `/onboarding` Onboarding (3 slides) — `mobile/app/onboarding.tsx` (Built).
  [AUTH-01]
- [ ] T193 [P] [D02] Build `/welcome` Welcome — `mobile/app/welcome.tsx` (Built, design change needed:
  email instead of phone — `design/overrides.md`). **Clarified, this fix pass**: this task renders the
  Google/Apple buttons and wires their `onPress` to T147/T148 — it does not reimplement the native
  sign-in flow inline; the Apple button is hidden entirely on Android (`Platform.OS === 'ios'`), not just
  disabled. [AUTH-01][AUTH-02][AUTH-03]
- [ ] T194 [P] [D02] Build `/sign-in` Sign in — `mobile/app/(auth)/sign-in.tsx` (Built, design change
  needed: email field instead of phone — `design/overrides.md`). **Clarified, this fix pass**: same
  delegation as T193 — calls T147 (Google)/T148 (Apple), does not duplicate their logic; a cancelled
  Google picker returns here with no error toast (T147's own done-condition). [AUTH-01][AUTH-02][AUTH-03]
- [ ] T195 [P] [D02] Build `/otp` Verify code — `mobile/app/(auth)/otp.tsx` (Built, design change needed:
  email-code wording [resend timer, "change email", spam-folder hint] and rework the prototype's 3-attempt
  UI to 5 — `design/overrides.md`). [AUTH-01]
- [ ] T196 [P] [D02] Build `/complete-profile` — `mobile/app/(auth)/complete-profile.tsx` (Built, design
  change needed: phone field becomes optional — `design/overrides.md`). [AUTH-04]
- [ ] T197 [P] [D02] Build the Setup Summary screen `mobile/app/onboarding/summary.tsx` (Built —
  `FurEver Design System/ui_kits/mobile-entry/e-onboard2.babel`; review-your-setup screen with per-step
  Edit buttons; present in the kit, present in `spec.md`'s Screen Coverage). [AUTH-01][PET-01]
- [ ] T198 [P] [D02] Build `/(tabs)/profile` Profile — `mobile/app/(tabs)/profile.tsx` (Built). [AUTH-05][AUTH-07]
- [ ] T199 [P] [D02] Build `/profile/settings` Settings — `mobile/app/profile/settings.tsx` (Built).
  **Re-tagged, remediation pass**: wires the three `notif_prefs` toggles (vaccination reminders, booking
  updates, offers — T255's schema) that NTF-02/FR-035 requires; this screen was previously tagged only
  `[AUTH-05]` despite `spec.md`'s own Screen Coverage already listing NTF-02 here. [AUTH-05][NTF-02]
- [ ] T200 [P] [D02] Build `/profile/account` Account — `mobile/app/profile/account.tsx` (Built, design
  change needed: linked methods show email/code and Google [and Apple, read-only] instead of phone and
  Google; the "Add phone" linking action is removed — `design/overrides.md`). **Enriched, remediation
  pass**: the removed "Add phone" action is replaced by two new ones, "Add Google account" and "Add email
  sign-in" (T179/T180 implement their logic; this task builds the buttons, their i18n keys, and
  loading/success/conflict states — see `design/overrides.md`'s new rows).
  [AUTH-06][AUTH-07][AUTH-08][AUTH-09]
- [ ] T201 [P] [D02] Build `/profile/edit` Edit profile — `mobile/app/profile/edit.tsx` (Spec; pattern:
  Complete profile; optional phone field). [AUTH-04]
- [ ] T202 [P] [D02] Build `/profile/help` Help — `mobile/app/profile/help.tsx` (Spec; pattern: Profile).
- [ ] T203 [P] [D02] Build `/profile/about` About — `mobile/app/profile/about.tsx` (Spec; pattern:
  Profile).
- [ ] T204 [P] [D02] Build `/legal/terms`, `/legal/privacy` — `mobile/app/legal/[doc].tsx` (Spec;
  pattern: Profile). [AUTH-04]
- [ ] T205 [P] [D02] Build `/force-update` — `mobile/app/force-update.tsx` (Spec; pattern: Splash).
  [PLT-01]
- [ ] T206 [P] [D02] Build `/maintenance` — `mobile/app/maintenance.tsx` (Spec; pattern: Splash,
  includes T183's banner equivalent for mobile). [PLT-02]
- [ ] T207 [P] [D02] Build `/login`, `/mfa` — `web/src/app/[locale]/(auth)/{login,mfa}/page.tsx` (Built).
  [CS-01][AD-01]
- [ ] T208 [P] [D02] Build Admin team — `web/src/app/[locale]/(admin)/team/page.tsx` (Spec; pattern:
  Users). [AD-01]
- [ ] T209 [P] [D02] Build admin Settings — `web/src/app/[locale]/(admin)/settings/page.tsx` (Spec;
  pattern: Clinic profile).
- [ ] T210 [P] [D02] Build `/accept-invite` — `web/src/app/[locale]/(auth)/accept-invite/page.tsx` (Spec;
  pattern: Sign in). [CS-01]
- [ ] T211 [P] [D02] Build `/forgot-password` — `web/src/app/[locale]/(auth)/forgot-password/page.tsx`
  (Spec; pattern: Sign in).
- [ ] T212 [P] [D02] Build `/no-access` — `web/src/app/[locale]/(auth)/no-access/page.tsx` (Spec; pattern:
  Sign in). [AD-01]

## E2E / unit

- [ ] T213 [D02] Maestro: email sign-up happy path + wrong code + lockout, reading the code from the local
  email inbox via T154's helper (2026-10-18 — was "phone sign-up"). [AUTH-01]
- [ ] T214 [D02] Maestro, **enriched this fix pass for per-platform cases (item 1f)**: on Android, Google
  sign-in happy path (T147) plus cancelling the account picker returns to Sign in with no error toast,
  and confirm the Apple button is entirely absent from the screen; on iOS, Apple sign-in happy path
  (T148) including the first-sign-in full-name capture, plus Google sign-in happy path (both buttons
  present on iOS). [AUTH-02][AUTH-03]
- [ ] T215 [D02] Playwright: dashboard login + MFA enrollment + aal2 gate. [AD-01]
- [ ] T216 [D02] **Checkpoint**: AUTH-01→04 completes end to end on a dev build incl. the Summary screen,
  using a real email code read from the local inbox; admin signs in with MFA and reaches `/admin`;
  suspended user rejected; force-update/maintenance reachable by flag; `write_audit_log()` fires on a flag
  change; `check-policy-coverage.ts` (T186) passes against every policy created so far; the 3 email
  templates (T152) render correctly bilingually; all in 4 combinations. Gate for D03.

---

# Delivery Phase D03 — Pets and passport

## Backend (breeds before pets)

- [ ] T217 [D03] Migration: `breeds` table + RLS + seed (40+ cat/dog breeds, bilingual) + the admin-write
  audit trigger (same pattern as T131/T132). [PET-01]
- [ ] T218 [D03] Migration: `pets` table + RLS. Depends on T217 (FK to `breeds`). [PET-01]
- [ ] T219 [P] [D03] Storage bucket `pet-photos` + path-prefix policy. [PET-01]
- [ ] T220 [P] [D03] Storage bucket `pet-documents` + path-prefix policy. [PET-05]
- [ ] T221 [D03] RPC `delete_pet(p_pet_id)` — soft-delete only (no `appointments` yet). Depends on T218.
  [PET-03]

## Data lifecycle: purge job (new, remediation pass — constitution IV, FR-013/PET-03)

- [ ] T222 [D03] Migration + RPC `purge_soft_deleted()` — `security definer`, hard-deletes `pets` and
  `profiles` rows where `deleted_at < now() - interval '30 days'`, written so a later phase registers its
  own table in the same function rather than writing a new one; calls `write_audit_log()` once per run with
  the count and table list purged. Schedule it with `pg_cron` **daily at 03:00 Africa/Cairo** (off-peak).
  Also deletes `otp_attempts` rows where `updated_at < now() - interval '7 days'` in the same run — **7
  days is an assumption, recorded in `spec.md`'s Assumptions**, since no lock lasts more than 15 minutes
  and nothing else reads this table once a code cycle completes; revisit if fraud-pattern analysis ever
  needs a longer window. Depends on T218 (pets), T130 (`write_audit_log`, from D02). [PET-03]
- [ ] T223 [D03] Migration: `storage_cleanup_queue` table + RLS (service-role only: `bucket`, `path`,
  `queued_at`, `done_at`) + Edge Function `purge-storage-objects/` that reads undone rows and calls the
  Storage API's `remove()` in batches of ≤1000 (confirmed from official Supabase docs: **deleting via SQL
  never removes the object from the bucket — it must go through the Storage API**), marking each row
  `done_at` on success. Schedule the Edge Function via `pg_cron` + `pg_net` every 15 minutes. `T222`'s
  purge enqueues the `photo_path`/`document_path` of every purged pet into this queue for the
  `pet-photos`/`pet-documents` buckets. Depends on T222, T219, T220. [PET-03]

## Shared attachment handling (point 7)

- [ ] T224 [D03] Build the shared `mobile/src/components/AttachmentUpload.tsx` (image/document picker,
  `expo-image-manipulator` resize, 10 MB + MIME checks, upload progress, retry on failure).
- [ ] T225 [D03] Build the shared `mobile/src/components/AttachmentViewer.tsx` (opens a private file via
  signed URL, pinch-to-zoom for images, PDF preview). Used by Document viewer (T235) and D04's Add
  vaccination/Add record/Passport share screens.

## pgTAP

- [ ] T226 [P] [D03] pgTAP: owner-only `pets` access. [PET-01]
- [ ] T227 [P] [D03] pgTAP: `delete_pet` soft-deletes correctly. [PET-03]
- [ ] T228 [P] [D03] pgTAP: `purge_soft_deleted()` (T222) removes a pet/profile row whose `deleted_at`
  is exactly 30 days (or older) in the past, and leaves a row at 29 days untouched. [PET-03]
- [ ] T229 [P] [D03] pgTAP: a `purge_soft_deleted()` (T222) run writes an `audit_logs` row via
  `write_audit_log()`. [PET-03]

## Shared schemas, i18n

- [ ] T230 [D03] Add pet Zod schemas. [PET-01][PET-02]
- [ ] T231 [D03] Add pet keys to `packages/i18n`. [PET-01..05]

## Screens (4)

- [ ] T232 [P] [D03] Build `/(tabs)/pets` My pets — `mobile/app/(tabs)/pets.tsx` (Built). **Reference
  implementation, remediation pass**: the first list screen to wire `OfflineBanner` (T171) above the
  list and read from the React Query cache (T169) so it still renders offline; later screens follow this
  pattern. [PET-01][PET-02][PET-03][PLT-03]
- [ ] T233 [P] [D03] Build `/pets/new` Add pet (4 steps) — `mobile/app/pets/new.tsx` (Built; uses T224 for
  the photo step). **Reference implementation, remediation pass**: its final-step submit button uses
  `useOfflineGuardedAction` (T172) so it is disabled with a reason when offline, instead of silently
  queuing or failing. [PET-01][PLT-03]
- [ ] T234 [P] [D03] Build `/pets/[id]/edit` Edit pet — `mobile/app/pets/[id]/edit.tsx` (Spec; pattern:
  Add pet). [PET-02]
- [ ] T235 [P] [D03] Build `/documents/[path]` Document viewer — `mobile/app/documents/[path].tsx` (Spec;
  pattern: Passport share; uses T225). [PET-05]

## E2E

- [ ] T236 [D03] Maestro: with the device offline (airplane mode or a mocked network layer), open My
  pets (T232) and confirm the cached list still renders with `OfflineBanner` (T171) showing; then open
  Add pet (T233) and confirm its submit button is disabled with a reason instead of silently failing. This
  is D08's T381 (PLT-03 verification)'s first real reference case. [PLT-03]
- [ ] T237 [D03] Maestro: add/edit/delete a pet, including during onboarding, then run as D03's
  **Checkpoint**: confirm a pet can be created, edited, and soft-deleted with the upcoming-bookings
  warning text (full cancellation lands in D06); confirm `purge_soft_deleted()` (T222) and the storage
  cleanup queue (T223) exist and pass their pgTAP tests (T228/T229). Gate for D04.
  [PET-01][PET-02][PET-03]

---

# Delivery Phase D04 — Vaccinations and notifications

## Backend (vaccine_types before vaccinations)

- [ ] T238 [D04] Migration: `vaccine_types` table + RLS + seed + admin-write audit trigger. [PET-04]
- [ ] T239 [D04] Migration: `vaccinations` table + RLS incl. `created_by_clinic_id`. Depends on T238,
  T218. **Tag added, this fix pass**: `created_by_clinic_id` is PET-09's "Verified by `<clinic>`"
  mechanism. [PET-04][PET-09]
- [ ] T240 [D04] Migration: `health_records` table + RLS incl. `created_by_clinic_id`. Depends on T218.
  Same tag addition as T239, same reason. [PET-06][CS-08][PET-09]
- [ ] T241 [P] [D04] Migration: `record_attachments` table + RLS. Depends on T240. [PET-06]
- [ ] T242 [D04] Extend `purge_soft_deleted()` (T222, D03): confirm/add `ON DELETE CASCADE` FKs so
  `vaccinations`/`health_records`/`record_attachments` rows are removed automatically when their parent
  `pet` is hard-deleted, and enqueue `record_attachments.path`/any vaccination `document_path` into
  `storage_cleanup_queue` (T223) for the `record-attachments`/`pet-documents` buckets before the cascade
  fires. Depends on T222, T223, T239, T240, T241. [PET-03]
- [ ] T243 [P] [D04] Migration: `notifications` table + RLS. [NTF-01]
- [ ] T244 [P] [D04] Migration: `notification_outbox` table + RLS. [NTF-01]
- [ ] T245 [D04] RPC + cron `generate_vaccination_reminders()`. **Extended, remediation pass (NTF-02)**:
  checks the owner's `notif_prefs.vaccination_reminders` (T255's schema) before inserting the
  `notification_outbox` row — the `notifications` (inbox) row is still always created either way (default
  proposed in `spec.md`'s Open Decisions: a disabled category suppresses the push only). [PET-07][NTF-02]
- [ ] T246 [D04] Edge Function `send-push/`. **Extended, remediation pass (NTF-02)**: re-checks
  `notif_prefs` before actually calling Expo Push, as a defense-in-depth backstop for any row enqueued by
  a path other than T245/T308 (e.g. `booking_confirmed`, which is not a suppressible category — see
  `spec.md`'s Open Decisions). [NTF-03][PET-07][NTF-02]

## Client-side push + notification routing (point 6)

- [ ] T247 [D04] Mobile push registration `mobile/src/lib/push.ts`: request permission, upsert
  `push_tokens` on login, remove on logout, delete on Expo-reported-invalid. [NTF-03]
- [ ] T248 [D04] Mobile notification-tap routing `mobile/src/lib/notification-routing.ts`, implementing
  every row of `contracts/rest-endpoints.md`'s notification-kinds table. [NTF-01]

## Shared attachment / passport share (point 7)

- [ ] T249 [D04] Passport-share image/PDF generation service `mobile/src/features/pets/passport-share.ts`
  (renders pet details + vaccination status to a shareable image or PDF in the current language). [PET-08]

## pgTAP / unit (incl. point 8 coverage additions)

- [ ] T250 [P] [D04] pgTAP: reminder dedupe on a double cron run. [PET-07]
- [ ] T251 [P] [D04] pgTAP: clinic-created entries editable only by that clinic's staff. [PET-09]
- [ ] T252 [P] [D04] pgTAP: `notifications`/`push_tokens` are owner-only.
- [ ] T253 [P] [D04] pgTAP: `notification_outbox` is admin-read / service-role-write only.
- [ ] T254 [D04] Unit: reminder-window math (7-day/1-day/due-date). [PET-07]
- [ ] T255 [D04] Add the `notif_prefs` Zod schema to `packages/shared/src/schemas/notifications.ts`:
  three booleans — `vaccination_reminders`, `booking_updates`, `offers` — each defaulting `true`, matching
  `profiles.notif_prefs jsonb` (`data-model.md`). [NTF-02]

## Shared schemas, i18n, PostHog

- [ ] T256 [D04] Add vaccination/record/notification Zod schemas. [PET-04][PET-06]
- [ ] T257 [D04] Add keys to `packages/i18n`. [PET-04..09][NTF-01..03]
- [ ] T258 [D04] PostHog instrumentation for `vaccination_added`, `notification_opened`.

## Screens (7 — plus extending D02's two shells)

- [ ] T259 [P] [D04] Extend `mobile/app/permissions.tsx` (D02 shell, T178) with the real
  notification/location permission-request flow. [NTF-03]
- [ ] T260 [P] [D04] Extend `mobile/app/(tabs)/index.tsx` (D02 shell, T176) with the vaccines-due banner.
  [PET-07]
- [ ] T261 [P] [D04] Build `/pets/[id]` Pet passport Vaccinations/Timeline tabs — `mobile/app/pets/[id].tsx`
  (Built partial). [PET-06][PET-09]
- [ ] T262 [P] [D04] Build `/pets/[id]/vaccinations/new` — `mobile/app/pets/[id]/vaccinations/new.tsx`
  (Built; uses T224). [PET-04]
- [ ] T263 [P] [D04] Build `/pets/[id]/records/new` — `mobile/app/pets/[id]/records/new.tsx` (Spec;
  pattern: Add vaccination; uses T224). [PET-06][CS-08]
- [ ] T264 [P] [D04] Build `/pets/[id]/passport` Passport share — `mobile/app/pets/[id]/passport.tsx`
  (Built; uses T249, T225). [PET-08]
- [ ] T265 [P] [D04] Build `/notifications` Inbox — `mobile/app/notifications.tsx` (Built). [NTF-01]

## E2E / verification

- [ ] T266 [D04] Maestro: record a vaccination and verify the reminder + push-tap-routing flow.
  [PET-04][PET-07]
- [ ] T267 [D04] pgTAP/unit test, **enriched this remediation pass**: for each of the 3 `notif_prefs`
  categories (T255), disabling it stops `generate_vaccination_reminders` (T245)/`appointment_reminders`
  (D06, T308) from enqueueing a push **and** stops `send-push` (T246) from sending one if a row somehow
  reaches it anyway; in every case the `notifications` (inbox) row is still created — a disabled category
  never removes the inbox item, only the push. Also assert `booking_cancelled` (sent when a clinic cancels)
  is **not** suppressible by any `notif_prefs` setting (mandatory transactional notice — `spec.md`'s Open
  Decisions). [NTF-02]
- [ ] T268 [D04] **Checkpoint**: a vaccine due within 7 days produces exactly one push + one inbox item
  under a double cron run; tapping it routes correctly; timeline labels are correct; push tokens are
  cleaned up on logout/invalid. Gate for D05.

---

# Delivery Phase D05 — Clinics and admin operations

## Backend (specialties before doctors; extends clinics instead of creating it)

- [ ] T269 [D05] Migration: `specialties` table + RLS + seed + admin-write audit trigger. [CS-03]
- [ ] T270 [D05] **Extend** `clinics` (created in D02, T125): `ALTER TABLE` adding `description_*`,
  `phone`, `whatsapp`, `address_*`, `location geography(Point)`, `logo_path`, `cover_path`,
  `opening_hours jsonb`, `is_24h`, `supports_emergency`, `rating_avg`, `rating_count`; add the GiST index
  on `location` and trigram indexes on `name_en`/`name_ar`. [CLN-01][AD-02]
- [ ] T271 [D05] Migration: `doctors` table + RLS incl. `queue_prefix` (PRD amendment 1). Depends on
  T269. [CS-03]
- [ ] T272 [P] [D05] Migration: `services` table + RLS. [CS-05]
- [ ] T273 [P] [D05] Migration: `doctor_services` table. Depends on T271, T272. [CS-05]
- [ ] T274 [P] [D05] Migration: `doctor_schedules` table + RLS. Depends on T271. [CS-04]
- [ ] T275 [P] [D05] Migration: `schedule_exceptions` table + RLS. Depends on T271. [CS-04]
- [ ] T276 [D05] RPC `nearby_clinics(...)`. Depends on T270. **Tag added, this fix pass**: `p_filters`
  implements CLN-02's search/filter requirement (open now, 24h, emergency, species, rating), not only
  CLN-01's distance sort. [CLN-01][CLN-02]
- [ ] T277 [D05] RPC `set_clinic_status(p_clinic_id, p_status, p_reason)` — approve/suspend; calls
  `write_audit_log()` (T130); owner-notify-on-suspend is a no-op here (no `appointments` yet). [AD-02]
- [ ] T278 [D05] RPC `set_schedule_exception(...)` — schedule-editor backing; conflict-flag half is a
  no-op here. Depends on T274, T275. [CS-04]
- [ ] T279 [D05] Demo seed data: 3 clinics with doctors, services, and schedules, for local + staging.
  Depends on T269-T275.

## pgTAP (incl. point 8 coverage additions)

- [ ] T280 [P] [D05] pgTAP: only `status = 'active'` clinics are publicly visible. [CLN-01]
- [ ] T281 [P] [D05] pgTAP: a clinic manager cannot change `clinics.status` (reconfirms T133's revoke
  against the now-extended table). [CS-02]
- [ ] T282 [P] [D05] pgTAP: `set_clinic_status` writes an `audit_logs` row via `write_audit_log()`. [AD-02]
- [ ] T283 [P] [D05] pgTAP: clinic staff can write only their own clinic's `doctors`/`services`/
  `doctor_schedules`/`schedule_exceptions`, never another clinic's.
- [ ] T284 [P] [D05] pgTAP: writes to `specialties`/`breeds`/`vaccine_types`/`cities` are admin-only and
  produce an audit row (confirms the triggers from T217/T238/T123/T269). [AD-04]

## Shared schemas, i18n

- [ ] T285 [D05] Add clinic/doctor/service Zod schemas. [CLN-01..03]
- [ ] T286 [D05] Add keys to `packages/i18n`. [CLN-01..03][CS-02..05][AD-02][AD-04][EMG-01]

## Screens (11)

- [ ] T287 [P] [D05] Build `/clinics` — `mobile/app/clinics/index.tsx` (Built). [CLN-01][CLN-02]
- [ ] T288 [P] [D05] Build `/clinics/[id]` Clinic detail — `mobile/app/clinics/[id].tsx` (Built). [CLN-03]
- [ ] T289 [P] [D05] Build `/clinics/[id]/doctors/[id]` Doctor — `mobile/app/clinics/[id]/doctors/[id].tsx`
  (Spec; pattern: Clinic detail). [CLN-03]
- [ ] T290 [P] [D05] Build `/emergency` — `mobile/app/emergency.tsx` (Built). [EMG-01]
- [ ] T291 [P] [D05] Build `/clinic/services` — `web/src/app/[locale]/(clinic)/services/page.tsx` (Built).
  [CS-05]
- [ ] T292 [P] [D05] Build `/clinic/profile` — `web/src/app/[locale]/(clinic)/profile/page.tsx` (Built).
  [CS-02]
- [ ] T293 [P] [D05] Build `/clinic/doctors` + schedule editor —
  `web/src/app/[locale]/(clinic)/doctors/page.tsx` (Spec; pattern: Services). [CS-03][CS-04]
- [ ] T294 [P] [D05] Build clinic Settings — `web/src/app/[locale]/(clinic)/settings/page.tsx` (Spec;
  pattern: Clinic profile).
- [ ] T295 [P] [D05] Build `/admin/clinics` — `web/src/app/[locale]/(admin)/clinics/page.tsx` (Built).
  [AD-02]
- [ ] T296 [P] [D05] Build clinic detail + creation wizard —
  `web/src/app/[locale]/(admin)/clinics/[id]/page.tsx` (Spec; pattern: Admin Clinics list). [AD-02]
- [ ] T297 [P] [D05] Build `/admin/reference-data` — `web/src/app/[locale]/(admin)/reference-data/page.tsx`
  (Built). [AD-04]

## E2E

- [ ] T298 [D05] Playwright: admin creates and approves a clinic end to end. [AD-02]
- [ ] T299 [D05] Playwright: manager edits a doctor's schedule. [CS-04]
- [ ] T300 [D05] Maestro: browse/search/filter clinics. [CLN-01][CLN-02]
- [ ] T301 [D05] **Checkpoint**: admin onboards and approves one clinic with a doctor (unique
  `queue_prefix`), a service, a schedule; the seed data (T279) matches; immediately visible/searchable in
  mobile. Gate for D06.

---

# Delivery Phase D06 — Booking

- [ ] T302 [D06] **BLOCKING**: confirm `plan.md`'s Open Question on the reschedule rule (2-hour rule
  working assumption) before T306. [BKG-05]

## Backend

**Purge job note, remediation pass**: `appointments` is **not** extended by `purge_soft_deleted()`
(T222, D03) — `data-model.md` confirms it has no `deleted_at` column; its lifecycle is the `status`
enum (`cancelled`, `completed`, etc.), not soft-delete, so there is nothing for a purge job to hard-delete
here. No task is added for this table.

- [ ] T303 [D06] Migration: `appointments` table + RLS + the no-double-booking exclusion constraint +
  idempotency unique constraint + `booking_code`/`cancelled_by_role`/`flagged_for_staff`. Depends on
  T124, T218, T270, T271, T272. **Tags added, this fix pass**: the exclusion constraint is BKG-02's
  actual enforcement mechanism; the idempotency unique constraint is BKG-03's. [BKG-01][BKG-02][BKG-03]
- [ ] T304 [P] [D06] RPC `get_available_slots(...)`. [BKG-01]
- [ ] T305 [P] [D06] RPC `book_appointment(...)`. [BKG-01]
- [ ] T306 [D06] RPC `cancel_appointment(...)` (2-hour owner rule + staff-anytime rule). [BKG-04]
- [ ] T307 [D06] RPC `reschedule_appointment(...)`. Depends on T302. [BKG-05]
- [ ] T308 [P] [D06] Cron `appointment_reminders`. **Extended, remediation pass (NTF-02)**: checks
  `notif_prefs.booking_updates` (T255) before enqueueing the push; the inbox row is always created.
  [BKG-06][NTF-02]
- [ ] T309 [P] [D06] Cron `mark_no_shows`. [BKG-01]
- [ ] T310 [D06] Extend `delete_pet` (T221) to cancel upcoming appointments + notify the clinic. [PET-03]
- [ ] T311 [D06] Extend `set_clinic_status` (T277) so suspending notifies owners with upcoming bookings.
  [AD-02]
- [ ] T312 [D06] Extend/exercise `set_schedule_exception` (T278) so its conflict flag fires against real
  bookings. [CS-04]

## pgTAP (incl. point 8 coverage additions)

- [ ] T313 [P] [D06] pgTAP: the exclusion constraint prevents a double booking under concurrent inserts.
  [BKG-02]
- [ ] T314 [P] [D06] pgTAP: an idempotent retry returns the same appointment. [BKG-03]
- [ ] T315 [P] [D06] pgTAP: `cancel_appointment` enforces the 2-hour rule for `owner` but not
  `clinic_staff`. [BKG-04]
- [ ] T316 [P] [D06] pgTAP: `delete_pet` cancels upcoming appointments and notifies the clinic. [PET-03]
- [ ] T317 [P] [D06] pgTAP: `set_clinic_status` suspend notifies affected owners. [AD-02]
- [ ] T318 [P] [D06] pgTAP: `set_schedule_exception` flags an overlapping booking. [CS-04]
- [ ] T319 [P] [D06] pgTAP: direct `INSERT`/`UPDATE` on `appointments`/`queue_tickets` is rejected for
  `authenticated` (only RPCs may write).
- [ ] T320 [P] [D06] pgTAP: clinic staff can read a pet's `pets`/`vaccinations`/`health_records` only when
  that pet has an appointment at their clinic.

## Shared schemas, i18n, PostHog

- [ ] T321 [D06] Add appointment Zod schemas. [BKG-01]
- [ ] T322 [D06] Add keys to `packages/i18n`. [BKG-01..06][CS-06]
- [ ] T323 [D06] PostHog instrumentation for `booking_started`, `booking_confirmed`, `booking_cancelled`.

## Screens (11)

- [ ] T324 [P] [D06] Build `/book/service` — `mobile/app/book/service.tsx` (Built). [BKG-01]
- [ ] T325 [P] [D06] Build `/book/doctor` — `mobile/app/book/doctor.tsx` (Built). [BKG-01]
- [ ] T326 [P] [D06] Build `/book/time` — `mobile/app/book/time.tsx` (Built). [BKG-01][BKG-02]
- [ ] T327 [P] [D06] Build `/book/details` — `mobile/app/book/details.tsx` (Built). [BKG-01]
- [ ] T328 [P] [D06] Build `/book/summary` — `mobile/app/book/summary.tsx` (Built). [BKG-01][BKG-03]
- [ ] T329 [P] [D06] Build `/book/success` — `mobile/app/book/success.tsx` (Built). [BKG-01]
- [ ] T330 [P] [D06] Build `/(tabs)/bookings` My bookings — `mobile/app/(tabs)/bookings.tsx` (Built).
  [BKG-01][BKG-04][BKG-05]
- [ ] T331 [P] [D06] Build `/bookings/[id]` Booking detail shell (live queue card lands in D07) —
  `mobile/app/bookings/[id].tsx` (Built). [BKG-04][BKG-05]
- [ ] T332 [P] [D06] Build `/clinic` Today shell — `web/src/app/[locale]/(clinic)/page.tsx` (Built). [CS-06]
- [ ] T333 [P] [D06] Build `/clinic/appointments` — `web/src/app/[locale]/(clinic)/appointments/page.tsx`
  (Built list/detail; calendar Spec), including a `flagged_for_staff` indicator/filter for bookings T312
  flags. [CS-06]
- [ ] T334 [P] [D06] Build admin Appointments view — `web/src/app/[locale]/(admin)/appointments/page.tsx`
  (Spec; pattern: Clinic appointments). [CS-06]

## E2E

- [ ] T335 [D06] Maestro/Playwright: full booking happy path. [BKG-01]
- [ ] T336 [D06] Test: a forced `SLOT_TAKEN` race resolves to exactly one success. [BKG-02]
- [ ] T337 [D06] Test: cancellation inside vs. outside the 2-hour window. [BKG-04]
- [ ] T338 [D06] **Checkpoint**: two concurrent bookings resolve to one success; owner cancelling at
  1h59m sees the policy message + Call clinic; staff cancel anytime with a reason;
  `flagged_for_staff` shows correctly in T333. Gate for D07.

---

# Delivery Phase D07 — Live queue and operations

## Backend (audit_logs already exists from D02 — not recreated here)

- [ ] T339 [D07] Migration: `queue_tickets` table + RLS. [QUE-01]
- [ ] T340 [D07] RPC `check_in_appointment(...)` (signed QR payload + typed `booking_code` validation).
  [QUE-01]
- [ ] T341 [P] [D07] RPC `call_next_ticket(p_doctor_id)`. [QUE-03][CS-07]
- [ ] T342 [P] [D07] RPC `complete_appointment(p_appointment_id)`. [CS-07][REV-01]
- [ ] T343 [P] [D07] RPC `get_queue_status(p_appointment_id)`. [QUE-02]
- [ ] T344 [P] [D07] Realtime private channel `queue:clinic:{clinic_id}`. [CS-07]
- [ ] T345 [P] [D07] Realtime private channel `queue:doctor:{doctor_id}:{date}` + 15-second polling
  fallback. [QUE-02]
- [ ] T346 [P] [D07] Migration: `reviews` table + RLS. [REV-01]
- [ ] T347 [D07] Trigger `recompute_clinic_rating()` on `reviews` insert/hide/unhide. Depends on T346.
  [REV-01][AD-09]
- [ ] T348 [D07] RPC `admin_get_pet(p_pet_id)` — calls `write_audit_log()` (T130), no direct admin
  `SELECT`. [AD-03]
- [ ] T349 [D07] RPC `admin_get_pet_timeline(p_pet_id)` — same pattern. [AD-03]
- [ ] T350 [P] [D07] Edge Function `admin-broadcast/`. [AD-06]
- [ ] T351 [P] [D07] KPI SQL views for the admin overview (refreshed hourly). [AD-05]
- [ ] T352 [D07] Clinic-scoped reporting RPCs/SQL views (new, remediation pass — CS-09/FR-045):
  `clinic_report_bookings_per_day`, `clinic_report_no_show_rate`, `clinic_report_busiest_hours`,
  `clinic_report_top_services`, each taking a `(p_clinic_id, p_from, p_to)` date-range parameter and gated
  by RLS so a caller only ever sees their own `clinic_staff` row's clinic — no admin-only exemption is
  needed here since AD-05's KPI views (T351) already cover the cross-clinic admin case. Add to
  `data-model.md`'s Platform section and `contracts/rpc-functions.md`. [CS-09]

## pgTAP (incl. point 8 coverage addition)

- [ ] T353 [P] [D07] pgTAP: an owner never receives another owner's queue data. [QUE-02]
- [ ] T354 [P] [D07] pgTAP: `audit_logs` is append-only (reconfirms against the D02-created table now
  under real load). [AD-08]
- [ ] T355 [P] [D07] pgTAP: one review per completed visit. [REV-01]
- [ ] T356 [P] [D07] pgTAP: `recompute_clinic_rating` recalculates correctly on hide/unhide. [AD-09]
- [ ] T357 [P] [D07] pgTAP: `admin_get_pet`/`admin_get_pet_timeline` always write an audit row; a direct
  `SELECT` by `admin` on `pets`/`vaccinations`/`health_records` is rejected. [AD-03]
- [ ] T358 [P] [D07] pgTAP: non-admin cannot see a hidden (`is_hidden = true`) review. [REV-01]
- [ ] T359 [P] [D07] pgTAP: a clinic manager's call to any of T352's reporting RPCs never returns
  another clinic's bookings, no-show, or service data. [CS-09]

## Shared schemas, i18n, PostHog

- [ ] T360 [D07] Add queue/review Zod schemas. [QUE-01][REV-01]
- [ ] T361 [D07] Add keys to `packages/i18n`. [QUE-01..03][CS-07..10][REV-01][AD-03][AD-05..09]
- [ ] T362 [D07] PostHog instrumentation for `queue_checked_in`, `review_submitted`.

## Screens (14)

- [ ] T363 [P] [D07] Build `/bookings/[id]/review` Rate visit — `mobile/app/bookings/[id]/review.tsx`
  (Built). [REV-01]
- [ ] T364 [P] [D07] Build `/clinic/queue` Live queue board — `web/src/app/[locale]/(clinic)/queue/page.tsx`
  (Built). [CS-07][QUE-01][QUE-02][QUE-03]
- [ ] T365 [P] [D07] Build `/clinic/staff` — `web/src/app/[locale]/(clinic)/staff/page.tsx` (Built).
  [CS-10]
- [ ] T366 [P] [D07] Build patients + patient detail — `web/src/app/[locale]/(clinic)/patients/page.tsx`
  + `[petId]/page.tsx` (Spec; pattern: Reference data). [CS-08]
- [ ] T367 [P] [D07] Build `/clinic/reviews` — `web/src/app/[locale]/(clinic)/reviews/page.tsx` (Spec;
  pattern: Patients). [REV-01]
- [ ] T368 [P] [D07] Build `/clinic/reports` — `web/src/app/[locale]/(clinic)/reports/page.tsx` (Spec;
  pattern: Admin Overview); calls T352's RPCs. [CS-09]
- [ ] T369 [D07] CSV export for the Reports screen (T368) — a Next.js Route Handler
  (`web/src/app/api/clinic/reports/export/route.ts`) that re-runs T352's RPC for the requested range and
  writes a minimal hand-rolled CSV response (no new dependency — `packages/*` doesn't already carry a CSV
  library and constitution X requires a one-line justification for adding one; the row counts here are
  small enough per clinic/date-range that a dependency isn't warranted). [CS-09]
- [ ] T370 [P] [D07] Build `/admin` Overview — `web/src/app/[locale]/(admin)/page.tsx` (Built). [AD-05]
- [ ] T371 [P] [D07] Build `/admin/users` — `web/src/app/[locale]/(admin)/users/page.tsx` (Built). [AD-03]
- [ ] T372 [P] [D07] Build `/admin/notifications` Broadcast — `web/src/app/[locale]/(admin)/notifications/page.tsx`
  (Built). [AD-06]
- [ ] T373 [P] [D07] Build `/admin/flags` — `web/src/app/[locale]/(admin)/flags/page.tsx` (Built). [AD-07]
- [ ] T374 [P] [D07] Build `/admin/audit-logs` — `web/src/app/[locale]/(admin)/audit-logs/page.tsx`
  (Built; diff viewer Spec). [AD-08]
- [ ] T375 [P] [D07] Build admin User detail — `web/src/app/[locale]/(admin)/users/[id]/page.tsx` (Spec;
  pattern: Admin Users). [AD-03]
- [ ] T376 [P] [D07] Build admin Pets support view — `web/src/app/[locale]/(admin)/pets/page.tsx` (Spec;
  pattern: Admin Users). [AD-03]
- [ ] T377 [P] [D07] Build admin Reviews moderation — `web/src/app/[locale]/(admin)/reviews/page.tsx`
  (Spec; pattern: Admin Users). [AD-09]

## E2E / load

- [ ] T378 [D07] Playwright: full clinic queue cycle (check-in by QR, check-in by code, call → complete)
  with two staff racing the same ticket. [CS-07]
- [ ] T379 [D07] k6 smoke test: slots/booking/queue RPCs at several times expected peak. [QUE-02]
- [ ] T380 [D07] **Checkpoint**: queue card updates within 3 seconds; two staff racing never produce two
  outcomes; Realtime-drop fallback polls every 15 seconds. Gate for D08.

---

# Delivery Phase D08 — Hardening and launch (split per point 10)

**Manual prerequisites**: Google Play Console + Apple Developer store listings ready; Supabase staging/
production provisioned with PITR; 2-3 pilot clinics agreed (business-side). No SMS-related prerequisite
exists anywhere in this phase (2026-10-18 — Twilio was never a D08 item in the first place, confirmed by
re-scan).

## Platform verification

- [ ] T381 [D08] PLT-03 offline-behavior verification across every D02-D07 screen. **Has something real to
  verify now, remediation pass**: confirms every list/action screen follows D03's reference pattern
  (`useNetworkStatus`/`OfflineBanner`/`useOfflineGuardedAction` — T170/T171/T172; T232/T233's
  reference wiring; T236's E2E case), not just that My pets happens to work. [PLT-03]
- [ ] T382 [D08] PLT-04 full-RTL verification across every D02-D07 screen. [PLT-04]

## Accessibility (one area per task)

- [ ] T383 [D08] Accessibility: color contrast (AA, 4.5:1 body text) across both themes.
- [ ] T384 [D08] Accessibility: labels and visible focus on every interactive control.
- [ ] T385 [D08] Accessibility: dynamic text scaling up to 130%.
- [ ] T386 [D08] Accessibility: screen-reader order respects RTL in Arabic.
- [ ] T387 [D08] Accessibility: no information conveyed by color alone (status chips carry text too).

## Performance (one target per task, PRD section 14)

- [ ] T388 [D08] Verify mobile cold start < 2.5 s on a mid-range Android phone.
- [ ] T389 [D08] Verify 60 fps on 500-item lists (FlashList).
- [ ] T390 [D08] Verify API read p95 < 300 ms.
- [ ] T391 [D08] Verify API write p95 < 500 ms.
- [ ] T392 [D08] Verify slot search p95 < 400 ms.
- [ ] T393 [D08] Verify booking p95 < 600 ms.
- [ ] T394 [D08] Verify queue update visible to the owner < 3 s under production-like load.
- [ ] T395 [D08] Verify dashboard LCP < 2.5 s; JS bundle < 250 KB gzipped per route; image sizes within
  budget.

## k6 load (one scenario per task)

- [ ] T396 [D08] k6: `get_available_slots`/`book_appointment` at 3-5× expected peak.
- [ ] T397 [D08] k6: `cancel_appointment`/`reschedule_appointment` at 3-5× expected peak.
- [ ] T398 [D08] k6: `check_in_appointment`/`get_queue_status`/`call_next_ticket` at 3-5× expected peak.

## Security review (one area per task)

- [ ] T399 [D08] Security review: RLS policies (full pass, not just `check-policy-coverage.ts`'s
  mechanical check).
- [ ] T400 [D08] Security review: Storage buckets and signed-URL expiry.
- [ ] T401 [D08] Security review: Auth flows (OTP guard, MFA, session storage).
- [ ] T402 [D08] Security review: secrets (no `service_role` in any client bundle; CI secret scoping).

## Store readiness (one area per task)

- [ ] T403 [D08] Privacy labels (Apple) and Data safety form (Google Play).
- [ ] T404 [D08] Verify the in-app account-deletion flow end to end (store requirement).
- [ ] T405 [D08] Arabic + English store screenshots.
- [ ] T406 [D08] **New (2026-10-18)**: sender-domain deliverability check in staging and production — send
  real test codes to Gmail, Outlook, and Yahoo inboxes and confirm none land in spam (`spec.md` → Launch
  readiness item 2; `research.md` §4-rewrite). Depends on T145 and the manual-prerequisites SMTP item.

## Launch

- [ ] T407 [D08] PITR restore drill on staging.
- [ ] T408 [D08] Beta: TestFlight + Play internal testing with 2-3 pilot clinics.
- [ ] T409 [D08] **Checkpoint**: every item T381-T408 passes or has a written, accepted exception; the app
  is submitted to both stores. **Phase 1 complete.**

---

## Table creation order (final, FK-safe)

1. **D02**: `cities` → `profiles` → `clinics` (slim) → `clinic_staff` → `push_tokens` / `consents` →
   `audit_logs` → (`write_audit_log()` helper) → `feature_flags` / `app_config` → `otp_attempts`. **Fixed
   this fix pass**: `audit_logs` and `write_audit_log()` now come before `feature_flags`/`app_config`,
   since both tables' audit triggers call `write_audit_log()` — the previous order had them created first
   with a forward-referencing trigger and a separate "sequenced here for readability only" follow-up task
   to attach it; that follow-up task is gone, and both tables attach their trigger inline.
2. **D03**: `breeds` → `pets` → (`purge_soft_deleted()` + `pg_cron` schedule, new 2026-10-19) →
   `storage_cleanup_queue` + `purge-storage-objects` Edge Function (new, same date — depends on `pets`
   existing for its enqueue call, and on the two storage buckets from D03's own earlier tasks).
3. **D04**: `vaccine_types` → `vaccinations` → `health_records` → `record_attachments` → (extend
   `purge_soft_deleted()`'s cascade to these three, new 2026-10-19) → `notifications` /
   `notification_outbox`.
4. **D05**: `specialties` → (`clinics` extended, not created) → `doctors` → `services` →
   `doctor_services` / `doctor_schedules` / `schedule_exceptions`.
5. **D06**: `appointments`.
6. **D07**: `queue_tickets` → `reviews`.

Every table's RLS is enabled in the same migration that creates it (constitution III); every reference
column above is created strictly after the table it points to. `otp_attempts` is keyed by a normalized
email `identifier` (2026-10-18 — was `phone_number`); no other table's columns changed as a result of the
sign-in method change except `profiles.phone` (now nullable/optional).

## Open item carried to `plan.md`

The Setup Summary screen (T197) is now present in both `plan.md`'s Coverage Table and `spec.md`'s own
Screen Coverage (added in the 2026-10-18 documentation-sync pass) — no longer an open item.

## Dependencies & Execution Order

Phase-level: D00a→…→D00g→D01→D02→D03→D04→D05→D06→D07→D08, each gated by its Checkpoint. Within-phase
dependencies are stated inline on each task above (e.g., "Depends on T2xx").

### Parallel groups (representative)

- **D02**: T127/T128 (push_tokens/consents); T140-T144 (5 Edge Functions); T147-T151 (**new, this fix
  pass**: Google/Apple sign-in modules, provider config, Expo config, nonce/platform-gating unit tests —
  T147/T148 and T151 are parallel once T150's Expo config lands; T149/T150 are config-only, parallel to
  everything); T152/T153 (templates + rendering check); T156-T163 (8 pgTAP); T169 (React Query, both
  files); T170-T189 (the offline-infra trio T170-T172, once T169 lands; the AUTH-06 trio T179-T181 runs
  sequentially — each depends on the previous — not parallel to each other, but parallel to
  T173-T178/T182-T189's unrelated infra tasks); T190-T212 (23 screen tasks, once T173-T189 land).
- **D03**: T219/T220 (storage buckets); T222/T223 (**new**: `purge_soft_deleted` and the storage-cleanup
  queue are independent migrations, though T223 depends on T222 having run first for its enqueue call —
  treat as sequential, not parallel); T226/T227 (pgTAP); T228/T229 (**new** pgTAP, parallel to T226/T227
  and to each other); T232-T235 (4 screens).
- **D04**: T241-T244 (3 tables; **note**: T242, the new cascade-cleanup task, is sequential after
  T239-T241, not part of this parallel group); T250-T253 (4 pgTAP); T259-T265 (7 screen/extension tasks).
- **D05**: T272-T275 (4 tables, after T271); T280-T284 (5 pgTAP); T287-T297 (11 screens).
- **D06**: T304/T305 (2 RPCs); T313-T320 (8 pgTAP); T324-T334 (11 screens).
- **D07**: T341-T345 (RPCs/channels); T352 (**new**: the CS-09 reporting RPCs, parallel to T341-T351 since
  they touch different tables); T353-T359 (6 pgTAP + the **new** T359 isolation test, all parallel);
  T363-T377 (14 screens); T369 (**new** CSV export, depends on T368's screen existing — sequential, not
  parallel to it).
- **D08**: T383-T387 (5 accessibility); T388-T395 (8 performance); T396-T398 (3 k6); T399-T402 (4
  security) — each group internally parallel.

### Task count per phase and total

| Phase | Tasks | Count |
| --- | --- | --- |
| D00 (a-g) | T001-T080 | 80 |
| D01 | T081-T119 | 39 |
| D02 | T120-T216 | 97 |
| D03 | T217-T237 | 21 |
| D04 | T238-T268 | 31 |
| D05 | T269-T301 | 33 |
| D06 | T302-T338 | 37 |
| D07 | T339-T380 | 42 |
| D08 | T381-T409 | 29 |
| **Total** | T001-T409 | **409** |

D02 grew by 4 relative to the pre-2026-10-18 baseline (bilingual email templates + rendering check,
local-inbox test helper, send-throttle test — sign-in method change); D08 grew by 1 (sender-domain
deliverability check, same change). The prior fix pass (same day) added one net task to D02 (T120
guard-bypass spike and the hardening placeholder added; the old separate "attach trigger" task removed —
net +2-1 = +1).

**This remediation pass** (`/speckit-analyze` findings C1/C2/H1/H2/H3/M1, 2026-10-19) adds **18 more
tasks**: D02 +8 (T121/T122 identity-linking spike + manual-linking config for M1/AUTH-06; T170-T172
offline infrastructure for H3/PLT-03; T179-T181 the account-linking action/conflict/E2E trio for
M1/AUTH-06), D03 +5 (T222/T223 the purge job + storage-cleanup queue, T228/T229 their pgTAP tests, T236
an offline E2E case — all for C1/constitution IV), D04 +2 (T242 the cascade-cleanup extension for C1,
T255 the `notif_prefs` schema for H1/NTF-02), D07 +3 (T352 clinic-scoped reporting RPCs, T359 their
isolation pgTAP test, T369 CSV export — all for H2/CS-09). D05, D06, and D08 gained no new tasks this
pass (D06 gained an explanatory note instead — see its Backend section — for why `appointments` has no
purge-extension task). Total after that pass was 404 (was 386).

**This fix pass** (same day, 2026-10-19) adds **5 more tasks, all in D02**: T147-T151 (Google sign-in
module, Apple sign-in module, Supabase provider config, Expo config entries, nonce/platform-gating unit
tests — AUTH-02/AUTH-03 had no implementation task before this). No other phase gained a task; 5 story
tags were added to existing backend tasks (`write_audit_log`→AD-08; the `vaccinations`/`health_records`
migrations→PET-09; `nearby_clinics`→CLN-02; `appointments`'s exclusion/idempotency constraints→
BKG-02/BKG-03) with no effect on counts. **Total is now 409** (was 404, was 386 before the sign-in
method change's own insertions).

### First 10 tasks to run (unchanged — D00a hasn't moved)

1. T001 — verify versions from official sources, write `COMPATIBILITY.md`
2. T002 — pin versions
3-9. T003-T009 — parallel tooling configs
10. T010 — copy PRD placeholder

---

## Coverage verification (re-run)

### Stories: 59/59 (unchanged in count; phase mapping updated for PLT-03)

AUTH×10→D02, PET-01/02/03→D03, PET-04/06/07/08/09→D04, CLN×3/EMG-01/AD-02/AD-04/CS-02..05→D05,
BKG×6/CS-06→D06, QUE×3/REV-01/CS-07..10/AD-03/05..09→D07, **PLT-01/02/03→D02 (build; PLT-03 moved here
from D08 in the 2026-10-19 remediation pass, finding H3 — see `plan.md`'s Coverage Table)**, PLT-04→D08
(verify only — nothing moved for PLT-04). **10+9+3+6+3+1+1+3+10+9+4 = 59** (the D02/D08 split within
Epic G changed from 2/2 to 3/1; the total is unaffected).

### Screens: 70/70 (unchanged by the sign-in method change)

D02: 23 (22 original + Setup Summary, T197). D03: 4. D04: 7. D05: 11. D06: 11. D07: 14.
**23+4+7+11+11+14 = 70.** Owner-mobile total is 41; clinic dashboard and admin dashboard totals (12, 17)
are unchanged. Five owner-mobile screens (T193 Welcome, T194 Sign in, T195 Verify code, T196 Complete
profile, T200 Account) are now marked "design change needed" for the phone→email swap — this does not add
or remove a screen, only changes its design status.

### Every story has an implementing task (remediation pass item 8)

Checked all 59 stories against three buckets — **implementation** (migration/RPC/Edge-Function/cron/Zod
schema), **screen**, and **test** (pgTAP/Maestro/Playwright/k6/unit) — expanding range tags like
`[AUTH-01..05]` to their full member list first (a first pass that didn't expand ranges wrongly flagged
~15 stories as "screen/test only"; all of them resolve once the range is expanded correctly). **Result:
every one of the 59 stories has at least one implementation-bucket task**, not only a screen or test tag.
Representative rows (full list available on request):

| Story | Implementation task(s) | Screen task(s) | Test task(s) |
| --- | --- | --- | --- |
| AUTH-01 | T134,T136,T137,T139,T145,T155,T175,T187,T188 | T192-T195,T197 | T213 |
| AUTH-02 | **T147** (Google sign-in module), T149,T150 | T193,T194 (buttons, delegate to T147) | T151,T214 |
| AUTH-03 | **T148** (Apple sign-in module), T149,T150 | T193,T194 (buttons, delegate to T148) | T151,T214 |
| AUTH-06 | T121,T122,T180,T188 | T179,T200 | T181 |
| NTF-02 | T245,T246,T255,T257,T308 | T199 | T267 |
| CS-09 | T352,T361,T369 | T368 | T359 |
| PLT-03 | T381 | T170-T172,T232,T233 | T236 |
| BKG-02 | T303 (exclusion constraint, `appointments` migration — **tag added, this fix pass**) | T326 | T313,T336 |
| BKG-03 | T303 (idempotency constraint, same migration — **tag added, this fix pass**) | T328 | T314 |
| PET-09 | T239,T240 (`created_by_clinic_id` on the `vaccinations`/`health_records` migrations — **tags
  added, this fix pass**), T257 (Zod schema) | T261 | T251 |
| CLN-02 | T276 (`nearby_clinics`'s `p_filters` — **tag added, this fix pass**), T285,T286 | T287 | T300 |
| AD-08 | T130 (`write_audit_log` — **tag added, this fix pass**), T361 | T374 | T354 |

**This fix pass closed both caveats the previous remediation pass left open**:
- AUTH-02/AUTH-03 now have real implementation tasks (T147 Google module, T148 Apple module, T149
  provider config, T150 Expo config, T151 nonce/platform-gating unit tests) instead of resting on the
  Welcome/Sign-in screens implicitly; those two screen tasks (T193/T194) were edited to state explicitly
  that they delegate to T147/T148 rather than duplicating the logic.
- The "tagging-completeness nit" (a migration implementing a story it wasn't tagged with) is fixed for
  the five cases found: `write_audit_log` → **+AD-08**; the `vaccinations`/`health_records` migrations →
  **+PET-09** each; `nearby_clinics` → **+CLN-02**; the `appointments` migration → **+BKG-02, +BKG-03**.
  A broader sweep for more such cases wasn't re-run beyond what this pass's own audit and the user's two
  named examples surfaced — treat this as "the known ones are fixed," not "exhaustively re-verified."

### No Phase 2-4 content

Confirmed by re-scan: no task references any table, screen, or function from `docs/future-phases.md`.
`docs/future-phases.md` itself contains zero phone/SMS/Twilio mentions (confirmed by direct grep before
this revision started) — nothing in it needed changing.

### FK dependency audit (point 1's explicit ask, re-confirmed after renumbering)

Every migration task's "Depends on T2xx" reference was updated to its new number as part of this
revision's shift; spot-checked `otp_attempts` (T134, service-role-only, no FK), `appointments`
(T303, depends on T124/T218/T270/T271/T272 — all exist by that point), and the D05 audit-trigger
confirmation (T284, now citing T217/T238/T123/T269). The remediation pass's own new tasks were
cross-checked the same way: `purge_soft_deleted()` (T222) depends on T218 (`pets`) and T130
(`write_audit_log`), both created earlier; the storage-cleanup queue (T223) depends on T222 plus
T219/T220 (the two storage buckets, D03); the cascade-cleanup extension (T242, D04) depends on
T222/T223 plus T239/T240/T241 (`vaccinations`/`health_records`/`record_attachments`, all created earlier
in the same D04 Backend block). **This fix pass's new tasks**: T147/T148 (Google/Apple modules) depend
on T184 (EAS dev build — a forward reference by number, same pattern already used by D06's T297-style
BLOCKING tasks; dependency correctness isn't about numeric order, only about the dependency existing and
being satisfiable before the dependent task runs). No forward references remain among same-block
migrations.

### `plan.md` updates made alongside this file (2026-10-18, sign-in method change)

- PRD amendments: amendment 3 rewritten (email, not phone); amendment 10 added (sign-in methods); count
  updated 9→10 everywhere it was stated.
- Technical Context: Twilio Verify removed; custom SMTP + local email inbox added.
- D00b: phone test OTP numbers removed; local email inbox + SMTP placeholders added.
- D02: backend/screens/manual-prerequisites/tests sections rewritten for email.
- Open Questions: added the email/Google automatic-linking confirmation item; coverage counts re-stated
  and confirmed unchanged (59 stories, 70 screens).

### The prior fix pass's changes (2026-10-18, folded into the numbers below)

- Fixed a dependency that pointed at an E2E task and a D03 migration instead of the `/login`/
  `/forgot-password` screens it actually edited; audited every "Depends on Txxx"/"see Txxx" reference in
  the file and fixed the ones that had gone stale across the sign-in-change renumbering.
- Reordered D02's migrations so `audit_logs`/`write_audit_log()` are created before
  `feature_flags`/`app_config`, removing a forward-reference and its separate "attach trigger" task.
- Added a guard-bypass spike and a hardening placeholder ahead of `verify-otp-guard`, per `research.md`'s
  new "Is the email-code guard bypassable?" section. Net effect that day: D02 gained 1 task, total became
  386.

### This remediation pass's changes (2026-10-19 — `/speckit-analyze` findings C1/C2/H1/H2/H3/M1/L1)

- **C1 (constitution IV — no purge job existed)**: added **T222** (`purge_soft_deleted()` + daily
  03:00-Cairo `pg_cron` schedule for `pets`/`profiles`, plus a 7-day `otp_attempts` cleanup — the 7 days is
  a recorded assumption) and **T223** (`storage_cleanup_queue` + `purge-storage-objects` Edge Function,
  since Supabase's own docs say Storage objects can only be deleted through the Storage API, never SQL);
  **T228**/**T229** pgTAP (30-vs-29-day boundary, audit row written); **T242** (D04) extends the cascade
  to `vaccinations`/`health_records`/`record_attachments`; a note (no task) in D06 explains why
  `appointments` is excluded — it has no `deleted_at` column, only a `status` enum.
- **C2 (FR-001's lockout guarantee isn't enforceable without a chosen fix)**: `spec.md` AUTH-01/FR-001 and
  a new Open Decision now say the guarantee holds only once T121/T139's hardening step is built; `plan.md`
  D02 exit criteria require the decision recorded first. `research.md` §17 gained two more researched
  options (CAPTCHA from React Native; a longer OTP length, 6-10 digits per official docs) as "Option A+",
  evaluated inside **T120**, still not chosen — that stays the owner's call.
- **H1 (NTF-02 had no implementing task)**: added **T255** (`notif_prefs` Zod schema); re-tagged the
  Settings screen task `[NTF-02]`; extended `generate_vaccination_reminders`, `appointment_reminders`, and
  `send-push` to check the preference before enqueueing/sending; enriched the existing preference test to
  cover all 3 categories, confirm the inbox row still appears when push is suppressed, and confirm
  `booking_cancelled` is never suppressible (both recorded as `spec.md` Open Decisions, pending owner
  confirmation on the "push-only" default).
- **H2 (CS-09 had no backend)**: added **T352** (clinic-scoped reporting RPCs/views, RLS-isolated),
  **T359** (its isolation pgTAP test), and **T369** (CSV export via a dependency-free Route Handler).
- **H3 (PLT-03 had no infrastructure)**: added **T170**-**T172** (`useNetworkStatus`, `OfflineBanner`,
  the "disabled with a reason" pattern) and extended T169's React Query task with cache persistence;
  wired D03's My pets/Add pet screens as the reference implementation and added **T236** (the first real
  E2E offline case); D08's **T381** (PLT-03 verification) now has something concrete to check.
- **M1 (AUTH-06 had no linking logic)**: added `IDENTITY_ALREADY_LINKED` (409) to
  `contracts/error-codes.md`; added **T121**/**T122** (confirm + enable Manual Linking — official docs
  say it's off by default, a separate mechanism from automatic linking), **T179**/**T180**/**T181**
  (the Account-screen actions, conflict mapping, E2E test); `design/overrides.md` gained the new strings.
- **L1**: `plan.md` PRD amendment 3 now cross-references amendment 10 instead of repeating the
  phone→email framing.
- **Net effect**: 18 new tasks (D02 +8, D03 +5, D04 +2, D07 +3); every task from the old T121 onward
  shifted (D02 by up to +8, D03 by up to +13, D04 by up to +15, D05/D06 flat +15, D07 by up to +18, D08
  flat +18). **Total after this pass was 404, T001-T404** (was 386).
- `plan.md` D02: the spike paragraph now also covers T121/T122's identity-linking confirmation; D02 exit
  criteria reference the C2 decision gate.
- `contracts/edge-functions.md`/`rpc-functions.md`/`error-codes.md`, `data-model.md`: updated for the new
  reporting RPCs (CS-09), `purge_soft_deleted()` (C1), and `IDENTITY_ALREADY_LINKED` (M1).
- `docs/full-product-audit.md`: unchanged this pass (already carries its historical-snapshot banner).

### This fix pass's changes (same day, 2026-10-19)

- **AUTH-02/AUTH-03 had no implementation task** (only a manual OAuth-client prerequisite and a combined
  E2E test existed) — added **T147** (Google sign-in module: `@react-native-google-signin/google-signin`,
  web client ID, `signInWithIdToken`, cancelled-picker-returns-with-no-toast), **T148** (Apple sign-in
  module: `expo-apple-authentication`, hashed nonce to Apple / raw nonce to
  `supabase.auth.signInWithIdToken`, first-sign-in name capture via `updateUser()`, hidden-email
  acceptance, iOS-only), **T149** (Supabase Google/Apple provider config in `config.toml` + a
  staging/production dashboard note), **T150** (the Expo config entries both libraries need —
  `iosUrlScheme` config plugin, `ios.usesAppleSignIn`, both verified against official docs, both
  requiring a dev build), **T151** (unit tests: Apple nonce hash round-trip, iOS-only gating). T193/T194
  (Welcome/Sign-in screens) were edited to state they delegate to T147/T148 rather than duplicating the
  logic; T214 (the combined Maestro test) was enriched for explicit per-platform cases.
- **5 missing story tags added to backend tasks that already implemented them, found per the explicit
  ask to check every migration/RPC**: `write_audit_log` (T130) → **+AD-08**; the `vaccinations`
  migration (T239) and `health_records` migration (T240) → **+PET-09** each (their `created_by_clinic_id`
  column is PET-09's actual mechanism); `nearby_clinics` (T276) → **+CLN-02** (its `p_filters` param is
  CLN-02's search/filter, not just CLN-01's distance sort); the `appointments` migration (T303) →
  **+BKG-02** (the exclusion constraint) and **+BKG-03** (the idempotency constraint) — the two cases the
  user named explicitly. No further sweep beyond these five was exhaustive; see the caveat at the end of
  "Every story has an implementing task" above.
- **PLT-03's D02/D08 split re-verified**: fixed one stale statement in this file's own "Coverage
  verification → Stories" line that still said "PLT-03/04→D08 (verify)" after the previous pass had
  already moved PLT-03's *introducing* phase to D02; `plan.md`'s D02 "Stories" line was also missing
  PLT-03 and has been added. No other stale "D08-only" statement was found for PLT-03 in `spec.md` or
  `tasks.md`.
- **Net effect**: 5 new tasks, all in D02 (T147-T151); every task from the old T147 onward shifted by
  +5. **Total is now 409, T001-T409** (was 404).
