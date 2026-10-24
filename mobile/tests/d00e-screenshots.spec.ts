import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDir = resolve(process.cwd(), '../design/screenshots/d00e-baseline');
const englishProof = 'A token-styled shell is ready.';

test('capture mobile shell in both locales and themes with token color proof', async ({ page }) => {
  await mkdir(outputDir, { recursive: true });
  await page.goto('/_dev/hello');

  for (const locale of ['en', 'ar'] as const) {
    const isEnglish = await page.getByText(englishProof).isVisible().catch(() => false);
    if ((locale === 'en') !== isEnglish) await page.getByTestId('locale-switch').click();
    if (locale === 'en') await expect(page.getByText(englishProof)).toBeVisible();

    for (const theme of ['light', 'dark'] as const) {
      const themeRoot = page.locator('[data-theme]').first();
      const currentTheme = await themeRoot.getAttribute('data-theme');
      if (currentTheme !== theme) await page.getByTestId('theme-switch').click();
      await expect(themeRoot).toHaveAttribute('data-theme', theme);

      const expected = theme === 'light' ? 'rgb(169, 96, 98)' : 'rgb(208, 138, 140)';
      const actual = await page
        .getByTestId('token-swatch')
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(actual).toBe(expected);

      await page.screenshot({ path: resolve(outputDir, `mobile-${locale}-${theme}.png`), fullPage: true });
    }
  }
});
