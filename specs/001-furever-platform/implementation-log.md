# Implementation Log — FurEver Platform (specs/001-furever-platform)

## D00c — Packages: tokens, i18n, shared, test runners

| Task | Worker | Retries | Commands run | Result | Commit |
| --- | --- | --- | --- | --- | --- |
| T024 | codex | 1 | `pnpm.cmd --filter backend exec supabase start`; `pnpm.cmd types:gen`; `pnpm.cmd --filter backend exec supabase stop`; `pnpm.cmd exec tsc --noEmit -p packages/shared/tsconfig.json`; raw-byte and `git diff --check` checks | PASS — local types generated from the running Supabase stack; strict package typecheck passed. Initial typecheck exposed missing Node declarations; added the exact typed-script dependency and enabled Node types only for shared. | 05d44a9 |
| T025 | codex | 0 | `pnpm.cmd exec vitest run packages/shared/src/schemas/base.test.ts`; `pnpm.cmd exec tsc --noEmit -p packages/shared/tsconfig.json`; raw-byte and `git diff --check` checks | PASS — 1 test file, 2 tests passed; shared package typecheck passed. | 4c28c75 |
| T026 | codex | 0 | `pnpm.cmd i18n:check -- .tmp-i18n-fixture` (mismatch reports both missing keys, exit 1); corrected fixture and reran command (keys match, exit 0); removed fixture; raw-byte and `git diff --check` checks | PASS — mismatch names each missing key; matching dictionaries pass. | 2a29d5c |
| T027 | codex | 0 | `pnpm.cmd i18n:check`; raw-byte and `git diff --check` checks | PASS — the actual `en.json` and `ar.json` dictionaries match with one placeholder key. | aebf3fd |
| T028 | codex | 1 | `pnpm.cmd exec vitest run packages/design-tokens/scripts/build.test.ts`; `pnpm.cmd exec biome check packages/design-tokens/scripts/build.ts packages/design-tokens/scripts/build.test.ts`; independent Python 3.11.9 OKLab reference calculation; raw-byte and `git diff --check` checks | PASS — seven color mixes in each theme match independent expected hex values; Biome passes after formatting fix. Includes the two non-variable component mixes from `components.css`. | 11d4d97 |
| T029 | codex | 1 | `pnpm.cmd tokens:build`; `pnpm.cmd exec vitest run packages/design-tokens/scripts/build.test.ts`; `pnpm.cmd exec biome check packages/design-tokens/scripts/build.ts packages/design-tokens/scripts/build.test.ts package.json packages/design-tokens/package.json`; generated-output inspection and raw-byte checks | PASS — generated `variables.css` and `tailwind-preset.js`; both contain all resolved themes, the 7 static color-mix results, and the light/dark shadow values. Generated CSS contains no `color-mix()`. | 1ec1610 |
| T030 | codex | 1 | `pnpm.cmd exec vitest run packages/design-tokens/scripts/build.test.ts -u`; `pnpm.cmd exec vitest run packages/design-tokens/scripts/build.test.ts`; `pnpm.cmd exec biome check packages/design-tokens/scripts/build.test.ts packages/design-tokens/scripts/build.ts`; raw-byte and `git diff --check` checks | PASS — 2 tests passed; committed snapshot records all seven mix results and both shadow values in light and dark generated CSS. | f3119fc |
| T031 | codex | 1 | `pnpm.cmd vitest run`; `pnpm.cmd exec biome check --write` on the 14 changed package/config files; raw-byte and `git diff --check` checks | PASS — 6 test files and 8 tests passed across web and all three `packages/*` workspaces. CJS config exports removed Vite loader warnings. | 51af739 |
| T032 | codex | 1 | `pnpm.cmd --filter mobile test`; `pnpm.cmd exec biome check mobile/package.json mobile/jest.config.js mobile/__tests__/workspace.test.js COMPATIBILITY.md`; `node --check mobile/jest.config.js`; raw-byte and `git diff --check` checks | PASS — 1 suite and 1 test passed. First Jest invocation produced no result within 30 seconds; `--runInBand` was added and the exact package test command then passed in 2.3 seconds. | e27ca37 |
| T033 | codex | 0 | `pnpm.cmd --filter backend exec supabase start` (exit 0; output filtered to avoid printing local generated keys); `pnpm.cmd types:gen`; `pnpm.cmd --filter backend exec supabase stop`; broken-copy `pnpm.cmd i18n:check -- .tmp-i18n-checkpoint` (exit 1, names `common.appName`); `pnpm.cmd tokens:build`; `pnpm.cmd i18n:check`; `pnpm.cmd vitest run`; `pnpm.cmd --filter mobile test`; `pnpm.cmd exec tsc --noEmit -p packages/shared/tsconfig.json`; raw-byte and `git diff --check` checks | PASS — all checkpoint commands passed; temporary parity fixture failed as intended and was removed. Root Vitest: 6 files/8 tests passed; mobile Jest: 1 suite/1 test passed. Local Supabase stopped. | db664d4 |
| T034 | codex | 2 | `pnpm.cmd exec biome check design/scripts/extract-built.ts`; `pnpm.cmd exec tsx design/scripts/extract-built.ts`; raw-byte and `git diff --check` checks | PASS — 44 Phase 1 Built records, including `/onboarding/summary` from the `mobile-entry` kit because the inventory omits it, and one `/login` record listing `/mfa` as an additional route. Phase 2-4 Built rows were skipped per the user's Phase 1-only scope. Follow-up audit corrected seven entry-flow screens to use dedicated `mobile-entry` prototype components; see handoff table. | 8133c56, fe457c2, 59fe39e |
| T035 | codex | 1 | `pnpm.cmd exec biome check design/scripts/extract-spec-stubs.ts`; `pnpm.cmd exec tsx design/scripts/extract-spec-stubs.ts`; raw-byte checks across `design/screens`; pattern-link validation; `git diff --check` | PASS — generated 26 Spec stubs, one per Phase 1 Spec row. Screen files now total 70: 44 Built and 26 Spec; all pattern links resolve. Multi-route rows remain one screen record with additional routes listed. | 5440e4c |
| T036 | codex | 0 | `pnpm.cmd exec biome check design/scripts/build-screen-map.ts`; `pnpm.cmd exec tsx design/scripts/build-screen-map.ts`; verified 70 data rows and dynamically read D02–D07 phase labels; `git diff --check` | PASS — generated a linked 70-row screen map with delivery phases parsed from `plan.md`'s Coverage Table. | d148eac |
| T037 | codex | 0 | `pnpm.cmd exec biome check design/scripts/extract-i18n.ts design/scripts/extract-i18n.test.ts`; `pnpm.cmd exec tsx design/scripts/extract-i18n.test.ts`; `pnpm.cmd exec tsx design/scripts/extract-i18n.ts`; `pnpm.cmd i18n:check`; JSON key-set comparison against `71e1aaa`; raw-byte and `git diff --check` checks | PASS ? merge-safe extractor retains hand-added and older keys; its check confirms `screens.app.testKey` and draft entries survive a rerun. Extracted 553 keys from 44 Built screens; en/ar/draft key sets each gained 75 and removed 0; parity reports 591 keys. Welcome tagline, email field label, and email-era overrides are sourced from `design/overrides.md`. One dynamic `t()` call is recorded under Doc changes needed. | 71e1aaa, 0b16ddc |
| T038 | codex | 0 | `pnpm.cmd exec biome check design/scripts/verify-screen-count.ts`; `pnpm.cmd exec tsx design/scripts/verify-screen-count.ts`; raw-byte and `git diff --check` checks | PASS — plan-driven screen count matched: 70/70. The script reads the mapped total from the Coverage Table heading; it has no hardcoded count. | 966558e |
| T039 | codex | 0 | `pnpm.cmd exec biome check` on six D00d scripts; `pnpm.cmd exec tsx design/scripts/extract-i18n.test.ts`; reran Built and Spec extractors, screen-map builder, i18n extractor, screen-count verifier, and `pnpm.cmd i18n:check`; `git diff --check` | PASS ? hand-added key survives merge check; 44 Built records and 26 Spec stubs regenerated; map and Coverage Table matched 70/70; i18n parity passed with 591 total keys; one dynamic `t()` call reported. Working tree clean after regeneration. | 249e17b (rerun after 59fe39e and 0b16ddc) |

