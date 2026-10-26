/**
 * Run with `pnpm exec tsx backend/supabase/scripts/check-policy-coverage.ts`.
 * Set DATABASE_URL, PGSERVICE, or standard libpq PGHOST/PGPORT/PGDATABASE/PGUSER/
 * PGPASSWORD variables. For local Supabase without host-installed psql, set
 * SUPABASE_DB_CONTAINER (usually `supabase_db_backend`). `PSQL_BIN` selects psql.
 */
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface Policy {
  schema: string;
  table: string;
  name: string;
}

const testDirectory = resolve(__dirname, "../tests");

export function parsePolicies(output: string): Policy[] {
  return output
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line, index) => {
      const fields = line.split("\t");
      if (fields.length !== 3 || fields.some((field) => field.length === 0)) {
        throw new Error(
          `Could not parse psql policy row ${index + 1}: ${JSON.stringify(line)}`,
        );
      }
      const [schema, table, name] = fields;
      return { schema, table, name };
    });
}

function mentionsIdentifier(source: string, identifier: string): boolean {
  const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\w$])${escaped}([^\\w$]|$)`, "i").test(source);
}

export function findMissingReferences(
  policies: Policy[],
  testSources: string[],
): Policy[] {
  const combinedTests = testSources.join("\n");
  return policies.filter(
    ({ table, name }) =>
      !mentionsIdentifier(combinedTests, name) &&
      !mentionsIdentifier(combinedTests, table),
  );
}

function readPgTapTests(directory: string): string[] {
  return readdirSync(directory)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => readFileSync(resolve(directory, file), "utf8"));
}

function loadPolicies(): Policy[] {
  const sql = [
    "SELECT schemaname, tablename, policyname",
    "FROM pg_catalog.pg_policies",
    "WHERE schemaname = 'public'",
    "ORDER BY schemaname, tablename, policyname;",
  ].join(" ");
  const container = process.env.SUPABASE_DB_CONTAINER;
  const psqlArguments = [
    "--no-psqlrc",
    "--tuples-only",
    "--no-align",
    "--field-separator",
    "\t",
    "--command",
    sql,
  ];
  const result = spawnSync(
    container ? "docker" : process.env.PSQL_BIN || "psql",
    container
      ? [
          "exec",
          container,
          "psql",
          "-U",
          "postgres",
          "-d",
          "postgres",
          ...psqlArguments,
        ]
      : psqlArguments,
    {
      encoding: "utf8",
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  if (result.error) {
    throw new Error(`Could not start psql: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `psql failed (exit ${result.status ?? "unknown"}): ${result.stderr.trim()}`,
    );
  }
  return parsePolicies(result.stdout);
}

export function checkPolicyCoverage(
  policies: Policy[],
  testSources: string[],
): boolean {
  console.log(`Public application policies (${policies.length}):`);
  policies.forEach(({ schema, table, name }, index) => {
    console.log(`  ${index + 1}. ${schema}.${table}.${name}`);
  });

  const missing = findMissingReferences(policies, testSources);
  if (missing.length > 0) {
    console.error(
      "\nPolicies without a matching reference in backend/supabase/tests/*.sql:",
    );
    missing.forEach(({ schema, table, name }) => {
      console.error(`  - ${schema}.${table}.${name}`);
      console.error(
        `    Add a pgTAP assertion that names policy '${name}' or table '${table}'.`,
      );
    });
    return false;
  }

  console.log("\nAll public policies have a pgTAP test reference.");
  return true;
}

function main(): void {
  if (
    !process.env.DATABASE_URL &&
    !process.env.PGHOST &&
    !process.env.PGSERVICE &&
    !process.env.SUPABASE_DB_CONTAINER
  ) {
    throw new Error(
      "Set DATABASE_URL, PGSERVICE, or libpq connection variables (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD) before running this checker.",
    );
  }

  const policies = loadPolicies();
  const tests = readPgTapTests(testDirectory);
  if (!checkPolicyCoverage(policies, tests)) process.exitCode = 1;
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
