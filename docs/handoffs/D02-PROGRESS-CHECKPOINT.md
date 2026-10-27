# D02 Progress Checkpoint

**Updated:** 2026-10-27
**Branch:** `main`
**Latest implementation commit:** `9377748` (`fix(D02): enable local dashboard auth flow`), pushed and synchronized in checkpoint commit `e6d855d`.
**Checkpoint status:** T143 export endpoint is implemented for current-schema data and remains partial; local dashboard Auth integration is now exercised end to end.
**Phase status:** D02 remains open. No D03 work has started.

## Session update — bilingual email templates (2026-10-27)

- Added English/Arabic RTL HTML artifacts for login code, staff invitation, and password reset under
  `backend/supabase/templates/`.
- Added standalone Vitest checks: 1 file / 6 tests passed, covering both language sections, Supabase
  placeholders, escaped values, and table-based email markup. `git diff --check` passed.
- T152/T153 remain unchecked/partial: Arabic native review, Auth wiring, SMTP delivery, and common email
  client preview checks remain outstanding. Login template was not configured because it could expose the
  public Supabase OTP route around the approved Option C policy.
- No D02 task is promoted to verified by this batch. D02 remains 54/97 verified (55.67%).
- At checkpoint time HEAD remains `73b20f520ce1819c9b6588fe0faa2e49a2d7b138`, equal to `origin/main`;
  these implementation and tracking edits are not yet committed or pushed. The three audit handoff files
  remain untouched and unstaged.

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
- **Complete locally:** T183 dashboard maintenance banner and admin layout are implemented; authorized routes
  remain available while maintenance is enabled. A synthetic local super-admin completed password login,
  first-time TOTP enrollment, AAL2 verification, and the guarded Settings landing route; English and Arabic/RTL
  maintenance banners were browser-verified. Hosted maintenance settings remain unconfigured and unverified.
- **Partial:** T147/T148 native Google/Apple sign-in adapters and pure cores are implemented. T150's
  compatible packages were installed and Expo config was checked with absent and synthetic Google URL
  schemes. T151 has nonce and availability tests. Provider credentials, UI integration, Android import-path
  verification, and an EAS development build remain outstanding. **Complete:** T151 now verifies Apple
  nonce handling and that the Welcome screen's Android path does not invoke/load the Apple adapter; iOS does.
- **Complete (code-level):** T179/T180 implement supported native Google token linking for an already
  authenticated owner and map `identity_already_exists` to `IDENTITY_ALREADY_LINKED`. The Account screen
  exposes this action only when Google is not linked, reads the current linked identities, provides a
  localized conflict state, exports the currently supported user data, and signs out. T200 remains partial:
  deletion awaits the safe coordinated backend contract in T142. Secondary email identity linking remains
  deferred because its safe attachment sequence is not established. Google credentials and native
  authenticated runtime were unavailable, so provider linking was not runtime-verified.
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
- **Complete:** T209 now edits the caller's own profile name through profiles RLS, changes the password via
  Supabase Auth, and supports TOTP enroll/remove through challenge and verify, alongside language/theme
  preferences. The admin route retains its role/status/AAL2 middleware. Unit/helper checks and production
  build pass; a focused browser test confirms signed-out users redirect from settings to login. No
  authenticated settings operation was runtime-exercised.
- **Complete:** T205/T206 provide mobile force-update and maintenance routes. They read the existing
  `min_mobile_version.version` and `maintenance.message_en/message_ar` config contracts. Expo web static
  export and browser route checks pass, including the bilingual maintenance fallback. Native build/device
  behavior remains unverified.
- **Complete locally:** T207 provides the bilingual web dashboard email/password page and TOTP enrollment/
  verification page. Local Auth config enables the custom access-token hook and TOTP enrollment/verification;
  password login issues the expected signed `user_role`, and a synthetic local super-admin completed first-time
  enrollment and AAL2 navigation. The `/admin` route lands at `/admin/settings`. Hosted Auth configuration,
  accounts, and provider behavior remain unverified. CAPTCHA remains T182; no Turnstile keys are configured.
- **Complete:** T211 provides bilingual `/forgot-password` and `/reset-password` routes using Supabase Auth's
  recovery request, `PASSWORD_RECOVERY` event, and `updateUser` APIs. The response copy is generic and the
  reset route requires a recovery session. Focused unit/browser checks, TypeScript, i18n parity, and production
  build pass. No recovery email or authenticated recovery session was exercised because SMTP remains
  unavailable (T145); Turnstile remains open (T182).
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
- **T179/T180:** supported Google linking and conflict mapping are implemented. Manual Linking is enabled
  in local config, but hosted settings/credentials and native runtime are unverified. T181 remains open for
  real provider-backed link/conflict verification; email identity linking is deferred.
- **T172:** hook and tests exist, but the representative `/pets/new` action is owned by D03 and was not
  started. T172 stays open.

- **Screens still open:** T194-T195 remain blocked on the safe OTP/session design (T138/T139); T196 lacks
  approved legal content/version inputs and the verified auth/onboarding flow; T200 remains partial pending
  T142's safe account-deletion endpoint; T204 needs approved Terms/Privacy text and versions. T213 still needs
  a supported email-code session path plus native prerequisites. T215 is complete for the local dashboard flow;
  T216 remains open.

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
- T211 continuation: web tests PASS (7 files / 28 tests); focused dashboard-auth Playwright PASS (5 tests);
  direct TypeScript and Biome PASS; `pnpm.cmd i18n:check` PASS (825 keys); production web build PASS with
  both localized recovery routes in the manifest; `git diff --check` PASS. SMTP delivery and a real recovery
  session were not tested.
