# Implementation Log — FurEver Platform (specs/001-furever-platform)

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
