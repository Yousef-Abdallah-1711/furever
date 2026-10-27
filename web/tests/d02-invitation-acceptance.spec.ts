import { expect, test } from "@playwright/test";

test("invitation acceptance fails closed without an authenticated invite session", async ({
  page,
}) => {
  await page.goto("/en/accept-invite");

  await expect(
    page.getByRole("heading", { name: "Accept your invitation" }),
  ).toBeVisible();
  await expect(page.locator("main").getByRole("alert")).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to sign in" })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Confirm password")).toHaveCount(0);
});

test("Arabic invitation acceptance preserves RTL and fails closed without a session", async ({
  page,
}) => {
  await page.goto("/ar/accept-invite");

  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("main").getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Confirm password")).toHaveCount(0);
});
