# D02 Progress Checkpoint

**Updated:** 2026-10-27
**Branch:** `main`
**Latest implementation commit:** `d00253e` (`feat(D02): add dashboard login and MFA screens`).
**Checkpoint status:** T143 export endpoint is implemented for current-schema data and remains partial.
**Phase status:** D02 remains open. No D03 work has started.

## Completed or advanced in this batch

- **Complete:** T123 launch cities (Cairo, Giza, Alexandria; stable IDs, bilingual, idempotent seed,
  deterministic order; pgTAP coverage).
- **Complete:** T187 shared Egyptian phone contract, optional empty value, E.164 normalization, auth
  profile schema, and database constraint/tests. T201 uses the shared optional-phone schema.
- **Complete:** T186 local standalone policy checker. `pnpm db:policy-coverage` checks the live local
  database and fails nonzero for missing coverage; all 32 current policies have test references. No
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
- **Partial:** T140 now has a pending invitation ledger, clinic-scoped create/cancel/accept RPCs, the
  `admin-create-staff` Edge Function, and audited staff-level change/removal RPCs. Managers can invite
  vets/receptionists only in their own clinic; platform admins alone can grant manager level. Direct
  `clinic_staff` writes are revoked. Acceptance locks the Auth user row for retry serialization. Invite
  links have an explicit fixed dashboard callback. Nine pgTAP files / 84 assertions pass, plus seven Edge
  Function unit tests (8 now, including callback validation). SMTP delivery remains outstanding.
- **Partial:** T210 has the bilingual invitation acceptance form. It sets the password, invokes the
  authenticated acceptance RPC, refreshes the session, and verifies the `clinic_staff` role claim before
  navigating to the portal. Six focused tests pass and both localized routes render locally; actual Auth
  invite/SMTP acceptance remains unverified.
- **Complete:** T212 `/no-access` provides bilingual denial/support copy and signs the session out before
  routing to sign-in. Unit tests cover sign-out success and error behavior; both locale routes render and
  Arabic RTL was confirmed.
- **Partial:** T208 provides a server-queried platform admin directory restricted to `super_admin`. The
  platform-admin invite/role/MFA-reset/removal actions have no matching backend contract and remain open.
- **Partial:** T209 shows the signed-in account identity and supports existing language/theme preferences.
  Profile editing, password changes, and MFA device management remain open.
- **Complete:** T205/T206 provide mobile force-update and maintenance routes. They read the existing
  `min_mobile_version.version` and `maintenance.message_en/message_ar` config contracts. Expo web static
  export and browser route checks pass, including the bilingual maintenance fallback. Native build/device
  behavior remains unverified.
- **Complete:** T207 provides the bilingual web dashboard email/password page and TOTP enrollment/verification
  page. Password sign-in routes using verified role claims; TOTP uses Supabase `enroll`, `challenge`, and
  `verify`, with the `/admin` middleware retaining the final role/status/AAL2 gate. Unit tests, login/MFA
  route Playwright checks, full web Playwright, and production build pass. No authenticated sign-in or live
  TOTP factor was exercised. CAPTCHA remains T182; no Turnstile keys are configured.
- **Complete:** T190-T193 provide the mobile Splash, language selection, three-slide onboarding, and welcome
  screens. The entry path was browser-verified. T193 calls the provider modules; Google/Apple native runtime
  remains unverified while T147-T150 are open. T176 Home now uses `/home` to keep `/` available for Splash.
- **Complete:** T198 Profile reads the signed-in profile and localized city and links to Edit profile,
  Settings, Help, and About. T199 reads/writes the three existing `notif_prefs` settings under profile RLS.
  T201 edits name, active city, and optional phone with shared Egyptian-format validation. T202 provides
  localized expandable FAQs and uses only configured, validated `app-config` support channels. T203 shows
  the Expo app version. Static export/browser behavior is verified; authenticated profile read/write
  behavior was not exercised with a real session, and native device behavior is not verified.

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

- **Screens still open:** T194-T195 remain blocked on the safe OTP/session design (T138/T139); T196 lacks
  approved legal content/version inputs and the verified auth/onboarding flow; T200 account linking/deletion
  depends on T179/T180/T142; T204 needs approved Terms/Privacy text and versions. T211 recovery UI remains
  unbuilt, T213/T215 authenticated E2E require test Auth accounts and email/MFA setup, and T216 remains open.

## Verification evidence

