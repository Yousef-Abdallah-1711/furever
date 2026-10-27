$ErrorActionPreference = "Continue"
$statusLines = & pnpm.cmd exec supabase status -o env 2>$null
if ($LASTEXITCODE -ne 0) { throw "Local Supabase is unavailable." }
$envLines = $statusLines | Where-Object { $_ -match "^[A-Z0-9_]+=.*$" }
$settings = ConvertFrom-StringData ($envLines -join "`n")
$env:NEXT_PUBLIC_SUPABASE_URL = $settings["API_URL"].Trim('"')
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = $settings["ANON_KEY"].Trim('"')
if (-not $env:NEXT_PUBLIC_SUPABASE_URL -or -not $env:NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw "Local public Supabase settings are unavailable."
}

& pnpm.cmd --filter web exec playwright test `
  --config playwright.authenticated.config.ts `
  tests/d02-invitation-acceptance.authenticated.spec.ts
exit $LASTEXITCODE
