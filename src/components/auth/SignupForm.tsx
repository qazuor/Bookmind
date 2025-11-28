/**
 * SignupForm Component
 *
 * Registration form with email/password, validation, and honeypot.
 */

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { SocialButtons } from "./SocialButtons";

interface SignupFormProps {
  onSuccess?: () => void;
}

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export function SignupForm({ onSuccess }: SignupFormProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { signUpWithEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      acceptTerms: false,
      website: "", // Honeypot field
    },
    onSubmit: async ({ value }) => {
      // Check honeypot
      if (value.website && value.website.length > 0) {
        // Bot detected, silently fail
        return;
      }

      // Check terms acceptance
      if (!value.acceptTerms) {
        setError(t("auth.errors.termsRequired"));
        return;
      }

      // Check password match
      if (value.password !== value.confirmPassword) {
        setError(t("auth.errors.passwordMismatch"));
        return;
      }

      setError(null);
      const emailUsername = value.email.split("@")[0] ?? "User";
      const userName = value.name || emailUsername;
      const result = await signUpWithEmail({
        email: value.email,
        password: value.password,
        name: userName,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard", { replace: true });
      }
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {t("auth.signup.title")}
        </CardTitle>
        <CardDescription>{t("auth.signup.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SocialButtons mode="signup" />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("auth.social.continueWith")}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                if (value && value.length < 2) {
                  return t("auth.errors.nameTooShort");
                }
                if (value && value.length > 100) {
                  return t("auth.errors.nameTooLong");
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="name">{t("auth.signup.nameOptional")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return t("auth.errors.emailRequired");
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return t("auth.errors.invalidEmail");
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.signup.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) return t("auth.errors.passwordRequired");
                if (value.length < 8) return t("auth.errors.passwordTooShort");
                if (value.length > 100) return t("auth.errors.passwordTooLong");
                if (!PASSWORD_REGEX.test(value)) {
                  return t("auth.errors.weakPassword");
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.signup.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("auth.signup.passwordHint")}
                </p>
              </div>
            )}
          </form.Field>

          <form.Field
            name="confirmPassword"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) => {
                const password = fieldApi.form.getFieldValue("password");
                if (!value) return t("auth.errors.confirmPasswordRequired");
                if (value !== password)
                  return t("auth.errors.passwordMismatch");
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("auth.signup.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="acceptTerms"
            validators={{
              onChange: ({ value }) => {
                if (!value) return t("auth.errors.termsRequired");
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="acceptTerms" className="text-sm font-normal">
                    {t("auth.signup.acceptTerms")}{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      {t("auth.signup.termsLink")}
                    </Link>{" "}
                    {t("common.and")}{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:underline"
                    >
                      {t("auth.signup.privacyLink")}
                    </Link>
                  </Label>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Honeypot field - hidden from users */}
          <form.Field name="website">
            {(field) => (
              <div className="hidden" aria-hidden="true">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting
                  ? t("auth.signup.submitting")
                  : t("auth.signup.submit")}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground">
          {t("auth.signup.hasAccount")}{" "}
          <Link to="/login" className="text-primary hover:underline">
            {t("auth.signup.loginLink")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
