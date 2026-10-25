# FUREVER — D02 IMPLEMENTATION HANDOFF PROMPT

This is a standalone prompt for a new agent session. You do not have access to any prior conversation
— everything you need is either in this document or in the repository it points to. Read this fully
before touching code.

---

## A. Project identity

- **Project**: FurEver — a pet-care platform for the Egyptian market.
- **Repository**: `H:\Projects\Furever` (local), remote `origin` →
  `https://github.com/Yousef-Abdallah-1711/furever.git`, branch `main`.
- **Architecture**: pnpm monorepo.
  - `mobile/` — Expo (SDK 57) + React Native 0.86.3 + Expo Router, NativeWind 4 for styling.
  - `web/` — Next.js 16 (App Router) + Tailwind CSS v4, `next-intl` for i18n/routing, `@base-ui/react`
    for accessible primitives (Dialog, etc.), `nuqs` for URL state.
  - `backend/` — Supabase (Postgres + Auth + Edge Functions + Storage).
  - `packages/design-tokens`, `packages/i18n`, `packages/shared` — shared across mobile/web.
  - Dev environment: Docker/Compose (`docker-compose.yml`, `scripts/stack-{up,down,reset}.ps1`).
- **This is a Spec Kit project.** Everything is driven from `specs/001-furever-platform/`.

## B. Authoritative documentation — read these, in this order

1. `docs/PRD.md` — the **real, amended PRD**. The repo also has a root-level placeholder PRD file
   (`FurEver — PRD (Mobile + Web Dashboard + Backend) (1).md`) — **do not use it**, it predates 10
   documented amendments and is kept only as the original source artifact.
2. `specs/001-furever-platform/tasks.md` — the task list. **D02's exact scope is lines 478-811**
   (`# Delivery Phase D02 — Auth and roles` through the line before `# Delivery Phase D03`). Read it
   directly; section F below summarizes it but is not a substitute.
3. `specs/001-furever-platform/spec.md`, `data-model.md`, `research.md`, `plan.md`, `quickstart.md` —
   feature spec, DB schema reference, open-question research notes, phased plan, and local setup.
4. `specs/001-furever-platform/implementation-log.md` — the full history of D00 and D01, including every
   real bug found by actually running things (not just reading code) and the house debugging style this
   project has established. **Read D01a through D01j at minimum** before writing any D02 code — they
   record several non-obvious, still-relevant gotchas (section H below pulls out the ones that matter
   most for D02, but the full entries have more context).
5. `design/screen-map.md` — which kit/pattern source each screen follows.
6. `design/system/components/**/*.d.ts` — the authoritative prop contracts for the 18 components D01
   ported. **The ported components already exist** at `mobile/src/components/` and
   `web/src/components/` (plus `web/src/components/dashboard/` for the 6 dashboard-shell pieces) — do
   not re-read the kits to rebuild these, they're done; just import and use them. See section D.

## C. Verified D00 status — COMPLETE (closed in a prior session, not this one)

Foundation: repo tooling, Supabase init, shared packages, design-token/i18n extraction, mobile+web app
shells, Docker/Compose dev stack, the amended PRD. **T074-T076 (GitHub Actions CI, deploy-skeleton
workflows, `renovate.json`) were formally descoped by owner decision** (recorded in T080's `tasks.md`
note and the D00g log entry) — do not reopen them without a new, explicit owner decision; this is not an
oversight.

## D. Verified D01 status — COMPLETE, VERIFIED, CLOSED (this session)

All 39 tasks (T081-T119) are done and independently re-verified by the orchestrator, not just
self-reported by whatever implementer built each piece. Full detail is in implementation-log.md's
D01a-D01j entries; summary:

