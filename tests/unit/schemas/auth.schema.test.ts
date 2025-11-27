import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/schemas/auth.schema";

describe("Auth Schemas", () => {
  describe("loginSchema", () => {
    it("should validate valid login input", () => {
      const validInput = {
        email: "test@example.com",
        password: "password123",
      };
      const result = loginSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should require email", () => {
      const invalidInput = {
        password: "password123",
      };
      const result = loginSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should require password", () => {
      const invalidInput = {
        email: "test@example.com",
      };
      const result = loginSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should default rememberMe to false", () => {
      const input = {
        email: "test@example.com",
        password: "password123",
      };
      const result = loginSchema.parse(input);
      expect(result.rememberMe).toBe(false);
    });
  });

  describe("signupSchema", () => {
    it("should validate valid signup input", () => {
      const validInput = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        acceptTerms: true,
      };
      const result = signupSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should require passwords to match", () => {
      const invalidInput = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "DifferentPassword123",
        acceptTerms: true,
      };
      const result = signupSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("confirmPassword");
      }
    });

    it("should require accepting terms", () => {
      const invalidInput = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        acceptTerms: false,
      };
      const result = signupSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should detect bot via honeypot field", () => {
      const botInput = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        acceptTerms: true,
        website: "http://spam.com", // honeypot filled = bot
      };
      const result = signupSchema.safeParse(botInput);
      expect(result.success).toBe(false);
    });

    it("should allow empty honeypot field", () => {
      const validInput = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        acceptTerms: true,
        website: "", // empty is fine
      };
      const result = signupSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should enforce password complexity", () => {
      const weakPasswords = [
        "password", // no uppercase, no number
        "PASSWORD123", // no lowercase
        "Password", // no number
        "Pass1", // too short
      ];

      for (const password of weakPasswords) {
        const input = {
          email: "test@example.com",
          password,
          confirmPassword: password,
          acceptTerms: true,
        };
        const result = signupSchema.safeParse(input);
        expect(result.success).toBe(false);
      }
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should validate email", () => {
      const validInput = { email: "test@example.com" };
      const result = forgotPasswordSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidInput = { email: "not-an-email" };
      const result = forgotPasswordSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("should validate reset password input", () => {
      const validInput = {
        token: "some-reset-token",
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      };
      const result = resetPasswordSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should require token", () => {
      const invalidInput = {
        token: "",
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      };
      const result = resetPasswordSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should require passwords to match", () => {
      const invalidInput = {
        token: "some-token",
        password: "NewPassword123",
        confirmPassword: "DifferentPassword123",
      };
      const result = resetPasswordSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("changePasswordSchema", () => {
    it("should validate change password input", () => {
      const validInput = {
        currentPassword: "OldPassword123",
        newPassword: "NewPassword456",
        confirmPassword: "NewPassword456",
      };
      const result = changePasswordSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should require new password to be different from current", () => {
      const invalidInput = {
        currentPassword: "SamePassword123",
        newPassword: "SamePassword123",
        confirmPassword: "SamePassword123",
      };
      const result = changePasswordSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
