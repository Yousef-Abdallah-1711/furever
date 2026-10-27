# FurEver D02 Final Status and Next-Phase Readiness — 2026-10-27

## Executive summary

D02 is **not complete** and its mandatory T216 gate fails. Do not start D03. The approved phase order in
`tasks.md` is sequential: D00 → D01 → D02 → D03 → D04 → D05 → D06 → D07 → D08. D00 and D01 are closed;
D02 remains open at **54/97 verified tasks (55.67%)**. No D02 task was descoped.

This reconciliation uses the complete task audit, current `tasks.md`, `plan.md`, `research.md` §§17–18,
current implementation log/checkpoint, and fresh checks listed below. The older protected audit is preserved
unchanged; its D02 status counts predate the profile/legal work in commits `d55002e` onward. This document
updates the two former blocked tasks T196/T204 to partial and records current route-guard evidence for T173.

## Repository and stack baseline

- Repository: `H:\Projects\Furever`; branch `main`.
- Starting HEAD and `origin/main`: `b8bc68a3ac17ae97b4fee947e69ec86d662d31b9`.
- Versions read from installed package metadata: Expo `57.0.30`, React Native `0.86.3`, Next.js `16.4.2`,
  pnpm `11.28.9`, Supabase CLI `2.121.0`.
- Local Supabase database container `supabase_db_backend` was running. No database reset was performed.
- Protected files remain untracked and untouched: `FUREVER-COMPLETE-PROJECT-AUDIT.md`,
  `D02-NEXT-SESSION-HANDOFF.md`, and `D02-NEXT-SESSION-MASTER-PROMPT.md`.
- `backend/.env` is ignored. Its password was not read or emitted. SMTP remains disabled; no hosted project
  was changed. Do not use a password previously pasted in chat.
- Applicable agent instructions: `mobile/AGENTS.md` and `web/AGENTS.md`. The mobile route-path note is stale:
  real Expo Router routes are under `mobile/app/`, not `mobile/src/app/`.

## Project phase status

| Phase | Official name | Tasks | Status | Gate/dependency |
| --- | --- | --- | --- | --- |
| D00 | Foundation, structure, Docker | T001–T080 | Closed with owner-approved T074–T076 descoping | D00 accepted scope complete |
| D01 | Design system port | T081–T119 | Complete and verified | D00 |
| D02 | Auth and roles | T120–T216 | Open; 54/97 verified | T216 is the mandatory gate for D03 |
| D03 | Pets and passport | T217–T237 | Not started | Blocked by D02/T216; do not implement now |
| D04 | Vaccinations and notifications | T238–T268 | Not started | D03 |
| D05 | Clinics and admin operations | T269–T301 | Not started | Earlier gates and D04 dependencies |
| D06 | Booking | T302–T338 | Not started | Earlier phases, including D05 |
| D07 | Live queue and operations | T339–T380 | Not started | Earlier phases, including D06 |
| D08 | Hardening and launch | T381–T409 | Not started | D02–D07 plus launch prerequisites |

Current official task counts are `D02=T120–T216 (97)`, `D03=T217–T237 (21)`. The tasks document explicitly
orders delivery phases sequentially; it does not authorize a parallel D03 workstream while T216 is open.

## D02 count reconciliation

| Current actual classification | Count | Checklist relationship |
| --- | ---: | --- |
| Complete and verified | 54 | Checked |
| Implemented, integration/runtime evidence still missing | 11 | Checked; do not mechanically uncheck |
| Partial | 14 | Unchecked; includes newly implemented T196 and T204 |
| Blocked | 18 | Unchecked |
| **Total** | **97** | **65 checked / 32 unchecked** |

Verified completion remains `54 ÷ 97 = 55.67%`. This is task-level completion only; it does not mean the D02
phase gate passes.

## D02 task-by-task reconciliation

The table below includes every D02 task ID. “Remaining work” is the task-specific acceptance gap from the
current source audit, corrected for the latest route/profile/legal changes. The complete task descriptions
and acceptance criteria remain authoritative in `specs/001-furever-platform/tasks.md`.

