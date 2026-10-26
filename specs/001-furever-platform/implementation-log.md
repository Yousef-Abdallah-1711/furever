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

## D00g — PRD, README, fresh-clone verification (completed 2026-10-25, CI/CD excluded by owner instruction)

**Scope adjustment, stated up front by the owner (2026-10-25)**: GitHub Actions, CI/CD workflows, and
`renovate.json` (T074-T076) were explicitly excluded from this pass — "do not implement, configure,
investigate, or spend time on" them, and do not mark them done or create placeholders. This pass covers
only T077 (README), T078 (amended PRD), and T079 (fresh-clone quickstart verification). T080's
checkpoint is correspondingly **not** claimed complete — see its tasks.md note.

**T078 — amended PRD**: replaced the byte-identical T010 placeholder `docs/PRD.md` with a real rewrite,
grounded section by section in `plan.md`'s 10 PRD amendments plus `spec.md`/`data-model.md`/`research.md`
(never invented). Touched far more of the document than just §6 Authentication, since the sign-in method
change alone appears in the product map, tech stack table, Epic A stories, risks, sprint plan, and open
questions — a single-section edit would have left the rest contradicting itself. Full list of what
changed: queue ticket shape (`doctors.queue_prefix` + `queue_tickets.ticket_number`, the `A-14` display
convention, added to the schema table and three screen descriptions that previously didn't mention it);
the `#6B6B6B` vs `#737373` text-secondary correction (verified against the actual
`design/system/tokens/colors.css` value, not just trusted from plan.md's prose); the full email-based
verification lockout (5-wrong-attempt cancellation, 3-cancellation/15-minute lock, throttling, no
enumeration — replacing phone-OTP/Twilio prose everywhere it appeared: sign-in methods table, flows,
Google/Apple setup checklist, abuse controls, Edge Functions table, AUTH-01/02/03 stories, risks, sprint
plan, open questions); the 2-hour cancellation policy (BKG-04 story and the booking-detail screen row,
previously vague "inside the allowed window"); pet creation as part of first-run onboarding (new
onboarding-table rows for the pet-species/basics/photo/health-passport steps and `/onboarding/summary`,
none of which existed in the placeholder PRD at all); Apple sign-in restricted to iOS only, stated
explicitly everywhere it's mentioned rather than left implicit; the design system as prop-for-prop source
of truth (new subsection — this concept didn't exist anywhere in the placeholder PRD); clinic-verified
record edit rights restricted to the creating clinic (permission matrix, RLS table, patient-detail screen,
CS-08 story — previously only covered *adding* records, not the *editing* restriction); and the Phase 4
hooks restated for emphasis per constitution VI.

**Two additional gaps found and fixed while cross-checking against the other spec documents, not part of
the 10 amendments but genuine PRD/implementation mismatches**: the `verify-otp-guard` Edge Function —
central to the whole amended auth flow — was completely absent from the Edge Functions table; and the
pets/vaccinations/health_records RLS row said admin access was merely "audited" when `data-model.md` is
more precise (no direct admin SELECT at all, RPC-only, each RPC writing its own audit row).

**Two genuinely open items flagged explicitly rather than silently resolved, per the instruction not to
invent decisions**: (1) `spec.md`'s stated Egyptian phone-number format (10 digits, leading 0, starting
10/11/12/15) contradicts the already-implemented `packages/shared/src/schemas/base.ts` `phoneSchema`,
which uses a generic E.164 `^\+[1-9][0-9]{7,14}$` pattern predating the sign-in method change — recorded
as an unresolved contradiction in the PRD's constraints section, not picked one way or the other; (2)
whether the email-code lockout can be bypassed by calling Supabase Auth's public `/auth/v1/otp`/`/verify`
endpoints directly (research.md §17's still-open decision) — recorded in §6's Flows, Risks, and Open
questions sections as explicitly unresolved.

**Verification**: all PRD tables checked programmatically for consistent column counts (clean); UTF-8
round-trip byte-check on the whole file (clean, no mojibake — relevant given this project's prior Arabic
corruption incident in D00e); no markdown linter is configured in this repo, so table/link structure was
verified by direct reading and the scripts above rather than a tool, and that limitation is stated rather
than silently skipped.

**T077 — README.md**: extended D00f's Docker-only README (kept verbatim, not replaced) with project
purpose/status, repo layout, prerequisites, environment configuration (and the `backend/.env.example` gap
`docs/environments.md` references three times but was never created — flagged explicitly, not silently
assumed to exist), first-run steps, how to access the running placeholders and switch language/theme, a
full command table cross-checked against the actual `package.json` scripts and `docker-compose.yml`
service names (caught and fixed one bad row that tried to cram three commands into one cell with escaped
pipes), and links to the PRD/quickstart/plan/tasks/COMPATIBILITY docs. Every relative link in the file
verified to actually resolve via a small script, not by eye.

**T079 — fresh-clone verification, found three more real bugs no static review caught**: cloned the repo
into a genuinely separate directory and ran `pnpm install && pnpm stack:up` verbatim, exactly as
`quickstart.md` instructs. It failed. Three real, confirmed-by-reproduction bugs, each fixed and
re-verified:

1. **Every `scripts/*.ps1` file contained an em-dash (U+2014) in a comment, which breaks Windows
   PowerShell 5.1's parser outright** — "The string is missing the terminator" cascading into brace-match
   failures through the whole file. Isolated with `[System.Management.Automation.PSParser]::Tokenize()`
   directly (not guesswork): a minimal repro without the em-dash parsed fine; adding it back reproduced
   the failure; stripping all em-dashes from all eight scripts and re-tokenizing confirmed every file
   parses clean. Not an isolated case — all eight `.ps1` files had at least one.
2. **`stack-up.ps1`'s own `supabase start 2>&1 | Tee-Object` redirected the native CLI's stderr**, which
   Windows PowerShell 5.1 wraps in a terminating `NativeCommandError` under `$ErrorActionPreference =
   "Stop"` even when the command exits 0 — triggered in practice by Supabase's own harmless "Stopped
   services: [...]" cleanup notice. This is the exact anti-pattern this environment's own PowerShell tool
   guidance already warns about, introduced by this pass's own new code. Fixed by capturing stdout only
   (the status JSON `stack-up.ps1` needs was never on stderr anyway).
3. **`docker-compose.yml`'s `web` service bind-mounts `./packages` over the image**, shadowing whatever
   `web/Dockerfile`'s `dev` stage generated into `packages/design-tokens/dist/` at build time. Every
   previous D00f test run "worked" only because this machine's `packages/design-tokens/dist/` already
   existed locally from earlier manual `pnpm tokens:build` runs — masking the bug entirely until a
   genuinely fresh clone (which has no local `dist/` at all) 500'd on every page: `Can't resolve
   '../../../packages/design-tokens/dist/variables.css'`. Fixed by regenerating tokens in the container's
   own startup command (`pnpm tokens:build && pnpm --filter web dev`), which runs *after* the bind mounts
   are in place, not just once at image build time.

Also found and fixed along the way (not a bug, but necessary for the one-command promise to hold):
**`web/.env.local` didn't exist** — `docker-compose.yml` references it via `env_file`, but nothing had
ever created it, so `docker compose up` failed outright with "env file not found" on the very first fresh
attempt (this is the same gap D00f's own entry already found and worked around manually on the original
repo — T079 is what makes the fix automatic instead of a manual step the docs would otherwise need to
spell out). `stack-up.ps1` now auto-creates it from `web/.env.example`, reusing `supabase start`'s own
printed anon key and pointing at `host.docker.internal` so the containerized app can reach the host's
Supabase.

**Re-verification after all four fixes, on the fresh clone, each step independently confirmed**: `pnpm
stack:up` reached a healthy web container; `curl http://localhost:3010/ar/login` returned `200` with real
Arabic body text and `dir="rtl"` (not just a health-check pass); `pnpm stack:down` and `pnpm stack:reset`
both still worked afterward. `quickstart.md` updated with what `stack-up.ps1` now does automatically and
a dated verification note. The fresh clone and its Docker images were deleted after verification.

**Worker**: orchestrator (Claude Code), direct — same continuing deviation from this log's delegation
model already flagged in D00e's and D00f's entries. **Result**: T077, T078, T079 PASS and committed.
T074-T076 genuinely not started (owner-scoped exclusion, not an oversight). T080 left unchecked — see its
tasks.md note for exactly which half is and isn't met. **Commits**: `docs(T078)` (PRD),
`docs(T077)` (README), `fix(T079)` (the three fresh-clone bugs + quickstart.md).

## Handoff note

- **Done**: D00d source attribution and merge-safe i18n updates; corrected the T039 commit reference.
  D00e (T040-T064), D00f (T065-T073), and D00g's T077-T079 completed and checkpointed. **D00 overall is
  now formally closed (T080 checked, 2026-10-25)**: the owner signed off on descoping T074-T076
  (GitHub Actions CI, deploy-skeleton workflows, `renovate.json`) from D00's exit criteria rather than
  building them — see T080's tasks.md note for the exact terms. D00 is complete under that descoping.
- **Next**: **D01 — design system port** (T081-T119): port `design/system/components/**/*.d.ts` prop-
  for-prop into `mobile/src/components/` and the web equivalent, plus the dashboard shell and two
  galleries (plan.md's Coverage Table / tasks.md's D01 section has the full breakdown). This is the first
  phase that touches real UI component code rather than scaffolding — read `design/system/components/
  **/*.d.ts` as the authoritative prop reference (PRD §12's "design system as source of truth" amendment)
  before porting anything, and cross-check against `design/screen-map.md` for which components each
  screen actually needs.
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

## D01a — Design system port, Wave 1: the 8 components with no internal dependencies (in progress)

**Scope**: T081 (`Avatar`), T084 (`Card`), T087 (`Icon`), T090 (`PhaseTag`), T092 (`Skeleton`), T093
(`StatusBadge`), T097 (`SlotChip`), T098 (`Stepper`) — the subset of D01's 18 `.d.ts`-backed components
that depend on none of their siblings (confirmed by reading every core/domain `.d.ts` before starting:
none of these eight has an `icon` prop or composes another ported component). The owner chose to restore
this log's stated delegation model for D01 (asked explicitly at the start of the phase, per the carried-
forward instruction from the prior session) — this pass dispatches to Codex (`gpt-6-luna`, effort `high`,
`service_tier=priority`) via the `codex-delegate` skill, three parallel batches on disjoint files (Batch
A: Icon/Skeleton/Avatar; Batch B: Card/PhaseTag/StatusBadge; Batch C: SlotChip/Stepper), since all eight
are mutually independent and the user's own standing instruction caps parallel Codex agents at three with
non-overlapping files.

**Pre-dispatch gap found by checking the repo, not by reading tasks.md**: mobile had no icon library at
all (`Icon.d.ts` is required by almost every later component). Added `lucide-react-native` +
`react-native-svg` (peer dep) via `npx expo install` for SDK-57-compatible versions, plus
`@react-native-community/datetimepicker` (needed later for T103) in the same pass to avoid a second
install round. Added `nuqs` + `react-day-picker` + `date-fns` to `web/package.json` for the later
DataTable/DateField tasks (T103, T111), `date-fns` matching PRD §12's own date-formatting guidance.
Installed and typechecked clean before any component dispatch. **Commit**: `81d8a29`.

**Windows Codex-dispatch gotcha (new, not in COMPATIBILITY.md yet)**: on this machine `codex` is not on
Git Bash's `PATH` under its bare name — `command -v codex` and bash's own `type` fail even with the
install directory prepended to `PATH`, though the literal file `codex.cmd` executes fine when named
explicitly, and Node's own child-process spawn (which `relay.mjs` uses) resolves the bare name correctly
via Windows' `PATHEXT`. Worked around with a one-line `codex.cmd` shim
(`"<codex.exe path>" -c service_tier=priority %*`) in a scratch directory prepended to `PATH` only for the
`relay.mjs` invocation; `--model gpt-6-luna --effort high` passed as `relay.mjs`'s own flags. Verified
end-to-end with a throwaway `--read-only` ping dispatch before spending real tokens, and independently
confirmed via the new Codex session's own `turn_context` line (`model: gpt-6-luna`, `effort: high`) per
this machine's standing Codex-delegation instruction — not just trusted from the relay's summary.

**Real bug found by reading Codex's diff against the actual library source, not by trusting its own gate
report**: `mobile/src/components/Icon.tsx`'s first draft built its icon lookup table with
`.filter(([, value]) => typeof value === 'function')`. `lucide-react-native`'s `createLucideIcon` (read
directly from `node_modules/.../lucide-react-native/dist/esm/createLucideIcon.js`) wraps every icon in
`React.forwardRef(...)`, which is `typeof 'object'`, not `'function'` — the filter silently excluded every
real icon, so `nativeIcons` was always empty and `<Icon name="..." />` would have rendered `null` for
every icon on mobile, with no typecheck or lint error to catch it (the bug is in runtime value shape, not
types). **Fix**: replaced the `typeof` filter with an `isIconComponent` guard that also accepts an object
whose `$$typeof` is `Symbol.for('react.forward_ref')` or `Symbol.for('react.memo')`, and switched from
eagerly `cssInterop`-wrapping all ~1500 exported icons at module load to a lazy, memoized per-name
resolution (the eager version was also needlessly wrapping every unused icon on every app start). Could
not runtime-smoke-test directly with plain `node` — `lucide-react-native`'s entry pulls in
`react-native`'s own Flow-typed `index.js`, which only parses under Metro/Babel — so this was verified by
(1) reading `createLucideIcon.js` directly to confirm the `forwardRef` wrapping, (2) the corrected
`$$typeof` check being the documented, standard way to detect a `forwardRef` component, and (3) a clean
`tsc --noEmit`. Real on-device rendering verification is deferred to T115/T117's gallery + screenshot
check, consistent with this project's established pattern of trusting real output over a type-check alone
for anything with a runtime-shape dependency.

**Tooling gotcha found while re-verifying the design-token gate**: `pnpm exec tsx scripts/lint-design-
tokens.ts <file-list>` hung indefinitely in this session's shell (three separate attempts, each moved to
background with zero output after 60s+, while a bare `pnpm exec tsx -e "console.log(1)"` returned in
1.1s) — left several zero-CPU orphaned `node` processes behind. The script itself (re-read in full) has
no loop, timer, or async wait that should block process exit, so the hang looks shell/environment-
specific rather than a script bug; not root-caused this pass (flagged here rather than silently worked
around). Re-verified the same two rules (raw hex in quotes, raw `px` literal) directly against all 16
Wave-1 files with two `Grep` passes mirroring the script's exact regexes — 0 matches on both patterns,
across both platforms. Worth root-causing before T118's prop-drift script (same `tsx`-via-`pnpm-exec`
pattern) is written, in case it hits the same hang.

