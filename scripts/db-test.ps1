# Runs the backend's pgTAP suite against the local Supabase stack (must already be
# running — see stack-up.ps1). Windows users may need to run this with
# `-ExecutionPolicy Bypass` if the default execution policy blocks local scripts; this
# file itself stays LF-encoded per .gitattributes even though it only runs on Windows.
# Usage: pnpm db:test  (or: powershell -ExecutionPolicy Bypass -File scripts/db-test.ps1)

$ErrorActionPreference = "Stop"
pnpm --filter backend exec supabase test db
exit $LASTEXITCODE
