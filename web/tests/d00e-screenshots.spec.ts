import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDir = resolve(process.cwd(), '../design/screenshots/d00e-baseline');

test('locale toggle changes rendered text', async ({ page }) => {
  await page.goto('/en/login');
  await expect(page.getByText('A token-styled shell is ready.')).toBeVisible();
  await page.getByTestId('locale-switch').click();
  await expect(page).toHaveURL(/\/ar\/login$/);
  await expect(page.getByText('واجهة بتصميم النظام جاهزة.')).toBeVisible();
});

test('capture web shell in both locales and themes with token color proof', async ({ page }) => {
  await mkdir(outputDir, { recursive: true });
  for (const locale of ['en', 'ar']) {
    for (const theme of ['light', 'dark']) {
      await page.goto(`/${locale}/login`);
      const currentTheme = await page.locator('html').getAttribute('data-theme');
      if (currentTheme !== theme) await page.getByTestId('theme-switch').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const expected = theme === 'light' ? 'rgb(169, 96, 98)' : 'rgb(208, 138, 140)';
      const actual = await page.getByTestId('token-swatch').evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(actual).toBe(expected);
      await page.screenshot({ path: resolve(outputDir, `web-${locale}-${theme}.png`), fullPage: true });
    }
  }
});
