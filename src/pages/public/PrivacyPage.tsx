/**
 * Privacy Policy Page (P7-002)
 *
 * Legal privacy policy content.
 */

import { BookOpen, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function PrivacyPage() {
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
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-8 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              1. Information We Collect
            </h2>
            <p className="mt-2">
              We collect information you provide directly to us, such as when
              you create an account, save bookmarks, or contact us for support.
              This may include:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Bookmark URLs, titles, and notes</li>
              <li>Tags, categories, and collections you create</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. How We Use Your Information
            </h2>
            <p className="mt-2">We use the information we collect to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Generate AI-powered summaries and suggestions</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. AI Processing
            </h2>
            <p className="mt-2">
              BookMind uses artificial intelligence to analyze your bookmarks
              and provide features like automatic summaries, tag suggestions,
              and semantic search. Your bookmark content may be processed by
              third-party AI services to provide these features. We do not use
              your personal data to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. Data Sharing
            </h2>
            <p className="mt-2">
              We do not sell your personal information. We may share your
              information only in the following circumstances:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>With your consent</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. Data Security
            </h2>
            <p className="mt-2">
              We implement appropriate technical and organizational measures to
              protect your personal information. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. Your Rights
            </h2>
            <p className="mt-2">You have the right to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your bookmarks</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. Cookies
            </h2>
            <p className="mt-2">
              We use cookies and similar technologies to maintain your session,
              remember your preferences, and analyze how you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              8. Changes to This Policy
            </h2>
            <p className="mt-2">
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              9. Contact Us
            </h2>
            <p className="mt-2">
              If you have questions about this privacy policy, please contact us
              at privacy@bookmind.app.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