- **28 shared components**, `mobile/src/components/*.tsx` + `web/src/components/*.tsx`:
  - 18 ported prop-for-prop from `design/system/components/{core,domain}/*.d.ts` (Avatar, Banner,
    Button, Card, Chip, EmptyState, Icon, IconButton, Input, PhaseTag, Rating, Skeleton, StatusBadge,
    ClinicCard, ConfirmSheet, PetCard, SlotChip, Stepper).
  - 10 built from the kits' inline usage patterns, no `.d.ts` existed for these (PhoneInput, OtpInput,
    SearchBar, Select, DateField, CategoryCard, DoctorCard, ListRow, Toast, ScreenHeader).
- **6 web-only dashboard-shell pieces**, `web/src/components/dashboard/*.tsx`: Sidebar, TopBar,
  DataTable (URL-backed pagination/sort via `nuqs`), Modal (built on `@base-ui/react/dialog`),
  RestrictedState, StatCard.
- **2 component galleries** (dev-only, for visual review): `mobile/app/_dev/gallery.tsx`;
  `web/src/app/[locale]/%5Fdev/gallery/page.tsx` — **note the `%5F` folder name**, not `_dev`: Next.js
  App Router treats a literal underscore-prefixed folder as excluded from routing entirely, so the real
  folder on disk is URL-encoded while the actual URL is still `/en/_dev/gallery` / `/ar/_dev/gallery`.
  If you ever add a sibling dev-only web route under this pattern, use the same `%5F` escape or it will
  404.
- **Prop-drift checker**: `scripts/check-component-props.ts` — compares the 18 `.d.ts`-backed
  components' real prop interfaces against both platform ports on every run. Currently passes clean (0
  violations). Run it after touching any of those 18 components.
- **Screenshot verification**: `mobile/tests/d01-gallery-screenshots.spec.ts`,
  `web/tests/d01-gallery-screenshots.spec.ts` — 8 PNGs under `design/screenshots/d01-gallery/`, all
  visually inspected, covering English/Arabic × light/dark for both galleries. Confirmed genuine RTL
  layout mirroring on web; mobile's RTL mirroring was **not** exercised (see the known-limitations note
  below — this is expected, not a bug).
- **Final commit for D01**: `94c2d82` (`docs(D01): close D01 under T119's final checkpoint - COMPLETE,
  VERIFIED`).

### Known limitations carried forward from D01 (none block D02, read before you hit them)

- **Mobile RTL mirroring is unverified by the D01 screenshot check.** PRD §12 documents that mobile RTL
  needs `I18nManager.allowRTL(true)` + `forceRTL(isArabic)` followed by a single `expo-updates` reload —
  a live Playwright session without a real reload can't exercise this. If D02 screens need RTL
  verification, it needs a real device/emulator pass, not a screenshot test extending the D01 pattern.
- Three Windows/Codex-sandbox environment quirks were worked around per-occurrence in D01, not
  root-caused: a `codex` PATH resolution issue (worked around with a `codex.cmd` shim — see your own
  Codex-delegation tooling setup, not this repo), a `pnpm exec tsx scripts/lint-design-tokens.ts` hang
  in this session's shell (worked around with direct `Grep`-based scans instead — if you hit this same
  hang, don't assume it's a real tooling break, just scan manually and move on), and `next dev`'s SWC
  native binding failing to initialize inside a Codex `workspace-write` sandbox specifically (cache-ACL
  validation rejects the sandbox's own temp directories as having an "untrusted owner SID") — if a
  Codex-delegated task needs to actually run `next dev`/`next build`/Playwright against the web app, run
  that part directly yourself rather than trusting the sandboxed attempt; `tsc --noEmit` directly (not
  via `next typegen`) is a reliable sandbox-safe typecheck workaround if that's all you need.
- `Rating`'s filled/unfilled stars differ only by stroke color, not a solid-vs-outline icon (Lucide's
  `star` icon has no filled variant) — a deliberate D01 design choice, not a defect.

## E. Current git state (verify this yourself before trusting it — it will be stale the moment anyone
commits again)

