# FurEver — Product Requirements Document (PRD)

Oct 18, 2026 · @Yousef Abdallah

## App at a glance

FurEver is three deployable parts, one backend, one mobile app for pet owners, and one web dashboard with two portals (clinic and admin), built in four phases where only Phase 1 is built now.

### The three parts

| Part | Folder | Users | Main areas | Phase 1 scope |
| --- | --- | --- | --- | --- |
| Backend | `backend/` (Supabase) | All apps | Auth, PostgreSQL with RLS, data API and RPC, Realtime, Storage, Edge Functions, scheduled jobs | Everything below depends on it |
| Mobile app | `mobile/` (Expo) | Pet owners | Sign-in, Home, Pets and health passport, Clinics and booking, Live queue, Emergency, Notifications, Profile | Yes |
| Web dashboard | `web/` (Next.js) | Clinic staff and admins | Clinic portal and admin portal | Yes |
| Shared packages | `packages/` | Developers | Zod schemas, generated DB types, translations (ar, en), design tokens (light, dark) | Yes |

### Product map

```text
FurEver
├── Mobile app (owners)
│   ├── Sign-in: phone OTP, Google, Apple, profile setup            [Phase 1]
│   ├── Home: search, categories, next booking, vaccines due          [Phase 1]
│   ├── Pets: profile, health passport, vaccinations, records         [Phase 1]
│   ├── Clinics: browse, doctors, booking, my bookings, live queue    [Phase 1]
│   ├── Emergency directory, reviews, notifications inbox             [Phase 1]
│   ├── Profile: language, theme, account, help, delete account       [Phase 1]
│   ├── Shop: catalog, cart, orders (cash on delivery)                [Phase 2]
│   ├── Adoption hub and Mating hub: listings, requests, chat         [Phase 3]
│   └── Online payments, video consultation, auto-delivery            [Phase 4]
├── Web dashboard
│   ├── Clinic portal: today, live queue board, appointments,
│   │   patients and records, doctors and schedules, services,
│   │   clinic profile, staff, reviews, reports                        [Phase 1]
│   └── Admin portal: overview and KPIs, users, clinics, appointments,
│       reference data, broadcasts, flags and config, audit log        [Phase 1]
│       products and orders [Phase 2], listing verification [Phase 3],
│       payments and refunds [Phase 4]
└── Backend (Supabase)
    ├── Auth, roles (owner, clinic_staff, admin, super_admin), MFA
    ├── PostgreSQL: tables, RLS, RPC functions, cron, notification outbox
    ├── Realtime (queue), Storage (private files), Edge Functions
    └── Environments: local, staging, production
```

Every part works in Arabic (RTL) and English, light and dark. The rest of this document details each box above: scope in section 2, roles in section 3, architecture in section 4, screens in sections 9 and 10.

## 1. Product overview

FurEver is a bilingual (Arabic/English) pet-care app for Egypt: an Expo mobile app for pet owners, a Next.js dashboard for clinics and admins, and one Supabase backend shared by both, designed so the first release can grow to 1M registered users without a rewrite.

**Problem.** Pet owners lose hours in clinic waiting rooms, miss vaccination dates, cannot find emergency help at night or on holidays, struggle to buy heavy supplies, and have no trusted channel for adoption or mating (scams in social groups, no verified medical history).

**Vision.** One trusted app for the whole life of a pet: health passport, booking with a live queue, emergency access, supplies, and verified adoption and mating.

**Brand.** FurEver: warm, trustworthy, user-friendly, pet-centric (rose palette from the existing case study).

### Goals

1. Ship Phase 1 (auth, pets, health passport and reminders, clinic booking with live queue, emergency directory, admin and clinic dashboard) as the smallest product that proves value to owners and clinics.
2. Make Arabic (RTL) and English, light and dark mode first-class from day one, not retrofitted.
3. Put every rule that is expensive to change later in place now: RLS on every table, migrations only, typed contracts, idempotent writes, feature flags, environment separation.
4. Make later phases (shop, mating and adoption, payments, video) additive: new tables, new screens, new flags, no breaking changes to Phase 1.

### Non-goals for Phase 1

- Online payments, wallets, and auto-delivery subscriptions (reserved hooks only, see section 2).
- Video teleconsultation (reserved hooks only).
- Shop, mating hub, and adoption hub (fully designed in this PRD, built in later phases).
- Native iPad or tablet layouts, and a public website for owners.
- AI features and in-app clinic-to-clinic referrals.

### Success metrics

These are proposed targets for the first 90 days after launch; confirm or replace them with your own.

| Metric | Proposed target |
| --- | --- |
| Onboarding completion (OTP or Google sign-in to completed profile) | 70% or higher |
| Pets added per active owner | 1.3 or higher |
| Booking funnel completion (clinic opened to booking confirmed) | 60% or higher |
| Vaccination reminder open rate | 35% or higher |
| Appointment no-show rate | 12% or lower |
| Partner clinics live in the launch city | 20 |
| Crash-free sessions (Sentry) | 99.5% or higher |
| API p95 latency for reads / writes (server side) | under 300 ms / under 500 ms |

## 2. Scope and phasing

Phase 1 is built now; Phases 2 to 4 are fully specified in this PRD but built later, and every one of them plugs into Phase 1 without changing it.

| Phase | Name | What ships | Status |
| --- | --- | --- | --- |
| 1 | Core (MVP) | Auth (phone OTP, Google, Apple), profile, pets, health passport, vaccinations and reminders, push notifications, clinics, doctors, services, booking with pay-at-clinic, live queue, reviews, emergency directory, admin dashboard, clinic dashboard | Build now |
| 2 | Shop | Catalog, cart, checkout with cash on delivery, orders and tracking, addresses, inventory and order management in dashboard | Later |
| 3 | Community | Verified adoption hub and mating hub, listings, verification workflow, match requests, in-app chat, reports and moderation | Later |
| 4 | Payments and video | Online payments (Paymob or Fawry), refunds, auto-delivery subscriptions, video teleconsultation | Later |

### Hooks reserved now for Phase 4 (designed, not built)

These make payments and video additive instead of a migration project.

- **Money columns exist from day one:** `price_minor` (integer, in piastres) and `currency` (default `EGP`) on services and, later, products. Money is never stored as a float.
- **Payment state exists but is inert:** `appointments.payment_status` enum (`unpaid`, `pay_at_clinic`, `paid`, `refunded`); Phase 1 only writes `pay_at_clinic`.
- **Appointment type enum already contains `video`;** Phase 1 only allows `in_clinic`, enforced by a flag, not by the schema.
- **Reserved namespaces:** Edge Functions `payments-*` and `video-*`; tables `payments`, `refunds`, `video_sessions` are not created yet.
- **UI slots:** the booking summary screen renders a `PaymentMethodSelector` component that shows only "Pay at clinic" until `payments_enabled` is true; the booking flow has a `consultation type` step that is skipped until `video_enabled` is true.
- **Flags:** `payments_enabled`, `video_enabled`, `shop_enabled`, `mating_enabled`, `adoption_enabled`, all false by default, read from `app-config` at launch.

### Phase 1 definition of done

A new owner can sign up with phone or Google, add a pet, record vaccinations, get a reminder, book an in-clinic appointment, see the live queue, and rate the visit; a clinic can manage doctors, schedules, services and the live queue; an admin can manage users, clinics and reference data; everything works in Arabic and English, light and dark.

## 3. Personas and roles

Four roles use the system, and every permission in the backend is derived from the role claim in the user's JWT plus ownership of rows.

### Personas

| Persona | Who | Goals | Pain points |
| --- | --- | --- | --- |
| Sarah Ahmed, The Busy Pet Parent | 26, marketing specialist, owns Milo (2-year-old Persian cat) | Manage health and vaccines without waiting rooms, order essentials, reach emergency help | Long waits, forgotten vaccines, running out of essentials |
| Youssef Hassan, The Social Pet Advocate | 29, software engineer, owns Max (3-year-old Golden Retriever) | Find a trustworthy, vaccinated mating partner, adopt safely, consult a vet fast | Scams in social groups, no verified history, no late-night help |
| Dr. Mona, Clinic Staff (new) | Vet or receptionist at a partner clinic | Fewer no-shows, an orderly queue, a full pet history at the desk | Phone-based booking chaos, paper records |
| Admin (new) | FurEver operations team | Onboard and verify clinics, moderate content, watch growth and quality | No single view of the marketplace |

### Roles

| Role (`app_role`) | Description | Where they sign in |
| --- | --- | --- |
| `owner` | Default role for every mobile signup | Mobile app |
| `clinic_staff` | Belongs to one or more clinics with a staff level (`manager`, `vet`, `receptionist`) | Web dashboard (clinic portal) |
| `admin` | FurEver operations | Web dashboard (admin) |
| `super_admin` | Admins plus managing admins, feature flags, and system settings | Web dashboard (admin) |

### Permission matrix (Phase 1)

| Capability | owner | clinic\_staff | admin | super\_admin |
| --- | --- | --- | --- | --- |
| Manage own profile and pets | Yes | Own profile only | Own profile only | Own profile only |
| Read pet health data | Own pets | Only pets with an appointment at their clinic | Yes (audited) | Yes (audited) |
| Add vaccination or health record | Own pets (marked self-reported) | For pets seen at their clinic (marked clinic-verified) | Yes | Yes |
| Browse active clinics, doctors, services | Yes | Yes | Yes | Yes |
| Book, reschedule, cancel own appointment | Yes | No | No | No |
| Manage appointments of their clinic, run the queue | No | Yes | Yes | Yes |
| Edit clinic profile, doctors, services, schedules | No | Manager level | Yes | Yes |
| Create, approve, suspend clinics | No | No | Yes | Yes |
| Suspend or delete users | No | No | Yes | Yes |
| Manage reference data (breeds, vaccine types, cities) | No | No | Yes | Yes |
| Send broadcast notifications | No | No | Yes | Yes |
| Feature flags, app config, manage admins | No | No | No | Yes |
| Read audit logs | No | No | Yes | Yes |

Phase 2 to 4 permissions follow the same pattern and are listed with their screens in sections 9 and 10.

## 4. System architecture and repo structure

The system has three deployable apps (`backend`, `mobile`, `web`) that never import from each other; they share only contracts through `packages/`, and the only door to data is the Supabase API protected by RLS.

### Architecture rules

1. **One backend.** Mobile and web talk to Supabase (Auth, PostgREST, Realtime, Storage, Edge Functions) and nothing else.
2. **Security lives in the database.** RLS decides who sees what; clients are untrusted.
3. **Privileged logic lives in Edge Functions.** The `service_role` key exists only in Supabase secrets, never in mobile, never in the browser, never in Next.js env.
4. **Multi-step writes are one database function (RPC).** Booking, cancelling, and queue moves run in a single transaction, not as several client calls.
5. **Background work uses an outbox.** Triggers and cron insert rows into `notification_outbox`; one Edge Function drains it. No fire-and-forget calls from clients.
6. **Contracts are shared.** Zod schemas and generated database types live in `packages/`; mobile, web, and Edge Functions import the same ones.
7. **Additive evolution.** Old app versions live for years, so columns and RPC parameters are added, never renamed or removed in one step (expand, then contract).

### How the pieces connect

&#91;embedded content: architecture · 2 apps, 1 backend, 3 external services\]

Both apps import the same shared packages, call only Supabase, and reach the data through RLS; Edge Functions use the service role for privileged work, and the dashed box marks what is reserved but not built.

### Repository layout

```text
furever/
├── backend/
│   └── supabase/
│       ├── config.toml
│       ├── migrations/            # one SQL file per change, timestamped, immutable once merged
│       ├── functions/
│       │   ├── _shared/           # cors, auth guard, zod, error helper
│       │   ├── app-config/        # flags + min app version
│       │   ├── send-push/         # drains notification_outbox via Expo Push
│       │   ├── admin-create-staff/
│       │   ├── delete-account/
│       │   └── export-my-data/
│       ├── seed.sql               # breeds, vaccine types, cities, demo clinics (dev only)
│       └── tests/                 # pgTAP: RLS and RPC tests
├── mobile/                        # Expo (React Native) app for owners
│   ├── app/                       # expo-router: (auth), (tabs), clinics, pets, bookings...
│   ├── src/
│   │   ├── features/              # pets, clinics, bookings, notifications, profile, shop...
│   │   ├── components/            # ui kit: Button, Card, Input, Sheet, EmptyState...
│   │   ├── lib/                   # supabase client, query client, push, sentry
│   │   ├── hooks/                 # useTheme, useLocale, useSession
│   │   └── i18n/                  # init + formatters
│   └── assets/                    # fonts (Cairo, Inter), images, icons
├── web/                           # Next.js dashboard (admin + clinic portal)
│   ├── app/[locale]/
│   │   ├── (auth)/                # login, forgot-password, accept-invite
│   │   ├── (admin)/               # overview, users, clinics, reference-data...
│   │   └── (clinic)/              # today, queue, appointments, doctors, services...
│   ├── src/
│   │   ├── features/              # same feature names as mobile
│   │   ├── components/            # shadcn/ui + data-table + charts
│   │   ├── lib/                   # supabase server/browser clients
│   │   └── i18n/                  # next-intl routing + request config
│   └── middleware.ts              # session refresh + role redirect + locale
├── packages/
│   ├── shared/                    # zod schemas, enums, constants, db types (generated)
│   ├── i18n/                      # ar.json, en.json: single source of translations
│   └── design-tokens/             # colors, spacing, radii, typography (light + dark)
├── .github/workflows/             # ci.yml, deploy-web.yml, eas-build.yml, db-migrate.yml
├── biome.json  turbo.json  pnpm-workspace.yaml  package.json
└── README.md
```

