# D02 Progress Checkpoint

**Updated:** 2026-10-27
**Branch:** `main`
**Latest implementation commit:** `ce75dc7` (`feat(D02): add current-schema data export`)
**Checkpoint status:** T143 export endpoint is implemented for current-schema data and remains partial.
**Phase status:** D02 remains open. No D03 work has started.

## Completed or advanced in this batch

- **Complete:** T123 launch cities (Cairo, Giza, Alexandria; stable IDs, bilingual, idempotent seed,
  deterministic order; pgTAP coverage).
- **Complete:** T187 shared Egyptian phone contract, optional empty value, E.164 normalization, auth
  profile schema, and database constraint/tests. Screens still need to use the shared schema.
- **Complete:** T186 local standalone policy checker. `pnpm db:policy-coverage` checks the live local
  database and fails nonzero for missing coverage; 31 policies currently have test references. No
  hosted CI gate exists; T074-T076 remain descoped.
- **Partial:** T173 mobile guard validates the Supabase user, profile, required consent rows, app config,
  maintenance, and minimum app version before rendering tabs. Missing/expired/suspended/deleted routes
  to `/welcome`; incomplete profile to `/complete-profile`; maintenance/update use their dedicated routes.
  Unknown state fails closed. Redirect screens and authenticated app runtime tests remain outstanding.
- **Partial:** T183 dashboard maintenance banner and admin layout are implemented; authorized routes remain
  available while maintenance is enabled. Middleware still requires authentication, allowed role, active
  profile, and AAL2 for admin. Authenticated dashboard E2E remains outstanding.
- **Partial:** T147/T148 native Google/Apple sign-in adapters and pure cores are implemented. T150's
  compatible packages were installed and Expo config was checked with absent and synthetic Google URL
  schemes. T151 has nonce and availability tests. Provider credentials, UI integration, Android import-path
  verification, and an EAS development build remain outstanding.
- **Partial:** T142 has a backend helper that checks the signed `amr` authentication timestamp within five
  minutes after Auth verification. Six focused tests pass. The delete endpoint is not implemented because
  the required data/file cleanup and Auth deletion need a safe coordinated lifecycle.
- **Partial:** T143 `export-my-data` validates the caller with Supabase Auth, then reads only that user's
  profile, consents, and push-device metadata using the caller token/public key, preserving RLS. The JSON
  download is marked `private, no-store`; raw push tokens are omitted. Pets, vaccinations, health records,
  attachments, and appointments are explicitly listed as unavailable until their later-phase tables land.
  Seven focused Deno tests pass; T143 remains open for complete coverage and runtime integration.

The nine owner decisions are recorded in `research.md`, `spec.md`, `plan.md`, and task notes. Approval
does not mean every decision's implementation is complete.

## Security and dependency blockers

- **T138/T139:** custom OTP is not safe to ship while Supabase public OTP endpoints can bypass its
  lockout policy and no supported authoritative session-establishment path has been proven. No custom
  verification/session flow has been implemented.
- **T142:** the signed `amr` claim supplies a supported authentication event timestamp; JWT `iat` and
  client timestamps are not used. The validator is tested, but transactional cleanup/deletion is still
  unimplemented and T142 remains open.
- **T140/T145:** invitation logic and SMTP delivery are not complete. SMTP provider and verified domain
  are unavailable; clinic managers are approved for vet/receptionist only within their clinic, while
  platform admins alone may grant manager level. The stale unresolved-decision note in the implementation
  log is corrected; backend enforcement remains pending.
- **T147/T148/T150/T184:** native OAuth config/build remains incomplete. T150 package install recovered;
  the compatible Apple package and Google Sign-In 16.1.5 installed with Expo's SDK 57 resolver. Google/
  Apple credentials, EAS account/build, Android SDK, Java, `adb`, and Maestro CLI are missing or unverified.
- **T179:** Google linking is approved; secondary email identity linking is deferred. Manual Linking is
  enabled locally, but hosted settings/credentials and native runtime are unverified.
- **T172:** hook and tests exist, but the representative `/pets/new` action is owned by D03 and was not
  started. T172 stays open.

## Verification evidence

- `pnpm.cmd --filter backend exec supabase test db`: PASS, 7 files / 53 assertions.
- `SUPABASE_DB_CONTAINER=supabase_db_backend pnpm.cmd db:policy-coverage`: PASS, 31 policies.
- `pnpm.cmd --filter @furever/shared test`: PASS, 4 files / 24 tests.
- `pnpm.cmd --filter @furever/shared exec tsc --noEmit -p tsconfig.json`: PASS.
- `pnpm.cmd --filter mobile test`: PASS, 12 suites / 34 tests.
- `pnpm.cmd --filter mobile typecheck`: PASS.
- Focused mobile ESLint for guard/layout: PASS.
- `pnpm.cmd --filter web test`: PASS, 3 files / 8 tests.
- `pnpm.cmd --filter web exec tsc --noEmit --incremental false`: PASS.
- Focused web ESLint for middleware/banner/layout: PASS.
- `npx.cmd --yes --offline deno test --no-lock backend/supabase/functions/_shared/recent-auth.test.ts`:
  PASS, 6 tests.
- `npx.cmd --yes --offline deno test --no-lock backend/supabase/functions/export-my-data/index.test.ts`:
  PASS, 7 tests; `deno check --no-lock` for the handler passes.
- `pnpm.cmd exec expo install --check`: reports only the pre-existing Expo SDK drift in `@expo/ui`,
  `expo`, and `expo-router`; the two newly installed native auth libraries are compatible.
- `pnpm.cmd i18n:check`: PASS, 713 matching keys.
- Real authenticated mobile and dashboard runtime flows, EAS build, Maestro, and hosted service checks:
  not run.

## Environment snapshot

- Node `v24.16.0`; `.nvmrc` specifies `22.13.0`.
- pnpm `9.12.2`; store `H:\.pnpm-store\v3`.
- Docker and local Supabase CLI `2.121.0` are available.
- Java, Android SDK/`adb`, Maestro CLI, and EAS CLI/account are missing.
- Google/Apple credentials, hosted SMTP provider/domain, and hosted Supabase projects are not verified.
- No secrets were added to the repository.

## Recommended next sequence

1. Continue T140's server-side clinic/role checks and negative tests; leave outbound invitation delivery
   clearly gated by T145 SMTP readiness.
2. Extend T143 as later-phase data tables land and investigate T142's supported step-up mechanism without
   trusting client time.
3. Continue T173 redirect screens and mobile onboarding/auth screens only along the verified OTP/session
   path; keep T138/T139 blocked until that path is proven.
4. Complete T183 after authorized maintenance behavior can be exercised against real dashboard routes.
5. Keep native OAuth/E2E tasks partial until required packages, credentials, build tooling, and devices are
   available.
6. Do not mark D02 complete until T216's end-to-end gate is genuinely satisfied.
