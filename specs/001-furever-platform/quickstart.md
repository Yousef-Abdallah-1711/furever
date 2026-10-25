# Quickstart: FurEver Platform (Phase 1)

This validates that Delivery Phase D00 (see `plan.md`) actually produced a working stack, and gives the
one-command path every later delivery phase builds on. It is a run/validation guide — implementation lives
in `tasks.md` and the code itself, not here.

## Prerequisites

- Windows 10/11 with **Docker Desktop** (WSL2 backend enabled) and PowerShell.
- Node version matching the repo's `.nvmrc`, `pnpm` (via Corepack), and the Supabase CLI (≥ v1.11.4 — pin
  the exact version at D00 start; see `research.md` §9).
- For mobile device/emulator testing: Android Studio (emulator runs on the Windows host, not in Docker —
  `research.md` §11) and an Expo/EAS account (iOS cannot be built locally — EAS Build only).
- **Windows file-watching note** (`research.md` §10): if this repo stays on a Windows drive (e.g. `H:\...`,
  as it is today), dev-server file watching needs polling mode — the root scripts below set that
  automatically. For the fastest HMR, clone instead into the WSL2 Linux filesystem and run Docker from
  there; either path is supported.

## One-command setup and run

```powershell
pnpm install
pnpm stack:up
```

`stack:up` (defined in D00) starts, in order, and waits on health checks before returning:

1. The Supabase local stack (via the Supabase CLI, which itself drives Docker) — Postgres, Auth with the
   **local email inbox** enabled (no real email is ever sent from a dev machine — owners sign in by email
   code, not phone/SMS, as of the 2026-10-18 sign-in method change), Storage, Realtime, PostgREST.
2. **`web/.env.local`**, if it doesn't exist yet (true on a fresh clone): `stack-up.ps1` creates it from
   `web/.env.example`, reusing `supabase start`'s own printed anon key and pointing
   `NEXT_PUBLIC_SUPABASE_URL` at `http://host.docker.internal:54321` so the containerized web app can reach
   the host's local Supabase. Found as a genuine gap by running this exact one-command path from a real
   fresh clone (T079, 2026-10-25) — `docker compose up` previously failed outright with "env file ... not
   found" before this fix existed. If you need different values (a real Sentry/PostHog DSN, for example),
   edit the generated `web/.env.local` afterward; it's gitignored.
3. The `web` dev server (containerized, hot reload via polling on Windows bind mounts). Its startup command
   regenerates `packages/design-tokens/dist/` *inside the running container* before starting `next dev` —
   also found via the same fresh-clone run: the compose file bind-mounts `./packages` over whatever the
   Docker image generated at build time, so a host that has never locally run `pnpm tokens:build` (true of
   every fresh clone) would otherwise 500 on `Can't resolve '.../design-tokens/dist/variables.css'`.
4. Prints the mobile command to run next (Metro runs on the host, not in Docker — `research.md` §11):
   ```powershell
   pnpm --filter mobile start
   ```

**Verified 2026-10-25 (T079)**: `pnpm install` then `pnpm stack:up` was run verbatim from a genuinely fresh
`git clone` (a new directory, not an existing working copy) and reached a healthy web container serving the
real themed login placeholder in both locales — the two fixes above are what made that true; before them,
the same two steps failed on a fresh clone every time.

## Validation scenarios (what "D00 is done" looks like)

Run these after `stack:up` succeeds; each one maps to a D00 exit criterion in `plan.md`.

1. **Web shell, four combinations**: open `http://localhost:3000` (or the port `stack:up` prints). Confirm
   the themed placeholder login page renders correctly in Arabic/English × light/dark (switch via the
   placeholder's language/theme toggles). No raw hex or unthemed flash should appear in any combination.
2. **Mobile shell, four combinations**: with Metro running, open the dev build (or Expo Go, for this
   shell-only screen) on an Android emulator or device. Confirm the themed "hello" screen renders in all
   four combinations and that switching Arabic/English flips direction with exactly one reload.
3. **Database and RLS gate**:
   ```powershell
   pnpm db:test     # runs pgTAP via `supabase test db`
   ```
   Expect all tests green, including the CI query that fails if any `public` table lacks RLS.
4. **Token and i18n generation**:
   ```powershell
   pnpm tokens:build   # regenerates packages/design-tokens from design/system/tokens/*.css
   pnpm i18n:check     # fails if ar.json and en.json key sets differ
   ```
5. **Type generation**:
   ```powershell
   pnpm types:gen      # supabase gen types typescript → packages/shared
   ```
6. **Production web image**:
   ```powershell
   docker build -f web/Dockerfile --target runner -t furever-web:local .
   docker run --rm -p 3000:3000 furever-web:local
   ```
   Expect the container to start and pass its healthcheck.
7. **Tear down**:
   ```powershell
   pnpm stack:down     # stop everything
   pnpm stack:reset     # stop + wipe local Supabase data, for a clean re-run
   ```

## Where to look when something fails

- Supabase local stack won't start → check Docker Desktop is running and WSL2 integration is enabled;
  `supabase status` shows which service failed.
- Mobile dev build can't reach Metro on a physical device → use `expo start --tunnel`
  (`research.md` §11) instead of LAN mode.
- Hot reload isn't firing inside the containerized `web` service on a Windows-drive checkout → confirm the
  polling env var D00 sets (`WATCHPACK_POLLING=true` or equivalent) is actually present in the container; see
  `research.md` §10 for why plain bind-mount `inotify` does not work from `/mnt/...` paths.

## Later delivery phases

Each delivery phase D01-D08 adds its own validation scenarios when it starts (per `plan.md`); this file is
updated incrementally rather than rewritten, so the one-command flow above never goes stale.
