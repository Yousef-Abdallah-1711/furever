const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    include: ["**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
  },
});
