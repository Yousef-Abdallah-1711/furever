# Starts local Supabase via the Supabase CLI, then brings up the web dev container,
# waiting for both to report healthy. Requires Docker Desktop running.
# Usage: pnpm stack:up  (or: powershell -ExecutionPolicy Bypass -File scripts/stack-up.ps1)

$ErrorActionPreference = "Stop"

Write-Host "==> Starting local Supabase..."
pnpm --filter backend exec supabase start
if ($LASTEXITCODE -ne 0) { throw "supabase start failed (exit $LASTEXITCODE)" }

Write-Host "==> Building and starting web (dev profile)..."
docker compose --profile dev up -d --build
if ($LASTEXITCODE -ne 0) { throw "docker compose up failed (exit $LASTEXITCODE)" }

Write-Host "==> Waiting for web's health check..."
$containerId = docker compose ps -q web
if (-not $containerId) { throw "web container not found after 'docker compose up'" }

$deadline = (Get-Date).AddSeconds(120)
$status = ""
do {
  Start-Sleep -Seconds 2
  $status = docker inspect --format='{{.State.Health.Status}}' $containerId 2>$null
} while ($status -ne "healthy" -and $status -ne "unhealthy" -and (Get-Date) -lt $deadline)

if ($status -ne "healthy") {
  docker compose logs web
  throw "web container did not become healthy within 120s (last status: '$status')"
}

Write-Host ""
Write-Host "Stack is up."
Write-Host "  Web:       http://localhost:3010"
Write-Host "  Supabase:  run 'pnpm --filter backend exec supabase status' for URLs/keys"
