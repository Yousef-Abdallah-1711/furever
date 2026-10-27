import { expect, test } from "@playwright/test";

test("dashboard login renders email and password fields", async ({ page }) => {
  await page.goto("/en/login");
  await expect(
    page.getByRole("heading", { name: "Sign in to the dashboard" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeDisabled();
});

test("dashboard login is localized in Arabic", async ({ page }) => {
  await page.goto("/ar/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(
    page.getByRole("heading", {
      name: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0625\u0644\u0649 \u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645",
    }),
  ).toBeVisible();
});

test("MFA route returns signed-out users to dashboard login", async ({
  page,
}) => {
  await page.goto("/en/mfa");
  await expect(page).toHaveURL(/\/en\/login$/);
});
