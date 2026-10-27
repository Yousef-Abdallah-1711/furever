import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/d02-invitation-acceptance.authenticated.spec.ts"],
  fullyParallel: false,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3100", ...devices["Desktop Chrome"] },
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/en/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
