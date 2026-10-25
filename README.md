# FurEver

> This file currently covers Docker usage only (D00f/T072). Repo layout, the one-command
> run, and a link to `specs/001-furever-platform/quickstart.md` are added by D00g's T077 —
> extend this file then rather than replacing it.

## Docker

`docker-compose.yml` runs the **web** dashboard's dev server and a set of one-shot
**tool** containers (lint, typecheck, unit-test, pgTAP). Local Supabase is started
separately via the Supabase CLI (`pnpm stack:up` does both, in order — see
`specs/001-furever-platform/quickstart.md`).

```powershell
pnpm stack:up      # supabase start, then `docker compose --profile dev up`, waits on health checks
pnpm stack:down     # stop the web container and local Supabase (keeps data)
pnpm stack:reset    # stop everything, discard Docker volumes and Supabase data, bring it back up clean
pnpm build:prod-web  # build web/Dockerfile's production `runner` target and confirm its HEALTHCHECK passes
```

Tool containers (ad hoc, each one-shot):

```powershell
docker compose --profile tools run --rm lint
docker compose --profile tools run --rm typecheck
docker compose --profile tools run --rm unit-test
docker compose --profile tools run --rm pgtap   # needs the local Supabase stack already running
```

### What does **not** run in Docker, and why

| Thing | Runs on | Why | Host-side command |
| --- | --- | --- | --- |
| Metro bundler (mobile) | Windows host | The Android emulator and physical devices on the LAN need to reach Metro directly; Docker's network layer (especially on Windows) adds failure modes for no benefit (`research.md` §11). | `pnpm --filter mobile start` |
| Android emulator | Windows host | Virtualized Android inside a Linux container isn't practical on Windows Docker Desktop. | Launch from Android Studio, or `emulator -avd <name>` |
| EAS builds (iOS and Android release/dev builds) | Expo's cloud build service, not this machine at all | No macOS is available locally, so iOS binaries can only be produced by EAS Build; Android dev/release builds use the same pipeline for consistency. | `pnpm --filter mobile exec eas build --platform <ios\|android>` |

### Port note

`stack:up` publishes the dev web container on **host port 3010** (container-internal port
stays 3000) — this is a shared dev machine with other projects' containers, and 3000 was
already taken by an unrelated project when D00f was built. `stack-up.ps1` prints the
actual URL at the end of the run; trust that over any hardcoded `:3000` you see
elsewhere.

### Windows file-watching note

If the repo stays on a Windows drive (as it is today), the containerized `web` dev
service needs polling-based file watching — `docker-compose.yml` sets
`WATCHPACK_POLLING=true` for exactly this reason (`research.md` §10). Expect noticeably
slower hot-reload than a native Linux filesystem; cloning into the WSL2 filesystem
instead removes the need for polling, at the cost of a different working-directory path
than this checkout.
