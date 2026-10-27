import { expect, test } from "@playwright/test";

async function expectSignedOutWelcome(page: import("@playwright/test").Page) {
  await expect(
    page.getByRole("heading", { name: "Welcome to FurEver!" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with email" })).toBeVisible();
}

test("signed-out direct about route returns to welcome", async ({ page }) => {
  await page.goto("/profile/about");
  await expectSignedOutWelcome(page);
});

test("signed-out direct help and edit routes return to welcome", async ({ page }) => {
  await page.goto("/profile/help");
  await expectSignedOutWelcome(page);
  await page.goto("/profile/edit");
  await expectSignedOutWelcome(page);
});

test("signed-out Arabic profile route returns to localized welcome", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("furever.locale", "ar"));
  await page.goto("/profile/help");
  await expect(
    page.getByRole("heading", {
      name: "\u0623\u0647\u0644\u0627\u064b \u0628\u064a\u0643 \u0641\u064a \u0641\u064a\u0631\u0627\u064a\u0641\u0631!",
    }),
  ).toBeVisible();
});
