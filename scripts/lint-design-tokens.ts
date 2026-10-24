/**
 * Mirrors the raw-hex/raw-px selectors in design/system/_adherence.oxlintrc.json.
 * Keep the copied adherence config as the source rule reference; this small scanner
 * applies those two rules to app TSX because the design kit's OXlint config is not
 * directly executable against this monorepo's React Native and Next.js sources.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const targets = process.argv.slice(2);
const scanRoots = targets.length ? targets : ['mobile/app', 'mobile/src', 'web/src'];
const extensions = new Set(['.tsx', '.jsx', '.ts', '.js']);
const violations: string[] = [];

function walk(path: string): void {
  let stat;
  try { stat = statSync(path); } catch { return; }
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue;
      walk(join(path, entry));
    }
    return;
  }
  if (!extensions.has(path.slice(path.lastIndexOf('.')))) return;
  const source = readFileSync(path, 'utf8');
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/(?:['"`])\s*#[\da-f]{3,8}\b/i.test(line)) {
      violations.push(`${path}:${index + 1}: raw hex color; use a design token`);
    }
    if (/(?:['"`])[^'"`]*\b\d+(?:\.\d+)?px\b[^'"`]*(?:['"`])|\b\d+(?:\.\d+)?px\b/i.test(line)) {
      violations.push(`${path}:${index + 1}: raw px value; use a design token`);
    }
  });
}

for (const target of scanRoots) walk(resolve(root, target));
if (violations.length) {
  process.stdout.write(`${violations.join('\n')}\n${violations.length} design-token violation(s)\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`0 design-token violations across ${scanRoots.join(', ')}\n`);
}
