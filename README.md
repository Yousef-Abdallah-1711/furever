# FurEver

A pet-care platform: an Expo (React Native) mobile app for owners, a Next.js dashboard
for clinic staff and admins, and a Supabase (Postgres) backend. Phase 1 covers auth,
pets and health passports, clinic booking with a live queue, and the admin/clinic
dashboards — see the [PRD](docs/PRD.md) for the full product scope and
[`specs/001-furever-platform/plan.md`](specs/001-furever-platform/plan.md) for the
delivery-phase architecture.

## Status

Foundation phases D00a–D00f are built and checkpointed: tooling, backend init, shared
packages, design-token/i18n extraction, the mobile and web app shells (themed, RTL-aware,
observability wired behind flags), and the Docker/Compose dev stack. D00g (this phase)
completes the PRD and this document. **No feature work has started yet** — auth, pets,
clinics, booking, and the live queue (D02 onward) are all still ahead. The authoritative,
up-to-date task-by-task status lives in
[`specs/001-furever-platform/tasks.md`](specs/001-furever-platform/tasks.md); the
reasoning and real bugs found along the way are in
[`specs/001-furever-platform/implementation-log.md`](specs/001-furever-platform/implementation-log.md).

## Repository layout

```text
mobile/           Expo Router app (owners) — mobile/app routes, mobile/src/{components,hooks,i18n,lib}
web/               Next.js App Router dashboard (clinic staff, admins) — web/src/app, web/src/{components,i18n,lib}
backend/           Supabase project — backend/supabase/{migrations,functions,tests,scripts}
packages/
  design-tokens/   Generates CSS variables + a Tailwind preset from design/system/tokens/*.css
  i18n/            packages/i18n/{en,ar}.json — the one source of translated text for both apps
  shared/          Zod schemas and generated Supabase types, shared by web and mobile
design/            Ported design system (design/system/) and generated screen inventory/screenshots
scripts/           Cross-platform tsx scripts plus their PowerShell wrappers (stack-up.ps1, etc.)
specs/001-furever-platform/   Spec Kit artifacts: spec.md, plan.md, tasks.md, data-model.md,
                   research.md, quickstart.md, implementation-log.md, contracts/
docs/              PRD.md (amended, authoritative), environments.md, future-phases.md
```

## Prerequisites

- **Node** matching [`.nvmrc`](.nvmrc) (22.13.0), with `pnpm` enabled via Corepack.
- **Docker Desktop** (WSL2 backend on Windows) — runs the web dev container and the
  one-shot lint/typecheck/unit-test/pgTAP tool containers.
- **Supabase CLI** — installed as a workspace devDependency (`backend/package.json`); no
  separate global install needed. Local Supabase itself still runs in Docker, orchestrated
  by the CLI.
- For mobile device/emulator work specifically: Android Studio (the emulator runs on the
  host, not in Docker) and an Expo/EAS account for builds. **Not available in every
  environment** — see Known limitations below.

## Environment configuration

Each app reads its config from a local, gitignored `.env.local` (or `.env`), copied from
a committed `.env.example` template. Templates exist for `mobile/` and `web/`:
[`mobile/.env.example`](mobile/.env.example), [`web/.env.example`](web/.env.example).
**`backend/.env.example` is referenced by [`docs/environments.md`](docs/environments.md)
but does not exist in this repo — a gap, not yet created; backend configuration
currently lives in `backend/supabase/config.toml` instead.**

Never commit a real `.env`/`.env.local` — only `.env.example` files belong in git.
`docs/environments.md` has the full local/staging/production breakdown; the short version
for local dev:

```powershell
Copy-Item web/.env.example web/.env.local
# For a containerized web dev server to reach the host's local Supabase:
#   NEXT_PUBLIC_SUPABASE_URL=http://host.docker.internal:54321
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon key `supabase status` prints — same well-known
#     value on every local instance, not a secret>
```

`mobile/.env.example` follows the same pattern (`EXPO_PUBLIC_SUPABASE_URL`, etc.) for
when mobile screens start reading Supabase config — nothing in `mobile/` reads it yet.

## First run

```powershell
pnpm install
pnpm stack:up
```

`stack:up` starts local Supabase (via the Supabase CLI, which drives its own Docker
containers), then builds and starts the web dev container, waiting on both health checks
before returning. It prints the real URL at the end — see the port note below.

## Accessing the app

- **Web dashboard**: open the URL `stack:up` prints (host port **3010**, not 3000 — see
  Known limitations). Only a themed placeholder login page exists so far
  (`/[locale]/login`), built to prove the app shell, i18n, and theming work end to end —
  not a real login screen yet.