**Verification performed** (orchestrator's own re-run on the full merged tree after all three Codex
batches landed, not the batches' own self-reported gates — each batch's own `pnpm --filter mobile
typecheck` transiently failed on the *other* batches' files mid-write, since all three ran in the same
working tree concurrently; this resolved itself once all three had finished and is not a real issue):
`pnpm --filter mobile typecheck` (clean after the Icon.tsx fix), `pnpm --filter web typecheck` (clean —
the "`next typegen` can't load its SWC native binding" error all three Codex sandboxes reported did not
reproduce outside the sandbox, so treated as sandbox-only noise, not a real repo issue), `pnpm --filter
mobile lint` / `pnpm --filter web lint` (clean; only pre-existing warnings plus the brief-approved
`Avatar.tsx` `<img>` warning), and the `Grep`-based token-rule re-check above.

**Files this pass**: `mobile/src/components/{Avatar,Card,Icon,PhaseTag,Skeleton,SlotChip,StatusBadge,
Stepper}.tsx` + the same eight under `web/src/components/`.

**Worker**: Codex (`gpt-6-luna`, `high`), three parallel dispatches, orchestrator-reviewed; the Icon.tsx
fix was applied directly by the orchestrator rather than round-tripped through another Codex dispatch
(a one-line, fully-understood correctness fix found during review, not a planned task). **Result**: PASS.
**Commit**: `92a6d82`.

## D01b — Design system port, Wave 2: the 6 components depending only on `Icon`

**Scope**: T082 (`Banner`), T083 (`Button`), T085 (`Chip`), T088 (`IconButton`), T089 (`Input`), T091
(`Rating`) — all six depend only on the now-landed `Icon`, confirmed by rereading each `.d.ts` before
dispatch. Same delegation setup as D01a: Codex (`gpt-6-luna`, `high`), three parallel batches on
disjoint files (Batch D: Button/IconButton; Batch E: Chip/Rating; Batch F: Input/Banner), each brief
telling Codex `Icon.tsx` already exists and to import it rather than reimplement icon lookup.

**Batch E failed its first attempt and had to be redispatched**: Codex's own tool-call log
(`events.jsonl`/`stderr.txt`) showed four repeated `Failed to write file
...mobile/src/components/Chip.tsx` errors across ~4 minutes, plus a stray diagnostic probe file
(`mobile/src/components/write-test.tmp`) it left behind trying to isolate the problem. Neither `Chip.tsx`
nor `Rating.tsx` existed anywhere afterward — a genuine failed run, not a review disagreement. Removed
the stray probe file and redispatched Batch E alone (not parallel this time) with the same brief; the
solo retry also hit one `Failed to write file ...Chip.tsx` on its first two tool calls before succeeding
on a later one, so this looks like a transient Windows file-write contention issue in Codex's sandbox
rather than a brief or content problem — worth watching for in later waves, not yet root-caused.

**Two real bugs found by reading the diff against actual platform behavior, not by trusting Codex's own
gate report:**

