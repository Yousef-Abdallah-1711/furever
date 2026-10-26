import { expect, test } from "@playwright/test";

test("force-update explains the required version and store update path", async ({
  page,
}) => {
  await page.goto("/force-update");
  await expect(page.getByText("Update required")).toBeVisible();
  await expect(page.getByText(/Update FurEver from your device/)).toBeVisible();
});

test("maintenance shows the localized fallback when public configuration is unavailable", async ({
  page,
}) => {
  await page.goto("/maintenance");
  await expect(page.getByText("FurEver is under maintenance")).toBeVisible();
  await expect(page.getByText("Please try again later.")).toBeVisible();
});

test("maintenance uses the saved Arabic locale", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("furever.locale", "ar"));
  await page.goto("/maintenance");
  await expect(
    page.getByText(
      "FurEver \u0642\u064a\u062f \u0627\u0644\u0635\u064a\u0627\u0646\u0629",
    ),
  ).toBeVisible();
});
