import assert from "node:assert/strict";
import {
  findMissingReferences,
  parsePolicies,
} from "./check-policy-coverage.js";

const parsed = parsePolicies(
  "public\tprofiles\tprofiles_select_self_or_admin\npublic\tcities\tcities_select_all\n",
);
assert.deepEqual(parsed, [
  {
    schema: "public",
    table: "profiles",
    name: "profiles_select_self_or_admin",
  },
  { schema: "public", table: "cities", name: "cities_select_all" },
]);

assert.throws(
  () => parsePolicies("public\tprofiles\n"),
  /Could not parse psql policy row 1/,
);

const missing = findMissingReferences(parsed, [
  "SELECT count(*) FROM public.profiles; -- test reference: cities_select_all",
]);
assert.deepEqual(missing, []);

const unreferenced = findMissingReferences(parsed, [
  "SELECT count(*) FROM public.profiles;",
]);
assert.deepEqual(unreferenced, [parsed[1]]);

console.log("check-policy-coverage parser and matcher tests passed");
