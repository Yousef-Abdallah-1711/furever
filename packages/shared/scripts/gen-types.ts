import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const outputPath = resolve(root, "packages/shared/src/database.types.ts");
async function main() {
  const result = spawnSync(
    "pnpm",
    ["--filter", "backend", "exec", "supabase", "gen", "types", "typescript", "--local"],
    {
      cwd: root,
      encoding: "utf8",
      shell: process.platform === "win32",
    },
  );

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, result.stdout, { encoding: "utf8" });
  process.stdout.write(`Generated ${outputPath}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
