# Environments

FurEver uses three separate environments: local, staging, and production. Each hosted
environment must use its own Supabase project, keys, and push credentials. Values that
have not been provisioned are shown as explicit placeholders; replace them only when the
corresponding resource exists.

Never commit secrets or real environment values in a `.env` file. Committed
`.env.example` files are reference templates only and must contain placeholders, not
working credentials. Secrets belong only in the managed stores described below: EAS,
Vercel, and Supabase-managed configuration. Supabase API URL and keys are injected into
Edge Function environments by Supabase; do not copy them into project secrets manually.
The legacy `service_role` key stays server-side and is never manually copied to a
client.

## Supabase Edge Function environment

The functions currently in `backend/supabase/functions/` use these Supabase-provided
values:

- `SUPABASE_URL` is the project API URL used by the functions.
- `SUPABASE_ANON_KEY` is accepted as the legacy public key. The current functions also
  accept the default key in `SUPABASE_PUBLISHABLE_KEYS`, which Supabase provides as a
  JSON object of named publishable keys. These are public keys; they do not replace
  server-side authorization or database row-level security.
- `SUPABASE_SERVICE_ROLE_KEY` is read by `admin-set-user-status` for Auth Admin
  operations. It is a privileged server-side key that bypasses row-level security. Never
  manually copy it to a web or mobile client. Supabase injects this legacy variable;
  newer projects may also expose named secret keys through `SUPABASE_SECRET_KEYS`, but
  this function does not parse or use that variable and has not been migrated to named
  secret keys.

These are supplied by Supabase for the corresponding local or hosted project. Safe
documentation-only placeholders, if a value must be illustrated, look like
`<project-url>` and `<public-key>`; never paste a real URL key pair or secret into this
document.

Both current dashboard-facing functions read `DASHBOARD_ORIGINS` as a comma-separated
list. Each item is trimmed and compared to the request's `Origin` as an exact string;
there is no wildcard, subdomain, or prefix matching. If the variable is unset, their
local default is exactly:

```text
http://localhost:3100,http://127.0.0.1:3100
```

When set, the configured list replaces those local defaults. Each hosted project must
be configured with the exact dashboard origin(s) for that environment, for example
`https://<staging-dashboard-host>` and `https://<production-dashboard-host>` (placeholders
only). Neither hosted origin can be set yet: the Supabase projects and dashboard domains
have not been provisioned or verified. Do not use these example placeholders as values.

`_shared/sentry.ts` supports optional Edge Function Sentry initialization. It runs only
when `ENABLE_SENTRY` is exactly `true` and `SENTRY_DSN` is present; otherwise it makes no
Sentry initialization call. If Sentry is used, configure the DSN as a project-specific
secret named `SENTRY_DSN` and set `ENABLE_SENTRY=true`. A safe placeholder is
`SENTRY_DSN=<sentry-dsn>`; no DSN is currently configured.

SMTP credentials are configured in Supabase Auth's SMTP settings for each project; they
are not an Edge Function secret. The SMTP provider remains undecided (T145), so no
provider-specific credentials or values are documented here. Local development uses
the Supabase local email inbox.

## Google and Apple sign-in providers

Google and Apple are configured independently for local development and for each hosted
Supabase project. The local provider blocks in `backend/supabase/config.toml` are present
and both have `enabled = false`. This repository contains no provider credentials or
verified app IDs; `backend/.env.example` contains placeholders only. Hosted Supabase
provider settings and external account/credential readiness have not been inspected or
verified. Keep each provider disabled until the applicable provider account, app IDs, and
credentials are confirmed for that environment.

For local Supabase development, provide these variables to the shell that runs
`supabase start` (or the local CLI command that reads this config):

```dotenv
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<web-client-id>,<android-client-id>,<ios-client-id>
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=<google-client-secret>
SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID=<apple-services-id>,<native-app-id>
SUPABASE_AUTH_EXTERNAL_APPLE_SECRET=<apple-client-secret>
```

Use only the IDs for registered platforms, with comma-separated values and no spaces.
For Google, put the web client ID first, followed by Android and then iOS client IDs as
available. For Apple, put the Services ID first for web OAuth, followed by native App
IDs as needed. The local config resolves secrets from environment variables and does not
enable either provider by itself. Keep actual values in ignored local environment storage;
`backend/.env.example` contains placeholder-only values and is not a credential source.

The mobile app also reads the public Google web client ID and iOS client ID from
`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. Set the reversed
iOS client ID as `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` so Expo config can add the native
Google Sign-In URL scheme. These client IDs and URL schemes are identifiers, not client
secrets; keep them in ignored `mobile/.env.local` for local builds and set them in the EAS
build environment for development builds. The Google config plugin is omitted when the iOS
scheme is absent; no placeholder scheme is used to generate native configuration.

Before enabling a provider locally, register the local callback with the provider:

- Google OAuth web client: authorized JavaScript origin `http://localhost:<web-port>`
  (use the actual local web origin) and authorized redirect URI
  `http://127.0.0.1:54321/auth/v1/callback`.
- Apple Services ID: configure the exact Auth domain and callback shown for the local
  Auth endpoint, represented as `https://<local-auth-domain>/auth/v1/callback`. Apple
  requires the registered Services ID website domain and return URL to match; if the
  local stack is not reachable through a provider-accepted HTTPS domain, local Apple
  OAuth cannot be used until an appropriate HTTPS development domain is provisioned.