The request path for everything the owner does is: mobile → Supabase API (JWT) → RLS → Postgres. Dashboard pages follow the same path through `@supabase/ssr`, and privileged actions (create clinic staff, delete account, broadcast) go through Edge Functions that re-check the caller's role. Section 5 lists the packages; section 8 lists the endpoints.

## 5. Tech stack and packages

The whole stack is TypeScript on top of standard PostgreSQL, so the team writes one language, shares one set of types, and keeps an exit path from every managed service. Pin exact versions in `package.json` at project start and let Renovate propose upgrades.

### Backend (Supabase)

| Need | Tool | Notes |
| --- | --- | --- |
| Database and API | Supabase Postgres + PostgREST | Auto REST API from the schema; RLS enforces access |
| Auth | Supabase Auth (GoTrue) | Phone OTP, Google, Apple, email and password for dashboard, MFA (TOTP) for admins |
| Role in JWT | Custom Access Token Hook | Adds `user_role` to the token so RLS avoids a join per row |
| Files | Supabase Storage | Private buckets with signed URLs |
| Live updates | Supabase Realtime | Queue board and chat; subscribe with filters only |
| Server logic | Edge Functions (Deno, TypeScript) | Zod validation, shared helpers in `_shared/` |
| Scheduled jobs | `pg_cron` + `pg_net` | Reminder generation, outbox drain, cleanup |
| Extensions | `postgis`, `pg_trgm`, `btree_gist`, `pgcrypto`, `pg_stat_statements` | Nearby clinics, fuzzy search, no double booking, query stats |
| SMS for OTP | Twilio Verify (via Supabase Auth) | Restrict allowed countries to stop SMS pumping fraud |
| Push | Expo Push Service | Called only from `send-push` |
| Rate limiting | Supabase Auth limits + Upstash Redis in Edge Functions | Optional until a public Edge endpoint needs it |
| DB tests | pgTAP via `supabase test db` | Every RLS policy and RPC has a test |
| Types | `supabase gen types typescript` | Output committed to `packages/shared` |

### Mobile (Expo)

| Area | Packages |
| --- | --- |
| Core | `expo`, `expo-router`, `expo-dev-client`, `typescript`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg` |
| Styling and UI | `nativewind` (v4) + `tailwindcss`, `lucide-react-native`, `expo-font`, `@gorhom/bottom-sheet`, `burnt` or `sonner-native` (toasts), `expo-haptics`, `expo-image` |
| Lists | `@shopify/flash-list` |
| Auth | `@supabase/supabase-js`, `@react-native-google-signin/google-signin` (needs a dev build, not Expo Go), `expo-apple-authentication`, `expo-secure-store`, `@react-native-async-storage/async-storage`, `expo-crypto`, `aes-js` |
| Data | `@tanstack/react-query`, `@tanstack/query-async-storage-persister`, `@react-native-community/netinfo`, `zustand`, `react-native-mmkv` (non-sensitive prefs) |
| Forms | `react-hook-form`, `zod`, `@hookform/resolvers` |
| i18n and RTL | `i18next`, `react-i18next`, `expo-localization`, `date-fns`; RTL via `I18nManager` + `expo-updates` reload |
| Media | `expo-image-picker`, `expo-document-picker`, `expo-image-manipulator` (resize before upload), `react-native-qrcode-svg` (check-in code) |
| Device | `expo-notifications`, `expo-device`, `expo-location`, `expo-linking`, `expo-splash-screen`, `expo-status-bar`, `expo-constants`, `expo-application` |
| Maps (when needed) | `react-native-maps` |
| Monitoring | `@sentry/react-native`, `posthog-react-native` |
| Tests | `jest`, `jest-expo`, `@testing-library/react-native`, Maestro (E2E flows) |
| Build and release | EAS Build, EAS Submit, EAS Update (OTA), EAS Secrets |

Session storage note: a Supabase session is larger than the 2 KB `expo-secure-store` limit, so store an AES key in SecureStore and the encrypted session in AsyncStorage (the pattern Supabase documents for Expo).

### Web dashboard (Next.js)

| Area | Packages |
| --- | --- |
| Core | `next` (App Router), `react`, `typescript`, `tailwindcss` |
| UI | `shadcn/ui` (Radix primitives, copied into the repo), `lucide-react`, `sonner`, `cmdk` (command palette), `react-day-picker` |
| Data tables and charts | `@tanstack/react-table`, `recharts` (via shadcn charts) |
| Calendar | `@fullcalendar/react` (day and week views, RTL supported) |
| Theme and i18n | `next-themes` (light, dark, system), `next-intl` (`/ar` and `/en`, sets `dir`), logical Tailwind classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) |
| Data and auth | `@supabase/supabase-js`, `@supabase/ssr`, `@tanstack/react-query` |
| Forms and URL state | `react-hook-form`, `zod`, `@hookform/resolvers`, `nuqs` (filters in the URL) |
| Utilities | `date-fns`, `papaparse` (CSV export), `@t3-oss/env-nextjs` (validated env vars) |
| Monitoring | `@sentry/nextjs`, `posthog-js` |
| Tests | `vitest`, `@testing-library/react`, `@playwright/test` |
| Hosting | Vercel (preview deploy per pull request) |

### Monorepo and quality tooling

| Need | Tool |
| --- | --- |
| Workspaces and task cache | `pnpm` workspaces + `turbo` |
| Lint and format | `@biomejs/biome` |
| Git hooks | `husky` + `lint-staged` + `commitlint` (conventional commits) |
| CI/CD | GitHub Actions |
| Dependency updates | Renovate |
| Env management | `.env.example` per app, secrets in EAS, Vercel, and Supabase |
| Error and product analytics | Sentry, PostHog (no personal data in events) |

### Packages deliberately not used

No Redux (React Query plus Zustand is enough), no ORM in Phase 1 (generated types cover it; Prisma or Drizzle can be added later for a separate service), no custom Express server, no GraphQL layer.

## 6. Authentication and authorization

Owners sign in with phone OTP, Google, or Apple on mobile; clinic staff and admins sign in with email and password on the web (admins with a second factor); all of it runs on Supabase Auth, and the role travels inside the JWT.

### Sign-in methods

| Surface | Method | Required | Notes |
| --- | --- | --- | --- |
| Mobile | Phone OTP (+20 default, 6 digits) | Yes | Primary method for Egypt; delivered through Twilio Verify |
| Mobile | Google Sign-In (native) | Yes | `signInWithIdToken({ provider: 'google', token })` |
| Mobile | Sign in with Apple | Yes on iOS | App Store review expects it when another social login is offered |
| Mobile | Email OTP | Optional | Fallback if SMS is down or too expensive; flag-controlled |
| Web | Email and password | Yes | Staff are invited; there is no public signup |
| Web | TOTP second factor (MFA) | Admin and super\_admin | Enforced with AAL2 in RLS and in middleware |
| Web | Password reset by email | Yes | Standard recovery link |

### Flows

**Phone OTP (mobile)**

1. User enters a phone number; the app normalizes it to E.164 (`+20...`) and calls `signInWithOtp({ phone })`.
2. Auth sends a 6-digit code (valid 5 minutes, resend after 60 seconds, limited attempts).
3. User enters the code; `verifyOtp({ phone, token, type: 'sms' })` returns a session.
4. If the profile is incomplete, the app opens Complete Profile (name, city, optional avatar); otherwise Home.

**Google (mobile)**

1. App calls `GoogleSignin.signIn()` with the web client ID configured; Google returns an ID token.
2. App calls `supabase.auth.signInWithIdToken({ provider: 'google', token })`.
3. A database trigger creates the profile from Google's name, email, and avatar; the same completion rules as phone apply (city is still required).
4. If the user later adds a phone number, the app uses `linkIdentity` so both methods open the same account.

**Apple (iOS)**

1. `expo-apple-authentication` returns an identity token (use a hashed nonce).
2. `signInWithIdToken({ provider: 'apple', token, nonce })`.
3. Apple shares the name only on first sign-in, so the app writes it to the profile immediately.

**Dashboard login (web)**

1. Email and password through `@supabase/ssr`; session lives in HTTP-only cookies.
2. Middleware refreshes the session, checks `user_role`, and redirects: `clinic_staff` to `/[locale]/clinic`, `admin` and `super_admin` to `/[locale]/admin`, anyone else to a no-access page.
3. Admins without a verified TOTP factor are forced to enroll before reaching any admin page.

**Staff invitation**

1. Admin or clinic manager calls `admin-create-staff` (Edge Function) with email, clinic, and staff level.
2. The function creates the auth user, sets `profiles.role = 'clinic_staff'`, inserts the `clinic_staff` row, and sends an invite email.
3. The invitee opens the link, sets a password, and lands in the clinic portal.

### Google and Apple setup checklist

- In Google Cloud Console create three OAuth clients: **Web** (its client ID and secret go into Supabase Auth, Google provider, and its client ID is the `webClientId` in the app), **Android** (package name plus the SHA-1 of each EAS keystore: debug, preview, production), and **iOS** (bundle ID).
- Add the Supabase callback `https://<project-ref>.supabase.co/auth/v1/callback` (or the custom domain version) to the Web client.
- In Supabase set the redirect URL allow list: `furever://auth/callback`, `https://admin.furever.app/**`, the staging dashboard URL, and `http://localhost:3000/**` (development only).
- Follow Supabase's current Expo Google guide for the iOS nonce setting; it has changed between releases.
- Apple: enable the Sign in with Apple capability for the bundle ID, create a Services ID and key, and add them to the Supabase Apple provider.
- Native Google and Apple sign-in need an EAS development build; Expo Go cannot test them.

### Tokens, sessions, and roles

- **Role claim.** A Custom Access Token Hook (Postgres function) copies `profiles.role` into the JWT as `user_role`; RLS reads it with `(select auth.jwt() ->> 'user_role')`.
- **No self-promotion.** `authenticated` has no UPDATE privilege on `profiles.role` or `profiles.status`; only the admin RPC and Edge Functions change them. A pgTAP test proves it.
- **Session lifetime.** Access token 1 hour, refresh-token rotation on. Mobile refreshes on app foreground (`AppState` listener) and sets `detectSessionInUrl: false`.
- **Clinic membership.** Not in the JWT; checked with a `stable security definer` function `is_clinic_staff(clinic_id)` so changing membership takes effect immediately.
- **Suspended users.** `profiles.status = 'suspended'` is checked by RLS helper `is_active_user()`, and the Auth ban is applied from the admin function so refresh stops too.

### Abuse and fraud controls

- Twilio Verify geo permissions limited to the countries you serve (start with Egypt) to prevent SMS pumping.
- Auth rate limits for OTP and sign-in kept at defaults or stricter; CAPTCHA (Cloudflare Turnstile) on web login and password reset.
- Local development uses fixed test OTP numbers from `config.toml`, so no SMS is sent outside production.

### Account deletion and data export

Both stores require in-app deletion. `delete-account` asks for a fresh OTP or password, removes pets, files, tokens, and profile data, anonymizes past appointments and reviews that clinics must keep, then deletes the auth user. `export-my-data` returns a JSON archive of the user's data.

## 7. Database design

The schema is plain PostgreSQL with RLS on every table, and the Phase 1 tables below are the only ones created now; Phase 2 to 4 tables are listed so naming and relations stay consistent when they arrive.

### Conventions

