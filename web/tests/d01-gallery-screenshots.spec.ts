import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDir = resolve(process.cwd(), '../design/screenshots/d01-gallery');

test('capture web component gallery in both locales and themes', async ({ page }) => {
  await mkdir(outputDir, { recursive: true });

  for (const locale of ['en', 'ar'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      await page.goto(`/${locale}/_dev/gallery`);
      await expect(page.getByText('Shared component gallery')).toBeVisible();

      const themeRoot = page.locator('html');
      const currentTheme = await themeRoot.getAttribute('data-theme');
      if (currentTheme !== theme) await page.getByTestId('theme-switch').click();
      await expect(themeRoot).toHaveAttribute('data-theme', theme);

      await page.screenshot({ path: resolve(outputDir, `web-${locale}-${theme}.png`), fullPage: true });
    }
  }
});
