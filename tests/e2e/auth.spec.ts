/**
 * Authentication E2E Tests (P10-009)
 *
 * Tests for user authentication flows including sign up, sign in, and sign out.
 */

import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Sign Up Flow", () => {
    test("should display sign up page", async ({ page }) => {
      await page.goto("/signup");

      // Should show sign up form
      await expect(
        page.getByRole("heading", { name: /sign up|create account/i }),
      ).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i).first()).toBeVisible();
    });

    test("should show validation errors for empty fields", async ({ page }) => {
      await page.goto("/signup");

      // Try to submit without filling fields
      await page
        .getByRole("button", { name: /sign up|create account/i })
        .click();

      // Should show validation errors
      await expect(page.getByText(/email is required|required/i)).toBeVisible();
    });

    test("should show error for invalid email format", async ({ page }) => {
      await page.goto("/signup");

      // Fill with invalid email
      await page.getByLabel(/email/i).fill("invalid-email");
      await page
        .getByLabel(/password/i)
        .first()
        .fill("password123");
      await page
        .getByRole("button", { name: /sign up|create account/i })
        .click();

      // Should show email format error
      await expect(page.getByText(/invalid email|valid email/i)).toBeVisible();
    });

    test("should show error for weak password", async ({ page }) => {
      await page.goto("/signup");

      // Fill with weak password
      await page.getByLabel(/email/i).fill("test@example.com");
      await page
        .getByLabel(/password/i)
        .first()
        .fill("123");
      await page
        .getByRole("button", { name: /sign up|create account/i })
        .click();

      // Should show password strength error
      await expect(
        page.getByText(/password.*characters|password.*short/i),
      ).toBeVisible();
    });

    test("should have link to sign in page", async ({ page }) => {
      await page.goto("/signup");

      // Should have link to sign in
      const signInLink = page.getByRole("link", {
        name: /sign in|login|already have/i,
      });
      await expect(signInLink).toBeVisible();
    });
  });

  test.describe("Sign In Flow", () => {
    test("should display sign in page", async ({ page }) => {
      await page.goto("/login");

      // Should show sign in form
      await expect(
        page.getByRole("heading", { name: /sign in|login|welcome/i }),
      ).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });

    test("should show validation errors for empty fields", async ({ page }) => {
      await page.goto("/login");

      // Try to submit without filling fields
      await page.getByRole("button", { name: /sign in|login/i }).click();

      // Should show validation errors
      await expect(page.getByText(/email is required|required/i)).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");

      // Fill with invalid credentials
      await page.getByLabel(/email/i).fill("nonexistent@example.com");
      await page.getByLabel(/password/i).fill("wrongpassword");
      await page.getByRole("button", { name: /sign in|login/i }).click();

      // Should show error message (wait for network request)
      await expect(
        page.getByText(/invalid|incorrect|not found|error/i),
      ).toBeVisible({ timeout: 10000 });
    });

    test("should have link to sign up page", async ({ page }) => {
      await page.goto("/login");

      // Should have link to sign up
      const signUpLink = page.getByRole("link", {
        name: /sign up|create account|register/i,
      });
      await expect(signUpLink).toBeVisible();
    });

    test("should have forgot password link", async ({ page }) => {
      await page.goto("/login");

      // Should have forgot password link
      const forgotLink = page.getByRole("link", { name: /forgot|reset/i });
      await expect(forgotLink).toBeVisible();
    });
  });

  test.describe("Password Reset Flow", () => {
    test("should display password reset page", async ({ page }) => {
      await page.goto("/forgot-password");

      // Should show password reset form
      await expect(
        page.getByRole("heading", { name: /reset|forgot|password/i }),
      ).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
    });

    test("should show validation error for invalid email", async ({ page }) => {
      await page.goto("/forgot-password");

      // Submit with invalid email
      await page.getByLabel(/email/i).fill("invalid");
      await page.getByRole("button", { name: /reset|send|submit/i }).click();

      // Should show error
      await expect(page.getByText(/invalid|valid email/i)).toBeVisible();
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect to login when accessing dashboard without auth", async ({
      page,
    }) => {
      await page.goto("/dashboard");

      // Should redirect to login page
      await expect(page).toHaveURL(/login|signin/);
    });

    test("should redirect to login when accessing bookmarks without auth", async ({
      page,
    }) => {
      await page.goto("/bookmarks");

      // Should redirect to login page
      await expect(page).toHaveURL(/login|signin/);
    });
  });
});
