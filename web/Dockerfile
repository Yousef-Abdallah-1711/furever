# Build context is the repo root (`docker build -f web/Dockerfile .`), not web/ — the
# web app reaches packages/i18n and packages/design-tokens/dist via relative imports
# rather than declared workspace dependencies, so the whole monorepo must be present.

# Debian-based (glibc), not alpine: the pnpm lockfile resolves several CLIs (Supabase,
# Sentry, Biome) to their glibc Linux binaries, which don't run under Alpine's musl libc
# — confirmed by actually running `supabase test db` in an Alpine tools image and hitting
# `spawn .../cli-linux-x64/bin/supabase ENOENT`. Only the production `runner` stage below
# stays on alpine, where no such CLI ever executes.
FROM node:22.13.0 AS base
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
WORKDIR /app

# ---- deps: install the full workspace, respecting the lockfile ----
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY web/package.json web/package.json
COPY mobile/package.json mobile/package.json
COPY backend/package.json backend/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/i18n/package.json packages/i18n/package.json
COPY packages/design-tokens/package.json packages/design-tokens/package.json
RUN pnpm install --frozen-lockfile

# ---- dev: full source, runs `next dev` against a bind-mounted workspace ----
FROM deps AS dev
COPY . .
RUN pnpm tokens:build
EXPOSE 3000
ENV PORT=3000
CMD ["pnpm", "--filter", "web", "dev"]

# ---- tools: full workspace, source + deps, for one-shot lint/typecheck/test/pgTAP ----
# The Docker CLI (client only, no daemon) is needed because `supabase test db --db-url`
# still spawns a pg_prove container of its own against the host's Docker socket even
# when pointed at an already-running remote database.
FROM deps AS tools
RUN curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-27.3.1.tgz \
    | tar -xz --strip-components=1 -C /usr/local/bin docker/docker
COPY . .

# ---- build: regenerate design tokens, then produce the Next.js standalone output ----
FROM deps AS build
COPY . .
RUN pnpm tokens:build
RUN pnpm --filter web build

# ---- runner: minimal production image, non-root, with a HEALTHCHECK ----
FROM node:22.13.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
COPY --from=build --chown=nextjs:nodejs /app/web/public ./web/public
COPY --from=build --chown=nextjs:nodejs /app/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/web/.next/static ./web/.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health',res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "web/server.js"]
