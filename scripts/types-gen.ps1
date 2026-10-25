# Generates TypeScript types from the local Supabase schema (must already be running -
# see stack-up.ps1). Windows users may need `-ExecutionPolicy Bypass`; this file stays
# LF-encoded per .gitattributes even though it only runs on Windows.
# Usage: pnpm types:gen  (or: powershell -ExecutionPolicy Bypass -File scripts/types-gen.ps1)

$ErrorActionPreference = "Stop"
pnpm exec tsx packages/shared/scripts/gen-types.ts
exit $LASTEXITCODE