- Names are `snake_case`, tables plural, enums singular. Every table has `id uuid primary key default gen_random_uuid()`, `created_at timestamptz not null default now()`, and `updated_at` maintained by a shared trigger.
- All times are `timestamptz` stored in UTC and displayed in `Africa/Cairo` (a named zone, never a fixed offset, because Egypt observes daylight saving time).
- User-owned data uses soft delete (`deleted_at`) with a nightly purge job after 30 days; reference data uses `is_active`.
- Bilingual content uses paired columns (`name_en`, `name_ar`). User-typed text is stored as typed, in one column.
- Money is `integer` in piastres (`price_minor`) plus `currency text default 'EGP'`; never floats.
- Every foreign key column has an index. Every table has `alter table ... enable row level security` in the same migration that creates it.
- Extensions: `postgis`, `pg_trgm`, `btree_gist`, `pgcrypto`, `pg_cron`, `pg_net`, `pg_stat_statements`.

### Enums

| Enum | Values |
| --- | --- |
| `app_role` | `owner`, `clinic_staff`, `admin`, `super_admin` |
| `user_status` | `active`, `suspended`, `deleted` |
| `staff_level` | `manager`, `vet`, `receptionist` |
| `species` | `cat`, `dog`, `bird`, `rabbit`, `other` |
| `pet_gender` | `male`, `female`, `unknown` |
| `record_type` | `visit`, `allergy`, `medication`, `surgery`, `lab`, `note` |
| `clinic_status` | `pending`, `active`, `suspended` |
| `appointment_type` | `in_clinic`, `video` (video blocked by flag until Phase 4) |
| `appointment_status` | `pending`, `confirmed`, `checked_in`, `in_progress`, `completed`, `cancelled`, `no_show` |
| `payment_status` | `unpaid`, `pay_at_clinic`, `paid`, `refunded` |
| `ticket_status` | `waiting`, `called`, `in_progress`, `done`, `skipped` |
| `outbox_status` | `pending`, `sent`, `failed` |

### Phase 1 tables

**Reference and configuration**

| Table | Purpose | Key columns |
| --- | --- | --- |
| `cities` | Launch cities | `name_en`, `name_ar`, `is_active` |
| `breeds` | Breed list per species | `species`, `name_en`, `name_ar` |
| `vaccine_types` | Vaccines and their rules | `species`, `name_en`, `name_ar`, `interval_days`, `is_core` |
| `specialties` | Doctor specialties | `name_en`, `name_ar` |
| `feature_flags` | Server-controlled flags | `key` (pk), `enabled`, `platform`, `min_app_version` |
| `app_config` | Key-value settings (support phone, min app version) | `key` (pk), `value jsonb` |

**Identity**

| Table | Purpose | Key columns |
| --- | --- | --- |
| `profiles` | One row per auth user (id = `auth.users.id`) | `full_name`, `phone`, `email`, `avatar_path`, `city_id`, `role`, `status`, `locale`, `theme`, `notif_prefs jsonb`, `deleted_at` |
| `clinic_staff` | Who works where | `clinic_id`, `user_id`, `staff_level` (pk on both ids) |
| `push_tokens` | Device tokens | `user_id`, `token` (unique), `platform`, `locale`, `last_seen_at` |
| `consents` | Legal acceptance log | `user_id`, `type`, `version`, `accepted_at` |

**Pets and health passport**

| Table | Purpose | Key columns |
| --- | --- | --- |
| `pets` | Pet profile | `owner_id`, `name`, `species`, `breed_id`, `gender`, `birth_date`, `weight_kg`, `color`, `microchip_no`, `is_neutered`, `photo_path`, `notes`, `deleted_at` |
| `vaccinations` | Given and planned vaccines | `pet_id`, `vaccine_type_id`, `given_on`, `next_due_on`, `batch_no`, `vet_name`, `clinic_id`, `document_path`, `source` (`self` or `clinic`), `created_by` |
| `health_records` | Timeline entries | `pet_id`, `record_type`, `title`, `description`, `recorded_on`, `clinic_id`, `created_by`, `source` |
| `record_attachments` | Files on a record | `record_id`, `path`, `mime`, `size_bytes` |

**Clinics and booking**

| Table | Purpose | Key columns |
| --- | --- | --- |
| `clinics` | Partner clinics | `name_en`, `name_ar`, `description_*`, `phone`, `whatsapp`, `city_id`, `address_*`, `location geography(Point)`, `logo_path`, `cover_path`, `opening_hours jsonb`, `is_24h`, `supports_emergency`, `status`, `rating_avg`, `rating_count` |
| `doctors` | Vets at a clinic | `clinic_id`, `user_id` (nullable), `full_name`, `specialty_id`, `bio`, `years_experience`, `photo_path`, `is_active` |
| `services` | What a clinic offers | `clinic_id`, `name_en`, `name_ar`, `duration_min`, `price_minor`, `currency`, `species[]`, `is_active` |
| `doctor_services` | Which doctor offers which service | `doctor_id`, `service_id` |
| `doctor_schedules` | Weekly working hours | `doctor_id`, `weekday` (0 to 6), `start_time`, `end_time`, `slot_minutes` |
| `schedule_exceptions` | Days off and special hours | `doctor_id`, `date`, `is_closed`, `start_time`, `end_time`, `reason` |
| `appointments` | Bookings | `owner_id`, `pet_id`, `clinic_id`, `doctor_id`, `service_id`, `type`, `starts_at`, `ends_at`, `status`, `payment_status`, `price_minor`, `notes`, `cancel_reason`, `cancelled_by`, `idempotency_key` (unique per owner) |
| `queue_tickets` | Live queue | `appointment_id`, `clinic_id`, `doctor_id`, `queue_date`, `ticket_number`, `status`, `called_at` |
| `reviews` | One review per completed visit | `appointment_id` (unique), `owner_id`, `clinic_id`, `rating` (1 to 5), `comment`, `is_hidden` |

**Platform**

| Table | Purpose | Key columns |
| --- | --- | --- |
| `notifications` | In-app inbox | `user_id`, `kind`, `title_key`, `body_key`, `params jsonb`, `data jsonb`, `read_at` |
| `notification_outbox` | Pending pushes | `user_id`, `kind`, `payload jsonb`, `dedupe_key` (unique), `status`, `attempts`, `send_after` |
| `audit_logs` | Admin and clinic actions, and every admin read of health data | `actor_id`, `action`, `entity`, `entity_id`, `diff jsonb` |

### Tables for later phases (not created now)

| Phase | Tables |
| --- | --- |
| 2 Shop | `product_categories`, `products`, `product_variants`, `inventory`, `addresses`, `carts`, `cart_items`, `orders`, `order_items`, `order_status_history`, `wishlists` |
| 3 Community | `listings` (type `adoption` or `mating`), `listing_media`, `listing_verifications`, `match_requests`, `conversations`, `conversation_members`, `messages`, `reports`, `blocks`, `favorites` |
| 4 Payments and video | `payments`, `refunds`, `payment_methods` (tokens only), `subscriptions`, `subscription_runs`, `video_sessions` |

### Constraints that protect the data

- **No double booking:** an exclusion constraint on `appointments` using `btree_gist`: `exclude using gist (doctor_id with =, tstzrange(starts_at, ends_at) with &&) where (status in ('pending','confirmed','checked_in','in_progress'))`.
- **Idempotent booking:** unique `(owner_id, idempotency_key)` so a retry after a network drop returns the same appointment.
- **One review per visit:** unique `reviews.appointment_id`, and an insert policy that requires `status = 'completed'` and ownership.
- **One ticket per appointment:** unique `queue_tickets.appointment_id`; unique `(doctor_id, queue_date, ticket_number)`.
- **Sane values:** checks for `rating between 1 and 5`, `weight_kg > 0`, `ends_at > starts_at`, `birth_date <= current_date`, `price_minor >= 0`.
- **Phone format:** `profiles.phone` matches `^\+[1-9][0-9]{7,14}$`.
- **Notification dedupe:** unique `notification_outbox.dedupe_key` (for example `vaccination:<id>:7d`) so cron can run twice safely.

### Indexes (day one)

| Table | Index | Serves |
| --- | --- | --- |
| `pets` | `(owner_id) where deleted_at is null` | My Pets, RLS |
| `vaccinations` | `(pet_id, next_due_on)` and partial `(next_due_on) where next_due_on is not null` | Timeline, reminder job |
| `clinics` | GiST on `location`; `(city_id, status)`; trigram on `name_en`, `name_ar` | Nearby, filters, search |
| `doctors`, `services` | `(clinic_id) where is_active` | Clinic page |
| `appointments` | `(owner_id, starts_at desc)`; `(clinic_id, starts_at)`; `(doctor_id, starts_at)` | My bookings, clinic day view, slots |
| `queue_tickets` | `(clinic_id, queue_date, status)` | Live board |
| `notifications` | `(user_id, created_at desc)`; partial `(user_id) where read_at is null` | Inbox, badge |
| `notification_outbox` | `(status, send_after)` | Worker |
| `audit_logs` | `(entity, entity_id)`; `(actor_id, created_at desc)` | Investigations |

Every list endpoint paginates by keyset on `(created_at, id)` or `(starts_at, id)`, never by `offset`.

### Database functions (RPC)

| Function | Role | What it does |
| --- | --- | --- |
| `get_available_slots(doctor_id, service_id, date)` | any signed-in user | Builds slots from schedule and exceptions, removes taken ones, returns local times |
| `book_appointment(...)` | owner | Validates pet ownership and slot, inserts appointment, handles idempotency, queues the confirmation notification |
| `cancel_appointment(id, reason)` | owner or clinic staff | Applies the cancellation window, frees the slot, notifies the other side |
| `reschedule_appointment(id, new_starts_at)` | owner or clinic staff | Cancel and rebook in one transaction |
| `check_in_appointment(id)` | owner (QR) or staff | Creates the queue ticket with the next number for the doctor and day |
| `call_next_ticket(doctor_id)` | clinic staff | Moves the next waiting ticket to `called`, pushes "you are next" |
| `complete_appointment(id)` | clinic staff | Closes the ticket and opens the review prompt |
| `nearby_clinics(lat, lng, radius_m, filters, cursor)` | any | Distance-sorted, filtered, keyset paginated |
| `my_upcoming_vaccinations()` | owner | Due and overdue vaccines across all pets |
| `generate_vaccination_reminders()` | cron | Inserts outbox rows at 7 days, 1 day, and due date |
| `custom_access_token_hook(event)` | Auth | Adds `user_role` to the JWT |
| `is_clinic_staff(clinic_id)`, `is_admin()`, `is_active_user()` | helpers | `stable security definer`, `set search_path = ''` |

### Row level security

Policies use `(select auth.uid())` and `(select auth.jwt() ->> 'user_role')` so Postgres evaluates them once per query, not once per row.

| Table | Select | Insert / update / delete |
| --- | --- | --- |
| `profiles` | Own row; admin all; clinic staff only owners with an appointment at their clinic (name and phone) | Own row, excluding `role` and `status` |
| `pets`, `vaccinations`, `health_records`, `record_attachments` | Owner; clinic staff for pets with an appointment at their clinic; admin (audited) | Owner for own pets; clinic staff may insert records and vaccinations with `source = 'clinic'` for such pets |
| `clinics`, `doctors`, `services`, `doctor_schedules`, `schedule_exceptions` | Everyone for `status = 'active'` rows; that clinic's staff and admins for all | Clinic manager for own clinic (not `status`); admin all |
| `appointments`, `queue_tickets` | Owner for own; clinic staff for own clinic; admin | Only through RPC (direct writes revoked) |
| `reviews` | Everyone for `is_hidden = false` | Owner once per completed visit; admin may hide |
| `notifications`, `push_tokens` | Own rows | Own rows; `notifications` inserts only by the service role |
| `notification_outbox`, `audit_logs` | Admin only | Service role and triggers only |
| Reference tables, `feature_flags`, `app_config` | Everyone (flags filtered by platform) | `admin` or `super_admin` (flags and config: `super_admin`) |
| Admin-only writes | Require `aal2` in the JWT |  |

CI runs a query that fails the build if any table in `public` has RLS disabled, and pgTAP tests cover: owner cannot read another owner's pet, staff cannot read pets without an appointment, owner cannot change own role, anonymous cannot read anything but public clinics.

### Storage buckets

| Bucket | Public | Contents | Path pattern | Limits |
| --- | --- | --- | --- | --- |
| `avatars` | Yes | User avatars | `{user_id}/avatar.jpg` | 1 MB, images |
| `pet-photos` | Yes (non-sensitive) | Pet photos | `{owner_id}/{pet_id}/photo.jpg` | 2 MB, images |
| `pet-documents` | No | Vaccination cards, lab results, PDFs | `{owner_id}/{pet_id}/{uuid}.{ext}` | 10 MB, images and PDF |
| `clinic-media` | Yes | Logos and covers | `{clinic_id}/...` | 2 MB, images |

Storage policies match the path prefix to the caller (`storage.foldername(name)[1] = auth.uid()::text`) or to clinic membership. Private files are always opened with signed URLs that expire in 60 minutes or less. Mobile resizes images with `expo-image-manipulator` before upload.