- T209 continuation: web tests PASS (8 files / 33 tests); focused dashboard-auth Playwright PASS (6 tests);
  direct TypeScript PASS; web lint PASS (0 errors,
  1 existing warning); Biome PASS; i18n parity PASS (847 keys); production web build PASS with the guarded
  settings route in the manifest; `git diff --check` PASS. No authenticated profile/password/MFA action was
  exercised.
- T151 continuation: focused loader Jest PASS (2 tests); full mobile Jest PASS (15 suites / 39 tests);
  mobile TypeScript PASS; mobile lint PASS (0 errors, 3 existing warnings); token check PASS (0 violations);
  Expo web export PASS (25 static routes) using local-only placeholder Supabase environment values. No native
  Android/iOS execution was performed.
- T179/T180/T200 continuation: mobile Jest PASS (16 suites / 44 tests, including 5 linking cases); mobile
  TypeScript and lint PASS (0 errors, 3 existing unrelated warnings); design-token check PASS (0 violations);
  i18n parity PASS (849 keys); Expo web static export PASS (26 routes, including `/profile/account`) with
  local-only placeholder Supabase values; `git diff --check` PASS. No live provider credential, Auth session,
  native linking flow, or export invocation was available.
- T135/T183/T207/T215 local dashboard Auth integration: local custom access-token hook and TOTP were enabled;
  password sign-in produced the `super_admin` role claim. Focused Playwright with a disposable local fixture
  passed first-time TOTP enrollment, AAL2 routing, `/admin` → `/admin/settings`, and English/Arabic RTL
  maintenance rendering. Fixture and maintenance row were deleted and both absence counts verified. Full web
  Playwright PASS (9 tests), Vitest PASS (8 files / 33 tests), TypeScript PASS, lint PASS (0 errors, 1 existing
  warning), production build PASS (includes `/[locale]/admin`), i18n parity PASS (849 keys), Biome PASS, and
  `git diff --check` PASS. Hosted Auth, email/SMTP, native runtime, and Maestro remain unverified.
- **T215:** focused local Playwright verified password login, first-time TOTP enrollment, AAL2-gated routing,
  and the English/Arabic maintenance banner with disposable local Auth/profile fixtures. The fixtures and
  maintenance row were deleted and verified absent. This is not hosted-provider or native-device verification.
- Real authenticated mobile runtime flows, EAS build, Maestro, and hosted service checks: not run.

## Environment snapshot

- Node `v24.16.0`; `.nvmrc` specifies `22.13.0`.
- pnpm `9.12.2`; store `H:\.pnpm-store\v3`.
- Docker and local Supabase CLI `2.121.0` are available.
- Java, Android SDK/`adb`, Maestro CLI, and EAS CLI/account are missing.
- Google/Apple credentials, hosted SMTP provider/domain, and hosted Supabase projects are not verified.
- No secrets were added to the repository.

## Recommended next sequence

1. Resolve the authoritative email OTP/session design before T138/T139, T155, T194/T195, or T213. Supabase's
   public OTP endpoints have not been proven to enforce the approved lockout, and no supported session issuance
   mechanism is established. Do not issue sessions through an insecure workaround or weaken lockout.
2. Configure a hosted SMTP provider/domain (T145), then finish T140/T152/T153/T210 and dependent T146 work.
   No SMTP credentials or verified domain are available.
3. Obtain approved Terms/Privacy copy and version identifiers (T204); complete T196 only with the consent
   contract and authentication path established. T197 also depends on pet onboarding owned by D03; do not start D03.
4. Provide Google/Apple credentials, an EAS account/build environment, Android SDK/Java/adb and Maestro CLI to
   complete T147/T148/T150/T181/T184/T189/T214. Keep provider/native runtime claims open until actually tested.
5. Keep T142/T200 open until the coordinated deletion lifecycle is implemented; extend T143 as future-phase data
   tables land. T208 stays partial until platform-admin lifecycle RPC/Edge Function contracts exist. T216 remains
   the final D02 gate and must stay open until its complete checklist passes.

## Remaining unchecked D02 task IDs and blockers

| Tasks | Blocker |
| --- | --- |
| T120, T138, T139, T155, T194, T195, T213 | Current official Auth Hooks docs show no email-OTP verification interceptor; `generateLink()` is not documented to mint a refreshable session. Exact wrong-code experiment still needs a numeric-code template. Preserve the lockout; T213 also needs Maestro/native prerequisites. |
| T140, T145, T152, T153, T210 | SMTP provider and verified domain are unavailable; invite/template delivery cannot be truthfully verified. |
| T142, T200 | Coordinated account deletion and trusted cleanup contract are not implemented. |
| T143 | Current-schema export exists; later-phase tables and full runtime coverage are outstanding. |
| T146 | Hosted projects/origins/secrets and dependent Edge Functions are not provisioned. |
| T147, T148, T150, T181, T184, T214 | Provider credentials and native development build/device prerequisites are unavailable. |
| T172 | Representative `/pets/new` action belongs to D03; D03 has not started. |
| T173 | Route guard code is partial until remaining onboarding destinations and authenticated mobile integration are complete. |
| T182 | Cloudflare Turnstile site/secret keys are unavailable. |
| T185 | `sign_up_completed` awaits the verified auth completion handler; preference events are implemented. |
| T189 | Maestro CLI, Java, Android SDK/adb, and native runtime are unavailable. |
| T196, T204 | Consent flow needs approved Terms/Privacy content and version identifiers; T196 also needs the safe auth entry path. |
| T197 | Summary depends on completed pet setup (D03) and the preceding auth/profile flow. |
| T208 | Directory is implemented; platform-admin invite, role change, MFA reset, and removal lack backend contracts. |
| T216 | Final end-to-end gate depends on the above OTP, SMTP, legal, native, and later-phase work. |
