import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "d02-invitation-acceptance.authenticated.spec.ts",
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3010",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3010",
    url: "http://localhost:3010/en/login",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