### Scheduled jobs (`pg_cron`)

| Job | Schedule | Purpose |
| --- | --- | --- |
| `generate_vaccination_reminders` | Daily 08:00 Cairo time | Fill the outbox for 7-day, 1-day, and due-date reminders |
| `send-push` trigger | Every minute | Call the Edge Function through `pg_net` to drain the outbox |
| `appointment_reminders` | Every 15 minutes | Notify 24 hours and 2 hours before an appointment |
| `mark_no_shows` | Every 15 minutes | Move missed confirmed appointments to `no_show` |
| `purge_soft_deleted` | Daily 03:00 | Hard delete rows and files older than 30 days |

### Seed data

`seed.sql` loads cities, 40 or more breeds for cats and dogs (Arabic and English names), core vaccine types for cats and dogs, specialties, and three demo clinics with doctors, services, and schedules, for development and staging only.

## 8. Backend API and endpoint URLs

The API is Supabase's generated API plus a small set of RPC functions and Edge Functions, all reached under one base URL per environment; mobile and web use `supabase-js`, which builds these URLs for you.

### Base URLs

The domain `furever.app` below is a placeholder; replace it with your real domain (a Supabase custom domain is a paid add-on, and without it the default `https://<project-ref>.supabase.co` works identically).

| Environment | API base | Dashboard | Notes |
| --- | --- | --- | --- |
| Local | `http://127.0.0.1:54321` | `http://localhost:3000` | `supabase start`; test OTP numbers, no real SMS |
| Staging | `https://api-staging.furever.app` | `https://admin-staging.furever.app` | Auto-deployed from `main`; seeded demo data |
| Production | `https://api.furever.app` | `https://admin.furever.app` | Deployed from release tags; PITR backups on |

| Service | Path under the API base |
| --- | --- |
| Auth | `/auth/v1/...` |
| Table API (PostgREST) | `/rest/v1/<table>` |
| RPC functions | `/rest/v1/rpc/<function>` |
| Edge Functions | `/functions/v1/<name>` |
| Storage | `/storage/v1/object/...` |
| Realtime (WebSocket) | `wss://<host>/realtime/v1/websocket` |

Every request carries `apikey: <anon key>` and, for signed-in users, `Authorization: Bearer <access token>`. The anon key is public by design; safety comes from RLS. Clients also send `x-app-version` and `x-platform` headers so the backend can enforce minimum versions.

### Authentication endpoints (`/auth/v1`)

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/otp` | Send phone or email OTP |
| POST | `/verify` | Verify OTP and create the session |
| POST | `/token?grant_type=id_token` | Google or Apple ID token sign-in |
| POST | `/token?grant_type=password` | Dashboard email and password sign-in |
| POST | `/token?grant_type=refresh_token` | Refresh session |
| POST | `/recover` | Send password reset email |
| GET, PUT | `/user` | Read or update the auth user |
| POST | `/logout` | Sign out |
| POST | `/factors`, `/factors/{id}/challenge`, `/factors/{id}/verify` | TOTP enroll and verify (admins) |

### Phase 1 data and RPC endpoints

| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET, PATCH | `/rest/v1/profiles?id=eq.{uid}` | owner | Read and edit own profile |
| GET | `/rest/v1/breeds?species=eq.dog&order=name_en` | any | Breed picker |
| GET | `/rest/v1/vaccine_types?species=eq.cat` | any | Vaccine picker |
| GET, POST | `/rest/v1/pets` | owner | List and create pets |
| GET, PATCH, DELETE | `/rest/v1/pets?id=eq.{id}` | owner | Read, edit, soft delete |
| GET, POST, PATCH | `/rest/v1/vaccinations?pet_id=eq.{id}` | owner, staff | Vaccination timeline |
| GET, POST | `/rest/v1/health_records?pet_id=eq.{id}` | owner, staff | Health records |
| POST | `/rest/v1/rpc/my_upcoming_vaccinations` | owner | Due and overdue across pets |
| POST | `/rest/v1/rpc/nearby_clinics` | any | Distance-sorted clinic list |
| GET | `/rest/v1/clinics?id=eq.{id}&select=*,doctors(*),services(*)` | any | Clinic detail |
| GET | `/rest/v1/clinics?supports_emergency=eq.true&status=eq.active` | any | Emergency directory |
| POST | `/rest/v1/rpc/get_available_slots` | any | Open slots for a day |
| POST | `/rest/v1/rpc/book_appointment` | owner | Create booking (idempotent) |
| POST | `/rest/v1/rpc/cancel_appointment` | owner, staff | Cancel |
| POST | `/rest/v1/rpc/reschedule_appointment` | owner, staff | Move to a new slot |
| POST | `/rest/v1/rpc/check_in_appointment` | owner, staff | Join the queue |
| POST | `/rest/v1/rpc/call_next_ticket` | staff | Call the next patient |
| POST | `/rest/v1/rpc/complete_appointment` | staff | Finish the visit |
| POST | `/rest/v1/rpc/get_queue_status` | owner | My number, current number, wait estimate |
| GET | `/rest/v1/appointments?owner_id=eq.{uid}&order=starts_at.desc` | owner | My bookings |
| POST | `/rest/v1/reviews` | owner | Review a completed visit |
| GET, PATCH | `/rest/v1/notifications` | owner | Inbox and mark as read |
| POST | `/rest/v1/push_tokens` (upsert on `token`) | owner | Register a device |

Dashboard calls use the same endpoints with staff or admin tokens; RLS returns only what that role may see. Admin-only CRUD (clinics, reference data, flags) uses the table API directly, protected by RLS and `aal2`.

### Edge Functions (`/functions/v1`)

| Method | Name | Caller | Purpose |
| --- | --- | --- | --- |
| GET | `app-config` | anyone | Feature flags for the platform, minimum app version, support contacts |
| POST | `send-push` | cron or service role | Drain `notification_outbox` through Expo Push, mark results, retry with backoff |
| POST | `admin-create-staff` | admin, clinic manager | Create and invite a clinic staff user |
| POST | `admin-set-user-status` | admin | Suspend or restore a user (profile status plus Auth ban) |
| POST | `admin-broadcast` | admin | Queue a push broadcast to a segment |
| POST | `delete-account` | owner | Delete the account and data |
| POST | `export-my-data` | owner | Return a JSON export |

### Realtime

| Channel | Type | Used by | Content |
| --- | --- | --- | --- |
| `queue:clinic:{clinic_id}` | Postgres changes on `queue_tickets` filtered by `clinic_id` | Clinic dashboard | Every ticket change for the live board |
| `queue:doctor:{doctor_id}:{yyyy-mm-dd}` | Broadcast from the database, private channel | Owner app | Only `{ current_number, waiting_count }`, so owners never receive other owners' data |
| `notifications:{user_id}` | Postgres changes on `notifications` | Mobile and web | New inbox item and badge count |

Subscribe only while the screen is open, and unsubscribe on blur.

### Example: booking request

```http
POST https://api.furever.app/rest/v1/rpc/book_appointment
apikey: <anon key>
Authorization: Bearer <access token>
Content-Type: application/json

{
  "p_pet_id": "0b6c5c10-...",
  "p_doctor_id": "6f1a2d90-...",
  "p_service_id": "3c9d7e41-...",
  "p_starts_at": "2026-11-02T14:30:00+02:00",
  "p_notes": "Limping on the left leg",
  "p_idempotency_key": "5d7f6a52-..."
}
```

Success returns `200` with the appointment row. Retrying with the same `p_idempotency_key` returns the same row instead of a duplicate.

### Conventions

- **Errors from RPC** raise a short upper-case code with a custom SQLSTATE so PostgREST maps the HTTP status (for example `raise exception 'SLOT_TAKEN' using errcode = 'PT409'`). **Errors from Edge Functions** return `{ "error": { "code": "SLOT_TAKEN", "message": "..." } }`. Clients translate the `code` into the user's language and never show raw server text.
- **Pagination:** `limit` (default 20, max 100) plus a keyset cursor `(created_at, id)`; responses never return unbounded lists.
- **Idempotency:** every write that a retry could duplicate (booking, orders later) takes an idempotency key.
- **Versioning:** add parameters with defaults and new columns freely; for a breaking change create `<name>_v2` and keep the old one until `app-config` shows the old app versions are gone.
- **CORS:** Edge Functions allow only the dashboard origins.
- **Time:** requests send ISO 8601 with offset; responses are UTC; clients format in Cairo time.

| Error code | HTTP | When |
| --- | --- | --- |
| `UNAUTHENTICATED` | 401 | Missing or expired token |
| `NOT_ALLOWED` | 403 | Role or ownership check failed |
| `ACCOUNT_SUSPENDED` | 403 | Suspended user |
| `VALIDATION_FAILED` | 422 | Zod or check constraint failed (includes field list) |
| `PET_NOT_FOUND` | 404 | Pet missing or not owned |
| `CLINIC_NOT_ACTIVE` | 422 | Clinic not accepting bookings |
| `SLOT_TAKEN` | 409 | Slot booked by someone else |
| `SLOT_IN_PAST` | 422 | Slot already started |
| `CANCEL_WINDOW_PASSED` | 422 | Too late to cancel free of charge |
| `FEATURE_DISABLED` | 422 | Flag is off (video, payments) |
| `RATE_LIMITED` | 429 | Too many requests |

### Reserved for later phases

| Phase | Reserved endpoints |
| --- | --- |
| 2 Shop | RPC `place_order`, `cancel_order`, `reorder`; tables `products`, `orders` |
| 3 Community | RPC `create_listing`, `send_match_request`, `respond_match_request`, `report_content`; Realtime `chat:{conversation_id}` |
| 4 Payments | `/functions/v1/payments-create-intent`, `payments-webhook`, `payments-refund` |
| 4 Video | `/functions/v1/video-create-room`, `video-token` |

## 9. Mobile app: screens and UI

The owner app has four tabs in Phase 1 (Home, Pets, Bookings, Profile) with a fifth Shop tab added by flag in Phase 2, and every screen below exists in Arabic RTL and English LTR, light and dark.

### Navigation model

- Root stack: `(auth)` group before sign-in, `(tabs)` after; booking, pet, and settings flows are stack screens above the tabs.
- Tabs: **Home**, **Pets**, **Bookings**, **Profile** (+ **Shop** when `shop_enabled`).
- Screens for features whose flag is off are not registered in navigation and their Home cards are hidden.
- Deep links use the `furever://` scheme and universal links on the production domain; see the notification routing table at the end of this section.

### Auth and onboarding (Phase 1)

| Route | Screen | UI and behavior |
| --- | --- | --- |
| `/` | Splash | Logo on the brand gradient; restores session, loads fonts, fetches `app-config`; routes to Home, Welcome, or Force Update |
| `/language` | Language | Two large cards, العربية and English; choosing applies RTL or LTR and reloads once; remembered for the next launch |
| `/onboarding` | Onboarding | Three slides (health passport, booking with live queue, emergency care), dots, Skip, Next |
| `/welcome` | Welcome | Title "Welcome to FurEver!", subtitle "The best care for your fur family.", primary button **Get Started**, secondary button **I Have an Account** (colors from the case study) |
| `/sign-in` | Sign in | Phone field with country picker (+20 default) and **Continue**; divider; **Continue with Google**; **Continue with Apple** (iOS only); links to Terms and Privacy |
| `/otp` | Verify code | Six boxes with SMS autofill, 60-second resend countdown, **Change number**, inline errors, loading state on verify |
| `/complete-profile` | Complete profile | Name, city picker, optional avatar, consent checkbox for Terms and Privacy; **Save** |
| `/permissions` | Permissions primer | Explains why notifications (reminders) and location (nearby clinics) are asked for; **Allow** or **Not now**; the app works without either |

### Home (Phase 1)

| Route | Screen | UI and behavior |
| --- | --- | --- |
| `/(tabs)/index` | Home | Gradient header (`#DAB7B5` to `#FBF6F5`) with greeting, avatar, and notifications bell with unread badge; search bar; **Categories** grid; **Next appointment** card (clinic, time, live queue status once checked in); **Vaccines due** banner when anything is due in 14 days or overdue; **My pets** horizontal row; red-tinted **Emergency** button |
| Categories | Grid cards (border `#A96062`, fill `#EEDAD7`) | Phase 1: Vet Clinics, My Pets, Emergency. Later, by flag: Shop, Mating, Adoption, Teleconsultation |

### Pets and health passport (Phase 1)