For staging and production, configure providers separately in each project's Supabase
Dashboard under **Authentication > Providers** (select Google or Apple). Add that
project's provider client IDs and secret there, enable the provider only after setup is
complete, and use the callback URL shown on that provider's Dashboard page in the
provider console. The expected hosted callback shape is
`https://<project-ref>.supabase.co/auth/v1/callback`; use the exact Dashboard value,
especially if a custom Auth domain is configured. Configure the site's URL and allowed
redirect URLs under **Authentication > URL Configuration** for each actual environment
domain, for example `https://<staging-app-domain>` and
`https://<production-app-domain>` (placeholders only).

For Google, create the OAuth web client with the actual hosted app origin(s) and the
Supabase callback URL; put the web client ID first in the comma-separated Client IDs
field, followed by Android and iOS IDs as applicable. For Apple, provision and verify
the Apple Developer Team, App ID(s), Services ID, and signing key; register the hosted
Supabase Auth domain and exact callback URL in the Services ID website configuration.
Use the Services ID first in the Apple Client IDs field, followed by native App IDs as
needed. Apple OAuth signing secrets require regular rotation; follow the current Apple
and Supabase guidance when provisioning them.

All hostnames, project references, origins, callback URLs, IDs, and secrets above are
illustrative placeholders. Replace them only after the staging or production Supabase
project and actual app domains are known, and the applicable provider account, verified
app IDs, and credentials have been confirmed. Do not enable a hosted provider before
those prerequisites are met.
See Supabase's [Google sign-in guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
and [Apple sign-in guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple)
for provider-specific setup.

Supabase documents injected Edge Function variables and custom secrets in its
[Edge Function environment variables guide](https://supabase.com/docs/guides/functions/secrets).
Do not run `supabase secrets set` until the target hosted project exists and its
environment-specific values are known.

## Local

**Purpose:** Developer work and automated development checks on a developer machine.

- **Supabase:** Run the local Supabase stack with the Supabase CLI using `supabase start`.
  Use the local project's generated configuration and keys; do not point local work at a
  hosted staging or production project.
- **Email:** Use the local Supabase email inbox. It captures test messages locally; no
  real email is sent.
- **Push:** Real push credentials are not required locally.
- **Secrets and configuration:** Supabase supplies its project URL and API keys to local
  Edge Functions. `DASHBOARD_ORIGINS` defaults to the two localhost origins documented
  above; local-only extra secrets belong in ignored local configuration. Local runtime
  values are for the developer's local stack
  and machine only. Do not commit them in a `.env` file. Hosted credentials must not be
  reused locally.
- **Environment templates:** [backend/.env.example](../backend/.env.example),
  [mobile/.env.example](../mobile/.env.example), and [web/.env.example](../web/.env.example).

## Staging

**Purpose:** A hosted environment for integration, release-candidate, and end-to-end
checks before production.

- **Supabase:** Use a dedicated staging Supabase project, separate from local and
  production. Its reference is `<staging-project-ref>` (placeholder only). The staging
  Supabase project has not yet been provisioned. Creating it is a manual prerequisite;
  it does not block D02, but it blocks the D08 cutover.
- **Email:** Configure real custom SMTP for staging Auth email. The SMTP provider is
  undecided; see `specs/001-furever-platform/research.md` §4-rewrite. Do not use the
  local email inbox for hosted staging mail.
- **Mobile:** Use the staging EAS build profile and staging-specific Supabase and push
  configuration.
- **Web:** Use a staging Vercel deployment with staging-specific configuration.
- **Secrets:** Store mobile build and push credentials in EAS and web deployment values in
  Vercel. Supabase supplies project API values to Edge Functions. Configure any required
  custom Edge Function secrets (such as `SENTRY_DSN`, only if Sentry is enabled) in the
  staging Supabase project. Configure SMTP credentials in Supabase Auth SMTP settings,
  not as Edge Function secrets. These hosted settings are pending project provisioning.
- **Environment templates:** [backend/.env.example](../backend/.env.example),
  [mobile/.env.example](../mobile/.env.example), and [web/.env.example](../web/.env.example).

## Production

**Purpose:** The live environment used by FurEver customers.

- **Supabase:** Use a dedicated production Supabase project, separate from local and
  staging. Its reference is `<production-project-ref>` (placeholder only). The production
  Supabase project has not yet been provisioned. Creating it is a manual prerequisite;
  it does not block D02, but it blocks the D08 cutover.
- **Email:** Configure real custom SMTP for production Auth email. The SMTP provider is
  undecided; see `specs/001-furever-platform/research.md` §4-rewrite.
- **Mobile:** Use the production EAS build profile and production-specific Supabase and
  push configuration.
- **Web:** Use a production Vercel deployment with production-specific configuration.
- **Backups:** Enable point-in-time recovery on the production Supabase project and
  complete the required restore drill before launch.
- **Secrets:** Store mobile build and push credentials in EAS and web deployment values in
  Vercel. Supabase supplies project API values to Edge Functions. Configure any required
  custom Edge Function secrets (such as `SENTRY_DSN`, only if Sentry is enabled) in the
  production Supabase project. Configure SMTP credentials in Supabase Auth SMTP settings,
  not as Edge Function secrets. These hosted settings are pending project provisioning;
  the `service_role` key must remain server-side.
- **Environment templates:** [backend/.env.example](../backend/.env.example),
  [mobile/.env.example](../mobile/.env.example), and [web/.env.example](../web/.env.example).
