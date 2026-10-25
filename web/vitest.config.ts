import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    exclude: [".next/**", "dist/**", "node_modules/**"],
  },
});