**Dependency rationale (T024)**: `tsx@4.23.15` runs the required TypeScript generator scripts without compiling them to JavaScript; `@types/node@26.6.5` supplies strict Node APIs for that script. Both versions were checked from the npm registry on 2026-10-19 and are pinned in `COMPATIBILITY.md`.
**Dependency rationale (T025)**: `vitest@5.0.5` runs the required shared-package unit test and will be configured for every web/package workspace in T031; its version was checked from the npm registry on 2026-10-19 and is pinned in `COMPATIBILITY.md`.
**Dependency rationale (T032)**: `jest-expo@58.0.11` supplies the Jest preset for the Expo SDK 58 mobile workspace; `jest@30.5.2` is its compatible test runner CLI. Both versions were checked from npm registry metadata on 2026-10-19 and pinned in `COMPATIBILITY.md`.

Delegation model: OpenAI Codex CLI (`gpt-6-luna`, effort `high`, service_tier `priority` via ambient
`~/.codex/config.toml`), orchestrated through the `codex-delegate` skill (`relay.mjs`). The orchestrator
(Claude Code) never writes implementation code — it writes briefs, dispatches, reviews diffs, re-runs
gates, and commits.

Columns: Task ID | Worker | Retries | Commands run (orchestrator's own re-verification) | Result | Commit

## Doc changes needed

- **plan.md Project Structure vs. T060 (D00e)**: plan.md's target tree lists only
  `design/system/{tokens,components,ui_kits,guidelines}` (matching T011's own task text exactly), but
  T060 references `design/system/_adherence.oxlintrc.json` — a root-level file in the SOURCE folder
  (`FurEver Design System/_adherence.oxlintrc.json`), not under any of those four subdirectories. T011
  (this pass) copies only the four subdirs it's asked for, per its own text — the original
  `FurEver Design System/` folder is left in place (T011 never says to delete/move the source), so
  tasks that read straight from the original root path (e.g. T034 reads
  `FurEver Design System/guidelines/screen-inventory.md` directly) are unaffected. **Action needed when
  D00e/T060 is reached**: either copy `_adherence.oxlintrc.json` into `design/system/` at that point, or
  change T060's lint rule to read it from the original `FurEver Design System/` path instead. Not
  blocking now; flagged for whoever picks up D00e.
- **D00d source-map documentation**: the inventory groups entry-flow screens under `ui_kits/mobile`, but the entry prototype notes and `mobile-entry/e-app.babel` map the dedicated Language, Slides, Welcome, Phone, OTP, Profile, Permissions, and Summary components to that flow. T034 now points the eight routes at those `mobile-entry` components; update the inventory source attribution in a future documentation pass.
- **D00d dynamic translation**: one `t()` call in the Built Profile component for `/complete-profile` is dynamic and was not statically extracted: `t('Name filled from your '+st.social+' account. City is still required.','????? ?????? ?? ???? '+st.social+'. ??? ???? ????? ???????.')`. Add a stable key and interpolation by hand in the later screen implementation/i18n task.
- **D00d screen inventory gap**: `spec.md`'s Phase 1 Coverage Table includes `/onboarding/summary` as Built, but `FurEver Design System/guidelines/screen-inventory.md` has no row for that route. T034 includes it from the `mobile-entry` Summary component so the generated map can cover all planned screens. Add the missing row to the design inventory in a future documentation update; no source spec/design file was changed in D00d.

## Risks and follow-ups

- **(a) Expo SDK 58 / React Native 0.88.0-rc.0 / NativeWind SDK-57-only / unmet metro-config peer**:
  Expo SDK 58 is paired with React Native 0.88.0-rc.0, and NativeWind 4.2.7 is documented only for SDK
  57; `pnpm install` reported an unmet peer (`@react-native/metro-config` rc.0 vs found 0.88.0). At
  T040/T041 (D00e), first scaffold a minimal app and run a smoke test of NativeWind with the generated
  token preset BEFORE building anything else. If it fails, stop and ask the owner; the fallback is
  Expo SDK 57.
- **(b) .nvmrc vs. dev-machine Node version**: `.nvmrc` says `22.13.0` but the dev machine that ran
  D00a's tasks runs Node 24.16 (confirmed: `node --version` → v24.16.0). CI and Docker must use the
  `.nvmrc` version, not whatever's ambient on a given machine.
- **(c) T002's version strings are not all exact semver**: T002 asked for exact versions, but
  `web/package.json` has `"next": "16.4"`, `"react": "19.3"` (no patch component) and `mobile`'s
  `package.json` has `"expo": "^58.0.0"` (a caret range, not an exact pin) because `COMPATIBILITY.md`
  itself only states those forms. Convert to fully exact versions when the apps are actually scaffolded
  in D00e, once `expo install`/`create-next-app`-equivalent tooling resolves the real patch versions.
- **(d) Duplicated sources, cleanup deferred**: `FurEver Design System/` (original) vs. `design/system/`
  (T011's ported copy of 4 subdirs), and the root-level PRD vs. `docs/PRD.md` (T010's placeholder copy).
  Decide the cleanup (delete the originals? keep both permanently?) after T034 (design extraction, reads
  the original path directly) and T078 (amended PRD replaces the `docs/PRD.md` placeholder). **Do not
  delete anything now.**

## Gap-fills (not numbered in tasks.md)

| Gap-fill | Worker | Retries | Commands run | Result | Commit |
| --- | --- | --- | --- | --- | --- |
| .gitignore (D00a) | codex (gpt-6-luna, effort high) | 0 | `git check-ignore -v`; raw-byte check | PASS | 3c3fcec |
| G2 (root tooling) | codex (gpt-6-luna, effort high) for research/scripts/COMPATIBILITY.md; orchestrator (direct) for the actual installs | 2 (both exhausted, then owner-approved orchestrator fallback) | `pnpm exec {biome,turbo,tsc,commitlint,lint-staged} --version`; `pnpm exec biome check biome.json package.json`; `echo <msg> \| pnpm exec commitlint` for one invalid-type message (rejected, exit 1), one empty-type message (rejected, exit 1), and one valid message (accepted, exit 0); confirmed biome.json's `$schema` already matches the installed 2.5.15 (no change needed); `git diff --stat pnpm-lock.yaml` (986 insertions) | PASS, after an infrastructure blocker (below) | 44b7274 |
| G3 (Supabase CLI) | codex (gpt-6-luna, effort high, read-only) for version research only; orchestrator (direct) for the install, applying G2's resolution proactively | 0 | `pnpm --filter backend exec supabase --version` → `2.121.0`; raw-byte check on backend/package.json | PASS | (pending) |

**G2 retry history**: attempt 0 (Codex, workspace-write sandbox) correctly researched all 7 exact
versions and wrote `COMPATIBILITY.md`'s Tooling section + root `package.json` scripts, but every
`pnpm add -D` failed with `EACCES` against the npm registry — nothing installed. Retry 1 (same
session, diagnosing the EACCES) found a store-path mismatch, worked around it with a project-local
`.npmrc` (`store-dir`/`cache-dir` inside the repo), but installs still failed with
`ERR_PNPM_META_FETCH_FAIL` against `registry.npmjs.org` — a different symptom of the same root cause.
Diagnosis: Codex's own web-fetch tool calls (used successfully for T001's and this task's version
research) reach the internet fine, but raw shell-level network sockets opened by a subprocess (pnpm)
inside Codex's sandbox do not — the same split observed independently in the orchestrator's own
environment (WebFetch worked against biomejs.dev; raw `curl` via Bash did not). A second retry with
`--sandbox danger-full-access` (a documented relay.mjs option for exactly this class of problem, not an
approval bypass) was blocked by the orchestrator's own tool-permission classifier ("Create Unsafe
Agents") before it could even run. Per the "stop and report, don't guess" rule, this was presented to
the owner rather than worked around silently; **owner decision**: the orchestrator runs the install
directly (same mechanism as T012's `pnpm install` checkpoint, which already proved this environment's
own shell has working registry access). Cleaned up the dead `.npmrc`/`.pnpm-store` left by the blocked
retry, reinstalled cleanly, then ran `pnpm add -D -w <7 pins> --save-exact` directly — succeeded in
25.2s with the same one pre-existing peer-dependency warning as T012 (RN 0.88-rc vs. metro-config
0.88.0 — Risk (a), unrelated to this task).

**G3**: applied G2's resolution proactively instead of re-hitting the same wall — delegated only the
version research (read-only Codex dispatch, confirmed `2.121.0` is current stable from
github.com/supabase/cli/releases/latest, and that Supabase's own docs recommend a project
devDependency install over global npm install), then ran `pnpm --filter backend add -D
supabase@2.121.0 --save-exact` directly. Docker Desktop confirmed running (`docker info` exit 0)
before proceeding, per the task's own prerequisite.

## D00b — Backend init and CI RLS check

**Standing infrastructure note (affects every task below)**: Codex's sandboxed subprocess execution
cannot spawn the `supabase` CLI successfully on this Windows machine (`Failed to create parent
directories for backend\supabase\.gitkeep`) — the same restricted-token pattern already seen with
`pnpm add`'s registry fetch (G2). Codex's own file-write and web-fetch tool calls work fine; it's
specifically subprocess-spawned CLI binaries that fail. **Resolution applied for all of D00b**: the
orchestrator runs every CLI-invoking command directly (`supabase init`, `supabase migration new`,
`supabase start`/`test db`/`stop`), then delegates the actual file-content authoring (editing
config.toml, writing migration SQL, writing test SQL) to Codex against the real files the CLI created.

| Task | Worker | Retries | Commands run | Result | Commit |
| --- | --- | --- | --- | --- | --- |
| T013 | orchestrator (`supabase init`, direct) + codex (gpt-6-luna, effort high) for content review | 0 | Re-read config.toml; `grep` for `[local_smtp]`, `[auth.sms]`, `[auth.sms.twilio]`, and a secret-pattern scan (orchestrator, independent of Codex's report); raw-byte BOM/CRLF check | PASS — the CLI-generated config.toml already satisfied every requirement (local email inbox via `[local_smtp]` enabled by default in Supabase CLI 2.121.0 — note this is a NEWER section name than `[inbucket]`, which official docs still reference; SMS/Twilio already disabled by default; no real secrets, only `env(...)` references); no edit was needed | (pending) |

**D02 follow-up, noted by T013's review**: `config.toml` has no equivalent for this project's real OTP
lockout rules (5 wrong attempts cancels a code; 3 cancellations in 60 minutes locks the email 15
minutes; per-email/per-IP throttling; no-enumeration). Confirmed already correctly deferred to D02's
`verify-otp-guard` Edge Function + `otp_attempts` table (research.md §3) — not a gap, just re-confirmed.

| T014 | orchestrator (`supabase migration new`, direct) + codex (gpt-6-luna, effort high) for SQL content | 0 | Raw-byte BOM/CRLF check; full content re-read; schema choice (`WITH SCHEMA extensions`) cross-checked against Codex's cited Supabase docs | PASS | (pending) |
| T015 | orchestrator (CLI) + codex (gpt-6-luna, effort high) | 0 | Raw-byte check; reviewed `now()` vs. `timezone('utc', now())` reasoning (correct: `timestamptz` already stores an absolute instant; `timezone('utc', now())` would wrongly produce a timestamp *without* time zone) | PASS | (pending) |
| T016 | orchestrator (CLI) + codex (gpt-6-luna, effort high) | 0 | Raw-byte check; **independently re-fetched** supabase.com/docs/guides/auth/auth-hooks myself and confirmed the GRANT/REVOKE statements match Supabase's own documented pattern exactly (grant usage+execute to `supabase_auth_admin`, revoke execute from `authenticated, anon, public`) | PASS | (pending) |
| T017 | codex (gpt-6-luna, effort high) | 0 | Raw-byte check; confirmed only comments, no SQL statements | PASS | (pending) |
| T018 | codex (gpt-6-luna, effort high) | 0 | Raw-byte check; structural SQL review (reusable `tables_missing_rls()` function pgTAP can call directly, plus a standalone `DO` block raising on violation for CI) | PASS, real-database proof deferred to T023's checkpoint | (pending) |
| T019 | codex (gpt-6-luna, effort high) | 0 (content), see T023 for the real-execution retries | Raw-byte check; content re-read | PASS as written, but see T023 — real execution found 3 structural bugs this static review couldn't catch, all fixed before T023 passed | c209033 (original), superseded by T023's commit |
| T020 | codex (gpt-6-luna, effort high) | 0 (content), see T023 | Raw-byte check | Superseded — T020's "two independent BEGIN/ROLLBACK blocks" structure turned out to violate TAP protocol (see T023) | c209033 (original), superseded by T023's commit |
| T023 | orchestrator (runs `supabase start`/`test db`/`stop` directly, per the task's own instruction) | 3 real fix-cycles via codex (gpt-6-luna, effort high) | `pnpm --filter backend exec supabase start` (full output shown, all 3 migrations applied in order); `pnpm --filter backend exec supabase test db` (re-run after each fix); direct `psql` query confirming zero leftover tables in `public` after rollback; `supabase stop` | **PASS** — `Result: PASS`, `Files=1, Tests=2`, all tests successful; stack stopped cleanly | (pending) |

**T023's three real bugs, found only by actually running the checkpoint (none caught by static/content review)**:
1. `function public.tables_missing_rls() does not exist` — `check-rls.sql` lives in `backend/supabase/scripts/`, not `migrations/`, so it was never applied to the live database. Fix attempt 1: `\ir ../scripts/check-rls.sql` at the top of the test file.
2. Fix attempt 1 itself failed: `supabase test db` runs pg_prove inside a Docker container that does **not** mount `backend/supabase/scripts/` — only the Supabase-CLI-known subdirectories (`tests/`, `migrations/`, `seed.sql`). Cross-directory `\ir` can't reach it. Fix attempt 2: inline the `tables_missing_rls()` function definition directly in the test file (accepted, deliberate duplication — flagged for a future task if the logic ever changes).
3. Fix attempt 2 still failed: `More than one plan found in TAP output` / `Bad plan. You planned 1 tests but ran 2` — this was **the orchestrator's own mistaken instruction** in the original T020 brief, which incorrectly claimed pgTAP test files commonly use multiple independent `BEGIN...plan()...finish()...ROLLBACK` blocks per file. `pg_prove` treats one `.sql` file as one TAP stream; only one `plan()` is valid per file. Fix: merged into a single `BEGIN; SELECT plan(2); <2 assertions>; SELECT * FROM finish(); ROLLBACK;` transaction.

All three fixes were dispatched to Codex with the real failure output each time; each was independently re-verified by the orchestrator re-running the actual `supabase test db` command, not by trusting Codex's self-report. Final state: `backend/supabase/tests/000_rls_check.test.sql` has one inlined function + one transaction + plan(2) + two ok() assertions + finish() + ROLLBACK.
| T021 | codex (gpt-6-luna, effort high) for content/research; orchestrator (direct) for the zod install | 0 | Raw-byte check on all 4 files; independently re-confirmed zod 4.6.7 is current stable (github.com/colinhacks/zod/releases); `pnpm --filter @furever/shared add zod@4.6.7 --save-exact`; **`pnpm exec tsc --noEmit` inside packages/shared — exit 0, env.ts typechecks cleanly against the real installed zod** | PASS | (pending) |
| T022 | codex (gpt-6-luna, effort high) | 0 | Raw-byte check; grepped for mojibake after an internal Codex patch-retry (one self-corrected `apply_patch` error mid-run, final file clean); confirmed only labeled placeholders, no real project refs/secrets | PASS | (pending) |

## D00a — Repo and tooling

| Task | Worker | Retries | Commands run | Result | Commit |
| --- | --- | --- | --- | --- | --- |
| T001 | codex (gpt-6-luna, effort high) | 0 | Independent re-fetch of expo.dev/changelog/sdk-58 and reactnative.dev/versions to confirm Codex's own flagged contradiction | PASS, with a human decision recorded below | be51738 |
| T002 | codex (gpt-6-luna, effort high) | 1 | `node -e "JSON.parse(fs.readFileSync(...))"` on all 7 package.json + raw-byte BOM/CRLF check on all 8 files | PASS after 1 retry (BOM + CRLF fixed) | 3e7b5e7 |
| T003 | codex (gpt-6-luna, effort high), parallel batch of 3 | 0 | Raw-byte check (no BOM/CRLF); content match against task text | PASS | (pending) |
| T004 | codex (gpt-6-luna, effort high), parallel batch of 3 | 0 | `JSON.parse` + raw-byte check; confirmed "tasks" (not "pipeline") is current Turborepo key | PASS | (pending) |
| T005 | codex (gpt-6-luna, effort high), parallel batch of 3 | 0 | `JSON.parse` + raw-byte check; separately dispatched a read-only Codex check against Biome's own docs to confirm `linter.rules.preset` and `!!` force-ignore glob syntax are real (not invented) schema keys | PASS | (pending) |
| T006 | codex (gpt-6-luna, effort high), parallel batch of 3 | 0 | `JSON.parse` + raw-byte check on all 5 tsconfig.json files; resolved each `extends` path in Node to confirm it points at the real root tsconfig.json | PASS (Codex also self-corrected a path error in my own brief: `packages/shared/tsconfig.json` needs `../../tsconfig.json`, not `../tsconfig.json`) | (pending) |
| T007 | codex (gpt-6-luna, effort high), parallel batch of 3 | 0 | Raw-byte check (no BOM/CRLF); content match | PASS | (pending) |
| T008 | codex (gpt-6-luna, effort high), parallel batch of 3 | 0 | Raw-byte check; confirmed exact required line `* text=auto eol=lf` present | PASS | (pending) |
| T009 | codex (gpt-6-luna, effort high) | 0 | `node --check` on both JS configs; raw-byte check; `git ls-files -s` on the husky hook | PASS, with one orchestrator-side fix (not sent back to Codex): `.husky/commit-msg` had no executable bit (`-rw-r--r--`) — git hooks silently don't run without it on Linux/macOS/CI. `core.filemode=false` on this Windows checkout, so `chmod` was a no-op; fixed via `git update-index --chmod=+x` to force mode 100755 in the git index/commit directly | 730142d |
| T010 | codex (gpt-6-luna, effort high) | 0 | SHA-256 + byte-length comparison between the root PRD and `docs/PRD.md` (Node, independent of Codex's self-report) | PASS, byte-identical (106,085 bytes, same SHA-256) | (pending) |
| T011 | codex (gpt-6-luna, effort high) | 0 | Recursive per-file SHA-256 comparison (Node script, path-aware) between `FurEver Design System/{tokens,components,ui_kits,guidelines}` and `design/system/{...}`; confirmed `design/overrides.md` untouched | PASS, 5/56/19/9 files all match | be16337 |
| T012 | orchestrator (run directly, not delegated) | 0 | `pnpm install` (exit 0, 520 packages); `git check-attr text eol -- '*.ts' tsconfig.json package.json` (`text: auto`, `eol: lf` on all) | PASS — **D00a complete, D00b may begin** | (pending) |

**Orchestrator gap-fill (not a numbered task)**: `.gitignore` is never mentioned anywhere in plan.md or
tasks.md — a real omission, discovered when T012's `pnpm install` created untracked `node_modules/`
dirs with nothing to stop an accidental broad `git add` from pulling them in. Delegated to Codex
(gpt-6-luna, effort high) same as any other task; verified via `git check-ignore -v` (node_modules
ignored at every depth, pnpm-lock.yaml and .env.example correctly NOT ignored) and a raw-byte check.
Committed alongside T012. Flagged here so a future `/speckit-tasks` pass can fold it in formally.

**Known issue, not blocking (T012)**: `pnpm install` emits one peer-dependency warning —
`mobile > react-native@0.88.0-rc.0 > @react-native/community-cli-plugin@0.88.0-rc.0` expects
`@react-native/metro-config@0.88.0-rc.0` but pnpm resolved the stable `0.88.0`. Direct consequence of
the T001 decision (pin Expo SDK 58 / RN 0.88.0-rc.0 as-is). Not a failure — `pnpm install` still exits
0 — but worth re-checking when D00e (T041, NativeWind/Metro config) actually wires up the mobile
Metro bundler, in case the stable/RC mismatch causes a real runtime problem then.

**Decision recorded (2026-10-19, T001)**: Expo's current stable SDK (58) bundles React Native 0.88,
which upstream reactnative.dev still lists as "Future" (release-candidate, not tagged stable); NativeWind's
stable 4.2.7 docs confirm SDK 57 support only, not SDK 58 explicitly. Independently re-verified via direct
fetch of expo.dev/changelog/sdk-58 (confirms: "SDK 58 upgrades React Native from 0.86 to 0.88... picks up
the changes from both React Native 0.87 and the React Native 0.88 release candidate") — this is a real
state of the two upstream projects, not a Codex error. **User decision**: pin Expo SDK 58 as-is (apps
pin the Expo SDK number, not React Native directly; Expo's own fork/patches are what actually ships) —
caveats documented in `COMPATIBILITY.md`'s "Compatibility finding" and "Source details and limitations"
sections. No further action needed before T002.

## D00f — Docker and compose (completed 2026-10-25)

**Scope**: T065-T073 — `web/Dockerfile` (deps/dev/tools/build/runner stages), root
`docker-compose.yml` (dev/tools/ci profiles), `.dockerignore`s, named volumes, the
`stack:up`/`stack:down`/`stack:reset`/`db:test`/`build:prod-web` orchestration scripts
(root `package.json` + PowerShell wrappers in `scripts/`), and `README.md`'s Docker
section. This machine has Docker Desktop installed but not running at the start of this
pass; it was launched and reached ready during the work.

**Real bugs found by actually running the stack, not by reading the Dockerfile/compose
file**:

1. **Alpine/musl vs. the Supabase CLI's glibc binary**: the `tools` image (built on
   `node:22.13.0-alpine`) installed `@supabase/cli-linux-x64` (a `"libc": ["glibc"]`
   package per its own `package.json`) with an empty `bin/` directory — no ENOENT until
   something actually tried to spawn it (`supabase test db`). Switched `base`/`deps` (and
   therefore `dev`/`tools`/`build`) to `node:22.13.0` (Debian, glibc); `runner` stays
   alpine since nothing in it ever executes a CLI post-build. After switching, a
   **stale Docker build cache** (both a manually-tagged image and docker-compose's
   separately-cached `furever-pgtap` image) kept reproducing the exact same empty-`bin/`
   symptom even after the base-image fix — only a `--no-cache` rebuild of *both* actually
   picked up a real, populated 112MB `supabase` binary. Re-verified `lint`/`typecheck`/
   `unit-test` tool containers stayed green on the new base, and re-ran the entire
   `stack:up`/`stack:down`/`stack:reset`/`build:prod-web` sequence again from scratch
   (below) since the base-image change also touches the app-serving `dev` and `build`
   stages, not just `tools`.
2. **`web/.env.local` didn't exist**: `docker-compose.yml`'s `web` service references
   `env_file: web/.env.local`, but only `.env.example` ever existed (by design —
   `.env.local` is gitignored). First `stack:up` failed outright (`env file ... not
   found`). Created `web/.env.local` from the example with the local Supabase instance's
   own well-known demo anon key (same value on every developer's machine — not a secret)
   and `http://host.docker.internal:54321` so the containerized app can reach the host's
   Supabase. This file is intentionally not committed (gitignored); a future README/
   quickstart pass should make this copy-step explicit for new clones.
3. **Host port 3000 was already taken**: this is a shared development machine running
   several *other, unrelated* projects' Docker containers (`list-school-web-1` among
   them) — one of them already held `0.0.0.0:3000`. `docker compose up` failed with
   `port is already allocated`. None of those containers were touched; FurEver's own
   `web` service was remapped to host port **3010** instead (container-internal port
   stays 3000). `stack-up.ps1` and `README.md` both updated to print/state the real port.
4. **pgTAP tool container — partially fixed, one real limitation remains.** Three
   consecutive real failures, each fixed, before hitting a structural one:
   - `ENOENT` spawning the Supabase CLI binary → fixed by item 1 above.
   - `ECONNREFUSED 127.0.0.1:54322` — the container's own loopback isn't the host's;
     added `extra_hosts: host.docker.internal:host-gateway` and pointed `supabase test
     db --db-url` at `host.docker.internal:54322`.
   - `tls error: The server does not support SSL` — local Supabase's Postgres doesn't
     speak TLS; appended `?sslmode=disable` to the connection string.
   - `docker: command not found` — `supabase test db` spawns its own `pg_prove`
     container via the Docker socket even when given an external `--db-url`; mounted
     `/var/run/docker.sock` and baked a static Docker CLI binary into the `tools` stage.
   - **Final, unresolved state**: it now connects and successfully spawns the nested
     `pg_prove` container, but that container reports `no pgTAP tests found in
     /app/backend/supabase/tests` — the spawned container is a Docker **sibling**
     (created by the *host's* daemon through the mounted socket), so it gets the host's
     filesystem, not this container's; `/app/backend/supabase/tests` only exists inside
     this image's own layers, never on the real host filesystem. This is an architecture
     mismatch (image-copied source vs. the DinD-via-socket pattern's assumption of a
     shared bind-mount path), not a one-line config fix, and not something a container
     image rebuild can solve on its own. Documented in `docker-compose.yml`'s `pgtap`
     service and left as a known limitation. **`pnpm db:test` (host-side, not through
     Docker) remains the verified, reliable path** — re-confirmed working this pass
     (`Result: PASS`, `Files=1, Tests=2`, same as T023's original checkpoint).

**T073 checkpoint — all four required commands run for real, end to end** (after the
Debian-base switch, i.e. against the final Dockerfile):
- `pnpm stack:up` → Supabase starts, `web` image builds, container starts, health check
  reaches `healthy`. Content independently verified past the health check: `curl
  localhost:3010/api/health` → `{"status":"ok"}`; `curl localhost:3010/ar/login` →
  `lang="ar" dir="rtl"` with real Arabic body text. **Also opened in actual Google
  Chrome via Playwright** (`channel: 'chrome'`, per the user's explicit ask) against the
  live container — screenshots confirmed both English/light and Arabic/dark render
  correctly with working locale/theme toggles, not just a curl-level check.
- `pnpm stack:down` → containers and network removed cleanly, Supabase stopped.
- `pnpm stack:reset` → named volumes and Supabase data discarded (`--no-backup`), then
  brought back up clean to `healthy` again.
- `pnpm build:prod-web` → builds the `runner` target, runs it once on a throwaway port,
  polls until Docker reports `healthy`, tears the test container down in a `finally`
  block. Separately also manually verified the prod container's actual behavior beyond
  the healthcheck: root `/` redirects to `/en` (307), `/ar/login` renders RTL Arabic
  correctly in the compiled standalone build too, not just dev mode.

**Two lint/typecheck bugs the `tools` container caught, fixed inline (same class as
D00e's checkpoint-driven fixes)**:
- `ShellControls.tsx`'s `useEffect(() => setMounted(true), [])` (D00e's hydration fix)
  triggered `react-hooks/set-state-in-effect`. Replaced with the react.dev-recommended
  `useSyncExternalStore(() => () => {}, () => true, () => false)` pattern, which needs no
  effect at all. Applied the identical fix to `mobile/src/hooks/use-color-scheme.web.ts`
  (Expo's own default-template file, not something D00e wrote, but it hit the exact same
  rule and is reachable from the still-present template `explore` tab).
- `web/vitest.config.ts` used CommonJS `require()`/`module.exports` while every other
  config file in the repo (`next.config.ts`, `playwright.config.ts`) uses ESM — flagged
  by `@typescript-eslint/no-require-imports`. Converted to `import`/`export default` to
  match.
- `web/package.json`'s `typecheck` script ran bare `tsc --noEmit`, which only passes if
  `.next/types` already exists from a prior `next build`/`next dev` — true on this
  machine (leftover from earlier manual testing) but false on a fresh clone or inside the
  `tools` image, where it failed with `Cannot find name 'LayoutProps'`. Changed to `next
  typegen && tsc --noEmit` (`next typegen` generates route types without a full build).

**New/changed files this pass**: `web/Dockerfile`, `.dockerignore` (root and `web/`),
`docker-compose.yml`, `web/src/app/api/health/route.ts` (the HEALTHCHECK target),
`README.md` (new, Docker section only — see T072's tasks.md note),
`scripts/{stack-up,stack-down,stack-reset,db-test,types-gen,tokens-build,build-prod-web}.ps1`,
five new root `package.json` scripts, `web/.env.local` (gitignored, not committed).

**Worker**: orchestrator (Claude Code), direct — continuing the deviation from this
log's stated delegation model that D00e's entry already flagged (the owner was asked and
chose to keep working directly for this pass too). **Result**: PASS — D00f complete; D00g
may begin. **Commit**: (pending — not committed by this pass yet).

## Handoff note

- **Done**: D00d source attribution and merge-safe i18n updates; corrected the T039 commit reference.
  D00e (T040-T064) and D00f (T065-T073) completed and checkpointed — see their entries above.
- **Next**: D00g — CI and docs (T074-T080).
- **Risks**: one dynamic `/complete-profile` translation still needs a manual key; screen inventory
  attribution still needs a documentation update (both carried over from D00d, untouched since). The
  `middleware` → `proxy` file-convention rename Next.js 16 now recommends (deprecation warning only, not
  an error) is undone; worth doing opportunistically in a later pass. True device/emulator screenshots for
  T063's mobile surface remain deferred to when an EAS/emulator environment exists (see T063's note) — this
  also means **no APK has been built or installed**; there is no Android SDK/emulator in this environment
  (confirmed: `ANDROID_HOME`/`ANDROID_SDK_ROOT` unset, no `adb`/`emulator` on PATH), and EAS builds need the
  manual-prerequisite Expo/EAS account tracked ahead of D02. The pgTAP Docker tool container has the
  structural limitation recorded in D00f's entry above; `pnpm db:test` is the real, verified path.
- **Working commands**: `pnpm.cmd exec tsx design/scripts/extract-built.ts`; `pnpm.cmd exec tsx design/scripts/extract-i18n.ts`; `pnpm.cmd i18n:check`; `pnpm.cmd exec tsx design/scripts/verify-screen-count.ts`.

## D00e Tailwind decision

- **Decision (2026-10-19):** mobile stays on Tailwind CSS 3.x for stable NativeWind 4.2.7; web uses Tailwind CSS 4.x with the official Next.js PostCSS/CSS-first setup. tailwind-preset.js serves mobile. Web uses variables.css and @theme inline mappings where utility tokens are needed. Although Tailwind 4 can explicitly load legacy JS configs, it no longer auto-detects them; no compatibility bridge is needed for web. The sources and decision are recorded in COMPATIBILITY.md.
- **Smoke result:** SDK 58.0.16 / NativeWind 4.2.7 built a web bundle, but Playwright showed no token colors; the output also warned that the generated interop CSS began with a BOM. Per the fallback, an isolated SDK 57.0.30 / RN 0.86.3 run was then generated from Expo's official SDK 57 template. Its web export stopped at Metro resolution: `react-native-css-interop/jsx-runtime` was missing. No token component rendered on SDK 57. Smoke apps and screenshot remain in the system temp directory. Awaiting owner direction on adding the exact compatible interop package and retrying once.
- **Resolution (2026-10-24, folded into D00e below):** the owner direction was to pin `react-native-css-interop@0.2.7` explicitly in `mobile/package.json` alongside the SDK 57.0.30/RN 0.86.3 fallback — this resolved the missing `jsx-runtime` resolution. Confirmed by this pass's fresh `expo export --platform web`, whose output CSS carries the real resolved token values (`--primary:#a96062` light / `#d08a8c` dark, etc.) and `--css-interop:true`.

## D00e — App shells, RTL/theme, observability (completed 2026-10-24)

**Starting state**: T040-T062's code already existed on disk, uncommitted, from work done before this
pass (scaffolds, i18n wiring, observability, theme/RTL/fonts/lint, the two D00e screens) — but none of
it had been checked off, test-verified end to end, or checkpointed. This pass's job was to verify each
task's real behavior (not just file presence), capture T063's missing mobile screenshots, and pass T064's
checkpoint. Running the real checkpoint — not just reading the code — surfaced three genuine bugs that
static review had missed, consistent with this project's established pattern (see T023's three bugs).

| Area | Verification performed | Result |
| --- | --- | --- |
| T040-T048, T052-T054, T056-T062 | Direct file review against each task's exact requirement | All match; no changes needed |
| T049, T055 | `pnpm --filter mobile test` (Jest) | 3 suites / 3 tests passed |
| T051 | `pnpm --filter web test` (Vitest) + `pnpm exec playwright test` in `web/` | Vitest 2 files/3 tests passed; Playwright's `locale toggle changes rendered text` case passed — **used instead of the originally-specified `web/src/i18n/__tests__/locale-switch.test.tsx` unit path**; see T051's tasks.md note |
| T040/T041/T056 (mobile), T044/T046/T047 (web) | `pnpm --filter mobile typecheck`, `pnpm --filter web typecheck` | Both exit 0 |
| T060 | `pnpm exec tsx scripts/lint-design-tokens.ts scripts/__fixtures__/bad-raw-hex.tsx` (expect violations); `pnpm exec tsx scripts/lint-design-tokens.ts "mobile/app/_dev/hello.tsx" "web/src/app/[locale]/(auth)/login/page.tsx"` (expect zero, per T064's exact scope) | Fixture: 2 violations, exit 1. Real shell files: 0 violations, exit 0 — T064's lint requirement **PASS** |
| T063 | New `mobile/tests/d00e-screenshots.spec.ts` + `mobile/playwright.config.ts` + `mobile/tests/serve-static.cjs` (dependency-free static file server), run against a fresh `expo export --platform web --output-dir dist`; re-ran `web/tests/d00e-screenshots.spec.ts` to refresh the web half | All 8 PNGs captured in `design/screenshots/d00e-baseline/`; each visually confirmed by direct image read (not just byte-presence) |

**Three real bugs found only by running the checkpoint for real (not by reading the code):**

1. **NativeWind `darkMode` config missing (blocks T063 entirely on mobile)**: `mobile/tailwind.config.js`
   had no `darkMode` key. Calling `setColorScheme()` (used by T056's `useTheme.ts` on every render) then
   throws `Unable to manually set color scheme without using darkMode: class` — a client-side exception
   that left the exported web page's `<body>` empty. Only visible by actually loading the exported page in
   a browser and reading `pageerror` events; a static code/type review would not catch it (it typechecks
   fine, and the error only fires at runtime). **Fix**: added `darkMode: 'class'` to
   `mobile/tailwind.config.js`.
2. **`web/middleware.ts` at the wrong path (silently never ran, since before D00e started)**: Next.js only
   auto-loads a `middleware.ts` next to the app's actual root — for a project using the `src/` directory
   convention (this one: `web/src/app/...`), that means `web/src/middleware.ts`, not `web/middleware.ts`.
   The file was at the project root. Direct navigation to any non-default locale (`/ar/login`) silently
   rendered English — `next-intl`'s `requestLocale` resolved to `undefined` on every request (confirmed
   with a temporary debug log, then removed) because the middleware that should have set it never ran. The
   existing `web/tests/d00e-screenshots.spec.ts` capture loop didn't catch this because it never asserted
   on text content, only on the theme-driven background color — so all four "web" screenshots captured
   2026-10-19 were silently English regardless of filename (`web-ar-dark.png` and `web-en-dark.png` were
   byte-identical). **Fix**: moved `web/middleware.ts` → `web/src/middleware.ts` (content unchanged except
   the relative import path); re-verified with a direct `curl` against a clean dev server (no cookies) —
   `/ar/login` now returns `lang="ar" dir="rtl"` and real Arabic body text. tasks.md's T044/T050 text
   corrected to reference the right path.
3. **`packages/i18n/ar.json`'s five D00e-added `common.*` strings were literal `?` characters, not
   Arabic** (`shellProof`, `tokenSample`, `switchToArabic`, `switchToDark`, `switchToLight` — confirmed by
   codepoint inspection: every character was U+003F). `common.appName` and `common.switchToEnglish` in the
   same file were unaffected (not part of this corruption). This is the same class of Windows-console
   mojibake already seen once in this log (T022); these five keys aren't in any git commit (`git show
   HEAD:packages/i18n/ar.json` has no `common.*` section at all), so they were added — and corrupted —
   entirely in this working tree before this pass, outside of any step this log already recorded. **Fix**:
   rewrote the five values with real Arabic text, reusing `web/tests/d00e-screenshots.spec.ts`'s
   already-hardcoded Arabic string for `shellProof` (`'واجهة بتصميم النظام جاهزة.'`) to stay consistent
   with what the web capture test already expected, and writing new direct translations for the other
   four (`tokenSample` → `الرمز الأساسي`; `switchToArabic` → `التبديل إلى العربية`; `switchToDark` →
   `المظهر الداكن`; `switchToLight` → `المظهر الفاتح`). Re-verified via codepoint inspection (all in the
   `U+0600`-`U+06FF` Arabic block) and `pnpm i18n:check` (597 keys still match).

**One more bug fixed opportunistically (surfaced by the middleware fix, not independently discovered)**:
once `/ar/login` actually rendered, the dev server logged a real (non-fatal) hydration-mismatch error —
`ShellControls.tsx`'s theme-switch button read `useTheme()`'s `theme` synchronously on first client render,
which can differ from the server's `undefined`-until-mounted value, producing a server/client text
mismatch ("Dark" vs "Light"). **Fix**: added the standard `next-themes` `mounted` guard (render the
SSR-consistent label until a `useEffect` confirms the client has mounted). Re-ran both Playwright tests
after the fix — console is clean, no hydration error.

**Also fixed, not a bug**: `mobile/jest.config.js`'s `testPathIgnorePatterns` didn't exclude the new
`mobile/tests/` directory, so Jest tried to run the Playwright spec and crashed
(`throwIfRunningInsideJest`). Added `"/tests/"` to the ignore list (does not affect
`mobile/src/**/__tests__/`, a different path). Added `test-results/`, `playwright-report/`,
`blob-report/`, `playwright/.cache/` to both `mobile/.gitignore` and `web/.gitignore` — Playwright's own
output directories, previously untracked-but-not-ignored in both apps.

**New files this pass**: `mobile/playwright.config.ts`, `mobile/tests/d00e-screenshots.spec.ts`,
`mobile/tests/serve-static.cjs` (dependency-free static server for Playwright's `webServer`, since no
`serve`/`http-server` package was already a dependency and network-fetching one was avoided).
`mobile/package.json` gained `@playwright/test@1.64.1` (devDependency, pinned to match `web`'s version).

**Commands re-run clean at the end of this pass** (full D00e surface, not just the changed files):
`pnpm --filter mobile test`, `pnpm --filter mobile typecheck`, `pnpm --filter web test`, `pnpm --filter
web typecheck`, `pnpm exec tsx scripts/lint-design-tokens.ts` (both the fixture and the narrowed real-file
scope), `pnpm exec playwright test` in both `mobile/` and `web/`, `pnpm i18n:check`.

**Deviation from this log's stated delegation model**: the "Delegation model" note near the top of this
file states the orchestrator writes briefs and dispatches implementation to Codex rather than writing code
directly. This pass's fixes (all six items above) were written directly rather than delegated, because
each was discovered interactively while running the checkpoint itself (a live debugging sequence: observe
a failure, add a temporary debug statement, form a hypothesis, test it, fix, verify) rather than planned
ahead of time as a dispatchable task. Flagged here so a future pass can decide whether to continue this
pattern for checkpoint-driven bug fixes or restore full delegation for D00f onward.

**Worker**: orchestrator (Claude Code), direct — see deviation note above. **Result**: PASS — D00e
complete; D00f may begin. **Commit**: (pending — not committed by this pass; left for the owner to review
the diff first).