| Task | Feature | Checklist | Actual status | Evidence / remaining acceptance work |
| --- | --- | --- | --- | --- |
| T120 | **Spike**: attempt to call Supabase Auth's email-OTP `signInWithOtp`/`verifyOtp` endpoints | Unchecked | Blocked | Supported OTP-to-refreshable-session path and public-Auth bypass resistance remain unproven; exact numeric wrong-code experiment is also outstanding. |
| T121 | **Spike (new, remediation pass)**: confirm Supabase Auth's automatic email/Google | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T122 | **New, remediation pass**: if T121 found Manual Linking is off, enable it in | Checked | Implemented; proof missing | Local manual-linking configuration parsed, but Auth was not restarted to prove runtime application. |
| T123 | Migration: `cities` table + RLS + seed. Needed before `profiles` (city picker). | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T124 | Migration: `profiles` table + RLS (`email` required; `phone` nullable/optional â€” 2026-10-18 | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T125 | Migration: `clinics` table (slim: identity + `status` only â€” `name_en/ar`, `city_id`, | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T126 | Migration: `clinic_staff` table + RLS. Depends on T124, T125 (FKs to both). | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T127 | Migration: `push_tokens` table + RLS. Depends on T124. | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T128 | Migration: `consents` table + RLS. Depends on T124. | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T129 | Migration: `audit_logs` table + RLS (append-only: no `UPDATE`/`DELETE` grant to any | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T130 | Write the shared helper function `write_audit_log(p_actor_id, p_action, p_entity, | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T131 | Migration: `feature_flags` table + RLS + seed (5 flags, all `false` â€” constitution | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T132 | Migration: `app_config` table + RLS + the same audit trigger as T131, attached | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T133 | REVOKE direct `UPDATE` of `clinics.status` from `authenticated` (only `set_clinic_status`, | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T134 | Migration: `otp_attempts` table + RLS (service-role only), | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T135 | Extend `custom_access_token_hook` (D00b skeleton) to inject `profiles.role` as | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T136 | RPC `record_otp_attempt(p_identifier, p_outcome)` (2026-10-18 â€” was | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T137 | RPC `get_otp_lock_status(p_identifier)` (2026-10-18 â€” was `p_phone`). Depends on | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T138 | **New (this fix pass)**: enforce the approved custom email-code security policy from T120. | Unchecked | Blocked | Option C is approved, but session establishment cannot safely be implemented before supported path is proven. |
| T139 | Edge Function `verify-otp-guard/`: implement T138's approved Option C with `send-code` and | Unchecked | Blocked | No verifiable custom OTP session architecture; no guard endpoint exists. |
| T140 | Edge Function `admin-create-staff/` | Unchecked | Partial | Local Mailpit invite and authenticated English/Arabic browser acceptance now pass through the SSR token-hash callback; cross-clinic/manager-escalation and idempotent acceptance evidence exists in local integration. Hostinger SMTP remains deferred/unverified; expired-token browser and additional negative cases remain. |
| T141 | Edge Function `admin-set-user-status/`, calling `write_audit_log()` for every status | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T142 | Edge Function `delete-account/`. [AUTH-08] | Unchecked | Partial | Fresh-auth validator is implemented/tested; coordinated transactional deletion is absent. |
| T143 | Edge Function `export-my-data/`. [AUTH-09] | Unchecked | Partial | Current profile/consent/device export exists; later entities and authenticated runtime remain. |
| T144 | Edge Function `app-config/`. [PLT-01][PLT-02] | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T145 | **Replaces the Twilio provider task (2026-10-18)**: configure custom SMTP and the | Unchecked | Blocked | Owner deferred SMTP this session; password is blank, Auth SMTP disabled, and Hostinger AUTH/external delivery are unverified. |
| T146 | Document and wire required Supabase secrets for every Edge Function above in | Unchecked | Partial | Environment documentation is partial; hosted projects/origins/secrets and dependent functions are not provisioned. |
| T147 | Build the Google sign-in module `mobile/src/features/auth/google-signin.ts`: configure | Unchecked | Partial | Google adapter exists; credentials, native runtime and complete EAS build are absent. |
| T148 | Build the Apple sign-in module `mobile/src/features/auth/apple-signin.ts` (**iOS only**; | Unchecked | Partial | Apple adapter/nonce core exists; credentials and iOS runtime/build are absent. |
| T149 | Supabase Google/Apple provider configuration: `backend/supabase/config.toml`'s | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T150 | Expo config entries both native modules need in `mobile/app.json`/`app.config.ts` â€” | Unchecked | Partial | Apple config/package setup exists; Google scheme/plugin and final native build setup remain incomplete. |
| T151 | Unit tests: Apple nonce round-trip (the SHA-256 hash of the raw nonce sent to | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T152 | Author the 3 bilingual (Arabic and English in the same email, RTL-safe) email templates â€” | Unchecked | Blocked | Bilingual templates exist and render tests pass; login template stays unwired; Arabic review and email-client preview remain. |
| T153 | Rendering check test for the 3 templates (T152): both languages render correctly in one | Unchecked | Blocked | Template unit rendering passes; provider delivery, Arabic review, and common-client preview remain. |
| T154 | Build the shared test helper `packages/shared/src/testing/read-local-inbox.ts`: fetches | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T155 | Integration test: `send-code` is throttled per email address and per IP address, and | Unchecked | Blocked | No send-code endpoint exists; cannot exercise actual per-email/per-IP throttling or enumeration response. |
| T156 | pgTAP: `authenticated` cannot update `profiles.role`/`status`. [AUTH-10] | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T157 | pgTAP: a suspended user's API call is rejected. | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T158 | pgTAP: RLS coverage for `profiles`/`consents`/`push_tokens` (owner-only). [AUTH-04][AUTH-09] | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T159 | pgTAP: `write_audit_log()` inserts a correct, immutable row. | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T160 | pgTAP: writing to `feature_flags`/`app_config` auto-produces an `audit_logs` row via | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T161 | pgTAP: only `super_admin` can write `feature_flags`/`app_config`. | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T162 | pgTAP: `otp_attempts` has zero `authenticated`-role access (service-role only). | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T163 | pgTAP: `clinics.status` cannot be updated directly by `admin` (confirms T133's | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T164 | Mobile Supabase client + encrypted session storage adapter in | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T165 | Mobile: `AppState` foreground session refresh + `detectSessionInUrl: false` in | Checked | Implemented; proof missing | AppState auto-refresh code and static checks exist; native foreground/background behavior has not been run on device. |
| T166 | Web `@supabase/ssr` browser + server clients in `web/src/lib/supabase/{browser,server}.ts`. | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T167 | Web middleware session refresh + role-based redirect in `web/src/middleware.ts` | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T168 | Web: enforce `aal2` for every `/admin` route in `web/src/middleware.ts` (same path | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T169 | React Query providers in `mobile/app/_providers.tsx` (corrected from the task's | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T170 | Build the shared `mobile/src/hooks/useNetworkStatus.ts` (wraps | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T171 | Build `OfflineBanner` â€” `mobile/src/components/OfflineBanner.tsx` + | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T172 | Build the shared "disabled with a reason" pattern for network-dependent actions â€” a | Unchecked | Blocked | Representative `/pets/new` guarded action belongs to D03, which is expressly not started. |
| T173 | Mobile route guard `mobile/src/lib/route-guard.ts`: redirects on signed-out, profile | Unchecked | Partial | Fresh export and Playwright verify signed-out direct links route to Welcome; authenticated transitions and native runtime remain. |
| T174 | Web route guard (extends T167/T168): same five states for the dashboard. Depends on T167. | Checked | Implemented; proof missing | Web branches are coded, but an authenticated suspended-user route was not live-exercised. |
| T175 | Onboarding flow orchestration `mobile/src/features/onboarding/router.ts` â€” new-user path | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T176 | Build the Home tab shell `mobile/app/(tabs)/home.tsx` (empty shell â€” D04 adds the | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T177 | Build `mobile/app/(tabs)/_layout.tsx` (tab bar: Home, Pets, Bookings, Profile). Depends on | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T178 | Build the Permissions primer shell `mobile/app/permissions.tsx` (empty shell â€” D04 adds | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T179 | Build the supported Account-screen identity linking path in | Checked | Implemented; proof missing | Google linking code/unit cases exist; no authenticated provider-backed native session was available. |
| T180 | Map Supabase's `identity_already_exists` Google-link conflict to the | Checked | Implemented; proof missing | Conflict mapping code/unit cases exist; live OAuth conflict was not exercised. |
| T181 | Maestro: link Google to an email-only account and link email to a Google-only account, | Unchecked | Blocked | Provider credentials/native sessions required for real linking/conflict E2E. |
| T182 | Cloudflare Turnstile on web login and password reset (`web/src/app/[locale]/(auth)/ | Unchecked | Blocked | Turnstile keys/configuration unavailable. |
| T183 | Maintenance banner in the dashboard shell `web/src/components/dashboard/ | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T184 | Produce the first EAS development build (`eas build --profile development`) and confirm | Unchecked | Blocked | EAS account/token/build and native platform toolchain unavailable. |
| T185 | PostHog instrumentation for `sign_up_completed`, `language_changed`, `theme_changed` | Unchecked | Partial | Preference events exist; signup event awaits verified signup handler. |
| T186 | Write `backend/supabase/scripts/check-policy-coverage.ts`: lists every policy from | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T187 | Add auth/profile Zod schemas to `packages/shared/src/schemas/auth.ts` (email required; | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T188 | Add auth/onboarding keys to `packages/i18n`. [AUTH-01..10] | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T189 | Install and configure Maestro (`mobile/.maestro/`) and Playwright | Unchecked | Blocked | Maestro, Java, Android SDK/adb unavailable. |
| T190 | Build `/` Splash â€” `mobile/app/index.tsx` (Built). [PLT-01][PLT-02] | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T191 | Build `/language` Language â€” `mobile/app/language.tsx` (Built). [AUTH-05] | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T192 | Build `/onboarding` Onboarding (3 slides) â€” `mobile/app/onboarding.tsx` (Built). | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T193 | Build `/welcome` Welcome â€” `mobile/app/welcome.tsx` (Built, design change needed: | Checked | Implemented; proof missing | Entry route is browser-verified; Google/Apple native success/cancel paths are not verified. |
| T194 | Build `/sign-in` Sign in â€” `mobile/app/(auth)/sign-in.tsx` (Built, design change | Unchecked | Blocked | Depends on safe OTP/session design (T138/T139); route missing. |
| T195 | Build `/otp` Verify code â€” `mobile/app/(auth)/otp.tsx` (Built, design change needed: | Unchecked | Blocked | Depends on safe OTP/session design and numeric email-code path; route missing. |
| T196 | Build `/complete-profile` â€” `mobile/app/(auth)/complete-profile.tsx` (Built, design | Unchecked | Partial | Profile route/RPC exist; approved bilingual legal copy/versions, safe auth entry, and authenticated runtime are missing. |
| T197 | Build the Setup Summary screen `mobile/app/onboarding/summary.tsx` (Built â€” | Unchecked | Blocked | Depends on auth/profile and D03 pet setup flow; route missing. |
| T198 | Build `/(tabs)/profile` Profile â€” `mobile/app/(tabs)/profile.tsx` (Built). [AUTH-05][AUTH-07] | Checked | Implemented; proof missing | Profile route rendered; authenticated profile/city query was not executed with a real session. |
| T199 | Build `/profile/settings` Settings â€” `mobile/app/profile/settings.tsx` (Built). | Checked | Implemented; proof missing | Settings UI is present; preference database writes were not executed with a real session. |
| T200 | Build `/profile/account` Account â€” `mobile/app/profile/account.tsx` (Built, design | Unchecked | Partial | Google linking/export/sign-out exist; deletion remains absent under T142. |
| T201 | Build `/profile/edit` Edit profile â€” `mobile/app/profile/edit.tsx` (Spec; pattern: | Checked | Implemented; proof missing | Edit-profile UI is present; authenticated profile update was not executed with a real session. |
| T202 | Build `/profile/help` Help â€” `mobile/app/profile/help.tsx` (Spec; pattern: Profile). | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T203 | Build `/profile/about` About â€” `mobile/app/profile/about.tsx` (Spec; pattern: | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T204 | Build `/legal/terms`, `/legal/privacy` â€” `mobile/app/legal/[doc].tsx` (Spec; | Unchecked | Partial | Bilingual legal viewer exists and fails closed; approved Terms/Privacy text and version IDs are missing. |
| T205 | Build `/force-update` - `mobile/app/force-update.tsx` (Spec; pattern: Splash). [PLT-01] | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T206 | Build `/maintenance` - `mobile/app/maintenance.tsx` (Spec; pattern: Splash, includes T183's | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T207 | Build `/login`, `/mfa` â€” `web/src/app/[locale]/(auth)/{login,mfa}/page.tsx` (Built). | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T208 | Build Admin team â€” `/admin/team`, `web/src/app/[locale]/(admin)/admin/team/page.tsx` (Spec; pattern: | Unchecked | Partial | Super-admin directory read exists; lifecycle actions lack backend contracts. |
| T209 | Build admin Settings â€” `/admin/settings`, `web/src/app/[locale]/(admin)/admin/settings/page.tsx` (Spec; | Checked | Implemented; proof missing | Settings code/helpers exist; authenticated profile/password/MFA operations were not runtime-exercised. |
| T210 | `/accept-invite` | Unchecked | Partial | Actual Mailpit callback link passed authenticated local Playwright 4/4 across English acceptance, Arabic RTL acceptance, invalid token, and reused link; role/membership and `/clinic` navigation verified. Expired-token browser and additional negative/retry scenarios remain. |
| T211 | Build `/forgot-password` â€” `web/src/app/[locale]/(auth)/forgot-password/page.tsx` | Checked | Implemented; proof missing | Recovery request/reset code and route checks exist; no delivered recovery email or recovery session was exercised. |
| T212 | Build `/no-access` - `web/src/app/[locale]/(auth)/no-access/page.tsx` (Spec; pattern: | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T213 | Maestro: email sign-up happy path + wrong code + lockout, reading the code from the local | Unchecked | Blocked | Depends on safe code/session path and native Maestro build prerequisites. |
| T214 | Maestro, | Unchecked | Blocked | Depends on provider credentials, EAS/native builds, Maestro and real platform devices. |
| T215 | Playwright: dashboard login + MFA enrollment + aal2 gate. [AD-01] Verified locally | Checked | Verified | No remaining task-level criterion identified in the audit; verification evidence is recorded in the implementation log. |
| T216 | **Checkpoint**: AUTH-01â†’04 completes end to end on a dev build incl. the Summary screen, | Unchecked | Blocked | Mandatory exit gate fails on safe OTP/session architecture, native onboarding, legal inputs, and unverified external email delivery. |

## Recent implementation audit

### Authentication, roles, and invitations

- An Auth-user trigger creates owner profiles; `custom_access_token_hook` places the database role into the
  JWT. Local profile provisioning and role tests are recorded in the implementation log.
- Staff invitation RPCs and `admin-create-staff` enforce clinic scope, prevent self-escalation, preserve the
  invited role in the ledger, and cancel definite delivery failures. Local Supabase Auth/Mailpit testing
  recorded same-clinic invitation delivery/acceptance, idempotent acceptance retry, cross-clinic denial,
  manager-role escalation denial, and duplicate-invite rejection.
- Invitation UI/browser acceptance and Hostinger delivery are not verified. T140/T210 remain partial.
- Dashboard MFA/login route work and T215 local Playwright coverage exist. Hosted configuration is not
  claimed.

### Mobile guards, completion, and legal documents

- Shared fail-closed guard is mounted for tabs and direct `/profile/*` routes. It checks session, active
  profile, deletion/suspension state, consent, app config, maintenance, and minimum mobile version.
- Fresh Expo web export produced 29 routes. Fresh mobile Playwright passed 11/11, including signed-out
  direct profile links returning to the localized Welcome route, force-update/maintenance screens, and
  entry routes. It does not verify authenticated profile navigation or native runtime.
- `/complete-profile` and `/legal/[doc]` are present. `complete_owner_profile` atomically writes owner
  profile and both current consent versions, validates explicit acceptance and bilingual document config,
  and is restricted to authenticated callers. A follow-up migration removes the earlier weaker RPC
  signature. Local pgTAP covers that removal, grants, acceptance requirement, current/stale versions,
  profile persistence, phone validation, and retry idempotency.
- T196/T204 remain partial. Owner-approved Terms/Privacy text and version IDs are absent; the UI/RPC fail
  closed until they are configured. No authenticated profile completion was exercised.

### Email, recovery, export, and account deletion

- English/Arabic invite and recovery templates render in local Supabase Auth/Mailpit. Existing local
  integration evidence records bilingual delivery, no unresolved template variables, recovery password
  update/sign-in, expired/reused link rejection, enumeration-equivalent responses, resend throttling, and
  invite role/clinic enforcement. This session reran template rendering tests, not the live local email
  workflow.
- Hostinger details are present in ignored local settings, but the SMTP password remains blank and local
  Auth SMTP is disabled. Sender/DNS verification, Hostinger AUTH, and external inbox delivery are not
  verified. SMTP is explicitly owner-deferred for this session.
- Current-schema export returns profile, consents, and push metadata without raw push tokens; pet/medical/
  appointment data does not exist yet. Full export acceptance remains partial.
- T142 has a signed `amr` recent-auth validator but no transactional delete endpoint, storage cleanup,
  Auth-user cleanup, idempotency, or failure-recovery lifecycle. T200 deletion therefore remains partial.

### Custom OTP and security

- Owner-approved Option C remains mandatory: custom random codes, protected storage, expiry, attempts,
  lockout/throttles, no enumeration, and no path around the policy via public Supabase Auth OTP endpoints.
- No custom OTP generation/verification flow shipped. No supported path from independently verified code
  to a normal refreshable Supabase session has been proven, and public Auth bypass resistance is unproven.
  T120/T138/T139/T155/T194/T195/T213 remain blocked. Do not fabricate tokens or weaken lockout.
- Local policy checker passes with 32 policy test references. This is not a semantic RLS review and is not
  hosted CI. Role, invitation, and profile RPC tests provide focused coverage; hosted-provider paths remain
  unverified.
- T208 has a super-admin-only directory read, but lacks audited backend contracts for platform-admin invite,
  role change, MFA reset, and removal.

## D02 exit gate verdict: FAIL

`plan.md` requires all of the following before D02 exits and D03 begins:

1. New email user completes AUTH-01→04 on a development build using a real code from the local inbox —
   **FAIL**: safe OTP/session architecture is unproven; no mobile dev build/Maestro runtime.
2. Admin MFA reaches `/admin` — **PASS locally** for disposable local fixtures; hosted configuration is
   not claimed.
3. Suspended user is rejected — **PARTIAL**: policy/guard implementation and focused tests exist; full
   authenticated mobile end-to-end evidence is missing.
4. Force-update and maintenance reachable by flag — **PARTIAL**: mobile Playwright verifies static routes
   and bilingual maintenance fallback; full authenticated four-combination/dev-build evidence is missing.
5. Audit fires on a flag change — **PASS in recorded local evidence** for the existing audit trigger/checks;
   this final verification did not repeat that mutation.
6. Policy checker covers every policy — **PASS locally**: 32 policy references; semantic review/CI is not
   claimed.
7. Three email templates render bilingually and all four locale/theme combinations are proven — **PARTIAL**:
   template render tests pass; Arabic native review/common-client preview and the complete authenticated
   four-combination flow are not demonstrated.
8. Approved Option C is implemented with a proven refreshable session and no public Auth bypass — **FAIL**.

Because mandatory criteria 1 and 8 fail, T216 stays open and D03 cannot safely start.

## Next phase and readiness

The next numbered phase is **D03 — Pets and passport (T217–T237)**. Its planned scope includes breeds and
pets tables/RLS, pet photo/document storage buckets and path policies, pet delete/purge and storage cleanup,
owner mobile My Pets/Add Pet/Edit Pet/document routes, schemas/localization, pgTAP, and Maestro flows. The
phase exit requires pet creation during onboarding or My Pets, edit and soft-delete behavior, storage and
RLS tests, and offline behavior. Its entry gate is D02/T216.

**D03 readiness: BLOCKED.** D02 entry/exit dependency is unsatisfied. Do not start D03 and do not create a
parallel D03 branch without an explicit owner change to the phase boundary.

## Recommended development path: A — continue D02

1. Keep T120/T138/T139/T155/T194/T195/T213 blocked until authoritative Supabase support/documentation
   proves a non-bypassable, refreshable session path for the approved custom code. Do not issue fabricated
   tokens or call public OTP verification from around the guard.
2. Keep SMTP deferred as directed. In a later authorized session, use a newly rotated password entered
   directly into ignored `backend/.env`; prove sender/DNS, SMTP AUTH, external inbox delivery, and failure
   behavior before closing T145/T140/T152/T153/T210. No hosted changes without explicit approval.
3. Obtain owner-approved bilingual legal text and version IDs; then exercise `/complete-profile` against the
   local database with an authenticated disposable test account before advancing T196/T204.
4. Design and test a transactional delete lifecycle for T142/T200; complete T143 when the future data
   entities exist. Do not claim deletion until database, storage, and Auth cleanup are coordinated.
5. Resolve T208 platform-admin lifecycle authorization/audit contracts before implementing actions.
6. With owner credentials/tooling, complete OAuth/linking and real native flows: Google/Apple credentials,
   EAS account/build, Java/Android SDK/adb, Maestro, and suitable test devices.
7. Obtain Turnstile credentials for T182; wire T185 signup analytics only after a real verified signup
   handler exists. Keep T172 and T197 within D03's authorized scope; do not implement them here.
8. Re-run T216 only when every criterion above is demonstrated with concrete evidence.

Path B (limited D03 parallel work) is not authorized by the current sequential phase plan. Path C (full D03)
fails its mandatory T216 entry gate.

## Final verification results

| Command | Result |
| --- | --- |
| `pnpm.cmd --filter mobile test` | PASS — 18 suites, 57 tests |
| `pnpm.cmd --filter mobile typecheck` | PASS — `tsc --noEmit` |
| `pnpm.cmd --filter web test` | PASS — 8 files, 33 tests |
| `pnpm.cmd --filter web exec tsc --noEmit --incremental false` | PASS |
| `pnpm.cmd --filter @furever/shared test` | PASS — 4 files, 24 tests |
| `pnpm.cmd --filter @furever/i18n test` | PASS — 1 file, 1 test |
| `pnpm.cmd i18n:check` | PASS — 850 keys match |
| `SUPABASE_DB_CONTAINER=supabase_db_backend pnpm.cmd db:policy-coverage` | PASS — 32 policies have pgTAP test references |
| `pnpm.cmd exec tsx scripts/check-component-props.ts` | PASS — 0 drift across 18 component contracts / 36 port files |
| `pnpm.cmd exec vitest run --config backend/supabase/templates/vitest.config.ts` | PASS — 1 file, 6 template tests |
| `pnpm.cmd --filter backend exec supabase test db --local` | PASS — 11 files, 100 assertions; transaction-scoped fixtures rolled back |
| `web` Playwright (`pnpm.cmd --filter web test:e2e`) | PASS — 9 tests |
| `mobile` static Playwright (`pnpm.cmd exec playwright test --config playwright.config.ts`, cwd `mobile`) | PASS — 11 tests after correcting stale signed-out profile expectations |
| `mobile` Expo web export (`pnpm.cmd exec expo export --platform web`, cwd `mobile`) | PASS — 29 static routes; local public API values supplied only in process memory |
| `git diff --check` | PASS after test/doc edits |

Warnings/limitations: pnpm emitted existing virtual-store/TTY warnings before scripts; scripts still ran.
Web Vitest emitted its existing Vite config-loader warning. Web Playwright logged a React hydration mismatch
in gallery rendering while all 9 assertions passed. Mobile Playwright screenshot checks rewrote tracked
baseline images; those generated changes were restored to the original clean-at-start baseline. No hosted
SMTP, hosted Supabase, native build, Maestro run, or authenticated mobile profile completion was performed.
Local Auth/Mailpit invite/recovery integration is historical evidence recorded in the checkpoint, not a test
rerun in this final verification.

## Owner inputs still required

- Later SMTP session: freshly rotated Hostinger password entered locally (never in chat), plus verified
  sender/DNS evidence and controlled external inbox addresses. SMTP is explicitly deferred now.
- Safe custom OTP → refreshable Supabase session support evidence from Supabase; this is the critical
  architecture blocker and is not an owner preference to reopen.
- Approved Terms/Privacy copy and stable version identifiers in English and Arabic.
- Google/Apple OAuth credentials, EAS access/build, Android SDK/Java/adb, Maestro and test devices.
- Turnstile site/secret credentials.
- Product/security contract for platform-admin team lifecycle actions (T208).

## Handoff and Git

The protected audit documents were not edited, staged, committed, or pushed. The only implementation test
change in this verification updates `mobile/tests/d02-profile-screens.spec.ts` so signed-out direct
`/profile/*` links assert the correct Welcome redirect instead of expecting protected content. The test
correction and this handoff were committed and pushed normally; local and remote `main` matched after push.
No SMTP secrets or hosted settings were included or changed.


## Continuation after owner responses ? 2026-10-27

- **Starting Git verification:** branch `main`; `HEAD`, `origin/main`, and `git ls-remote origin refs/heads/main` all reported `8cd65f92eb175a2d0848bb22f719c74352720010`.
- **Invitation callback correction:** the prior failure was caused by the default implicit-link/session-fragment flow landing in a Next.js SSR app configured for PKCE cookies. Added the server callback and changed the local invite template/function to use Supabase's single-use token hash through `verifyOtp({ type: "invite" })`. The authenticated test now requires the direct callback URL delivered by Mailpit, hides token values, validates acceptance through the local DB because the invitation ledger denies direct table reads, and passed 1/1. English and Arabic authenticated flows passed; invalid-token and reused-link browser attempts fail closed. An expired-token browser case and further negative/retry scenarios remain, so T210 remains partial and no task count changed.
- **Owner OTP decision:** ?Keep approved Option C blocked.? No switch to Supabase-owned OTP or unsupported session exchange is authorized; T120/T138/T139/T155/T194/T195/T213 stay blocked.
- **Retention proposal:** recorded in the owner decision register and the review-only Privacy Policy draft as a proposed engineering schedule pending Egyptian legal review. No hard-delete worker or automatic purge was activated. Access blocking remains partial pending future-resource inventory and cleanup safeguards.
- **Terms/Privacy drafts:** prepared EN/AR draft files with `terms-v1.0.0`, `privacy-v1.0.0`, and proposed effective date `2026-11-01`. The missing operator identity, contacts, controller roles, regulatory status, deployed providers/regions, age rules, and other owner/counsel facts are listed in `docs/legal/drafts/README.md`. Production completion remains fail-closed; T196/T204/T216 remain open.
- **Current D02 status:** 54/97 verified (55.67%); 65 checked, 32 unchecked; T216 FAIL; D03 BLOCKED / NOT STARTED; newly completed tasks: 0.
- **Verification from this continuation:** authenticated invitation Playwright passed 4/4; bilingual email-template Vitest passed 1 file/6 tests; web Vitest passed 8 files/33 tests; web TypeScript passed for the final combined change set. Deno unit tests unavailable. Hosted Supabase/SMTP and native tests not run.


### Invitation E2E follow-up ? 2026-10-27

The invitation callback now carries the inviter-selected `locale` (`en` or `ar`) through an allowlisted SSR callback. The authenticated local Playwright suite passed 4/4: English invitation acceptance, reused-link rejection in a fresh browser context, invalid token-hash fail-closed behavior, and Arabic RTL invitation acceptance. Both authenticated flows verified the role/membership path; the English flow also verified invitation-ledger acceptance and `/en/clinic` navigation. The test's exact callback URL is read from Mailpit and token values are never printed. `admin-create-staff` Deno unit tests could not run because Deno is unavailable. T210 remains partial pending expired-token browser coverage and any remaining acceptance criteria; no task was newly marked complete.
