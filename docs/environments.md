# Environments

FurEver uses three separate environments: local, staging, and production. Each hosted
environment must use its own Supabase project, keys, and push credentials. Values that
have not been provisioned are shown as explicit placeholders; replace them only when the
corresponding resource exists.

Never commit secrets or real environment values in a `.env` file. Committed
`.env.example` files are reference templates only and must contain placeholders, not
working credentials. Secrets belong only in the managed stores described below: EAS,
Vercel, and Supabase secrets. The Supabase `service_role` key stays in Supabase and is
never shipped to an app.

## Local

**Purpose:** Developer work and automated development checks on a developer machine.

- **Supabase:** Run the local Supabase stack with the Supabase CLI using `supabase start`.
  Use the local project's generated configuration and keys; do not point local work at a
  hosted staging or production project.
- **Email:** Use the local Supabase email inbox. It captures test messages locally; no
  real email is sent.
- **Push:** Real push credentials are not required locally.
- **Secrets and configuration:** Local runtime values are for the developer's local stack
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
- **Secrets:** Store mobile build and push credentials in EAS; web deployment values in
  Vercel; and Supabase Auth SMTP credentials and Edge Function secrets in the staging
  Supabase project's secrets. Keep each value scoped to staging.
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
- **Secrets:** Store mobile build and push credentials in EAS; web deployment values in
  Vercel; and Supabase Auth SMTP credentials and Edge Function secrets in the production
  Supabase project's secrets. Keep each value scoped to production. The `service_role`
  key must remain in Supabase.
- **Environment templates:** [backend/.env.example](../backend/.env.example),
  [mobile/.env.example](../mobile/.env.example), and [web/.env.example](../web/.env.example).
