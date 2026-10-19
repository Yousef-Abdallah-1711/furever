import assert from "node:assert/strict";
import { mergeDraftKeys, mergeScreenDictionaries } from "./extract-i18n.ts";

const existing = {
  common: { appName: "FurEver" },
  screens: {
    app: { testKey: "Hand-added value", oldGeneratedKey: "Keep existing copy" },
    profile: { name: "Name" },
  },
};
const firstRun = mergeScreenDictionaries(existing, {
  app: { generatedKey: "Generated value" },
});
const result = mergeScreenDictionaries(firstRun, {
  app: { generatedKey: "Regenerated value" },
});
assert.deepEqual(result, {
  common: { appName: "FurEver" },
  screens: {
    app: {
      testKey: "Hand-added value",
      oldGeneratedKey: "Keep existing copy",
      generatedKey: "Regenerated value",
    },
    profile: { name: "Name" },
  },
});
assert.deepEqual(
  mergeDraftKeys(["screens.app.testKey"], ["screens.app.generatedKey"]),
  ["screens.app.generatedKey", "screens.app.testKey"],
);
process.stdout.write(
  "Hand-added screen keys and draft entries survive extractor merges\n",
);
