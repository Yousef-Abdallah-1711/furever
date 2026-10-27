import { expect, test } from "@playwright/test";

test("about shows the configured app version", async ({ page }) => {
  await page.goto("/profile/about");
  await expect(page.getByText("FurEver", { exact: true })).toBeVisible();
  await expect(page.getByText("App version")).toBeVisible();
  await expect(page.getByText("1.0.0", { exact: true })).toBeVisible();
});

test("help expands profile and language answers and reports missing support contacts", async ({
  page,
}) => {
  await page.goto("/profile/help");
  await page
    .getByRole("button", { name: "How do I change the app language?" })
    .click();
  await expect(
    page.getByText(
      "Open Profile, then Settings, and choose your preferred language.",
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "How do I update my profile?" })
    .click();
  await expect(
    page.getByText(
      "Open Profile and choose Edit profile to update your name, city, or optional phone number.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("Support contact details are not available yet."),
  ).toBeVisible();
});

test("help and edit profile use Arabic copy when the locale is saved", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("furever.locale", "ar"));
  await page.goto("/profile/help");
  await expect(page.getByText("تواصل مع الدعم", { exact: true })).toBeVisible();
  await page.goto("/profile/edit");
  await expect(page.getByText("الاسم بالكامل")).toBeVisible();
  await expect(page.getByText("رقم الهاتف (اختياري)")).toBeVisible();
});
