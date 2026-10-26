import { expect, test } from "@playwright/test";

test("splash leads into the language selection screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("FurEver", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Get Started" }).click();
  await expect(page.getByText("Language", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Digital health passport")).toBeVisible();
});

test("onboarding advances through three slides and reaches welcome", async ({
  page,
}) => {
  await page.goto("/onboarding");
  await expect(page.getByText("Digital health passport")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Booking with live queue")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Emergency care")).toBeVisible();
  await page.getByRole("button", { name: "Get Started" }).click();
  await expect(page.getByText("Welcome to FurEver!")).toBeVisible();
});

test("welcome offers Google and email sign-in without an Apple button on web", async ({
  page,
}) => {
  await page.goto("/welcome");
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with email" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Apple" })).toHaveCount(0);
});
