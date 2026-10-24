import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  timeout: 30_000,
  use: { baseURL: 'http://localhost:4310' },
  webServer: {
    command: 'node tests/serve-static.cjs dist 4310',
    url: 'http://localhost:4310/_dev/hello',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
