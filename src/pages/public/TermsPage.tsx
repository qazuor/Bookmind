/**
 * Terms of Service Page (P7-003)
 *
 * Legal terms of service content.
 */

import { BookOpen, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">BookMind</span>
          </Link>

          <Button variant="ghost" asChild>
            <Link to="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-8 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2">
              By accessing or using BookMind, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do
              not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. Description of Service
            </h2>
            <p className="mt-2">
              BookMind is an AI-powered bookmark management service that allows
              users to save, organize, and search their bookmarks. Features
              include automatic summarization, tag suggestions, collections, and
              semantic search.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. User Accounts
            </h2>
            <p className="mt-2">
              To use certain features, you must create an account. You are
              responsible for:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Maintaining the confidentiality of your credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us of any unauthorized access</li>
              <li>Providing accurate and complete information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. Acceptable Use
            </h2>
            <p className="mt-2">You agree not to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Use the service for any illegal purpose</li>
              <li>Upload malicious content or malware</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Scrape or collect data without permission</li>
              <li>Impersonate others or misrepresent your identity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. Content Ownership
            </h2>
            <p className="mt-2">
              You retain ownership of the bookmarks and content you save to
              BookMind. By using our service, you grant us a license to store,
              process, and display your content as necessary to provide the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. AI Features
            </h2>
            <p className="mt-2">
              Our AI features provide automated summaries, suggestions, and
              search capabilities. While we strive for accuracy, AI-generated
              content may not always be accurate or complete. You should verify
              important information independently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. Service Availability
            </h2>
            <p className="mt-2">
              We strive to maintain high availability but do not guarantee
              uninterrupted access. We may modify, suspend, or discontinue any
              part of the service at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              8. Limitation of Liability
            </h2>
            <p className="mt-2">
              To the maximum extent permitted by law, BookMind shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              9. Termination
            </h2>
            <p className="mt-2">
              We may terminate or suspend your account at any time for violation
              of these terms. You may delete your account at any time through
              your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              10. Changes to Terms
            </h2>
            <p className="mt-2">
              We reserve the right to modify these terms at any time. We will
              notify users of significant changes. Continued use of the service
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              11. Contact
            </h2>
            <p className="mt-2">
              If you have questions about these terms, please contact us at
              legal@bookmind.app.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
