import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const planPath = resolve(repositoryRoot, "specs/001-furever-platform/plan.md");
const mapPath = resolve(repositoryRoot, "design/screen-map.md");

async function main() {
  const [plan, screenMap] = await Promise.all([
    readFile(planPath, "utf8"),
    readFile(mapPath, "utf8"),
  ]);
  const coverageStart = plan.indexOf("## Coverage Table");
  if (coverageStart < 0)
    throw new Error("Coverage Table is missing from plan.md");
  const coverage = plan.slice(coverageStart);
  const screensHeading = /^### Screens \((\d+)\/(\d+) mapped\)/m.exec(coverage);
  if (!screensHeading) {
    throw new Error("Coverage Table is missing its Screens (mapped) total");
  }
  const expected = Number(screensHeading[2]);
  const rows = screenMap
    .split(/\r?\n/)
    .filter((line) => /^\| `[^`]+` \|/.test(line));
  const ids = rows.map((line) => /^\| `([^`]+)` \|/.exec(line)?.[1] ?? "");
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) {
    throw new Error(
      `Duplicate screen IDs in screen-map.md: ${[...new Set(duplicateIds)].join(", ")}`,
    );
  }
  if (rows.length !== expected) {
    throw new Error(
      `Screen map has ${rows.length} rows; plan.md Coverage Table lists ${expected}`,
    );
  }
  process.stdout.write(
    `Screen map matches the plan Coverage Table: ${rows.length}/${expected} screens\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