- `pnpm.cmd --filter backend exec supabase test db`: PASS, 9 files / 84 assertions after the T140 local
  migrations were applied incrementally (no reset).
- `SUPABASE_DB_CONTAINER=supabase_db_backend pnpm.cmd db:policy-coverage`: PASS, 32 policies.
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
- `npx.cmd --yes --offline deno test --no-lock backend/supabase/functions/admin-create-staff/index.test.ts`:
  PASS, 7 tests; `deno check --no-lock` for the handler passes.
- `pnpm.cmd exec expo install --check`: reports only the pre-existing Expo SDK drift in `@expo/ui`,
  `expo`, and `expo-router`; the two newly installed native auth libraries are compatible.
- `pnpm.cmd i18n:check`: PASS, 736 matching keys.
- T210 continuation: `pnpm.cmd --filter web test` PASS (4 files / 14 tests); direct web TypeScript check
  PASS; focused ESLint PASS; `pnpm.cmd i18n:check` PASS (727 keys); admin-create-staff Deno tests PASS
  (8) and `deno check` PASS; local `/en/accept-invite` and `/ar/accept-invite` both returned 200 with the
  expected localized content and RTL direction.
- T212 continuation: web tests PASS (5 files / 17 tests); direct web TypeScript check and focused ESLint
  PASS; `pnpm.cmd i18n:check` PASS (733 keys); `/en/no-access` and `/ar/no-access` returned 200 with the
  sign-out control rendered and Arabic RTL direction confirmed.
- T205/T206/T212 batch (`29cd6f9`): web tests PASS (5 files / 17 tests), direct web TypeScript and focused
  ESLint PASS; mobile tests PASS (14 suites / 37 tests), typecheck PASS,
  lint PASS (3 pre-existing warnings); token check 0 violations; locale parity PASS (736 keys); Expo web
  static export PASS (17 routes); focused Playwright route checks PASS (3 tests). No native build/device
  runtime was available.
- T208/T209 continuation: `pnpm.cmd --filter web build` PASS; route manifest confirms `/[locale]/admin/team`
  and `/[locale]/admin/settings`, within the MFA-guarded URL segment. Web tests PASS (6 files / 21 tests),
  focused ESLint PASS, locale parity PASS (763). No authenticated admin session was available for a live
  data query; role-check helper tests cover missing user, non-super-admin, and stale-profile-role cases.
- T190-T193 continuation: Expo web export PASS (21 routes); Playwright PASS (6 entry/system tests); mobile Jest
  PASS (14 suites / 37 tests), typecheck PASS, lint PASS (3 pre-existing warnings), token lint PASS, and i18n
  parity PASS (765 keys). Root Splash and tab Home route coexist as `/` and `/home` respectively.
- T198/T199/T201-T203 continuation: Expo web export PASS (25 routes); full mobile Playwright PASS (11 tests);
  Jest PASS (14 suites / 37 tests); typecheck PASS; lint PASS (3 existing warnings); design-token check PASS
  (0 violations); i18n parity PASS (787 keys); Biome and `git diff --check` PASS. New browser tests verify
  About version display, Help FAQ expansion and missing-contact fallback, and Arabic Help/Edit-profile copy.
  This did not establish authenticated database writes or native runtime.
- T207 continuation: web tests PASS (7 files / 26 unit tests); full Playwright PASS (6 tests); direct TypeScript,
  Biome, i18n (808 keys), and production build PASS. Route manifest includes localized `/login` and `/mfa`.
  Four refreshed D00e screenshots were visually inspected; no real Auth credentials or TOTP enrollment were used.
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

1. Build T211's password-recovery screen using the supported Supabase recovery API, keeping SMTP delivery
   verification open until T145 is provisioned; then assess T182 (Turnstile) only if its site key/secret
   become available. Keep email-code mobile sign-in blocked until T138's authoritative safe session path is
   resolved.
2. Define and implement the platform-admin lifecycle contract before completing T208's invite/role/MFA/remove
   actions. Complete T209 after secure profile, password, and MFA management flows are available.
3. Extend T143 as later-phase data tables land and complete T142 only when trusted backend reauthentication
   and the coordinated deletion lifecycle are implemented.
4. Keep native OAuth/E2E tasks partial until provider credentials, EAS, Android/Java, and test devices are
   available. Do not mark D02 complete until T216's end-to-end gate is genuinely satisfied.
