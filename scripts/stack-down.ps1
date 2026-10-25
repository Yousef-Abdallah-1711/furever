# Stops the web dev container and the local Supabase stack. Data volumes are kept —
# use stack-reset.ps1 to also discard them.
# Usage: pnpm stack:down  (or: powershell -ExecutionPolicy Bypass -File scripts/stack-down.ps1)

$ErrorActionPreference = "Stop"

Write-Host "==> Stopping web (dev profile)..."
docker compose --profile dev down

Write-Host "==> Stopping local Supabase..."
pnpm --filter backend exec supabase stop

Write-Host "Stack is down."
