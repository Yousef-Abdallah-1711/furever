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
| T037 | codex | 0 | `pnpm.cmd exec biome check design/scripts/extract-i18n.ts design/scripts/extract-i18n.test.ts`; `pnpm.cmd exec tsx design/scripts/extract-i18n.test.ts`; `pnpm.cmd exec tsx design/scripts/extract-i18n.ts`; `pnpm.cmd i18n:check`; JSON key-set comparison against `71e1aaa`; raw-byte and `git diff --check` checks | PASS ? merge-safe extractor retains hand-added and older keys; its check confirms `screens.app.testKey` and draft entries survive a rerun. Extracted 553 keys from 44 Built screens; en/ar/draft key sets each gained 75 and removed 0; parity reports 591 keys. Welcome tagline, email field label, and email-era overrides are sourced from `design/overrides.md`. One dynamic `t()` call is recorded under Doc changes needed. | 71e1aaa, pending |
| T038 | codex | 0 | `pnpm.cmd exec biome check design/scripts/verify-screen-count.ts`; `pnpm.cmd exec tsx design/scripts/verify-screen-count.ts`; raw-byte and `git diff --check` checks | PASS — plan-driven screen count matched: 70/70. The script reads the mapped total from the Coverage Table heading; it has no hardcoded count. | 966558e |
| T039 | codex | 0 | `pnpm.cmd exec biome check` on all five D00d scripts; reran Built and Spec extractors, screen-map builder, i18n extractor, screen-count verifier, and `pnpm.cmd i18n:check`; raw-byte scan across generated design and i18n text files; `git diff --check` | PASS — regenerated 44 Built records and 26 Spec stubs; map and Coverage Table matched 70/70; i18n parity passed with 516 total keys; all 79 checked text files had UTF-8/LF bytes. No generated drift. **D00d complete; stop for review.** | 249e17b |

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

## Handoff note

- **Done**: D00d source attribution and merge-safe i18n updates; corrected the T039 commit reference.
- **Next**: complete D00d checkpoint evidence, then make the official Tailwind major-version decision before any D00e scaffold work.
- **Risks**: one dynamic `/complete-profile` translation needs a manual key; screen inventory attribution needs a documentation update. T063 still requires four actual mobile screenshots from an emulator/device.
- **Working commands**: `pnpm.cmd exec tsx design/scripts/extract-built.ts`; `pnpm.cmd exec tsx design/scripts/extract-i18n.ts`; `pnpm.cmd i18n:check`; `pnpm.cmd exec tsx design/scripts/verify-screen-count.ts`.
