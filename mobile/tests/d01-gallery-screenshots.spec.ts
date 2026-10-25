import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDir = resolve(process.cwd(), '../design/screenshots/d01-gallery');

test('capture mobile component gallery in both locales and themes', async ({ page }) => {
  await mkdir(outputDir, { recursive: true });
  await page.goto('/_dev/gallery');
  await expect(page.getByText('Mobile component gallery')).toBeVisible();

  for (const locale of ['en', 'ar'] as const) {
    const localeSwitch = page.getByTestId('locale-switch');
    const currentLocale = (await localeSwitch.textContent())?.includes('Switch to Arabic') ? 'en' : 'ar';
    if (currentLocale !== locale) await localeSwitch.click();
    await expect(localeSwitch).toContainText(locale === 'en' ? 'Switch to Arabic' : 'Switch to English');
    await expect(page.getByText('Mobile component gallery')).toBeVisible();

    for (const theme of ['light', 'dark'] as const) {
      const themeRoot = page.locator('[data-theme]').first();
      const currentTheme = await themeRoot.getAttribute('data-theme');
      if (currentTheme !== theme) await page.getByTestId('theme-switch').click();
      await expect(themeRoot).toHaveAttribute('data-theme', theme);

      await page.screenshot({ path: resolve(outputDir, `mobile-${locale}-${theme}.png`), fullPage: true });
    }
  }
});
