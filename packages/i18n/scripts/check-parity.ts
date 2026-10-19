import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function flattenKeys(value: JsonValue, prefix = "", keys = new Set<string>()): Set<string> {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flattenKeys(child, prefix ? `${prefix}.${key}` : key, keys);
    }
  } else if (prefix) {
    keys.add(prefix);
  }

  return keys;
}

async function readDictionary(path: string): Promise<Set<string>> {
  const raw = await readFile(path, "utf8");
  return flattenKeys(JSON.parse(raw) as JsonValue);
}

async function main() {
  const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const argumentsAfterScript = process.argv.slice(2).filter((argument) => argument !== "--");
  const directory = argumentsAfterScript[0] ? resolve(argumentsAfterScript[0]) : packageDirectory;
  const [arabicKeys, englishKeys] = await Promise.all([
    readDictionary(resolve(directory, "ar.json")),
    readDictionary(resolve(directory, "en.json")),
  ]);

  const errors = [
    ...[...arabicKeys].filter((key) => !englishKeys.has(key)).map((key) => `en.json missing key: ${key}`),
    ...[...englishKeys].filter((key) => !arabicKeys.has(key)).map((key) => `ar.json missing key: ${key}`),
  ];

  if (errors.length > 0) {
    process.stderr.write(`${errors.join("\n")}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`Translation keys match (${englishKeys.size}).\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