- **Mobile**: not yet runnable from a one-command path. Run `pnpm --filter mobile start`
  on the host (Metro stays host-side, never in Docker — see below) and open the printed
  dev-build/Expo Go URL; only a dev-only themed screen exists (`/_dev/hello`), same
  purpose as the web placeholder.
- **Switch language**: both placeholders have a visible toggle (web: the pill button
  showing `العربية`/`English`; mobile: "Switch to Arabic"/"Switch to English"). Flips
  layout direction immediately.
- **Switch theme**: same pattern — a visible Light/Dark toggle on each placeholder.

## Commands

All commands run from the repo root unless noted.

| Command | What it does | Runs in |
| --- | --- | --- |
| `pnpm stack:up` | Start Supabase + the web dev container, wait for both to be healthy | Host orchestrates; web runs in Docker |
| `pnpm stack:down` | Stop the web container and Supabase (keeps data) | Host orchestrates |
| `pnpm stack:reset` | Stop everything, discard Docker volumes and Supabase data, bring it back up clean | Host orchestrates |
| `pnpm build:prod-web` | Build `web/Dockerfile`'s production `runner` target, run it once, confirm its `HEALTHCHECK` passes | Docker |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Fan out via Turborepo to every workspace (`web`, `mobile`, `packages/*`) | Host (or see tool containers below) |
| `docker compose --profile tools run --rm lint` | Same lint check, in a clean container | Docker |
| `docker compose --profile tools run --rm typecheck` | Same typecheck, in a clean container | Docker |
| `docker compose --profile tools run --rm unit-test` | Same unit tests, in a clean container | Docker |
| `pnpm db:test` | Run the backend's pgTAP suite against local Supabase | Host — the verified, reliable path |
| `docker compose --profile tools run --rm pgtap` | Same, from a container | Docker — has a known limitation, see below |
| `pnpm tokens:build` | Regenerate `packages/design-tokens/dist/` from `design/system/tokens/*.css` | Host |
| `pnpm i18n:check` | Fail if `packages/i18n/en.json` and `ar.json` key sets differ | Host |
| `pnpm types:gen` | Generate TypeScript types from the running local Supabase schema | Host |

## What does **not** run in Docker, and why

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

## Known limitations and manual prerequisites

- **No Android SDK/emulator in every environment** — mobile can't always be run,
  screenshotted from a real device, or have an APK built/installed/tested locally.
  `ANDROID_HOME`/`ANDROID_SDK_ROOT` and `adb`/`emulator` must be present on whichever
  machine does this work.
- **pgTAP's Docker tool container has a real, documented limitation**: it connects to
  local Supabase and spawns its test runner correctly, but that runner is a Docker
  *sibling* container (created via the host's daemon through a mounted socket), so it
  gets the host's filesystem, not this container's — it never sees
  `backend/supabase/tests/`. `pnpm db:test` (host-side) is the verified, reliable path;
  see `docker-compose.yml`'s `pgtap` service comment and
  `implementation-log.md`'s D00f entry for the full story.
- **D02 (the first real feature phase) cannot start** until several manual, non-code
  prerequisites exist: an Expo/EAS account, Google Cloud OAuth clients (Web/Android/iOS),
  an Apple Developer account with Sign in with Apple configured, and — critically, since
  owner sign-in itself is email-code-based — **a working SMTP provider with a verified
  sending domain (SPF/DKIM/DMARC)**. The full list is in `tasks.md`'s "Manual (human)
  prerequisites" section, right after D00g.
- **`docs/environments.md` references `backend/.env.example`, which doesn't exist** — see
  Environment configuration above.
- **The amended PRD records one genuine open architectural decision**: whether the
  email sign-in code's lockout can be bypassed by calling Supabase Auth's public
  endpoints directly, and how to close that gap if so. See `docs/PRD.md` §6 and its
  Risks/Open questions sections.

## Further reading

- [`docs/PRD.md`](docs/PRD.md) — the amended Product Requirements Document (authoritative
  product scope, screens, data model, and rules)
- [`specs/001-furever-platform/quickstart.md`](specs/001-furever-platform/quickstart.md) —
  the one-command run and validation scenarios, phase by phase
- [`specs/001-furever-platform/plan.md`](specs/001-furever-platform/plan.md) — technical
  architecture and the D00–D08 delivery-phase breakdown
- [`specs/001-furever-platform/tasks.md`](specs/001-furever-platform/tasks.md) — the
  task-by-task tracker (current source of truth for what's done)
- [`COMPATIBILITY.md`](COMPATIBILITY.md) — pinned dependency versions and the
  compatibility decisions behind them (Expo SDK, Tailwind, etc.)
- [`docs/environments.md`](docs/environments.md) — local/staging/production environment
  details
