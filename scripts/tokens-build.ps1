# Regenerates packages/design-tokens/dist/{variables.css,tailwind-preset.js} from the
# design kit's token source. Windows users may need `-ExecutionPolicy Bypass`; this file
# stays LF-encoded per .gitattributes even though it only runs on Windows.
# Usage: pnpm tokens:build  (or: powershell -ExecutionPolicy Bypass -File scripts/tokens-build.ps1)

$ErrorActionPreference = "Stop"
pnpm exec tsx packages/design-tokens/scripts/build.ts
exit $LASTEXITCODE