- Branch: `main`. HEAD at the time this handoff was written: `94c2d82`.
- Remote: `origin` → `https://github.com/Yousef-Abdallah-1711/furever.git`, tracking `origin/main`.
- **Push status: BLOCKED, not resolved.** `git push origin main` failed with a 403 — the active `gh`
  CLI account (`yousefabdallah171`) does not have push permission to this repo; a second authenticated
  account (`Yousef-Abdallah-1711`, inactive) matches the repo owner and almost certainly has the right
  permissions, but switching the active `gh` account was blocked by this environment's own permission
  classifier as a credential-related action requiring explicit user authorization — it was not
  attempted further. **As of this handoff, all 60 local commits (the entirety of D00 and D01) remain
  unpushed to `origin/main`.** Before starting any D02 work that depends on CI, a shared remote, or
  collaboration, resolve this first: either have the repo owner run `gh auth switch --hostname
  github.com --user Yousef-Abdallah-1711` themselves (or otherwise fix which credentials `git push` uses)
  and push the 60 commits, or get explicit confirmation from the owner to do it yourself. Don't silently
  work around a credential/auth denial.
- Working tree: clean as of `94c2d82` (verify with `git status` — this is a point-in-time fact, not a
  promise).

## F. D02 scope — read `tasks.md` lines 478-811 yourself; this is a summary, not a substitute

**Phase title**: "Auth and roles." **97 tasks, T120-T216.**

