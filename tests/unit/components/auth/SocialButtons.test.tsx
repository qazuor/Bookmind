/**
 * SocialButtons Component Tests
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocialButtons } from "@/components/auth/SocialButtons";

// Mock the useAuth hook
const mockSignInWithGoogle = vi.fn();
const mockSignInWithGithub = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    signInWithGoogle: mockSignInWithGoogle,
    signInWithGithub: mockSignInWithGithub,
  }),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("SocialButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render Google and GitHub buttons", () => {
      renderWithRouter(<SocialButtons mode="signin" />);

      expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign in with GitHub/i)).toBeInTheDocument();
    });

    it("should show 'Sign up with' text when mode is signup", () => {
      renderWithRouter(<SocialButtons mode="signup" />);

      expect(screen.getByText(/Sign up with Google/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign up with GitHub/i)).toBeInTheDocument();
    });

    it("should disable buttons when disabled prop is true", () => {
      renderWithRouter(<SocialButtons mode="signin" disabled />);

      const googleButton = screen
        .getByText(/Sign in with Google/i)
        .closest("button");
      const githubButton = screen
        .getByText(/Sign in with GitHub/i)
        .closest("button");

      expect(googleButton).toBeDisabled();
      expect(githubButton).toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("should call signInWithGoogle when Google button is clicked", async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SocialButtons mode="signin" callbackURL="/dashboard" />,
      );

      await user.click(screen.getByText(/Sign in with Google/i));

      expect(mockSignInWithGoogle).toHaveBeenCalledWith("/dashboard");
    });

    it("should call signInWithGithub when GitHub button is clicked", async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SocialButtons mode="signin" callbackURL="/dashboard" />,
      );

      await user.click(screen.getByText(/Sign in with GitHub/i));

      expect(mockSignInWithGithub).toHaveBeenCalledWith("/dashboard");
    });

    it("should use default callbackURL when not provided", async () => {
      const user = userEvent.setup();
      renderWithRouter(<SocialButtons mode="signin" />);

      await user.click(screen.getByText(/Sign in with Google/i));

      expect(mockSignInWithGoogle).toHaveBeenCalledWith("/dashboard");
    });
  });
});
