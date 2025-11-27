/**
 * SignupPage
 *
 * Public page for user registration.
 */

import { Link } from "react-router-dom";
import { GuestGuard } from "@/components/AuthGuard";
import { SignupForm } from "@/components/auth";

export function SignupPage() {
  return (
    <GuestGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
        <div className="mb-8 flex flex-col items-center">
          <Link to="/" className="mb-2 text-2xl font-bold">
            BookMind
          </Link>
          <p className="text-muted-foreground">
            AI-enhanced bookmark management
          </p>
        </div>
        <SignupForm />
      </div>
    </GuestGuard>
  );
}