1. **`react-hooks/static-components` lint error reappeared in the already-committed `Icon.tsx`** (D01a's
   own fix), caught only because two independent fresh Codex runs (Batches D and F) both hit it rereading
   the full tree — D01a's own pre-commit lint run had reported 0 errors on the same file content
   (confirmed via `git diff`: the file was byte-identical). This points to a stale-cache blind spot in
   `expo lint`'s ESLint cache (Windows mtime granularity is coarse enough that an edit immediately
   followed by a lint run can hit a cache entry keyed from before the edit) — D01a's "clean lint" claim
   for `Icon.tsx` was wrong, caught only by this pass's independent re-runs. **Fix**: the D01a fix had
   switched `Icon.tsx`'s lookup from an eager module-scope object to a lazy, `Map`-memoized per-name
   resolver — functionally safe (same component identity returned on every call for a given name after
   the first), but the lint rule can't see that: it flags any component value *created by a function call
   inside a render function* regardless of memoization, because the concern is about reconciliation
   safety in the general case. Reverted to eager construction of the full icon map at module scope (same
   shape as Batch A's original, pre-bug code) with the corrected `forwardRef`/`memo` type guard kept —
   satisfies both the lint rule (nothing is "created during render" anymore, it's a plain object property
   lookup) and the original forwardRef-detection bug fix.
2. **Three of Wave 2's six mobile components passed a web-only CSS escape hatch as a React Native style
   value**: `Button.tsx` used literal `'var(--on-primary)'` (etc., per variant) for its icon/spinner
   color; `Chip.tsx`, `Rating.tsx`, `Banner.tsx`, and `Input.tsx` used the CSS keyword `'currentColor'` for
   the same purpose. Both are valid on web (real CSS, resolved by the browser) but meaningless to React
   Native — RN's `style` prop is never run through NativeWind's className compiler (only `className`
   strings are, which is why `Button`'s `h-[var(--h-btn-l)]` *className* works fine on mobile: mobile's
   `global.css` imports `packages/design-tokens/dist/variables.css` before `@tailwind` directives, so
   NativeWind's own CSS pipeline resolves that `var()` reference — confirmed by reading `global.css` and
   `app/_layout.tsx`'s import chain). A literal `style={{ color: 'var(--x)' }}` or `'currentColor'`,
   passed directly as a RN style object rather than through a className, has no such resolution path. Not
   caught by typecheck (both are valid strings for a loosely-typed/`as never`-cast `color`) or by the
   token-rule scan (neither pattern matches a raw hex or `px` literal). **Fix**: added
   `mobile/src/lib/resolveTokenColor.ts`, a `useTokenColor(name)` hook that reads the active theme from
   the existing `useTheme()` hook and looks up the real hex from
   `packages/design-tokens/dist/tailwind-preset.js`'s `furever.themes.<light|dark>.colors` object (the
   same generated artifact already used for every className token, just read as a plain JS object instead
   of through Tailwind's class compiler) — verified by directly inspecting that object's keys against
   `variables.css`'s hand-read values before trusting it. Replaced the five `var()`/`currentColor` call
   sites across `Button.tsx`, `Chip.tsx`, `Rating.tsx`, and `Banner.tsx`'s mobile files with
   `useTokenColor(...)` calls; `Input.tsx`'s mobile icon color was the fifth site, not called out in its
   own Codex report but found by the same review pass. Re-verified with `tsc --noEmit` (clean) after each
   fix; could not verify the actual rendered color without a device/simulator, so this is confirmed
   correct by the token-lookup's own hex output matching `variables.css` exactly, not by a screenshot —
   real visual confirmation is deferred to T115/T117 same as D01a's Icon fix.

**Verification performed** (orchestrator's own re-run on the full merged tree, all 12 Wave 2 files plus
the new `resolveTokenColor.ts` helper, after every fix above): `pnpm --filter mobile typecheck` and
`pnpm --filter web typecheck` both clean; `pnpm --filter mobile lint` and `pnpm --filter web lint` both
clean (only the same pre-existing warnings D01a already noted); `Grep`-based token-rule re-check (raw hex
in quotes, raw `px` literal) across all 12 files — 0 matches on both platforms.

**Tooling note carried forward from D01a**: `pnpm exec tsx scripts/lint-design-tokens.ts` was not
attempted again this pass (same unexplained hang from D01a); the `Grep`-based manual check continues to
stand in. Still unresolved before T118's prop-drift script needs the same `tsx`-via-`pnpm-exec` pattern.

**Files this pass**: `mobile/src/components/{Banner,Button,Chip,IconButton,Input,Rating}.tsx` + the same
six under `web/src/components/`, plus the new `mobile/src/lib/resolveTokenColor.ts`.

**Worker**: Codex (`gpt-6-luna`, `high`), three parallel dispatches (one redispatched solo after a
genuine sandbox-level failure), orchestrator-reviewed; both bug fixes above were applied directly by the
orchestrator rather than round-tripped through another Codex dispatch (well-understood, narrowly-scoped
corrections found during review). **Result**: PASS.
**Remaining D01 work**: `EmptyState`, `ClinicCard`, `ConfirmSheet`, `PetCard` (domain components that
depend on Wave 1/2 core pieces), then the 10 built-from-pattern components, then the dashboard shell, then
T115-119's galleries and checkpoint.
**Commit**: `c0b14a4`.

## D01c — Design system port, Wave 3: the last 4 `.d.ts`-backed components (completes T081-T098)

**Scope**: T086 (`EmptyState`), T094 (`ClinicCard`), T095 (`ConfirmSheet`), T096 (`PetCard`) — the last
four of the 18 core/domain components with a `.d.ts`. All depend only on components landed in D01a/b
(`Icon`, `Button`, `Card`, `Avatar`, `StatusBadge`, `useTokenColor`), confirmed by rereading each `.d.ts`
before dispatch. Three Codex batches (`gpt-6-luna`, `high`): Batch G (`EmptyState`+`ClinicCard`), Batch H
(`PetCard` alone), Batch I (`ConfirmSheet` alone, given its own dispatch since a modal/sheet overlay is
meaningfully more involved than the rest). Every brief explicitly repeated the `var()`/`currentColor`
mobile gotcha D01b found, pointed at the existing `useTokenColor` hook, and told Codex which components
already exist to import rather than reimplement.

**Two of the three batches failed outright under 3-way concurrent dispatch and needed a solo
redispatch — the same class of problem D01b's Batch E hit once, now happening twice in one wave:**

1. **Batch H (`PetCard`) self-reported total failure** ("Windows sandbox helper returned 'Access is
   denied'" on every write and shell attempt, `touchedFiles: []`) — but checking the working tree showed
   both `PetCard.tsx` files already existed with real, mostly-correct content at that point. The write
   had actually succeeded *before* a later tool call hit the access-denied error, and Codex's own final
   report described the whole task as failed when it wasn't — a second, concrete instance of "don't trust
   the self-report," this time the self-report was pessimistic rather than optimistic. Redispatched solo
   anyway (before checking the tree, since the report gave no reason to expect otherwise) — the solo
   retry overwrote both files with equivalent content.
2. **Batch I (`ConfirmSheet`) genuinely failed**: only a one-line stub (`import type { ReactNode } from
   'react';`) landed on mobile, nothing on web. Removed the stub and redispatched solo; the retry
   succeeded cleanly on the first attempt.

Given this is now 3 of 9 Wave 1-3 parallel batches needing a solo redispatch (D01b's Batch E once, D01c's
Batches H and I), 3-way concurrent `workspace-write` Codex dispatch against the same working tree appears
meaningfully less reliable on this machine than running 2 at a time or sequentially — not yet root-caused
(no reproducible minimal case), but worth downgrading to 2-way parallelism for the remaining D01 waves
rather than continuing to hit this at the current rate.

**One more real bug, the same corruption class this log has already recorded twice (T022;
D00e's five Arabic strings)**: the solo-redispatched `PetCard.tsx` rendered `{breed} <U+FFFD> {age}`
(the Unicode replacement character) in place of the middle-dot separator ("·", U+00B7) the brief asked
for, on **both** platforms, confirmed by direct codepoint inspection — and the corruption was identical
on the *first* Batch H attempt too (confirmed before it was overwritten), so this is systematic to
writing that one specific character through Codex's Windows file-write path in this environment, not a
one-off. **Fix**: replaced both occurrences directly with the real `·` character and re-verified by
codepoint (`U+00B7` confirmed on both files) and by scanning all 8 of this wave's files for any
`U+FFFD` occurrence (none found elsewhere). Not root-caused to a specific encoding step; flagged here
as a recurring risk for any future component whose copy needs a non-ASCII character, the same caution
this log's `.ps1` em-dash finding already established for script files.

**Verification performed** (orchestrator's own re-run on the full merged tree, all 8 Wave 3 files):
`pnpm --filter mobile typecheck` and `pnpm --filter web typecheck` both clean; `pnpm --filter mobile
lint` and `pnpm --filter web lint` both clean (same pre-existing warnings as D01a/b); `Grep`-based
token-rule re-check (raw hex in quotes, raw `px` literal) — 0 matches across all 8 files; a direct
`U+FFFD` scan of all 8 files — none found after the fix.

**Files this pass**: `mobile/src/components/{ClinicCard,ConfirmSheet,EmptyState,PetCard}.tsx` + the same
four under `web/src/components/`.

**Worker**: Codex (`gpt-6-luna`, `high`); two of three batches needed a solo redispatch after a parallel-
run failure (see above); the mojibake fix and the stale-stub cleanup were applied directly by the
orchestrator. **Result**: PASS — **T081-T098 (all 18 `.d.ts`-backed core/domain components) now
complete.**
**Remaining D01 work**: the 10 built-from-pattern components (T099-T108: `PhoneInput`, `OtpInput`,
`SearchBar`, `Select`, `DateField`, `CategoryCard`, `DoctorCard`, `ListRow`, `Toast`, `ScreenHeader` —
none has an existing `.d.ts`; each needs its prop shape inferred from the kits' inline usage, same care
as a new design), then the 6 web-only dashboard-shell pieces (T109-T114), then T115-119's galleries,
prop-drift check, screenshot check, and checkpoint.
**Commit**: `ca343b5`.

## D01d — Design system port, Wave 4: 7 of the 10 built-from-pattern components

**Scope**: T099 (`PhoneInput`), T100 (`OtpInput`), T101 (`SearchBar`), T104 (`CategoryCard`), T105
(`DoctorCard`), T106 (`ListRow`), T108 (`ScreenHeader`) — 7 of the 10 components with no existing
`.d.ts`. Before writing any brief, mined the actual kit usage for each (grepped
`design/system/ui_kits/**/*.babel` for the real inline patterns these components replace): the phone
field at `mobile/kit-auth.babel`, the hidden-input/visible-boxes OTP pattern at
`mobile-entry/e-auth.babel`, the search-trigger `Input` usage at `mobile-entry/e-home.babel` and
`mobile/kit-booking.babel`, the category grid and settings-row list at `mobile/kit-home.babel`, the
doctor roster/picker at `mobile/kit-booking.babel`, and two slightly different `Header` implementations
(`mobile-entry/e-core.babel`, `mobile/kit-shell.babel`) merged into one `ScreenHeader` spec. Each brief
specified the full prop interface directly (there being no `.d.ts` to point Codex at) and explicitly
corrected one stale-from-the-kit detail: the OTP screen's kit prototype mentions SMS delivery, but this
app's real, already-amended auth flow sends the code by email — the brief told Codex not to carry over
any SMS-autofill affordance (`autoComplete="one-time-code"` etc.), matching `tasks.md`'s own note for
this task. Two Codex batches (`gpt-6-luna`, `high`) dispatched together this time (Batch J: PhoneInput/
OtpInput/SearchBar; Batch K: CategoryCard/DoctorCard/ListRow/ScreenHeader) — **dialed back from 3-way to
2-way parallelism** per D01c's reliability finding.

**`OtpInput` still needed a solo redispatch**: Batch J's mobile file was left as the single word `xyz`
(an aborted placeholder) and the web file was never created; Codex's own report correctly flagged this
one as incomplete this time (unlike D01c's wrongly-pessimistic PetCard report). Removed the stub and
redispatched `OtpInput` alone — succeeded cleanly on the first attempt, including the trickier bits (ref-
based focus-forwarding to a visually-hidden input, and an `onComplete`-fires-once-per-completion guard
via a ref flag that resets once the code drops below full length).

**One more instance of the same recurring mojibake bug** (now the third occurrence; see D01a/D01c):
`DoctorCard.tsx`'s specialty/experience separator (`[specialty, experience].filter(Boolean).join(' · ')`)
came back as the Unicode replacement character on **both** platforms again, identical to D01c's `PetCard`
corruption. Fixed directly (same remedy: replace with the real `·`, U+00B7, verified by codepoint) and
re-scanned every one of this wave's 14 files for `U+FFFD` — none found elsewhere. This is now a
consistent enough pattern (3 for 3 on any middle-dot-style separator Codex has written on this machine)
that any future brief asking for a non-ASCII separator character should budget for checking it
afterward, the same way this log already treats `.ps1` em-dashes as a known landmine.

**Verification performed** (orchestrator's own re-run on the full merged tree, all 14 Wave 4 files):
`pnpm --filter mobile typecheck` and `pnpm --filter web typecheck` both clean; `pnpm --filter mobile
lint` and `pnpm --filter web lint` both clean (same pre-existing warnings as prior D01 passes); `Grep`-
based token-rule re-check (raw hex in quotes, raw `px` literal) — 0 matches across all 14 files; a direct
`U+FFFD` scan of all 14 files — only the one `DoctorCard` instance above, now fixed.

**Files this pass**: `mobile/src/components/{CategoryCard,DoctorCard,ListRow,OtpInput,PhoneInput,
ScreenHeader,SearchBar}.tsx` + the same seven under `web/src/components/`.

**Worker**: Codex (`gpt-6-luna`, `high`), 2-way parallel dispatch, one solo redispatch
(`OtpInput`); the mojibake fix was applied directly by the orchestrator. **Result**: PASS.
**Remaining D01 work**: `Select` and `DateField` (the last 2 of the 10 built-from-pattern components —
`Select` follows the kits' own `Sheet`+`Pick` bottom-sheet pattern; `DateField` uses the libraries
`tasks.md` specifies, `@react-native-community/datetimepicker`/`react-day-picker`, not the kits' plain
`<input type="date">` prototype), `Toast`, then the 6 dashboard-shell pieces (T109-T114), then T115-119's
galleries, prop-drift check, screenshot check, and checkpoint.
**Commit**: `f3a7b7d`.

## D01e — Design system port, Wave 5: Select, DateField, Toast (completes T099-T108)

**Scope**: T102 (`Select`), T103 (`DateField`), T107 (`Toast`) — the last 3 of the 10 built-from-pattern
components, completing all 28 of D01's component-port tasks (T081-T108). Two Codex batches (`gpt-6-luna`,
`high`), 2-way parallel: Batch L (`Select`+`Toast`), Batch M (`DateField` alone, given its own dispatch
since it integrates two entirely different platform libraries).

**Real dependency gap found before trusting either library call**: before writing `DateField`'s brief,
verified both libraries' *actual* installed APIs directly rather than trusting memory or the task
description's one-line mention — read `@react-native-community/datetimepicker`'s own README (confirmed
v9.1.0's real usage: `onValueChange`/`onDismiss`, not the deprecated `onChange` the library's own docs
warn against) and `react-day-picker`'s type definitions directly (confirmed v10.0.2's single-select
`mode="single"`/`selected`/`onSelect` shape). Both briefs quoted the exact confirmed signatures rather
than asking Codex to guess.

**One real gap Codex's own run caught that the orchestrator's dependency setup had missed**: `date-fns`
had only been installed in `web/package.json` (added back in D01a's dependency-prep pass) — mobile never
got it, so `DateField.tsx`'s mobile half failed `tsc` with `TS2307: Cannot find module 'date-fns'`.
Installed it for mobile via `npx expo install date-fns` (SDK-compatible resolution, same approach as
D01a's other mobile installs) before re-verifying.

**`Select` needed a solo-equivalent fix mid-wave**: Batch L's first pass left `mobile/src/components/
Select.tsx` as the literal word `hello` (another aborted-placeholder stub, same class as D01d's `OtpInput`
stub) while the batch was still running; by the time the batch's own completion notification arrived, it
had already overwritten that stub with the real, complete implementation on its own — no redispatch was
needed this time, but it's recorded here because checking the file mid-run (prompted by `DateField`'s own
Codex run flagging `TS2304` errors referencing stray `hello`/`there` identifiers in that file) is what
surfaced it; waiting for the batch's own final report would have missed the transient state.

**One real bug found by reading the diff, not from any gate**: both platforms' `Toast.tsx` built its
auto-dismiss timer with `useEffect(..., [duration, onDismiss])`. Since `onDismiss` is near-certain to be
a fresh inline closure on every call site (e.g. `onDismiss={() => setToast(null)}`), any re-render of the
parent during the toast's lifetime tears down and restarts the timer — a toast whose owner re-renders at
all during `duration` could silently never auto-dismiss. **Fix**: capture `onDismiss` in a `useRef`,
updated by its own effect, and depend the dismiss-timer effect on `duration` alone. The first version of
this fix mutated the ref directly in the render body (`onDismissRef.current = onDismiss;` outside any
effect) — caught immediately by `react-hooks/refs` ("Cannot update ref during render") on both platforms'
lint, a real rule catching a real mistake in the orchestrator's own fix, not Codex's code. Corrected by
moving that assignment into its own `useEffect`.

**Verification performed** (orchestrator's own re-run on the full merged tree, all 6 Wave 5 files, after
the date-fns install and both Toast fixes): `pnpm --filter mobile typecheck` and `pnpm --filter web
typecheck` both clean (this also confirms the `DayPicker` `classNames` slot keys and the `disabled`
matcher shape Codex used are real, correctly-typed v10 API surface, not guessed); `pnpm --filter mobile
lint` and `pnpm --filter web lint` both clean after the ref fix (same pre-existing warnings as prior D01
passes); `Grep`-based token-rule re-check — 0 matches across all 6 files; a direct `U+FFFD` scan — none
found.

**Files this pass**: `mobile/src/components/{DateField,Select,Toast}.tsx` + the same three under
`web/src/components/`, plus `date-fns` added to `mobile/package.json`.

**Worker**: Codex (`gpt-6-luna`, `high`), 2-way parallel dispatch, no redispatch needed this wave; the
`date-fns` install and the `Toast` ref-timing fix (plus its own lint-caught correction) were applied
directly by the orchestrator. **Result**: PASS — **T081-T108 (all 28 D01 components) now complete.**
**Remaining D01 work**: the 6 web-only dashboard-shell pieces (T109 `Sidebar`, T110 `TopBar`, T111
`DataTable`, T112 `Modal`, T113 `RestrictedState`, T114 `StatCard`), then T115-119's galleries, prop-drift
check, screenshot check, and checkpoint.
**Commit**: `9e27a58`.

## D01f — Dashboard shell: Sidebar, TopBar, DataTable, Modal, RestrictedState, StatCard (completes T109-T114)

**Scope**: T109-T114, the 6 web-only dashboard-shell pieces under `web/src/components/dashboard/`. Mined
`design/system/ui_kits/dashboard/kit-chrome.babel`'s `Shell`/`Table`/`Modal`/`Restricted`/`Stat`
prototypes for the real visual/behavioral patterns before writing either brief — that file alone covers
five of the six (its `Shell` combines what became `Sidebar` + `TopBar`). T109's "collapsible" sidebar
requirement has no kit prototype at all (the kit's rail is always expanded), so that interaction was
designed fresh rather than ported. Two Codex batches (`gpt-6-luna`, `high`), 2-way parallel: Batch N
(`Sidebar`/`TopBar`/`StatCard`), Batch O (`DataTable`/`Modal`/`RestrictedState`).

**Two pieces of infrastructure added by the orchestrator before dispatch, not by Codex**: `DataTable`'s
own task text requires URL-backed pagination/sort state via `nuqs` — `nuqs`'s Next.js App Router adapter
(`NuqsAdapter` from `nuqs/adapters/next/app`) must wrap the app for its hooks to work at all, and nothing
in this repo had added it yet, so it was added to `web/src/app/providers.tsx` directly (a one-line,
well-understood infra change, not delegated). Separately, before writing `Modal`'s brief, confirmed
`@base-ui/react/dialog`'s real controlled API (`Dialog.Root`'s `open`/`onOpenChange` props) by reading
`DialogRoot.d.ts` directly rather than assuming a Radix-style signature — `@base-ui/react` is already an
installed dependency used elsewhere in this repo (the unrelated `web/src/components/ui/button.tsx`
shadcn scaffold), so `Modal` is built on its real `Dialog` primitive (full focus-trap, portal, body-scroll
-lock, and Escape-to-close for free) instead of hand-rolling overlay logic a fourth time (after
`ConfirmSheet`, `Select`, and `DateField`'s popover each needed their own).

**One real bug found by reading the diff, the same class D01e's `Toast` fix already caught**:
`DataTable`'s page/sort/dir-changed effect depended on `[page, sort, dir, onQueryChange]`. Since
`onQueryChange` is near-certain to be a fresh inline closure from most call sites, any unrelated
re-render of the owning dashboard page would re-fire the effect and call `onQueryChange` again even
though the actual query hadn't changed — for a callback whose whole purpose is "tell the caller to
refetch," this risks redundant network requests on every unrelated re-render while the table is mounted.
**Fix**: same remedy as `Toast` — capture `onQueryChange` in a `useRef` updated by its own effect, and
depend the query-changed effect on `page`/`sort`/`dir` alone.

**Verification performed** (orchestrator's own re-run on the full merged tree, all 6 Wave 6 files, after
the `DataTable` fix): `pnpm --filter web typecheck` clean (this also confirms `Dialog.Close`'s `render`
prop usage and the `nuqs` setter calls in `DataTable` are real, correctly-typed API surface, not guessed);
`pnpm --filter web lint` clean (same pre-existing `Avatar.tsx` warning as every prior D01 pass); a `Grep`
-based scan for raw hex/`px` literals and for hardcoded `left`/`right`-style classes — 0 matches across
all 6 files; a direct `U+FFFD` mojibake scan — none found.

**Files this pass**: `web/src/components/dashboard/{Sidebar,TopBar,DataTable,Modal,RestrictedState,
StatCard}.tsx`, plus `NuqsAdapter` added to `web/src/app/providers.tsx`.

**Worker**: Codex (`gpt-6-luna`, `high`), 2-way parallel dispatch, no redispatch needed this wave; the
`NuqsAdapter` addition and the `DataTable` ref-timing fix were applied directly by the orchestrator.
**Result**: PASS — **T109-T114 (all 6 dashboard-shell components) now complete. All 34 of D01's
component-build tasks (T081-T114) are done.**
**Remaining D01 work**: T115 (mobile gallery), T116 (web gallery, including the 6 dashboard-shell
pieces), T117 (4-combination screenshot check), T118 (prop-drift checker against the 18 real `.d.ts`
files), T119 (final checkpoint) — the phase's gate for D02.
**Commit**: `ec7f924`.

## D01g — Component galleries (T115, T116)

**Scope**: T115 (`mobile/app/_dev/gallery.tsx`) and T116 (the web gallery), rendering all 28 shared
components plus (web only) the 6 dashboard-shell pieces — 28 mobile usages, 34 web usages. Two Codex
batches (`gpt-6-luna`, `high`), 2-way parallel, both succeeded on the first attempt (no redispatch
needed).

**Real path correction found and fixed before dispatch, not after**: `tasks.md`'s own text names T116's
path as `web/src/app/_dev/gallery/page.tsx`. Checked this against the actual app before writing the
brief — `web/src/middleware.ts`'s `next-intl` matcher (`/((?!api|trpc|_next|_vercel|.*\\..*).*)`) catches
every non-API/asset route, and `web/src/i18n/routing.ts` sets `defaultLocale: 'en'` with next-intl's
default always-prefixed strategy (the same reason the existing login page lives at `[locale]/(auth)/
login`, reachable at `/en/login`, never bare `/login`). The literal task path would 404 under this
app's own routing. Built at the corrected path instead: `web/src/app/[locale]/_dev/gallery/page.tsx`,
reachable at `/en/_dev/gallery` and `/ar/_dev/gallery` — exactly the two URLs T117's screenshot check
needs to hit directly, same pattern as D00e's `d00e-screenshots.spec.ts` navigating `/en/login`/`/ar/
login`. `tasks.md`'s T116 line corrected to record the real path and why.

**Both galleries reviewed component-by-component against each one's real prop interface** (not just
typechecked): confirmed all 28/34 imports resolve to the real component files, every interactive
component (`Rating`, `PhoneInput`, `OtpInput`, `SearchBar`, `Select`, `DateField`, `SlotChip`,
`ConfirmSheet`, `Modal`, `Sidebar`, `TopBar`'s dummy locale/theme state, `DataTable`) is wired to real
local `useState` rather than static placeholders, and `ConfirmSheet`/`Modal` are correctly gated behind
their own trigger `Button`s matching each one's real mount-controlled (`ConfirmSheet`) vs.
`open`-controlled (`Modal`) contract. One usage worth noting, not a bug: the web gallery passes
`w="var(--sp-12)"` / `r="var(--r-full)"` etc. to `Skeleton`'s `w`/`h`/`r` props (typed `number|string`) —
valid and clever on web specifically, since these are real CSS custom properties resolved by the
browser inside an inline `style` object; this is NOT the mobile `var()`/`currentColor` anti-pattern
D01a-d already fixed repeatedly (that restriction is mobile-only, inline `style` objects on web resolve
`var()` normally).

**Verification performed** (orchestrator's own re-run, both files): `pnpm --filter mobile typecheck` and
`pnpm --filter web typecheck` both clean (the web check also confirms `DataTable`'s generic type
inference and every dashboard-shell prop usage in the gallery is real, correctly-typed API surface);
`pnpm --filter mobile lint` and `pnpm --filter web lint` both clean (same pre-existing warnings as every
prior D01 pass); `Grep`-based scans for raw hex/`px` literals and hardcoded `ml-`/`mr-`/`text-left`/
`text-right`/`float-left`/`float-right` classes — 0 matches in either file; a direct `U+FFFD` mojibake
scan — none found.

**Files this pass**: `mobile/app/_dev/gallery.tsx`, `web/src/app/[locale]/_dev/gallery/page.tsx`.

**Worker**: Codex (`gpt-6-luna`, `high`), 2-way parallel dispatch, no redispatch needed. **Result**: PASS.
**Commit**: `795bba7`.

## D01h — Prop-drift checker (T118)

**Scope**: `scripts/check-component-props.ts`, comparing every one of the 18 `.d.ts`-backed components'
real prop interfaces against their mobile/web ports. Dispatched to Codex (`gpt-6-luna`, `high`), one
batch.

**The checker's first version reported 32 "violations" that were all false positives, caught by actually
reading the diff output rather than trusting the self-reported "did not pass" summary as proof the
*components* were wrong** (the mandate's own instruction not to fabricate or accept a weakened passing
result cuts both ways — a failing result also has to be checked, not assumed correct): every single
reported mismatch was one of two cosmetic-only differences, not real drift —
(1) whitespace around union/arrow-function punctuation (`'info'|'warning'` in the hand-written `.d.ts`
files vs `'info' | 'warning'` in the TypeScript-formatted port files — the identical type, different
spacing) and (2) qualified vs. unqualified references to the same type (`React.ReactNode` in the `.d.ts`
files, which `import * as React`, vs bare `ReactNode` in the ports, which `import type { ReactNode }` —
again the identical type). The checker's own `normalizeType` only collapsed whitespace runs to a single
space, which doesn't remove spacing around `|`/`=>`, and did nothing about the qualifier difference.
Separately, Codex's own report claimed the two contract directories contain "19" components, contradicting
`tasks.md`'s stated 18 — independently re-ran the exact same `readdirSync` logic the script itself uses
and got 18, confirming that specific self-reported number was simply wrong (no script bug behind it; not
investigated further since the script's own file-discovery code was already verified correct by this
direct re-run).

**Fix, delegated as a delta brief resuming the same Codex session** (not a fresh dispatch — the session's
`threadId` from the first run let Codex pick up with full context of what it had just built): extended
`normalizeType` to strip all whitespace (not just collapse it) and to strip every `React.` qualifier from
the normalized string on both sides before comparing — a narrow, textual canonicalization of two verified-
equivalent spellings, not a loosening of the actual structural comparison (prop presence, optionality,
and the remaining type text are still compared exactly). Re-verified independently (not trusting the
self-report): `pnpm exec tsx scripts/check-component-props.ts` run directly by the orchestrator now
reports `0 prop-drift violations across 18 components (36 port files checked)`, exit code 0.

**Files this pass**: `scripts/check-component-props.ts`.
**Worker**: Codex (`gpt-6-luna`, `high`), one initial dispatch plus one same-session delta fix after
orchestrator review found the false positives; both re-verified directly by the orchestrator, not
trusted from either report. **Result**: PASS — independently confirmed.
**Commit**: (pending — grouped with T117 below).

## D01i — Gallery screenshot check (T117)

**Scope**: Playwright specs capturing both galleries in all 4 locale/theme combinations
(`mobile/tests/d01-gallery-screenshots.spec.ts`, `web/tests/d01-gallery-screenshots.spec.ts`), modeled on
D00e's existing `d00e-screenshots.spec.ts` pattern. Dispatched to Codex (`gpt-6-luna`, `high`), one batch.

**Mobile half passed cleanly on the first attempt** (all 4 PNGs captured, a fresh `expo export
--platform web` worked around the same "existing `mobile/dist` is stale" issue D00e's own entry already
documented). **Web half failed inside Codex's sandbox**: `next dev`'s SWC native binding couldn't
initialize because its cache-validation step rejected every candidate cache directory as having an
"untrusted owner SID" under the sandbox's restricted token — the same `@swc/core` binding error this log
has now seen reported by essentially every Codex `typecheck` run all through D01a-i, but this is the
first time it actually blocked something load-bearing (a real server start) rather than just the `next
typegen` step that a direct `tsc --noEmit` has always been able to route around. Ran the web half directly
instead (same `pnpm exec playwright test`, outside the sandbox) — the dev server started fine, confirming
this really is sandbox-specific, not a real environment problem.

**Two real, independently-discovered bugs fixed in this pass, neither caught by typecheck or lint — found
by actually running the pages and reading the console, same house style as D00e's three bugs and this
log's recurring pattern:**

1. **The web gallery page was completely unreachable — a genuine 404, not a transient failure.** Running
   the test directly reproduced it immediately against a fresh `next dev`. Root cause: `web/src/app/
   [locale]/_dev/gallery/page.tsx` (D01g's corrected path) sits inside a folder literally named `_dev` —
   and Next.js App Router treats **any** folder prefixed with a literal underscore as a "private folder,"
   excluded from routing entirely, a separate and independent convention from the `[locale]`-segment issue
   D01g already found and fixed. Confirmed against Next.js's own documented escape hatch
   (`%5F`, the URL-encoded underscore, which produces the identical `_dev` URL segment while opting out of
   the private-folder exclusion) rather than guessing. **Fix**: moved the page to `web/src/app/[locale]/
   %5Fdev/gallery/page.tsx` — same URL (`/en/_dev/gallery`, `/ar/_dev/gallery`), now actually routable.
   The move itself hit a second, unrelated obstacle: the original `_dev` directory had been created by a
   Codex `workspace-write` sandbox process and inherited that sandbox's restricted ACL
   (`BUILTIN\Users` had only Read+Execute, no Modify/Delete; confirmed via `icacls`) — a plain rename or
   `git mv` failed with Access Denied, and so did `icacls`'s own attempt to re-grant rights (no
   `WRITE_DAC`) and `takeown` (no `SeTakeOwnershipPrivilege` without admin). A plain recursive delete
   (`rm -rf`) succeeded where rename didn't — Windows evaluates "delete this child" against the *parent*
   folder's permissions, a materially different check from "rename/modify this object," which is why one
   worked and the other didn't. Recreated the page fresh at the correct path afterward. Worth remembering
   for any future case where a Codex-sandbox-created directory needs moving rather than just edited in
   place: try delete-and-recreate before assuming a permissions dead end.
2. **A `next-themes` server/client hydration mismatch on the gallery's own theme-switch button** — the
   exact same bug class D00e already found and fixed once in `ShellControls.tsx` (recorded in that pass's
   log entry), reintroduced here because the gallery page built its own theme toggle from scratch instead
   of reusing `ShellControls`. The button read `theme` from `useTheme()` directly with no mounted guard, so
   the server-rendered label (computed before `next-themes` can know the persisted theme) didn't match the
   client's first real render, surfacing as a console hydration-mismatch error caught by actually opening
   the page and reading the browser console — not by anything the test's own assertions checked, and not
   something Playwright fails a test over by default, so it would have been shipped as a silent defect if
   the console output hadn't been inspected. **Fix**: applied the identical `useSyncExternalStore`-based
   `useMounted()` guard `ShellControls.tsx` already established, gating the button's label the same way.
   Re-ran the test after the fix — the specific hydration-mismatch diff for this button no longer appears.
   One remaining console diff (a `style={{caret-color:"transparent"}}` attribute flagged on several
   `<input>` elements) was investigated and left alone: it reproduces identically before and after this
   fix, on unrelated `Input`/`SearchBar` instances, and matches a well-known Chromium/autofill-injected
   style — React's own hydration-mismatch message explicitly names "a browser extension ... before React
   loaded" as a known external cause distinct from an application bug; not treated as blocking.

**All 8 screenshots (4 mobile + 4 web) visually inspected directly by the orchestrator, not just checked
for file existence** — this is the actual evidence for T119's checkpoint, not an assertion: all 4
combinations render every section without clipping or overflow; dark/light tokens apply correctly in both
apps; the web gallery's RTL (Arabic) screenshots show genuine structural mirroring (sidebar, `DataTable`
column order, `Stepper` progress direction, form label alignment all flip, confirming the logical-
property classNames across every ported component actually work under `dir="rtl"`, not just in isolated
unit review). One limitation recorded, not silently resolved: the **mobile** Arabic screenshots show no
layout mirroring — expected and consistent with PRD §12's own documented constraint that mobile RTL needs
`I18nManager.forceRTL()` followed by an `expo-updates` reload to take effect, which a live Playwright
session (no app reload) cannot exercise; this is the same category of deferred-to-a-real-device
verification D00g's handoff already flagged for mobile screenshots generally, not a new gap. Also noted,
not fixed: `Rating`'s filled vs. unfilled stars are distinguished only by stroke color
(`warning` vs `text-secondary`), not a solid-vs-outline icon, since Lucide's `star` is outline-only and
this was the deliberate, specified design from D01b's brief — legible on close inspection but low-
contrast at a glance; a cosmetic observation, not a defect, and not something to change this late in D01.

**Files this pass**: `mobile/tests/d01-gallery-screenshots.spec.ts`, `web/tests/d01-gallery-screenshots.spec.ts`,
`web/src/app/[locale]/%5Fdev/gallery/page.tsx` (moved from the `_dev` path, with the `useMounted` fix),
8 PNGs under `design/screenshots/d01-gallery/`.
**Worker**: Codex (`gpt-6-luna`, `high`) for both spec files and the mobile run; the web run, the private-
folder path fix, the ACL/permissions workaround, and the hydration-mismatch fix were all done directly by
the orchestrator after the sandboxed run hit its SWC blocker. **Result**: PASS — independently verified
with real screenshots, not self-reported.
**Commit**: `cbbb25b`.

## D01j — T119 final checkpoint: D01 CLOSED

**Scope**: re-verify every one of T117/T118's gate conditions together, on the full merged tree, as the
phase's actual gate for D02 — not a restatement of the individual passes above, a fresh, independent run
of all of them.

**One more real, recurring-class bug found during this final pass, not previously caught**: running the
*full* mobile Playwright suite together (`pnpm exec playwright test`, both specs, 2 workers) — rather
than the single filtered `d01-gallery-screenshots.spec.ts` run D01i's own verification used — failed:
`mobile/dist` (the static export `tests/serve-static.cjs` serves, per `mobile/playwright.config.ts`'s
`reuseExistingServer: true` webServer) was still the **stale export from 2026-10-24**, predating
`gallery.tsx`'s existence entirely (`dist/_dev/` contained only `hello.html`) — the exact same staleness
class T079's entry already documented for `packages/design-tokens/dist/`, now recurring for
`mobile/dist`. D01i's own screenshots were still legitimate (Codex's sandboxed run exported to a
temporary directory specifically to work around a `mobile/test-results` write restriction, confirmed in
its own report), but the checked-in, reusable local `dist/` never got that fresh build, so a plain
re-run of the suite without this fix would fail for the next person. **Fix**: regenerated via `pnpm
exec expo export --platform web --output-dir dist` (confirmed `/_dev/gallery` now listed among the
static routes, 71KB); re-ran the full mobile Playwright suite — both specs pass together. The 4 mobile
PNGs were regenerated as a side effect (byte-different, visually identical on a direct re-check — font
anti-aliasing/non-determinism, not a content change) and re-committed.

**Full checkpoint, every item independently re-verified by the orchestrator on the final merged tree:**

| Gate | Result |
| --- | --- |
| Both galleries render all components in all 4 locale/theme combinations | PASS — all 8 PNGs under `design/screenshots/d01-gallery/` visually inspected directly (not just checked for existence); mobile's full Playwright suite (D00e's + D01's specs together) passes; web's full Playwright suite (same) passes |
| Raw-hex/px rule reports 0 violations against the new component code | PASS — scanned every one of D01's actual deliverables by name (all 28 mobile + 34 web components, `resolveTokenColor.ts`, both gallery files, both screenshot specs, the prop-drift script — 87 files): 0 matches. (A repo-wide sweep separately found 2 raw-hex lines in `mobile/src/components/animated-icon.tsx`/`themed-text.tsx` and 8 raw-px lines in `web/src/app/page.tsx`/`web/src/components/ui/button.tsx` — all pre-existing Expo-template/shadcn-scaffold files from before D01, never touched by any D01 task, out of scope by the same precedent D00e's own T064 checkpoint established of scoping this rule to the phase's actual new files, not the whole legacy tree.) |
| Prop-drift check (T118) passes | PASS — `pnpm exec tsx scripts/check-component-props.ts` run directly: `0 prop-drift violations across 18 components (36 port files checked)` |
| Mobile test suite (Jest) | PASS — 3 suites / 3 tests |
| Web test suite (Vitest) | PASS — 2 files / 3 tests |
| Mobile typecheck / lint | PASS — 0 errors (4 pre-existing warnings, unrelated to D01) |
| Web typecheck / lint | PASS — 0 errors (1 pre-existing warning, unrelated to D01) |

**D01 scope closed**: T081-T119, all 39 tasks. 28 shared components (18 ported prop-for-prop from
`design/system/components/**/*.d.ts`, 10 built from the kits' inline usage patterns) + 6 web-only
dashboard-shell pieces = 34 total components, 2 component galleries, 1 prop-drift checker, 8 verified
screenshots across both apps.

**Known limitations carried forward, not silently resolved (none block D02, all explicitly recorded
here rather than left implicit):**
- Mobile RTL mirroring was not exercised by this phase's screenshot check — PRD §12's own documented
  constraint (`I18nManager.forceRTL()` + an `expo-updates` reload) can't be triggered by a live
  Playwright session without a real reload cycle; same category of deferred-to-device verification
  D00g's handoff already flagged for mobile screenshots generally.
- `Rating`'s filled/unfilled stars differ only by stroke color (Lucide's `star` icon has no solid
  variant) — legible but low-contrast; a deliberate, specified design choice from D01b, not a defect.
- Three separate Windows/Codex-sandbox environment issues recorded across D01a-j (the `codex.cmd` PATH
  shim, the `lint-design-tokens.ts` `pnpm exec tsx` hang worked around with direct `Grep` scans
  throughout, and the SWC-native-binding/cache-ACL failures inside `workspace-write` sandboxes) remain
  environment quirks, not root-caused to a single fix — each was worked around per-occurrence as
  documented in its own entry above.
- The two still-open, explicitly-flagged-not-silently-resolved PRD/implementation questions carried
  since D00g (the Egyptian-phone-format-vs-E.164 `phoneSchema` contradiction; whether the email-code
  lockout can be bypassed via Supabase Auth's public endpoints) remain unresolved and are D02's to pick
  up, not D01's.

**Worker**: orchestrator (Claude Code), direct — this pass's fix (the `dist` regeneration) was a build-
artifact regeneration, not application code, so it was done directly rather than delegated, consistent
with every prior pass's convention of delegating implementation/scripts but not environment
housekeeping. **Result**: PASS.

# D01 STATUS: COMPLETE — VERIFIED — CLOSED

**Commit**: (pending — this pass's regenerated screenshots and this entry not yet committed).

## D02 documentation checkpoint — T120-T122 (2026-10-26)

T121 is complete as a verified investigation: local Auth settings reported `email=true`, `google=false`,
`apple=false`; official Supabase documentation confirms automatic same-email linking and describes
Manual Linking as a separate beta OAuth identity flow. Google was disabled locally, so automatic linking
was not runtime-exercised. T179's planned email-code identity attachment through `verify-otp-guard` is
not established by the official docs and remains unresolved.

T122 is complete as a configuration-file change: only
`backend/supabase/config.toml`'s `auth.enable_manual_linking` changed from `false` to `true`; Python
`tomllib` independently parsed and confirmed the value. The local Auth container was not restarted, so
runtime application is unconfirmed. Staging/production Manual Linking toggles remain prerequisites.

T120 remains open. Supabase CLI 2.121.0 status reported local API `127.0.0.1:54321` and Mailpit
`127.0.0.1:54324`. Three direct `POST /auth/v1/otp` sends for synthetic
`t120-20261026@example.test`, 1.2 seconds apart, returned 200 and produced three inbox messages. Six
direct `POST /auth/v1/verify` requests with an invalid token returned 403 / `error_code=otp_expired`.
The default local email rendered a sign-in link, not a visible six-digit code. Therefore the exact
five-wrong-attempt cancellation, three-cancelled-code lockout, and correct-after-five experiment remain
unverified. A+ is already evaluated in research §17; no mitigation was selected. Neither T120 nor D02
is complete.


## D02 offline infrastructure checkpoint: T170-T172 (2026-10-26)

T170 adds the mobile `useNetworkStatus` NetInfo hook and a focused connectivity-change test. It
falls back to `isConnected` when `isInternetReachable` is `null`. T171 adds mobile and web
`OfflineBanner` compositions using the existing `Banner`: mobile uses T170's hook, while web uses
a web-native, SSR-safe browser-event hook without importing mobile code. Added the generic bilingual
`common.offlineActionRequiresConnection` message; both locale files were verified as UTF-8.

T172's reusable `useOfflineGuardedAction` hook and test are present. Representative-screen wiring is
deferred because `/pets/new` does not yet exist and cannot be wired without starting D03. No D03
route or screen was created, and T172 remains open.

Independent orchestrator gates: mobile Jest: 5 suites / 5 tests pass; mobile typecheck passes; mobile
lint: 0 errors / 4 existing warnings. Web Vitest: 2 files / 3 tests pass; web typecheck passes; web
lint: 0 errors / 1 existing warning. `i18n:check` passes with 598 matching keys; `git diff --check`
passes. No native development build or runtime test was run; the NetInfo native module requires rebuilt
development binaries. D02 is not complete.

## D02 mobile Supabase encrypted session storage — T164 (2026-10-26)

T164 is complete. The mobile Supabase client uses an encrypted storage adapter: an AES-256-GCM
key is persisted in SecureStore, while versioned ciphertext envelopes are stored in AsyncStorage.
Legacy plaintext is migrated on read by encrypting it, persisting and reading back the envelope,
then returning the session; failures attempt to restore the original plaintext. GCM authentication
data binds each envelope to its storage key and version.

The focused Jest coverage exercises round-trip storage, plaintext migration, persistence recovery,
malformed/tampered values, missing keys, and serialized operations. Crypto execution was unit-tested
through a mocked crypto adapter; no native device or build runtime was exercised, so end-to-end native
encryption is unverified.

Independent orchestrator gates: mobile tests pass (6 suites / 10 tests); mobile typecheck passes;
mobile lint passes (4 existing warnings, 0 errors); `git diff --check` passes. `expo install --check`
reports only existing version drift: `@expo/ui` 57.0.25 vs expected ~57.0.26, `expo` 57.0.30 vs
~57.0.31, and `expo-router` 57.0.28 vs ~57.0.29. It reports no drift for the newly added
`expo-crypto` or `expo-secure-store` packages. T165 remains open.

## D02 database foundation, Batch 1 — T123 (partial), T124, T125, T133 (2026-10-26)

**Scope**: the core identity chain — `cities`, `profiles`, `clinics` (slim), and T133's
`clinics.status` update revoke. First batch of D02's database foundation; everything else in Group B
(T126-T134) and most of the rest of D02 depends on these three tables existing. Dispatched to Codex
(`gpt-6-luna`, `high`), one batch (sequential by nature — migrations in a dependency chain, not
independent files safe to parallelize).

**T123 deliberately split**: the task is "`cities` table + RLS + seed," but the actual launch-city list
is an open, unresolved owner decision (no PRD/spec/data-model document names one) — see Decision D in
this session's status report. Built the table + RLS, left it with zero rows, and left T123 unchecked in
`tasks.md` pending the seed. This is not a shortcut: the table/RLS/FK structure that everything else in
this phase needs is fully in place, only the actual city names are missing.

**Sandbox limitation, same class as D01's SWC-binding issue**: Codex's `workspace-write` sandbox could
not reach the Docker API (`permission denied ... npipe:////./pipe/docker_engine`), so it could not run a
true `supabase db reset` to verify from a clean slate — it applied the migrations incrementally via
`supabase migration up --db-url` against the already-running local stack instead, then verified with
direct SQL queries. The orchestrator then ran a genuine `supabase db reset` directly (outside the
sandbox) against the same local stack — all 7 migrations (the 3 existing D00 ones + these 4) applied
cleanly from a fully recreated database, confirming the sandboxed incremental-apply result wasn't masking
an ordering or clean-install problem.

**Full review of the actual SQL, not the self-report** (all 4 new files read in full): the `profiles`
role/status-protection trigger (`protect_profile_role_status()`) correctly blocks both a privileged
self-insert (INSERT with `role`/`status` other than the defaults) and a self-escalation UPDATE (any
change to `role`/`status`) for any caller whose JWT `user_role` claim isn't `admin`/`super_admin` —
correctly fails closed for *everyone* right now, since `custom_access_token_hook` (T135, not yet done)
doesn't inject that claim yet, so no one currently has it; this is expected sequencing, not a bug. The
`clinics.status` revoke (T133) is implemented as three statements (blanket revoke, re-grant the three
non-status columns, redundantly re-revoke `status`) that are partially redundant with the column-scoped
grant the `clinics` migration already used (`status` was never grantable in the first place) — harmless,
and keeping T133 as its own explicit, auditable migration (rather than relying on an implicit side effect
of an earlier one) is the right call for a security-relevant revoke regardless of the redundancy.
Independently re-verified via `information_schema.column_privileges` after the clean reset: `authenticated`
has `UPDATE` on `city_id`/`name_en`/`name_ar` but **not** `status` — confirmed, including for the
`admin`/`super_admin` application roles, since both are still just the Postgres `authenticated` role; any
status change (by anyone, including admins) must go through the future `set_clinic_status` RPC (D05),
matching `data-model.md`'s stated intent that status changes are audit-logged there, not via raw SQL.

**One minor, non-blocking note**: the new migration files use timestamps (`20261019113454`-`57`) that
continue right after the three existing Oct-19 migrations rather than reflecting today's actual date —
cosmetically inconsistent with the rest of this project's dated migration history, but functionally
correct (they sort and apply in the right order either way). Left as-is rather than renaming, to keep
moving; flagging here in case a future pass wants to normalize migration-file dating conventions.

**Verification performed** (orchestrator's own re-run, full merged tree): `pnpm --filter backend exec
supabase db reset` — clean, all 7 migrations applied in order; direct `psql` queries against the result
confirmed RLS enabled on all 3 new tables, 0 `cities` rows, and the exact column-grant state described
above.

**Files this pass**: `backend/supabase/migrations/20261019113454_create_cities.sql`,
`.../20261019113455_create_profiles.sql`, `.../20261019113456_create_clinics.sql`,
`.../20261019113457_revoke_clinic_status_updates.sql`.

**Worker**: Codex (`gpt-6-luna`, `high`); the clean-reset verification was done directly by the
orchestrator after the sandboxed run hit its Docker-access limitation. **Result**: PASS (T124, T125,
T133 complete; T123's structure done, seed pending Decision D).
**Commit**: `0041884`.

## D02 database foundation, Batch 2 — T126, T127, T128 (2026-10-26)

**Scope**: `clinic_staff`, `push_tokens`, `consents` — depend on `profiles`/`clinics` from Batch 1.
Dispatched to Codex (`gpt-6-luna`, `high`), one sequential batch (same reasoning as Batch 1: a
dependency-chained set of migrations, not independent files to parallelize).

**Same Codex-sandbox Docker-access limitation as Batch 1**, correctly self-reported this time rather
than silently working around it: `supabase db reset` failed with the same `npipe` permission error;
Codex fell back to applying the three migrations individually via `supabase db query --local` and
verified with direct catalog queries. Orchestrator ran a genuine `supabase db reset` afterward — all 10
migrations (the 3 D00 ones + Batch 1's 4 + these 3) applied cleanly from a fully recreated database.

**Full review of the actual SQL** (all 3 files read in full): correct composite PK on `clinic_staff`
(`clinic_id`, `user_id`) with the separate `user_id` index for reverse lookups; `push_tokens`'s
`platform` check constraint and `token` uniqueness match spec; `consents`'s append-only design correctly
has no update/delete policy and an explicit `REVOKE UPDATE, DELETE ... FROM PUBLIC, anon, authenticated`
— independently confirmed via `information_schema.table_privileges` after the clean reset: neither
`anon` nor `authenticated` holds `UPDATE`/`DELETE` on `consents`. Both `clinics`/`profiles`'s
clinic-staff-dependent RLS clauses remain correctly deferred (code comment left in `clinic_staff`'s own
migration noting the dependency chain) — not silently added despite the dependency now existing, since
`profiles`'s clause additionally needs `appointments` (D06), which still doesn't exist.

**Verification performed** (orchestrator's own re-run): `pnpm --filter backend exec supabase db reset`
clean, all 10 migrations applied in order; direct `psql` queries confirmed RLS enabled on all three new
tables and the exact `consents` grant state described above.

**Files this pass**: `backend/supabase/migrations/20261026120000_create_clinic_staff.sql`,
`.../20261026120001_create_push_tokens.sql`, `.../20261026120002_create_consents.sql`.

**Worker**: Codex (`gpt-6-luna`, `high`); the clean-reset verification was done directly by the
orchestrator after the sandboxed run hit the same Docker-access limitation as Batch 1. **Result**: PASS.
**Commit**: `6aed6b3`.

## D02 database foundation, Batch 3 — T129, T130, T131, T132 (2026-10-26)

**Scope**: `audit_logs`, the shared `write_audit_log()` function, `feature_flags`, `app_config` — the
generic admin-write audit mechanism every later phase's admin RPCs/Edge Functions depend on. Dispatched
to Codex (`gpt-6-luna`, `high`), one sequential batch.

**Codex's sandbox was fully blocked this time, correctly self-reported rather than silently skipped**:
unlike Batches 1-2 (which could at least fall back to an incremental `supabase migration up`/`db query`
against the already-running stack), this run hit both the same Docker-API permission denial *and* a
`psql`-unavailable limitation, plus an `EPERM` writing Supabase's own telemetry temp file. It wrote the
four migrations and explicitly reported it had run **zero** verification — no schema check, no grant
check, no audit-trigger test. Correctly left T129-T132 unmarked in its own report rather than claiming
anything passed.

**One real, security-relevant judgment call worth recording, found by reading the actual SQL**: the
brief asked Codex to block direct client writes to `audit_logs` from `authenticated`/`anon`. Codex's
migration went further and also `REVOKE ALL ... FROM ... service_role` — a stricter read of
`data-model.md`'s own stated intent ("`audit_logs` is written exclusively through `write_audit_log()`
... never a raw `INSERT` from a client") than what was explicitly asked. This does not break
`write_audit_log()` itself: it's `SECURITY DEFINER`, so it inserts using the *function owner's*
privileges (the migration-running role), not the caller's — a table-level `REVOKE` from `service_role`
has no effect on a `SECURITY DEFINER` function's own internal operations. Confirmed this holds in
practice below (the live audit-trigger test below inserted successfully despite the revoke). Kept as-is
rather than loosened, since it correctly forces every writer — even privileged backend code — through
the one audited chokepoint, which is the stronger and more correct interpretation of the stated design.

**Verification performed entirely by the orchestrator, from zero** (Codex ran none): `pnpm --filter
backend exec supabase db reset` — clean, all 14 migrations (3 D00 + Batches 1-3's 11) applied in order.
Direct `psql` queries confirmed: all 5 `feature_flags` seeded correctly (`shop_enabled`, `mating_enabled`,
`adoption_enabled`, `payments_enabled`, `video_enabled`, all `enabled = false`); `app_config` empty; RLS
enabled on `audit_logs`/`feature_flags`/`app_config` (one early query without a schema join returned a
confusing duplicate `feature_flags` row — turned out to be Supabase's own unrelated internal
`_realtime.feature_flags` table coincidentally sharing the name, not a real issue, resolved by
re-scoping the query to `nspname = 'public'`); `audit_logs` grants confirmed exactly `authenticated:
SELECT` and nothing else for `anon`/`service_role` (matching the stricter revoke above). **Then actually
exercised the audit trigger end to end**, the thing Codex itself couldn't test: ran `UPDATE feature_flags
SET enabled = true WHERE key = 'shop_enabled';` directly, confirmed a real row landed in `audit_logs`
with `action = 'update'`, `entity = 'feature_flags'`, `entity_id = 'shop_enabled'`, and a `diff` jsonb
containing both the full old and new row state; reverted the flag to `false` and confirmed a second,
correctly-captured audit row for the revert, leaving the seed state exactly as it started (2 audit rows
total, both independently inspected).

**Files this pass**: `backend/supabase/migrations/20261026120003_create_audit_logs.sql`,
`.../20261026120004_create_write_audit_log.sql`, `.../20261026120005_create_feature_flags.sql`,
`.../20261026120006_create_app_config.sql`.

**Worker**: Codex (`gpt-6-luna`, `high`) for the SQL; every verification step (clean reset, schema/grant
queries, and the live audit-trigger test) was done entirely by the orchestrator, since the sandbox could
run none of it this time. **Result**: PASS — independently confirmed, not self-reported.
**Commit**: `d2b677d`.

## D02 database foundation, Batch 4 — T134, completes Group B (2026-10-26)

**Scope**: `otp_attempts`, the last of the 10 D02 foundation migrations (T123-T134). Dispatched to
Codex (`gpt-6-luna`, `high`), one batch.

**A third, different sandbox limitation than Batches 1-3**: Docker access was denied as before, but
this time `supabase migration up --local` *also* failed with `MigrationMissingLocalError` ("Remote
migration versions not found in local migrations directory") — the sandboxed session's view of the
local migration history had drifted from what the orchestrator's own direct `supabase db reset` runs had
already applied in Batches 1-3. Codex correctly recognized this, fell back to applying the single
migration's statements individually via `supabase db query --local`, and reported the mismatch rather
than silently working around it or guessing.

**One fact worth confirming rather than assuming**: the migration enables RLS with zero policies and
grants full access only to `service_role` — this is correct specifically because Supabase's
`service_role` carries `rolbypassrls = true` by default (RLS doesn't apply to it regardless of policy
count), which is Supabase's own standard configuration, not something this migration sets up itself.
Verified this directly rather than taking it on faith: queried `pg_roles.rolbypassrls` for all three
roles (`service_role: true`, `authenticated`/`anon`: `false`), then literally `SET ROLE service_role;`
and inserted a real test row into `otp_attempts`, confirming write access in practice, not just by
inference from the catalog flag — deleted the test row afterward.

**Verification performed** (orchestrator's own, from a genuine clean reset): `pnpm --filter backend exec
supabase db reset` — all 15 migrations (3 D00 + Batches 1-4's 12) applied cleanly in order, completing
the entire D02 database foundation. Direct queries confirmed the exact column set, the unique
`identifier` constraint, the partial `locked_until` index, RLS enabled, zero grants for `anon`/
`authenticated`, and the `service_role` bypass-RLS write test above.

**T123-T134 (Group B, database foundation) is now fully complete** except T123's seed data, still
pending Decision D (launch cities) — table/RLS/FK structure for all 10 tables is in place and verified.

**Files this pass**: `backend/supabase/migrations/20261026120007_create_otp_attempts.sql`.

**Worker**: Codex (`gpt-6-luna`, `high`); the clean-reset verification and the `service_role` bypass-RLS
proof were done directly by the orchestrator. **Result**: PASS.
**Commit**: (pending — this pass's files not yet committed).

## D02 Batch 6 — T165, T169 (2026-10-26)

**Scope**: T165 (mobile `AppState` foreground session refresh) and T169 (React Query providers on both
platforms, with offline cache persistence on mobile). Dispatched to Codex (`gpt-6-luna`, `high`), one
batch.

**Path correction found (same class as T116's D01 gallery-path fix)**: T169's task text names
`mobile/src/app/_providers.tsx`, but mobile's Expo Router tree lives directly under `mobile/app/` (not
`mobile/src/app/`) — confirmed by the already-existing `mobile/app/_layout.tsx` and `mobile/app/_dev/`.
Codex placed the new file at the corrected `mobile/app/_providers.tsx`; `tasks.md` updated to record the
correction.

**T165**: added a module-scope `AppState` listener in `mobile/src/lib/supabase.ts`, after the shared
client is created — `supabase.auth.startAutoRefresh()` on `active`, `stopAutoRefresh()` otherwise, per
Supabase's React Native auth guide. `detectSessionInUrl: false` (already set by T164) is untouched.

**T169**: `mobile/app/_providers.tsx` wraps children in `PersistQueryClientProvider` with
`createAsyncStoragePersister({ storage: AsyncStorage })`, mounted outermost in `mobile/app/_layout.tsx`
(wrapping `I18nProvider` and the themed Stack, in that order — no existing provider removed or
reordered). `web/src/app/providers.tsx` wraps children in `QueryClientProvider` using a per-render
`useState(() => new QueryClient())` (the documented Next.js App Router pattern, since there's no
Suspense-query usage in the web app to worry about the known `useState`-under-Suspense caveat), mounted
outermost around the existing `NuqsAdapter`/`ThemeProvider`/`ObservabilityInit` composition.

**Dependencies pre-installed directly by the orchestrator** before dispatch (not by Codex): `@tanstack/react-query`
(both apps), `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister` (mobile
only) — typecheck confirmed clean on both before the batch was dispatched; committed separately as
`e25b9e8` "chore(D02): add React Query for T169".

**Verification performed** (orchestrator's own, independent of Codex's self-report): `pnpm --filter
mobile typecheck` (clean), `pnpm --filter mobile lint` (0 errors, 3 pre-existing warnings, all in
unrelated i18n files), `pnpm --filter mobile test` (6 suites/10 tests pass), `pnpm --filter web
typecheck` (clean — Codex's sandbox again hit its recurring Next.js SWC-native-binding/cache denial on
`next typegen`, confirmed sandbox-only by running the equivalent `tsc --noEmit` directly), `pnpm --filter
web lint` (0 errors, 1 pre-existing warning in `Avatar.tsx`), `pnpm --filter web test` (2 files/3 tests
pass). Read all four changed files in full; no scope creep, no provider reordering, no removed code.

**Files this pass**: `mobile/app/_providers.tsx` (new), `mobile/app/_layout.tsx`,
`mobile/src/lib/supabase.ts`, `web/src/app/providers.tsx`.

**Worker**: Codex (`gpt-6-luna`, `high`). **Result**: PASS.
**Commit**: (pending — this pass's files not yet committed).
