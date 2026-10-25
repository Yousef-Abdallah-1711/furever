# Tears the stack all the way down, discarding Docker named volumes (pnpm store,
# node_modules caches) and the local Supabase database, then brings everything back up
# clean. Use this when dependencies or migrations get into a weird state.
# Usage: pnpm stack:reset  (or: powershell -ExecutionPolicy Bypass -File scripts/stack-reset.ps1)

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot

Write-Host "==> Tearing down web (dev profile) and its named volumes..."
docker compose --profile dev down -v

Write-Host "==> Stopping local Supabase and discarding its data..."
pnpm --filter backend exec supabase stop --no-backup

Write-Host "==> Bringing the stack back up..."
& "$here/stack-up.ps1"
