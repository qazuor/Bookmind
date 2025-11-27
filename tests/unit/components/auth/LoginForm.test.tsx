/**
 * LoginForm Component Tests
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/auth/LoginForm";

// Mock the useAuth hook
const mockSignInWithEmail = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockSignInWithGithub = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    signInWithEmail: mockSignInWithEmail,
    signInWithGoogle: mockSignInWithGoogle,
    signInWithGithub: mockSignInWithGithub,
  }),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithEmail.mockResolvedValue({});
  });

  describe("rendering", () => {
    it("should render the login form", () => {
      renderWithRouter(<LoginForm />);

      expect(screen.getByText("Welcome back")).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in$/i }),
      ).toBeInTheDocument();
    });

    it("should render social login buttons", () => {
      renderWithRouter(<LoginForm />);

      expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign in with GitHub/i)).toBeInTheDocument();
    });

    it("should render forgot password link", () => {
      renderWithRouter(<LoginForm />);

      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it("should render sign up link", () => {
      renderWithRouter(<LoginForm />);

      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("should show error for invalid email format", async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "invalid-email");

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it("should show error when email is cleared", async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "a");
      await user.clear(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it("should show error when password is cleared", async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, "a");
      await user.clear(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe("submission", () => {
    it("should call signInWithEmail on valid form submission", async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/^password$/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
          rememberMe: false,
        });
      });
    });

    it("should display error message on failed login", async () => {
      mockSignInWithEmail.mockResolvedValue({
        error: new Error("Invalid credentials"),
      });

      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/^password$/i), "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it("should toggle remember me checkbox", async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm />);

      const checkbox = screen.getByLabelText(/remember me/i);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });
});
