# Builds web/Dockerfile's production "runner" target, runs it once, and confirms its
# HEALTHCHECK reports "healthy" before exiting. Requires Docker Desktop running.
# Usage: pnpm build:prod-web  (or: powershell -ExecutionPolicy Bypass -File scripts/build-prod-web.ps1)

$ErrorActionPreference = "Stop"
$image = "furever-web:prod-check"
$container = "furever-web-prod-check"
$port = 3100

Write-Host "==> Building the production runner image..."
docker build -f web/Dockerfile --target runner -t $image .
if ($LASTEXITCODE -ne 0) { throw "docker build failed (exit $LASTEXITCODE)" }

docker rm -f $container 2>$null | Out-Null

Write-Host "==> Running it on port $port..."
docker run -d --name $container -p "${port}:3000" $image
if ($LASTEXITCODE -ne 0) { throw "docker run failed (exit $LASTEXITCODE)" }

try {
  Write-Host "==> Waiting for the HEALTHCHECK to report healthy..."
  $deadline = (Get-Date).AddSeconds(60)
  $status = ""
  do {
    Start-Sleep -Seconds 2
    $status = docker inspect --format='{{.State.Health.Status}}' $container 2>$null
  } while ($status -ne "healthy" -and $status -ne "unhealthy" -and (Get-Date) -lt $deadline)

  if ($status -ne "healthy") {
    docker logs $container
    throw "production image did not become healthy within 60s (last status: '$status')"
  }

  Write-Host "Production web image is healthy (http://localhost:$port)."
} finally {
  docker rm -f $container | Out-Null
}