**Manual prerequisites that block the phase** (per `tasks.md`'s own header note): an Expo/EAS dev build;
Google OAuth clients; Apple Developer + Sign In With Apple; and — replacing Twilio entirely, per the
2026-10-18 sign-in method change — **an SMTP provider account with a verified sending domain
(SPF/DKIM/DMARC live)**, since sign-in now runs on email codes and nothing can be tested end-to-end
without real email delivery. Push credentials (FCM/APNs) don't block D02 itself but block D04's push
registration from doing anything real.

**Rough shape of the 97 tasks, in the order `tasks.md` presents them** (dependency order mostly follows
this, but confirm from the file, don't assume):

1. **Guard-bypass spike (T120-T122)** — run first, see section G below. Shapes T138-T141.
2. **Migrations, FK-safe order (T123-T134)** — `cities` → `profiles` → `clinics` (slim, D05 extends it
   later) → `clinic_staff` → `push_tokens`/`consents` → `audit_logs` → `write_audit_log()` helper →
   `feature_flags`/`app_config` (both with audit triggers attached in the same migration) → revoke
   direct `clinics.status` updates → `otp_attempts` (keyed by normalized email, not phone).
3. **Role claim, OTP guard, Edge Functions (T135-T146)** — `custom_access_token_hook` role injection;
   `record_otp_attempt`/`get_otp_lock_status` RPCs; **T138 hardens the direct-Auth path per T120's spike
   finding and the owner's chosen mitigation — if that owner decision is still pending when you reach
   T138, stop and escalate, don't build T139 (`verify-otp-guard`) on a guard the direct path can
   bypass**; several Edge Functions (`admin-create-staff`, `admin-set-user-status`, `delete-account`,
   `export-my-data`, `app-config`); SMTP + login-code email template config.
4. **Google and Apple sign-in (T147-T151)** — both require an EAS dev build (T184), not Expo Go, since
   they're native modules. Exact library calls, nonce handling for Apple, and config plugin wiring are
   all specified task-by-task in `tasks.md` — follow it precisely, the sequencing (raw vs. hashed nonce,
   which client ID Android uses) is easy to get subtly wrong.
5. **Email templates (T152-T153)** — 3 bilingual templates (login code, staff invite, password reset),
   Arabic marked draft pending native review.
6. **Local email inbox test helper (T154)** and **send-throttle test (T155)**.
7. **pgTAP coverage (T156-T163)** — role/audit/RLS policy tests.
8. **Supabase clients (T164-T169)** — mobile encrypted session storage, web `@supabase/ssr`, web
   middleware session refresh + `aal2` enforcement on every `/admin` route, React Query providers
   (mobile gets offline cache persistence here too).
9. **Offline infrastructure (T170-T172)** — `useNetworkStatus`, `OfflineBanner` (composed from D01's
   already-built `Banner` component — reuse it, don't rebuild), a `useOfflineGuardedAction` hook.
10. **Route guards, onboarding orchestration, shells (T173-T178)**.
11. **Account linking (T179-T181)** — gated on T121/T122's Manual Linking finding.
12. **Smaller items (T182-T186)** — Turnstile on web login/forgot-password, a maintenance banner, the
    first EAS dev build, PostHog events, a CI-gate script for policy-test coverage.
13. **Shared schemas, i18n, test tooling (T187-T189)**.
14. **Screens — 23 counted + 3 infrastructure (T190-T212)** — mobile: Splash, Language, Onboarding,
    Welcome, Sign in, Verify code, Complete profile, Setup Summary, Profile + its sub-screens, legal
    pages, force-update, maintenance; web: `/login` + `/mfa`, admin Team/Settings, `/accept-invite`,
    `/forgot-password`, `/no-access`.
15. **E2E/unit (T213-T216)** — Maestro and Playwright suites, closing with **T216's checkpoint**: full
    AUTH-01→04 flow on a real dev build with a real email code, admin MFA + `aal2` gate, suspended-user
    rejection, force-update/maintenance reachability, audit logging, policy-coverage check, and the 3
    email templates rendering correctly — all in 4 locale/theme combinations. **This is D02's gate for
    D03.**

## G. Authentication — read this before writing any auth code

The sign-in method changed from phone+SMS to **email + 6-digit code** on 2026-10-18 — this is already
reflected throughout `tasks.md`/`spec.md`/`research.md`, but if you find anything in the repo still
referencing phone-based OTP or Twilio outside of an explicitly-marked historical note, treat it as stale,
not authoritative.

**Two explicitly unresolved decisions — do not silently resolve either of these, they are the owner's
call:**

1. **Is the email-code lockout bypassable?** `research.md` has a section "Is the email-code guard
   bypassable?" — the open question is whether calling Supabase Auth's public
   `signInWithOtp`/`verifyOtp` endpoints directly (with just the anon key) lets an attacker skip
   `verify-otp-guard`'s 5-wrong-attempt/3-cancelled-code lockout entirely. **T120 is a spike task whose
   entire job is to actually test this and record the finding** — don't assume an answer, run the spike.
   T120 also evaluates two possible mitigations (Option A+: CAPTCHA on the Auth endpoints from a React
   Native client, or a longer OTP length) without choosing between them — that choice belongs to T138,
   which requires an owner decision on which mitigation (A/A+/B/C, as laid out in `research.md`) to
   implement. **If you reach T138 and that owner decision hasn't been made, stop and escalate rather
   than building T139's `verify-otp-guard` on a guard the direct path can still bypass.**
2. **Egyptian phone format vs. E.164** (carried from D00g, still unresolved): `spec.md` describes an
   Egyptian phone-number format (10 digits, leading 0, starting 10/11/12/15) for the *optional* profile
   phone field, but the already-implemented `packages/shared/src/schemas/base.ts`'s `phoneSchema`
   implements generic E.164 (`^\+[1-9][0-9]{7,14}$`) instead — this predates the sign-in method change
   and was never reconciled. `docs/PRD.md`'s constraints section records this as an open contradiction,
   not a resolved one. **T187** (auth/profile Zod schemas) and the Complete Profile screen (T196) both
   touch the phone field — resolve this with the owner before either locks in one format.

## H. Complete Profile and onboarding

The onboarding flow changed shape with the sign-in method change: pet creation is now part of first-run
onboarding (Language→Onboarding→Welcome→**Email**→Verify→Profile→pet steps→Permissions→Summary→Home for
new users), not a separate later flow. T196 (Complete Profile) needs the phone field made **optional**
(design change from the original kit, which had it required) — see `design/overrides.md` for the exact
screen-level change list; it's the authoritative record of every design deviation from the raw kit
prototypes across D02's screens (T193-T201 all reference it). Read `design/overrides.md` before building
any of those screens — don't rebuild from the raw kit files and rediscover these deviations yourself.

## I. Architecture and implementation guidance

- **Mobile code**: `mobile/app/` for Expo Router routes, `mobile/src/` for everything else
  (`components/`, `hooks/`, `lib/`, `features/`, `i18n/`). D02 adds a new `mobile/src/features/`
  subtree (`auth/`, `account/`, `onboarding/`) per `tasks.md`'s file paths — follow those paths exactly,
  they're specified task-by-task.
- **Web code**: `web/src/app/[locale]/...` for every route (this app is locale-prefixed everywhere,
  `defaultLocale: 'en'`, always-prefixed strategy — confirmed in `web/src/i18n/routing.ts`). Route
  groups like `(auth)`/`(admin)` are already used (see the existing `(auth)/login` directory) — D02's
  new web screens follow the same convention, exact paths given in `tasks.md`.
- **Backend code**: `backend/supabase/migrations/` (timestamped SQL files — this project's constitution
  requires migrations-only schema changes, reviewed in a PR, no dashboard edits in production),
  `backend/supabase/functions/` for Edge Functions, `backend/supabase/templates/` for email templates.
- **Shared packages**: `packages/shared/src/schemas/` (Zod, shared between mobile/web/Edge Functions —
  this is where the phone-format decision from section G lands), `packages/i18n/{en,en}.json` (CI fails
  if the two files have different key sets — run `pnpm i18n:check` after adding any new key),
  `packages/design-tokens` (already built, D01 consumed it — you shouldn't need to touch it for D02
  unless a genuinely new token is needed).
- **Design system consumption**: every ported D01 component is ready to use — import from
  `mobile/src/components/<Name>` / `web/src/components/<Name>` (or `.../dashboard/<Name>` for the 6
  dashboard-shell pieces). **Do not rebuild or duplicate any of these.** If a D02 screen needs something
  D01 didn't build, check the `.d.ts` files and the kits first for an existing pattern before inventing
  a new one, same discipline D01 used.
- **Design-token rule**: never a raw hex color or raw px value in application code — always the token
  classNames. `scripts/lint-design-tokens.ts` enforces this (though note the hang issue in section D —
  use direct `Grep` scans as a fallback if the script hangs in your shell too).
- **RTL discipline**: logical Tailwind classes only (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`), never
  `left`/`right` for layout, on both platforms. D01's components all follow this — match it.
- **Mobile `style`-prop gotcha** (hit repeatedly in D01, read `mobile/src/lib/resolveTokenColor.ts`):
  React Native's `style` prop is never run through NativeWind's className compiler. Never pass
  `'var(--x)'` or `'currentColor'` as a literal `style.color` on mobile — use the existing
  `useTokenColor(name)` hook instead, which resolves a token name to a real hex for the active theme.
  This restriction is mobile-only; it's fine on web.

## J. Testing and verification — commands and lessons from D00/D01

**Gate commands** (confirm these are still accurate by checking `package.json` yourself — they were
correct as of D01's close):
```
pnpm --filter mobile typecheck   # tsc --noEmit
pnpm --filter web typecheck      # next typegen && tsc --noEmit (see the SWC sandbox note above)
pnpm --filter mobile lint        # expo lint
pnpm --filter web lint           # eslint
pnpm --filter mobile test        # jest --runInBand
pnpm --filter web test           # vitest run
pnpm exec playwright test        # run from inside mobile/ or web/ respectively
pnpm i18n:check                  # packages/i18n key-parity check
pnpm exec tsx scripts/check-component-props.ts   # D01's prop-drift checker
```

**Lessons from D00/D01, carried forward:**

- **Run things for real, don't trust a static read.** Nearly every real bug found in D00 and D01 was
  found by actually running the app/tests/scripts and reading the output, not by reading the code. This
  is this project's established house style — match it.
- **Don't trust a delegated implementer's self-report, verify independently.** D01 caught multiple cases
  where a Codex dispatch's own "this passed" or "this failed" summary was simply wrong (sometimes
  optimistic, sometimes — a prop-drift checker reporting 32 false-positive violations — pessimistic
  about the *target* code when the bug was actually in the *checker*). Re-run the actual gate commands
  yourself before accepting any completion claim.
- **Never a non-ASCII character in a `.ps1` file** — breaks Windows PowerShell 5.1's parser
  unpredictably.
- **Never pipe a native CLI's stderr through `2>&1` in a `.ps1` under `$ErrorActionPreference = "Stop"`**
  — PowerShell 5.1 wraps every stderr line in a terminating error even on exit code 0.
- **Test against a genuinely fresh clone before calling anything done** — D00's T079 and D01's dist-
  staleness findings (section D) were both caught this way; local dev-machine state (an existing `dist/`,
  an existing `.env.local`) can mask real bugs that only show up from zero.
- **This is a shared dev machine.** Check `docker ps` before assuming a port is free (3000 was already
  taken by another project; this repo's web dev container publishes on 3010, and the Playwright test
  port for web is 3100 — both already configured, don't reassign them). Never touch containers that
  aren't yours.
- A mojibake/encoding corruption class of bug recurred **four times** across D01 (always on a non-ASCII
  character — a middle dot `·` — written through a Codex dispatch on this Windows machine, always coming
  back as the Unicode replacement character). If any D02 copy needs a non-ASCII character, check the
  actual bytes after any delegated implementation touches it (`codePointAt` or a `\uFFFD` grep), don't
  assume it round-tripped correctly.

## K. Required delegation workflow

This repo's `implementation-log.md` documents a standing delegation model: the orchestrator (you) writes
briefs and reviews diffs; an implementer (OpenAI Codex CLI via the `codex-delegate` skill, or whatever
equivalent tool your environment provides) does the typing. **D01 used this model for all of D01e
onward** (the owner explicitly chose to restore it after D00's passes deviated from it) — continue it
for D02 unless the owner tells you otherwise. Concretely:

1. Read `tasks.md`'s full D02 section and `implementation-log.md`'s D01 entries (both already listed
   above) before writing or delegating anything.
2. Inspect the actual repository state — don't trust this handoff's git-state snapshot (section E) once
   any time has passed; re-run `git status`/`git log` yourself.
3. Identify unresolved owner decisions (section G has the two known ones; there may be more once you're
   actually inside D02's tasks) and surface them rather than silently picking an answer.
4. Produce a concrete D02 implementation plan — at minimum, confirm the migration order (section F.2),
   confirm which manual prerequisites are actually available (section F's header note) before starting
   any task that depends on them, and decide your own batching/sequencing for delegation.
5. Delegate implementation work through your delegation tool, one bounded task (or a small disjoint
   batch) per dispatch. D01 found that 3-way concurrent Codex dispatch against the same working tree was
   measurably less reliable on this machine than 2-way — default to 2-way parallelism, not 3, unless
   you've independently confirmed 3-way is stable in your own session.
6. Review every diff yourself before accepting it — read the actual code change, re-run the real gate
   commands, don't accept a "this passed" summary at face value.
7. Fix small, well-understood issues you find during review directly rather than round-tripping through
   another dispatch (D01's convention); delegate anything that's a real implementation task, not a
   one-line fix you already fully understand.
8. Update `tasks.md` checkboxes only after you've personally verified a task, not when a delegate claims
   it's done.
9. Commit in logical groups with conventional commit messages matching this repo's established style
   (`feat(D02): ...`, `fix(D02): ...`, `test(D02): ...`, `docs(D02): ...`) — check `git log` for the
   exact pattern already in use.
10. Update `implementation-log.md` as you go, matching the documentation density already established in
    the D00/D01 entries — they're thorough because that thoroughness already caught real bugs; don't
    thin it out for D02.

## L. First action for the new agent

Start by reading the complete D02 task section (`specs/001-furever-platform/tasks.md` lines 478-811)
and its dependencies, inspect the repository state (including resolving or at least re-confirming the
blocked git push from section E), identify unresolved owner decisions (section G at minimum), and
present a detailed D02 implementation plan before writing any code.
