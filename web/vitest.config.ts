const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    include: ["**/*.test.ts"],
    exclude: [".next/**", "dist/**", "node_modules/**"],
  },
});
