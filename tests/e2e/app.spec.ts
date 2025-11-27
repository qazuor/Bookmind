import { expect, test } from "@playwright/test";

test.describe("App", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BookMind/);
  });

  test("should display the main heading", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });
});