| Route | Screen | UI and behavior |
| --- | --- | --- |
| `/(tabs)/pets` | My Pets | Pet cards with photo, name, breed, age, and a status chip (Up to date, Due soon, Overdue); **Add pet** button; empty state with illustration |
| `/pets/new` | Add pet (4 steps) | 1 Species; 2 Basics (name, breed search, gender, birth date or approximate age, weight); 3 Photo (camera or library); 4 Vaccination (upload card, enter manually, or skip); progress bar; back keeps entered data |
| `/pets/[id]` | Pet profile (Digital Pet Passport) | Header with photo and key facts; tabs **Overview**, **Timeline**, **Vaccinations**, **Records**, **Documents**; verified badge on clinic-added entries; overflow menu: Edit, Share passport, Delete |
| `/pets/[id]/edit` | Edit pet | Same fields as creation; photo replace; soft-delete confirmation sheet |
| `/pets/[id]/vaccinations/new` | Add vaccination | Vaccine type (next-due date auto-filled from the interval, editable), date given, batch number, vet name, photo of the card |
| `/pets/[id]/records/new` | Add record | Type (visit, allergy, medication, surgery, lab, note), title, description, date, attachments |
| `/pets/[id]/passport` | Passport share | A clean read-only card with pet details and vaccination status; **Share** as image or PDF through the system share sheet |
| `/documents/[path]` | Document viewer | Opens private files through a signed URL; pinch to zoom for images; PDF preview |

### Clinics, booking, and emergency (Phase 1)

| Route | Screen | UI and behavior |
| --- | --- | --- |
| `/clinics` | Clinics | Search; filter chips (Near me, Open now, 24 hours, Emergency, species, rating 4+); sort by distance or rating; clinic cards with logo, name, distance, rating, next available slot; infinite scroll with FlashList |
| `/clinics/[id]` | Clinic detail | Cover photo, name, rating, open or closed status; **Call**, **WhatsApp**, **Directions**; tabs About, Services, Doctors, Reviews; sticky **Book now** |
| `/clinics/[id]/doctors/[doctorId]` | Doctor | Photo, specialty, experience, bio, services, next slots; **Book with this doctor** |
| `/book/service` | Booking step 1 | Service list filtered by the pet's species, with duration and price |
| `/book/doctor` | Booking step 2 | Doctor cards plus **Any available doctor** |
| `/book/time` | Booking step 3 | Horizontal date strip (next 14 days), grid of slot chips, closed days disabled, times shown in Cairo time |
| `/book/details` | Booking step 4 | Choose pet (or add one inline), optional notes |
| `/book/summary` | Booking step 5 | Clinic, doctor, service, date and time, price, `PaymentMethodSelector` (only **Pay at clinic**), cancellation policy text, **Confirm booking** with a spinner; a double tap cannot double submit |
| `/book/success` | Confirmation | Check animation, booking summary, **View booking** and **Back to home** |
| `/(tabs)/bookings` | My bookings | Tabs Upcoming, Past, Cancelled; booking cards with status badge; empty state |
| `/bookings/[id]` | Booking detail | Status stepper (Confirmed, Checked in, In progress, Completed); QR code for check-in; **Live queue card** (your number, now serving, people ahead, estimated wait) once checked in; Call clinic, Directions, Reschedule, Cancel (reason sheet) |
| `/bookings/[id]/review` | Rate visit | Five stars, optional comment, **Submit**; available once after completion |
| `/emergency` | Emergency | Banner "Emergency vets near you"; list of 24-hour and emergency clinics sorted by distance, each with large **Call** and **Directions** buttons; without location permission it falls back to the saved city |

### Notifications and profile (Phase 1)

| Route | Screen | UI and behavior |
| --- | --- | --- |
| `/notifications` | Inbox | Grouped by day; unread dot; tapping routes to the target; **Mark all as read** |
| `/(tabs)/profile` | Profile | Avatar, name, phone; rows to Edit profile, Settings, Account, Help, Legal, About |
| `/profile/edit` | Edit profile | Name, city, avatar |
| `/profile/settings` | Settings | **Language** (العربية, English), **Theme** (System, Light, Dark), **Notifications** (vaccination reminders, booking updates, offers) |
| `/profile/account` | Account | Linked sign-in methods (phone, Google, Apple) with **Add phone** and **Link Google**; **Log out**; **Export my data**; **Delete account** with re-authentication and typed confirmation |
| `/profile/help` | Help | FAQ accordion; contact by WhatsApp, phone, or email (from `app-config`); **Report a problem** |
| `/legal/terms`, `/legal/privacy` | Legal | Rendered in-app, in the current language, version recorded on acceptance |
| `/profile/about` | About | App version and build, open source licenses |
| `/force-update`, `/maintenance` | System screens | Shown when `app-config` says the version is too old or the backend is in maintenance |

### Phase 2: Shop

| Route | Screen | UI and behavior |
| --- | --- | --- |
| `/(tabs)/shop` | Shop home | Search, category chips, promo banners, featured products, **Buy again** row |
| `/shop/category/[id]` | Product list | Grid, filters (brand, species, price, rating), sort, infinite scroll |
| `/shop/product/[id]` | Product detail | Gallery, variant picker (size, flavor), price, stock state, description, **Add to cart**, related products |
| `/shop/cart` | Cart | Items with quantity stepper, subtotal, delivery fee, empty state |
| `/shop/checkout` | Checkout | Address, delivery slot, payment (**Cash on delivery**; online methods appear in Phase 4), order summary, **Place order** |
| `/shop/order-success` | Order placed | Order number, estimated delivery |
| `/shop/orders`, `/shop/orders/[id]` | Orders | List and detail with timeline (Placed, Confirmed, Out for delivery, Delivered), cancel while allowed, **Reorder** |
| `/profile/addresses`, `/profile/addresses/new` | Addresses | List, add and edit with map pin and fields, set default |
| `/shop/wishlist` | Wishlist | Saved products |

### Phase 3: Adoption and Mating hubs

| Route | Screen | UI and behavior |
| --- | --- | --- |
| `/community` | Hub | Two tabs, **Adoption** and **Mating**; filters (species, breed, gender, age, city, verified only, vaccination status); listing cards with a **Verified** badge |
| `/community/listing/[id]` | Listing detail | Photos, verified badge, passport summary (vaccination status, clinic-verified records), city, owner first name; **Request adoption** or **Send match request**; Report |
| `/community/new` | Create listing | Pick a pet (its passport must be complete), type, description, photos, upload proof documents; submitted as **Pending verification** |
| `/community/mine` | My listings | Status per listing (Pending, Verified, Rejected with reason, Paused), edit, pause, delete |
| `/community/requests` | Requests | Incoming and outgoing; approve or decline; adoption requests carry a short questionnaire (housing, other pets, experience) |
| `/community/chat`, `/community/chat/[id]` | Chat | Opens only after approval; text and images; **Report** and **Block** in the header |
| `/community/report` | Report sheet | Reason list and optional note |

### Phase 4: Payments and video

| Route | Screen | UI and behavior |
| --- | --- | --- |
| `PaymentMethodSelector` | Payment options | Adds Card, Wallet, and Fawry to the existing selector; opens the hosted payment page, returns by deep link, shows pending, paid, or failed |
| `/consult/[appointmentId]/prejoin` | Video pre-join | Camera and microphone check, network test, waiting room |
| `/consult/[appointmentId]/call` | Video call | Remote video, self preview, mute, camera, flip, end; reconnect banner |
| `/consult/[appointmentId]/summary` | After the call | Doctor notes added to the pet timeline, rate the consultation |
| `/subscriptions` | Auto-delivery | Subscribed products, next delivery date, change interval, skip, pause, cancel |

### UI kit (mobile)

`Button` (primary, secondary, ghost, destructive; sizes S, M, L; loading state), `TextInput`, `PhoneInput`, `OtpInput`, `SearchBar`, `Select` (bottom sheet picker), `DateField`, `Avatar`, `Rating`, `StatusBadge`, `Chip`, `CategoryCard`, `PetCard`, `ClinicCard`, `DoctorCard`, `SlotChip`, `Stepper`, `ListRow`, `Banner`, `EmptyState`, `Skeleton`, `Toast`, `ConfirmSheet`, `ScreenHeader`. Date fields use `@react-native-community/datetimepicker`. Every component takes its colors from the theme tokens and its spacing from logical (start and end) props.

### Behaviors every screen follows

- **Four states:** loading (skeleton, never a blank screen), empty (illustration plus a clear action), error (message plus **Retry**), and content.
- **Offline:** a banner appears; cached lists stay readable (React Query persistence); writes that need the network are disabled with an explanation, not queued silently.
- **Pull to refresh** on all lists; **optimistic updates** only for reversible actions (mark as read).
- **Destructive actions** (delete pet, cancel booking, delete account) always use a confirmation sheet.
- **Touch targets** are at least 44 pt; text scales with the system font size up to 130 percent; every control has an accessibility label in the current language.
- **Keyboards:** forms scroll above the keyboard; phone and OTP fields use the right keyboard type.
- **Push permission** is requested after the first booking or pet is added, not at launch (the primer screen explains why).

### Notification routing

| Kind | Trigger | Opens |
| --- | --- | --- |
| `vaccination_due` | 7 days, 1 day, and the due date | `/pets/{pet_id}` Vaccinations tab |
| `booking_confirmed` | After booking | `/bookings/{id}` |
| `booking_reminder` | 24 hours and 2 hours before | `/bookings/{id}` |
| `queue_next` | Ticket called, or two ahead | `/bookings/{id}` |
| `booking_cancelled` | Cancelled by clinic | `/bookings/{id}` |
| `review_prompt` | After completion | `/bookings/{id}/review` |
| `broadcast` | Admin message | `/notifications` or the link in the payload |

## 10. Web dashboard: screens and UI

One Next.js app serves two portals, an **admin portal** at `/[locale]/admin` and a **clinic portal** at `/[locale]/clinic`, and the sidebar, routes, and data each user sees are decided by their role.

### Layout and shell

- **Sidebar** (collapsible; on the right in Arabic) with items filtered by role; **top bar** with clinic switcher (staff with several clinics), global search (command palette, `Ctrl+K`), language toggle (ar, en), theme toggle (light, dark, system), and user menu.
- **Routing:** `/ar/...` and `/en/...`; the locale sets `lang` and `dir` on `<html>`. Middleware refreshes the session, checks the role, and redirects.
- **Responsive:** fully usable on tablet width, because reception desks use tablets for the queue.
- **Realtime:** the queue board and the notification badge subscribe through Supabase Realtime; everything else refetches on focus.

### Public and auth screens (Phase 1)

| Route | Screen | Behavior |
| --- | --- | --- |
| `/login` | Sign in | Email and password, CAPTCHA, link to reset |
| `/forgot-password`, `/reset-password` | Recovery | Email link, then new password |
| `/accept-invite` | Invitation | Set password after an invite email |
| `/mfa/enroll`, `/mfa/verify` | Second factor | QR code enrollment and 6-digit code; required for admins |
| `/no-access` | No access | Shown to non-staff accounts, with a sign-out button |

### Admin portal (Phase 1)

| Route | Screen | UI and behavior |
| --- | --- | --- |
| `/admin` | Overview | KPI cards (total users, new users, pets, bookings today and this week, completion rate, no-show rate, active and pending clinics); charts (sign-ups per day, bookings per day, bookings by status, top clinics); date range picker. Data comes from SQL views refreshed hourly, not live aggregation over big tables |
| `/admin/users` | Users | Table (name, phone, email, role, status, city, created, last active); search; filters; row actions Suspend, Restore, Force sign-out; CSV export |
| `/admin/users/[id]` | User detail | Profile, pets, bookings, activity; role change (super admin only); every view of health data writes an audit row |
| `/admin/pets`, `/admin/pets/[id]` | Pets | Read-only list and passport view for support cases, audited |
| `/admin/clinics` | Clinics | Table with status filter (Pending, Active, Suspended); **New clinic** |
| `/admin/clinics/new` | Create clinic wizard | Details (Arabic and English), map pin, opening hours, media, first manager invite |
| `/admin/clinics/[id]` | Clinic detail | Tabs Overview, Doctors, Services, Staff, Appointments, Reviews, Activity; actions **Approve**, **Suspend** |
| `/admin/appointments` | All appointments | Filters by clinic, status, date; detail drawer; cancel on behalf |
| `/admin/reviews` | Review moderation | List, **Hide** or **Unhide** with reason |
| `/admin/reference-data` | Reference data | Tabs Cities, Breeds, Vaccine types, Specialties; inline-editable bilingual tables; deactivate instead of delete |
| `/admin/notifications` | Broadcast | Composer with Arabic and English text, segment (all, city, species owned, language), preview, schedule, send; history with sent and failed counts |
| `/admin/flags` | Flags and config (super admin) | Toggles per flag and platform, minimum app version, maintenance mode, support contacts |
| `/admin/audit-logs` | Audit log | Filter by actor, entity, action, date; diff viewer |
| `/admin/team` | Admin team (super admin) | Invite, change role, reset MFA, remove |
| `/admin/settings` | My settings | Profile, language, theme, password, MFA devices |

