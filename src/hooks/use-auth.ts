/**
 * useAuth Hook
 *
 * Provides authentication state and methods for components.
 * Wraps Better Auth's useSession with additional convenience methods.
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  authClient,
  signIn,
  signOut,
  signUp,
  useSession,
} from "@/lib/auth-client";

interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

interface SignInParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface ForgotPasswordParams {
  email: string;
}

interface ResetPasswordParams {
  token: string;
  newPassword: string;
}

// Extract session data type from useSession
type SessionData = ReturnType<typeof useSession>["data"];
type UserData = NonNullable<SessionData>["user"];
type SessionInfo = NonNullable<SessionData>["session"];

interface UseAuthReturn {
  // Session state
  user: UserData | null;
  session: SessionInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth methods
  signInWithEmail: (params: SignInParams) => Promise<{ error?: Error }>;
  signUpWithEmail: (params: SignUpParams) => Promise<{ error?: Error }>;
  signInWithGoogle: (callbackURL?: string) => Promise<void>;
  signInWithGithub: (callbackURL?: string) => Promise<void>;
  logout: (redirectTo?: string) => Promise<void>;

  // Password reset
  requestPasswordReset: (
    params: ForgotPasswordParams,
  ) => Promise<{ error?: Error }>;
  confirmPasswordReset: (
    params: ResetPasswordParams,
  ) => Promise<{ error?: Error }>;

  // Utilities
  refetch: () => void;
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const { data, isPending, refetch } = useSession();

  const isAuthenticated = !!data?.user;
  const user = data?.user ?? null;
  const session = data?.session ?? null;

  /**
   * Sign in with email and password
   */
  const signInWithEmail = useCallback(async (params: SignInParams) => {
    try {
      const { error } = await signIn.email({
        email: params.email,
        password: params.password,
        rememberMe: params.rememberMe ?? false,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return {};
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error("Sign in failed"),
      };
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signUpWithEmail = useCallback(async (params: SignUpParams) => {
    try {
      const { error } = await signUp.email({
        email: params.email,
        password: params.password,
        name: params.name,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return {};
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error("Sign up failed"),
      };
    }
  }, []);

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = useCallback(async (callbackURL = "/dashboard") => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL,
      errorCallbackURL: "/login?error=google",
    });
  }, []);

  /**
   * Sign in with GitHub OAuth
   */
  const signInWithGithub = useCallback(async (callbackURL = "/dashboard") => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL,
      errorCallbackURL: "/login?error=github",
    });
  }, []);

  /**
   * Sign out and optionally redirect
   */
  const logout = useCallback(
    async (redirectTo = "/") => {
      await signOut();
      navigate(redirectTo);
    },
    [navigate],
  );

  /**
   * Request password reset email
   */
  const requestPasswordReset = useCallback(
    async (params: ForgotPasswordParams) => {
      try {
        // Use type assertion as Better Auth types may not be fully exposed
        const client = authClient as unknown as {
          forgetPassword: (opts: {
            email: string;
            redirectTo: string;
          }) => Promise<{ error?: { message: string } }>;
        };

        const { error } = await client.forgetPassword({
          email: params.email,
          redirectTo: "/reset-password",
        });

        if (error) {
          return { error: new Error(error.message) };
        }

        return {};
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err
              : new Error("Password reset request failed"),
        };
      }
    },
    [],
  );

  /**
   * Confirm password reset with token
   */
  const confirmPasswordReset = useCallback(
    async (params: ResetPasswordParams) => {
      try {
        // Use type assertion as Better Auth types may not be fully exposed
        const client = authClient as unknown as {
          resetPassword: (opts: {
            token: string;
            newPassword: string;
          }) => Promise<{ error?: { message: string } }>;
        };

        const { error } = await client.resetPassword({
          token: params.token,
          newPassword: params.newPassword,
        });

        if (error) {
          return { error: new Error(error.message) };
        }

        return {};
      } catch (err) {
        return {
          error:
            err instanceof Error ? err : new Error("Password reset failed"),
        };
      }
    },
    [],
  );

  return {
    user,
    session,
    isLoading: isPending,
    isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGithub,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    refetch,
  };
}
