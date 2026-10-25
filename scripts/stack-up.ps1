# Starts local Supabase via the Supabase CLI, then brings up the web dev container,
# waiting for both to report healthy. Requires Docker Desktop running.
# Usage: pnpm stack:up  (or: powershell -ExecutionPolicy Bypass -File scripts/stack-up.ps1)

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$webEnvLocal = Join-Path (Split-Path $here -Parent) "web/.env.local"
$webEnvExample = Join-Path (Split-Path $here -Parent) "web/.env.example"

Write-Host "==> Starting local Supabase..."
# No `2>&1` here: in Windows PowerShell 5.1, redirecting a native command's stderr wraps
# each stderr line in a terminating NativeCommandError under $ErrorActionPreference =
# "Stop", even on exit code 0 (found by actually running this end to end from a fresh
# clone and hitting it on Supabase's own "Stopped services: [...]" stderr notice).
# supabase start's status JSON is on stdout anyway, so capturing stdout alone is enough.
$supabaseOutputLines = pnpm --filter backend exec supabase start
if ($LASTEXITCODE -ne 0) { throw "supabase start failed (exit $LASTEXITCODE)" }

# `supabase start` prints one line of status JSON (DB_URL, API_URL, ANON_KEY, etc.) - reuse
# it to auto-create web/.env.local on a fresh clone, rather than failing with a confusing
# "env file not found" from docker compose (found by actually running this from a fresh
# clone, per quickstart.md's T079 check - the step was undocumented until this fix).
if (-not (Test-Path $webEnvLocal)) {
  $jsonLine = $supabaseOutputLines | Where-Object { $_ -match '^\{.*"ANON_KEY"' } | Select-Object -Last 1
  if ($jsonLine) {
    $status = $jsonLine | ConvertFrom-Json
    Write-Host "==> web/.env.local not found; creating it from web/.env.example + this Supabase instance's anon key..."
    $envContent = Get-Content $webEnvExample -Raw
    $envContent = $envContent -replace 'NEXT_PUBLIC_SUPABASE_URL=.*', 'NEXT_PUBLIC_SUPABASE_URL=http://host.docker.internal:54321'
    $envContent = $envContent -replace 'NEXT_PUBLIC_SUPABASE_ANON_KEY=.*', "NEXT_PUBLIC_SUPABASE_ANON_KEY=$($status.ANON_KEY)"
    Set-Content -Path $webEnvLocal -Value $envContent -NoNewline
  } else {
    Write-Warning "Could not parse 'supabase start' status JSON to auto-create web/.env.local - copy web/.env.example to web/.env.local yourself (see README.md's Environment configuration section) and re-run."
  }
}

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