### Clinic portal (Phase 1)

| Route | Screen | UI and behavior |
| --- | --- | --- |
| `/clinic` | Today | Counters (booked, checked in, waiting, done, no-show); next patients; shortcut to the queue |
| `/clinic/queue` | Live queue board | One column per doctor with lanes Waiting, Called, In progress; buttons **Check in** (scan the owner's QR or type the booking code), **Call next**, **Start**, **Complete**, **Skip**, **No-show**; optional sound on new check-in; updates in realtime |
| `/clinic/appointments` | Appointments | Calendar (day and week, by doctor) and list views; detail drawer with owner, pet, notes, history; confirm, reschedule, cancel with reason |
| `/clinic/patients` | Patients | Pets seen at this clinic (pet, owner, species, last visit, visit count); search |
| `/clinic/patients/[petId]` | Patient detail | Read-only passport; **Add vaccination** and **Add record** (marked clinic-verified, with attachments); visit history |
| `/clinic/doctors` | Doctors | List; add and edit (photo, specialty, bio, services); **weekly schedule editor** (several ranges per weekday, slot length) and **days off** calendar |
| `/clinic/services` | Services | Table with name (ar, en), duration, price, species, active toggle; inline edit |
| `/clinic/profile` | Clinic profile | Names, descriptions, contacts, WhatsApp, address, map pin, opening hours, 24-hour and emergency toggles, logo, cover, gallery; banner while status is Pending |
| `/clinic/staff` | Staff (manager) | Invite, change level, remove |
| `/clinic/reviews` | Reviews | Rating summary and list |
| `/clinic/reports` | Reports | Bookings per day, no-show rate, busiest hours, top services; date range; CSV export |
| `/clinic/settings` | Settings | Profile, language, theme, password |

The QR scanner uses `@yudiel/react-qr-scanner` (or `html5-qrcode`) in the browser; typing the booking code is always available as a fallback.

### Later phases

| Phase | Admin screens | Clinic screens |
| --- | --- | --- |
| 2 Shop | `/admin/products`, `/admin/categories`, `/admin/inventory`, `/admin/orders` (status updates, assignment, print invoice), `/admin/delivery-zones` | None |
| 3 Community | `/admin/listings` (verification queue with document viewer, approve or reject with reason), `/admin/reports` (moderation queue), `/admin/blocked-users` | Clinic-side verification of a listing's medical record (optional) |
| 4 Payments and video | `/admin/payments`, `/admin/refunds`, `/admin/subscriptions`, `/admin/video-sessions` | `/clinic/payouts`, video consultation schedule and join screen |

### Rules for every dashboard screen

- **Tables:** server-side pagination and sorting, filters and page stored in the URL (`nuqs`) so views can be shared, column visibility, bulk selection where it makes sense, CSV export of the current filter, skeleton while loading, a helpful empty state.
- **Forms:** `react-hook-form` and `zod` with the shared schemas, inline field errors, a warning when leaving with unsaved changes, disabled submit while saving.
- **Destructive actions** open a confirmation dialog that names the item; sensitive ones (suspend user, suspend clinic) require a reason that is written to the audit log.
- **Permissions:** the UI hides what a role cannot do, but the database is the real gate; a forbidden response shows a clear message, never a blank page.
- **Accessibility:** keyboard navigation, visible focus, labels on icon buttons, and sufficient contrast in both themes.

## 11. User stories and acceptance criteria

Each story has an ID that tickets, tests, and pgTAP files reference; all are Phase 1 unless a Phase column says otherwise, and every story is also accepted only if it works in Arabic and English, light and dark.

### Epic A: Account and onboarding (owner)

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| AUTH-01 | As a new owner I want to sign up with my phone number so that I can start quickly | Valid +20 number accepted; code arrives and verifies in under 60 seconds; wrong code shows an error and allows retry; after 5 wrong attempts or on resend within 60 seconds the user sees a wait message |
| AUTH-02 | As an owner I want to continue with Google so that I do not wait for an SMS | One tap opens the Google account chooser; on success a session and profile exist; cancelling returns to Sign in without an error toast |
| AUTH-03 | As an iPhone owner I want to continue with Apple | Works on iOS builds; the name from the first sign-in is saved; hidden email is accepted |
| AUTH-04 | As a new user I want to complete my profile so that clinics know who I am | Name and city required; avatar optional and resized below 1 MB; Terms and Privacy acceptance stored with version and time; cannot reach Home before this is done |
| AUTH-05 | As an owner I want to choose Arabic or English and light or dark mode | Language switch flips layout direction and persists across launches; theme follows system by default and can be forced; no screen shows mixed direction or unreadable contrast |
| AUTH-06 | As an owner I want to link Google or a phone number to my account so that I can sign in either way | Linking adds the identity to the same user; a second account is never created; conflicts show a clear message |
| AUTH-07 | As an owner I want to log out | Session and push token for this device are removed; the app returns to Welcome |
| AUTH-08 | As an owner I want to delete my account and data | Re-authentication required; pets, files, tokens, and profile removed; past appointments anonymized; user signed out; a store-compliant flow reachable in under 3 taps from Profile |
| AUTH-09 | As an owner I want to export my data | A JSON file with profile, pets, records, and bookings is returned and shareable |
| AUTH-10 | As the business I want suspended users blocked | A suspended user cannot refresh a session or call the API, and sees a support message |

### Epic B: Pets and health passport (owner)

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| PET-01 | As an owner I want to add a pet so that I can track its health | Name, species, gender required; breed search in the current language; birth date or approximate age; photo optional; pet appears immediately in My Pets |
| PET-02 | As an owner I want to edit my pet's details | Changes save and show without a restart; weight changes are kept in the timeline |
| PET-03 | As an owner I want to delete a pet | Confirmation sheet; pet disappears from lists; data is purged after 30 days; upcoming appointments for that pet are cancelled with a warning |
| PET-04 | As an owner I want to record a vaccination | Vaccine type from the list; next due date proposed from the vaccine interval and editable; saved entry appears in Vaccinations and Timeline |
| PET-05 | As an owner I want to attach a photo or PDF of a vaccination card or lab result | Images and PDFs up to 10 MB; stored privately; opens only for the owner and permitted clinic staff; upload shows progress and survives a failed retry |
| PET-06 | As an owner I want a timeline of my pet's health | Entries from all sources sorted by date; clinic-added items carry a Verified badge; infinite scroll |
| PET-07 | As an owner I want vaccination reminders so that I never miss a date | Push and inbox item 7 days before, 1 day before, and on the due date; no duplicates if the job runs twice; respects notification preferences; tap opens the pet's Vaccinations tab |
| PET-08 | As an owner I want to share my pet's passport | Share sheet sends an image or PDF with pet details and vaccination status in the current language |
| PET-09 | As an owner I want to see which entries a clinic verified | Entries created by clinic staff are labeled and cannot be edited by the owner |

### Epic C: Clinics, booking, and the live queue (owner)

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| CLN-01 | As an owner I want to see clinics near me | With location permission, list is sorted by distance; without it, by the saved city; only active clinics appear |
| CLN-02 | As an owner I want to search and filter clinics | Search matches Arabic and English names; filters for open now, 24 hours, emergency, species, rating; results update within 1 second of a filter change |
| CLN-03 | As an owner I want to see a clinic's details | Services with prices, doctors, hours, rating, reviews; Call, WhatsApp, and Directions open the right apps |
| BKG-01 | As an owner I want to book an appointment in a few steps | Service, doctor, time, pet, and confirmation in at most 5 steps; confirmation screen and inbox item appear; booking visible in Upcoming |
| BKG-02 | As an owner I want to be told if someone took my slot | Two users booking the same slot: exactly one succeeds, the other sees the SLOT\_TAKEN message and a refreshed list of slots; no double booking is possible at database level |
| BKG-03 | As an owner I want a safe retry | A request repeated with the same idempotency key (bad network) creates one appointment |
| BKG-04 | As an owner I want to cancel | Cancelling inside the allowed window frees the slot and notifies the clinic; outside the window the user sees the policy message |
| BKG-05 | As an owner I want to reschedule | Pick a new slot; old slot is released and the new one reserved in one step, or nothing changes |
| BKG-06 | As an owner I want reminders before my visit | Notifications 24 hours and 2 hours before in Cairo local time, once each |
| QUE-01 | As an owner I want to check in on arrival | Showing the QR code or tapping Check in creates a queue ticket with the next number for that doctor and day |
| QUE-02 | As an owner I want to see the live queue | Card shows my number, the number being served, people ahead, and an estimated wait; updates within 3 seconds of a change; no other owner's data is exposed |
| QUE-03 | As an owner I want a push when I am next | Notification when I am called or two places away |
| REV-01 | As an owner I want to rate my visit | Available once after completion; stars 1 to 5 and optional comment; clinic rating updates |
| EMG-01 | As an owner I want emergency clinics quickly | From Home in one tap; 24-hour and emergency clinics sorted by distance; Call works in one tap |

### Epic D: Notifications

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| NTF-01 | As an owner I want an inbox of notifications | Items listed newest first with unread state; opening one routes to its target; mark all as read works; badge count matches |
| NTF-02 | As an owner I want to control notification types | Toggles for vaccination reminders, booking updates, and offers; the backend respects them |
| NTF-03 | As the system I want to register the device token safely | Token upserted per device on login and refreshed; removed on logout; invalid tokens (reported by Expo) are deleted |

### Epic E: Clinic staff (web)

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| CS-01 | As clinic staff I want to accept my invitation and sign in | Invite link sets a password; after login I land in the clinic portal and see only my clinic |
| CS-02 | As a manager I want to edit my clinic profile | Arabic and English names, contacts, address, map pin, hours, media; clinic status cannot be changed by the clinic; changes visible in the app within a minute |
| CS-03 | As a manager I want to manage doctors | Add, edit, deactivate; deactivated doctors keep history but cannot be booked |
| CS-04 | As a manager I want to set working hours and days off | Several ranges per weekday and a slot length; exceptions override the weekly schedule; slots in the app reflect changes immediately; existing bookings in a newly closed period are flagged for action |
| CS-05 | As a manager I want to manage services and prices | Duration, price, species; inactive services disappear from the app |
| CS-06 | As staff I want to see and manage today's and future appointments | Day and week calendar by doctor; open any appointment; confirm, reschedule, or cancel with a reason; the owner gets a notification |
| CS-07 | As staff I want to run the live queue | Check in by QR or code; call next; start; complete; skip; mark no-show; owners see changes in under 3 seconds; two staff members acting on the same ticket never produce an inconsistent state |
| CS-08 | As a vet I want to add records and vaccinations to a visit | Entries are marked clinic-verified, linked to the clinic, and appear in the owner's timeline; vet can attach files |
| CS-09 | As a manager I want reports | Bookings per day, no-show rate, busiest hours, top services for a chosen range; CSV export |
| CS-10 | As a manager I want to manage staff | Invite by email with a level; change level; remove access immediately |

### Epic F: Admin (web)

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| AD-01 | As an admin I want to sign in securely | Email, password, and TOTP code required; without MFA enrolled the admin is forced to enroll; admin pages are unreachable otherwise |
| AD-02 | As an admin I want to onboard and approve clinics | Create a clinic with its first manager; clinic stays Pending and invisible in the app until Approved; Suspend hides it and blocks new bookings but keeps history |
| AD-03 | As an admin I want to manage users | Search, suspend with a reason, restore, force sign-out; actions are written to the audit log |
| AD-04 | As an admin I want to manage reference data | Add or edit breeds, vaccine types, cities, specialties in Arabic and English; changes appear in the app without a release |
| AD-05 | As an admin I want to see business KPIs | Overview loads in under 2 seconds on a large dataset; numbers match the underlying tables within the refresh interval |
| AD-06 | As an admin I want to send a broadcast | Compose in both languages, choose a segment, preview, send or schedule; users receive it in their language; delivery counts are shown |
| AD-07 | As a super admin I want to control flags and app config | Toggle features by platform; set the minimum app version and maintenance mode; change takes effect on the next config fetch |
| AD-08 | As an admin I want an audit trail | Every admin write and every admin read of health data is logged with actor, time, and entity; logs cannot be edited |
| AD-09 | As an admin I want to moderate reviews | Hide or restore a review with a reason; clinic rating recalculates |

### Epic G: Platform and quality

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| PLT-01 | As the business I want to force an update for unsafe old versions | When the app version is below the minimum, only the Force Update screen is reachable |
| PLT-02 | As the business I want a maintenance mode | A flag shows a maintenance screen in the apps and a banner in the dashboard |
| PLT-03 | As an owner I want the app to behave offline | Cached lists open; a banner explains the connection; actions that need the network are disabled with a reason |
| PLT-04 | As an Arabic-speaking user I want a fully right-to-left app | Layout, icons that imply direction, lists, tabs, and animations mirror correctly; numbers and dates follow the Egyptian locale; no clipped or overlapping text |
| PLT-05 | As a developer I want every change to be safe | CI runs lint, types, unit tests, pgTAP RLS tests, and builds for each pull request; a table without RLS fails the build |

### Epics for later phases

| ID | Phase | Story | Acceptance criteria |
| --- | --- | --- | --- |
| SHP-01 | 2 | As an owner I want to browse and search products | Categories, filters, and search in Arabic and English; out-of-stock items are labeled |
| SHP-02 | 2 | As an owner I want a cart and a checkout | Quantity limits follow stock; address required; order placed once even on retries; stock is decremented in the same transaction |
| SHP-03 | 2 | As an owner I want to track and reorder | Status timeline with push on each change; Reorder refills the cart with current prices |
| SHP-04 | 2 | As an admin I want to manage products, stock, and orders | CRUD with images, variants, bilingual text; order status changes notify the owner; low-stock list |
| COM-01 | 3 | As an owner I want to list a pet for adoption or mating | Only pets with a complete passport; proof documents required; listing hidden until Verified |
| COM-02 | 3 | As an admin I want to verify listings | Queue with document viewer; approve or reject with a reason that the owner sees |
| COM-03 | 3 | As an owner I want to browse verified listings and send a request | Filters; verified badge; one open request per listing and pet; the other owner is notified |
| COM-04 | 3 | As an owner I want to chat after approval | Chat opens only on approval; messages arrive in realtime; report and block work from the chat |
| COM-05 | 3 | As an admin I want to handle reports | Queue with context; actions to hide a listing, warn, or suspend the user, all audited |
| PAY-01 | 4 | As an owner I want to pay online for bookings and orders | Hosted payment page; result confirmed by a verified server webhook, never by the app; pending and failed states are visible |
| PAY-02 | 4 | As an admin I want to refund | Full or partial refund recorded and reflected on the order or appointment |
| PAY-03 | 4 | As an owner I want auto-delivery of essentials | Choose an interval; skip, pause, or cancel; each run creates an order and charges the saved method |
| VID-01 | 4 | As an owner I want a video consultation | Booking with type video; join window opens shortly before the start; notes are saved to the pet timeline |

## 12. Design system, themes, and localization

The light palette comes straight from the FurEver case study, the dark palette is new and proposed here, and both are defined once in `packages/design-tokens` and consumed by mobile (NativeWind) and web (CSS variables), so no screen ever contains a raw color.

### Color tokens

Light values are from the case study; dark values and semantic colors are proposals to validate in Figma against WCAG AA (4.5:1 for body text).

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `primary` | `#A96062` | `#D08A8C` | Main buttons (Get Started), category card borders, links, active tab |
| `on-primary` | `#FFFFFF` | `#1A1415` | Text and icons on primary |
| `surface-secondary` | `#EEDAD7` | `#3A2A2C` | Secondary buttons, category card fill, search bar, chips |
| `bg-gradient-top` | `#DAB7B5` | `#2B1F21` | Header and upper screen area |
| `bg-gradient-bottom` / `background` | `#FBF6F5` | `#1A1415` | Screen background |
| `surface` | `#FFFFFF` | `#251C1E` | Cards, sheets, dialogs |
| `border` | `#E6D3D0` | `#4A393C` | Dividers, input borders |
| `text-primary` | `#4A4A4A` | `#F3E9E8` | Headings, labels, icons |
| `text-secondary` | `#737373` | `#B9A9A8` | Subtitles and helper text |
| `success` | `#3F8F5F` | `#6CC08B` | Up to date, completed |
| `warning` | `#B7791F` | `#E0A94F` | Due soon, pending |
| `danger` | `#C0443F` | `#E5736E` | Overdue, errors, emergency, destructive actions |
| `info` | `#3F6FA8` | `#7FA6D6` | Confirmed, in progress |
| `overlay` | `rgba(0,0,0,0.40)` | `rgba(0,0,0,0.60)` | Modal backdrops |

Contrast checks to do before build: white on `#A96062` is about 4.6:1 (passes for normal text, with little margin); `#737373` on `#FBF6F5` is about 4.4:1, just under AA, so use `#6B6B6B` for small helper text in light mode. In dark mode, depth comes from lighter surfaces, not shadows.

### Status colors

| State | Token |
| --- | --- |
| Appointment `pending` / `confirmed` / `checked_in` / `in_progress` | `warning` / `info` / `primary` / `info` |
| Appointment `completed` / `cancelled` / `no_show` | `success` / `text-secondary` / `danger` |
| Vaccination Up to date / Due soon / Overdue | `success` / `warning` / `danger` |

### Typography

| Style | Size and weight | Notes |
| --- | --- | --- |
| H1 | 24 Bold | Screen titles, welcome text (from the case study) |
| H2 | 20 SemiBold | Section titles such as Categories |
| H3 | 18 SemiBold | Card titles (new) |
| Body | 14 Regular | Default text; 16 Regular for long reading |
| Button | 16 Medium | All buttons |
| Caption | 12 Regular | Timestamps, badges |

Fonts: **Inter** for English (the case study allows Inter or Poppins; Inter reads better at small sizes) and **Cairo** for Arabic, because neither Inter nor Poppins includes Arabic glyphs. Arabic text uses line height 1.5 to 1.6 and renders about 1 px larger for visual parity. The theme hook switches font family by locale. Web fonts load through `next/font`; mobile loads them with `expo-font` before the splash screen hides.

### Spacing, shape, and motion

- **Spacing** uses a 4-point scale: 4, 8, 12, 16, 20, 24, 32, 40, 48.
- **Radius:** 8 (chips), 12 (buttons, inputs), 16 (cards), 24 (sheets), full (avatars, pills).
- **Icons:** Lucide, 24 px default, 1.75 stroke, `text-primary` by default.
- **Touch target:** at least 44 pt; buttons are 48 (large), 40 (medium), 32 (small) high.
- **Motion:** 150 to 250 ms ease-out; sheet and page transitions use platform defaults; all non-essential animation is disabled when the system asks to reduce motion.

### Button specification

| Variant | Light | Dark | Use |
| --- | --- | --- | --- |
| Primary | `#A96062` fill, white text | `#D08A8C` fill, `#1A1415` text | One per screen, the main action |
| Secondary | `#EEDAD7` fill, `#4A4A4A` text | `#3A2A2C` fill, `#F3E9E8` text | Alternate action (I Have an Account) |
| Ghost | No fill, `primary` text | Same | Tertiary actions |
| Destructive | `danger` fill, white text | `danger` fill, `#1A1415` text | Delete, cancel booking |

All variants have default, pressed, focused, disabled (50 percent opacity), and loading states.

### How themes are built

1. `packages/design-tokens` exports `lightTheme` and `darkTheme` objects, a Tailwind preset, and CSS variable maps.
2. Web: variables on `:root` and `.dark`; `next-themes` toggles the class; shadcn components read the same variables.
3. Mobile: NativeWind `vars()` per theme with `darkMode: 'class'`; a `useTheme` hook exposes `scheme` (`system`, `light`, `dark`), saved in Zustand and `AsyncStorage` and synced to `profiles.theme` for signed-in users.
4. Components use semantic names only (`bg-surface`, `text-text-primary`). A CI check fails when a hex color appears in `src/` outside the tokens package.

### Localization and RTL rules

- **One source of text:** `packages/i18n/ar.json` and `en.json`, keys like `bookings.detail.cancelButton`, no concatenated sentences, interpolation for values. CI fails when the two files have different keys.
- **Plurals:** Arabic has six plural forms (zero, one, two, few, many, other); use i18next plural suffixes on mobile and ICU plural syntax in next-intl on web.
- **Logical layout only:** `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-` in Tailwind; `marginStart`, `paddingEnd` in React Native styles; never `left` or `right` for layout.
- **Icons:** mirror directional icons (back, chevrons, progress arrows); do not mirror phone, play, logos, check marks, or charts.
- **Mixed text:** phone numbers, codes, and prices are wrapped so they keep left-to-right order inside Arabic sentences.
- **Numbers and dates:** Western digits (0 to 9) in both languages as the default for the Egyptian market, through one formatter so it can change in one place; dates use `date-fns` locales (`ar`, `enUS`) or `Intl` with `Africa/Cairo`.
- **Server content:** bilingual columns are chosen by locale with a fallback to the other language; error codes map to translated messages on the client.
- **Mobile direction change:** `I18nManager.allowRTL(true)` and `forceRTL(isArabic)` followed by a single reload through `expo-updates`; the first-launch language screen runs before heavy screens so the reload happens once. Declare supported locales in the Expo config so the OS knows both.
- **Testing:** screenshots of the key screens in four combinations (Arabic or English, light or dark) are part of the definition of done for each feature.

## 13. Day-one engineering rules for 1M users

Supabase is plain PostgreSQL, so scaling to 1M registered users depends on a few habits that cost nothing now and are painful to add later; each rule below is enforced by review or CI, not by good intentions.

### Database rules

1. **Migrations only.** Every schema change is a timestamped SQL file in `backend/supabase/migrations`, reviewed in a pull request, applied to staging first. Nobody edits production in the Supabase dashboard.
2. **RLS on every table, tested.** CI fails if a public table has RLS off; every policy has a pgTAP test.
3. **Fast RLS.** Wrap `auth.uid()` and `auth.jwt()` in `(select ...)`, index every column a policy filters on, and keep policies free of heavy subqueries (use the `security definer` helper functions).
4. **Index every foreign key** and every column used in a filter or sort on a list screen; check new queries with `explain analyze` on seeded data (100k pets, 500k appointments).
5. **Keyset pagination only.** No `offset` on growing tables; no unbounded `select *`; always `limit`.
6. **Transactions in RPC.** Any write that touches more than one row is one database function with constraints (exclusion constraint for slots, unique keys for idempotency).
7. **Outbox for side effects.** Pushes and emails are rows in `notification_outbox`, sent by a worker with retry and dedupe, so a failed push never fails a booking.
8. **Denormalize counters with triggers** (`rating_avg`, `rating_count`, unread counts) instead of computing them on every read.
9. **Aggregates for dashboards come from views or materialized views** refreshed on a schedule, never from live scans of large tables.
10. **Plan for partitioning without doing it now.** Tables that will grow fastest (`notifications`, `audit_logs`, `queue_tickets`, `messages`) have `created_at` in every index and no foreign keys pointing into them, so they can be partitioned by month later.
11. **Soft delete plus purge,** so deletes stay cheap and recoverable for 30 days.
12. **Use PgBouncer (Supavisor) pooling** for serverless and Edge Function connections, and keep the app on the REST API rather than direct connections.

### API and client rules

13. **Backward compatibility forever.** Old app versions stay in the wild for years: add columns and parameters, never rename or remove in one release (expand, migrate, contract), and use `app-config` minimum versions to retire old ones.
14. **Typed contracts.** Database types are generated into `packages/shared`; inputs are validated with the same Zod schemas in the app, the dashboard, and Edge Functions.
15. **Idempotent writes** for anything a retry could duplicate.
16. **Feature flags** for every new module; Phase 2 to 4 ship dark and are turned on without a release.
17. **Errors are codes,** translated on the client; no raw server strings reach users.
18. **Realtime only where it pays:** queue and chat. Everything else uses React Query with sensible stale times; subscriptions are scoped and removed on unmount.
19. **Images are resized on the device** before upload and served at needed sizes; lists use cached thumbnails.
20. **Read-only analytics queries never run on the primary at scale:** move them to a read replica when dashboards slow the app.

### Operational rules

21. **Three environments** from the start (local, staging, production), each with its own Supabase project, keys, and push credentials.
22. **Backups with point-in-time recovery** enabled on production and a restore drill before launch.
23. **Observability on day one:** Sentry in all apps, Supabase logs and slow-query reports, an uptime check, and alerts on error spikes.
24. **Secrets in managed stores** (EAS, Vercel, Supabase), never in the repo; the `service_role` key never leaves Supabase.
25. **Load test before launch** with k6 against booking, slots, and queue RPCs at several times the expected peak.

### Capacity plan

These stages are planning guidance, not guarantees; trigger upgrades from your metrics, not from user counts.

| Stage | Registered users | Typical setup | What to do next |
| --- | --- | --- | --- |
| 0 | up to 10,000 | Supabase Pro, small compute, one region closest to users | Ship, learn, fix slow queries weekly |
| 1 | 10,000 to 100,000 | Medium compute, PITR, pooler on, Sentry and alerts tuned | Review top 20 queries monthly; add indexes; cache static lists on the client |
| 2 | 100,000 to 500,000 | Larger compute, read replica for dashboards and reports | Materialized views for KPIs; partition `notifications` and `audit_logs`; move heavy jobs to a separate worker service |
| 3 | 500,000 to 1M and beyond | Dedicated compute tier, replicas, CDN for media, rate limiting at the edge | Consider a separate service (for example Node) only for workloads that do not fit Postgres and Edge Functions, such as search and payments reconciliation |

Upgrade triggers: sustained CPU above 60 percent, connection usage above 70 percent of the pool, p95 query time above 200 ms for a key query, or realtime connection limits near the plan's cap.

A million registered users usually means 5 to 10 percent active in a day. The first limits you will meet are slow queries and notification volume, not raw user count.

## 14. Non-functional requirements

FurEver stores health data about pets and personal data about people, so security, privacy, and reliability are release gates, not later improvements.

### Security

| Area | Requirement |
| --- | --- |
| Access control | RLS on every table; admin writes require `aal2`; no table readable by anonymous users except public clinic data |
| Secrets | `service_role` and provider keys only in Supabase secrets; mobile and web hold only the anon key and public client IDs |
| Files | Private buckets for medical documents; signed URLs of 60 minutes or less; MIME type and size checks in storage policies |
| Sessions | Refresh-token rotation; session stored encrypted on mobile; HTTP-only cookies on web; sign-out revokes the session |
| Input | Zod validation at every boundary; parameterized SQL only; HTML from users is never rendered unescaped |
| Web hardening | Content Security Policy, `X-Frame-Options`, `Referrer-Policy`, CORS limited to dashboard origins, CAPTCHA on login |
| Abuse | OTP rate limits and SMS geo restriction; Edge Function rate limiting for public endpoints; account suspension flow |
| Audit | Admin actions and admin reads of health data are logged to `audit_logs` (append-only) |
| Dependencies | Renovate pull requests weekly; `pnpm audit` in CI; pinned versions |
| Review | A security review (RLS, storage, auth, secrets) before each store submission |

### Privacy and legal

- Privacy Policy and Terms in Arabic and English, shown in the app, with acceptance version and time stored.
- Data minimization: collect only what a feature needs; location is used for distance and is never stored as a history.
- In-app account deletion and data export (required by Apple and Google).
- Retention: soft-deleted data purged after 30 days; backups age out on their own schedule.
- Egypt's Personal Data Protection Law (Law No. 151 of 2020) applies; have a lawyer confirm registration, consent, and cross-border storage obligations before launch, since the Supabase region is outside Egypt.
- App Store privacy labels and Google Play Data safety forms are prepared from this PRD's data inventory.

### Performance targets

| Area | Target |
| --- | --- |
| Mobile cold start | under 2.5 seconds on a mid-range Android phone |
| Screen transitions and list scrolling | 60 frames per second on lists of 500 items (FlashList) |
| API reads / writes (server side, p95) | under 300 ms / under 500 ms |
| Slot search and booking (p95) | under 400 ms / under 600 ms |
| Queue update to owner's screen | under 3 seconds |
| Dashboard page load (LCP) | under 2.5 seconds on a typical office connection |
| JS bundle (web, per route) | under 250 KB gzipped for the largest route |
| Image sizes | avatars and thumbnails under 100 KB; photos under 500 KB after resize |

### Reliability

- Target availability 99.9 percent for booking and queue; Supabase and Vercel status pages are monitored.
- Idempotent writes, outbox retries with exponential backoff (up to 5 attempts), and dead-letter status for failed pushes.
- Graceful degradation: if Realtime drops, the queue card falls back to polling every 15 seconds.
- Backups: daily plus point-in-time recovery on production; restore tested quarterly.

### Accessibility

WCAG 2.1 AA as the target: contrast, labels on all controls, dynamic text up to 130 percent, screen reader order that respects RTL, no information conveyed by color alone (status chips also carry text).

### Observability and analytics

- **Errors:** Sentry in mobile, web, and Edge Functions, with release and environment tags and source maps uploaded by CI.
- **Backend:** Supabase logs, slow query report, and `pg_stat_statements` reviewed weekly.
- **Uptime:** an external check on `app-config` and the dashboard login page.
- **Product events (PostHog, no personal data):** `sign_up_completed`, `pet_added`, `vaccination_added`, `clinic_viewed`, `booking_started`, `booking_confirmed`, `booking_cancelled`, `queue_checked_in`, `review_submitted`, `notification_opened`, `language_changed`, `theme_changed`.
- **Business KPIs:** computed from the database (section 10), not from analytics events.

### Testing strategy

| Layer | Tools | What is covered |
| --- | --- | --- |
| Database | pgTAP (`supabase test db`) | Every RLS policy, constraints, RPC happy and failure paths, reminder generation |
| Edge Functions | Deno test | Auth guard, validation, error codes |
| Unit | `jest` (mobile), `vitest` (web, shared) | Zod schemas, formatters, slot logic helpers, hooks |
| Component | Testing Library | Buttons, forms, empty and error states, RTL rendering |
| End to end, mobile | Maestro | Sign in with test OTP, add pet, book, check in, cancel |
| End to end, web | Playwright | Login with MFA, create clinic, schedule editor, queue actions |
| Load | k6 | Slots, booking, queue under 3 to 5 times expected peak |
| Manual | Checklist | Four-combination screenshots, real devices (low-end Android, small iPhone), poor network |

### CI/CD and environments

1. Pull request: Biome, type check, unit tests, pgTAP against a local Supabase, build web, EAS preview build on demand, Vercel preview URL.
2. Merge to `main`: migrations applied to staging, Edge Functions deployed to staging, web deployed to staging, OTA update to the staging channel.
3. Release tag: migrations applied to production after a manual approval, functions and web deployed, EAS Build and Submit for store releases, EAS Update for JavaScript-only fixes.
4. EAS build profiles: `development` (dev client), `preview` (internal testers), `production`; EAS Update channels match the profiles and runtime versions follow the app version, so an OTA update never reaches an incompatible binary.
5. Rollback: previous Vercel deployment, previous EAS Update, and a forward-fix migration (never edit applied migrations).

### Store requirements checklist

Apple developer account and Google Play developer account; Sign in with Apple; in-app account deletion; privacy policy URL; privacy labels and Data safety forms; notification permission rationale; screenshots in Arabic and English; age rating; support URL.

## 15. Roadmap, definition of done, risks, and open questions

Phase 1 takes about 9 two-week sprints (around 18 weeks) for one to two developers working with AI-assisted tooling; treat this as an estimate to re-plan after sprint 1, and build every feature as a vertical slice (database, API, mobile, dashboard, tests) so each sprint ends with something usable.

### Phase 1 sprint plan

1. **Sprint 0, foundations (weeks 1 to 2).** Repo with `backend`, `mobile`, `web`, `packages`; three Supabase projects; CI; design tokens; i18n; theme and RTL shells in both apps; migration pipeline. *Exit:* a hello-world screen in Arabic and English, light and dark, on mobile and web, with CI green.
2. **Sprint 1, auth and profiles (weeks 3 to 4).** Phone OTP, Google, Apple, profile completion, access token hook, dashboard login with MFA, role routing, first RLS tests. *Exit:* AUTH-01 to AUTH-10 and AD-01.
3. **Sprint 2, pets and passport (weeks 5 to 6).** Pets CRUD, breeds seed, storage buckets, documents. *Exit:* PET-01 to PET-03 and PET-05.
4. **Sprint 3, vaccinations and notifications (weeks 7 to 8).** Vaccinations, timeline, outbox, cron reminders, `send-push`, inbox, preferences, passport sharing. *Exit:* PET-04, PET-06 to PET-09, NTF-01 to NTF-03.
5. **Sprint 4, clinics (weeks 9 to 10).** Admin creates and approves clinics, reference data, clinic profile, doctors, services, schedules; mobile clinic browse and detail. *Exit:* AD-02, AD-04, CS-01 to CS-05, CLN-01 to CLN-03.
6. **Sprint 5, booking (weeks 11 to 12).** Slots, booking, cancel, reschedule RPCs; mobile booking flow and My Bookings; clinic appointment calendar. *Exit:* BKG-01 to BKG-06, CS-06.
7. **Sprint 6, live queue and operations (weeks 13 to 14).** Check-in, queue board, realtime, reviews, emergency directory, clinic records, reports, admin KPIs, broadcast, flags, audit, moderation. *Exit:* QUE-01 to QUE-03, REV-01, EMG-01, CS-07 to CS-10, AD-03, AD-05 to AD-09.
8. **Sprint 7, hardening (weeks 15 to 16).** Security review, load tests, accessibility pass, four-combination QA on real devices, legal texts, force update and maintenance modes, store assets. *Exit:* all items in the definition of done below.
9. **Sprint 8, beta and launch (weeks 17 to 18).** TestFlight and Play internal testing with two to three pilot clinics, fixes, store submission, production cutover and monitoring.

Later phases are estimated at six to eight weeks each (Shop, Community, Payments and video) and run in the order the business chooses; see open question 12.

### Definition of done (every feature)

- Database migration, RLS policies, and pgTAP tests merged.
- Shared Zod schemas and generated types updated.
- Mobile and web screens implemented with loading, empty, error, and content states.
- Works in Arabic and English, light and dark, verified with screenshots.
- All user-facing text lives in the translation files; no hard-coded strings or colors.
- Unit and end-to-end tests added for the main path and one failure path.
- Analytics events and Sentry breadcrumbs added where listed in section 14.
- Feature flag in place if the feature is not part of the current release.
- Acceptance criteria of the linked user stories checked by someone other than the author.

### Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Too few clinics at launch | App feels empty; owners churn | Sign 3 to 5 pilot clinics before launch; admin onboards them; sell the clinic benefit (fewer no-shows, ordered queue) |
| SMS cost, fraud, or poor delivery in Egypt | High verification cost; users cannot sign in | Twilio Verify with geo permissions; Google and Apple sign-in; optional email OTP; monitor cost per verification weekly |
| Weak or slow RLS policies | Data leak or slow screens | Helper functions, pgTAP tests for every policy, `explain analyze`, load tests |
| RTL and Arabic layout defects | Poor reviews in the main market | RTL from sprint 0; four-combination screenshots; logical properties only |
| Store rejection | Launch delay | Checklist in section 14; no medical diagnosis claims in Phase 1; Sign in with Apple and account deletion present |
| Privacy and legal obligations | Fines, forced changes | Lawyer review before launch; consent and deletion built in |
| Daylight saving errors in booking times | Wrong slot times twice a year | `timestamptz`, the named zone `Africa/Cairo`, tests around DST change dates |
| Slot hoarding and no-shows | Clinics lose trust | Reminders, cancellation window, no-show tracking, a cap on active bookings per user |
| Scope creep from later phases | Delayed launch | Phase gates and flags; changes to Phase 1 scope need a written PRD change |
| Vendor dependence (Supabase, Expo) | Lock-in worries | Standard Postgres and open source tooling; local builds can replace EAS; exit path documented |

### Open questions

These need your decision; the PRD carries the stated assumption until you answer.

1. **Domain and brand names.** The PRD uses `furever.app` as a placeholder. What are the real domain, store listing names, and bundle IDs?
2. **Launch city and pilot clinics.** Which city first, and how many clinics are already interested? (assumed: one city, 3 to 5 clinics)
3. **Clinic onboarding.** Admin-created only, or clinics can apply and wait for approval? (assumed: admin-created)
4. **Cancellation window.** Assumed free cancellation up to 2 hours before the visit; confirm the policy.
5. **Walk-in patients.** Phase 1 queues only app bookings; do clinics need staff-created queue entries for people without the app?
6. **Revenue model.** Free for clinics, commission per booking, clinic subscription, shop margin, or a mix? This shapes the Phase 4 payment design.
7. **SMS provider.** Twilio Verify is assumed; confirm Egyptian pricing and delivery, or plan a local provider through Supabase's SMS hook.
8. **Supabase region.** Choose a European region close to Egypt (for example Frankfurt); confirm this is acceptable under the data protection review.
9. **Digits.** Western digits (0 to 9) are assumed in Arabic; confirm or switch to Arabic-Indic digits.
10. **Species at launch.** Breeds and vaccine rules are seeded for cats and dogs; other species are allowed but have no seeded data. Confirm.
11. **Doctor verification.** Do you need to collect and verify veterinary licenses for doctors before they appear in the app?
12. **Order of later phases.** Shop first, or Adoption and Mating first? (assumed: Shop, then Community, then Payments and video)
