/**
 * Bookmarks E2E Tests (P10-010)
 *
 * Tests for bookmark CRUD operations through the UI.
 * Note: These tests require authentication setup.
 */

import { expect, test } from "@playwright/test";

test.describe("Bookmarks", () => {
  // Skip auth-dependent tests for now - they would need a test user
  test.describe("Add Bookmark Flow", () => {
    test.skip("should display add bookmark dialog", async ({ page }) => {
      // This test requires authentication
      await page.goto("/dashboard");

      // Click add bookmark button
      await page.getByRole("button", { name: /add|new|create/i }).click();

      // Should show dialog
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByLabel(/url/i)).toBeVisible();
    });

    test.skip("should validate URL field", async ({ page }) => {
      await page.goto("/dashboard");

      // Open add dialog
      await page.getByRole("button", { name: /add|new/i }).click();

      // Submit without URL
      await page.getByRole("button", { name: /save|add/i }).click();

      // Should show validation error
      await expect(page.getByText(/url.*required|required/i)).toBeVisible();
    });

    test.skip("should validate invalid URL format", async ({ page }) => {
      await page.goto("/dashboard");

      // Open add dialog
      await page.getByRole("button", { name: /add|new/i }).click();

      // Enter invalid URL
      await page.getByLabel(/url/i).fill("not-a-valid-url");
      await page.getByRole("button", { name: /save|add/i }).click();

      // Should show format error
      await expect(page.getByText(/invalid.*url|valid.*url/i)).toBeVisible();
    });
  });

  test.describe("Bookmark List", () => {
    test.skip("should display empty state when no bookmarks", async ({
      page,
    }) => {
      await page.goto("/dashboard");

      // Should show empty state
      await expect(
        page.getByText(/no bookmarks|empty|get started/i),
      ).toBeVisible();
    });

    test.skip("should display bookmark cards", async ({ page }) => {
      await page.goto("/dashboard");

      // Should display bookmark cards or empty state
      const hasBookmarks = (await page.getByRole("article").count()) > 0;
      const hasEmptyState = await page
        .getByText(/no bookmarks|empty/i)
        .isVisible();

      expect(hasBookmarks || hasEmptyState).toBeTruthy();
    });
  });

  test.describe("Bookmark Actions", () => {
    test.skip("should open bookmark menu", async ({ page }) => {
      await page.goto("/dashboard");

      // Click on first bookmark's menu button
      const menuButton = page
        .getByRole("button", { name: /more|menu|options/i })
        .first();

      if (await menuButton.isVisible()) {
        await menuButton.click();

        // Should show dropdown menu
        await expect(page.getByRole("menu")).toBeVisible();
      }
    });

    test.skip("should show edit option in menu", async ({ page }) => {
      await page.goto("/dashboard");

      const menuButton = page
        .getByRole("button", { name: /more|menu|options/i })
        .first();

      if (await menuButton.isVisible()) {
        await menuButton.click();

        // Should show edit option
        await expect(
          page.getByRole("menuitem", { name: /edit/i }),
        ).toBeVisible();
      }
    });

    test.skip("should show delete option in menu", async ({ page }) => {
      await page.goto("/dashboard");

      const menuButton = page
        .getByRole("button", { name: /more|menu|options/i })
        .first();

      if (await menuButton.isVisible()) {
        await menuButton.click();

        // Should show delete option
        await expect(
          page.getByRole("menuitem", { name: /delete/i }),
        ).toBeVisible();
      }
    });
  });

  test.describe("Bookmark Details", () => {
    test.skip("should navigate to bookmark details page", async ({ page }) => {
      await page.goto("/dashboard");

      // Click on first bookmark
      const bookmarkLink = page
        .getByRole("link")
        .filter({ hasText: /https?:\/\// })
        .first();

      if (await bookmarkLink.isVisible()) {
        await bookmarkLink.click();

        // Should navigate to details page
        await expect(page).toHaveURL(/bookmarks\/[a-z0-9-]+/i);
      }
    });
  });

  test.describe("Public Landing Page", () => {
    test("should display landing page for unauthenticated users", async ({
      page,
    }) => {
      await page.goto("/");

      // Should show landing page elements
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    test("should have call-to-action buttons", async ({ page }) => {
      await page.goto("/");

      // Should have CTA buttons
      const ctaButton = page.getByRole("link", {
        name: /get started|sign up|try/i,
      });
      await expect(ctaButton).toBeVisible();
    });

    test("should display features section", async ({ page }) => {
      await page.goto("/");

      // Should have features/benefits section
      const featuresSection = page
        .locator("section")
        .filter({ hasText: /feature|benefit|organize|save/i });
      await expect(featuresSection.first()).toBeVisible();
    });
  });
});
