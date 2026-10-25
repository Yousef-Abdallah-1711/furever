# Verifies packages/i18n/en.json and ar.json have exactly matching key sets. Windows
# users may need `-ExecutionPolicy Bypass`; this file stays LF-encoded per
# .gitattributes even though it only runs on Windows.
# Usage: pnpm i18n:check  (or: powershell -ExecutionPolicy Bypass -File scripts/i18n-check.ps1)

$ErrorActionPreference = "Stop"
pnpm exec tsx packages/i18n/scripts/check-parity.ts
exit $LASTEXITCODE
