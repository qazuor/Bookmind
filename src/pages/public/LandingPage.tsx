/**
 * Landing Page (P7-001)
 *
 * Public landing page with hero, features, and CTA.
 */

import {
  BookOpen,
  Brain,
  Cloud,
  Folder,
  Search,
  Share2,
  Sparkles,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Summaries",
    description:
      "Automatically generate intelligent summaries for your bookmarks using advanced AI technology.",
  },
  {
    icon: Sparkles,
    title: "Smart Tag Suggestions",
    description:
      "Get AI-suggested tags based on content analysis to keep your bookmarks organized.",
  },
  {
    icon: Folder,
    title: "Collections & Categories",
    description:
      "Organize bookmarks into nested collections and categories for easy navigation.",
  },
  {
    icon: Tag,
    title: "Powerful Tagging",
    description:
      "Use tags to cross-reference and find bookmarks quickly across your library.",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "Find bookmarks using natural language queries powered by AI understanding.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description:
      "Share individual bookmarks or entire collections with customizable privacy.",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description:
      "Access your bookmarks from anywhere with secure cloud synchronization.",
  },
  {
    icon: BookOpen,
    title: "Import & Export",
    description:
      "Import from browsers and export to HTML, JSON, or CSV formats.",
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">BookMind</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your Bookmarks,{" "}
            <span className="text-primary">Supercharged with AI</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            BookMind is an intelligent bookmark manager that uses AI to
            automatically summarize, categorize, and organize your saved links.
            Never lose a bookmark again.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/signup">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              Everything You Need to Manage Bookmarks
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Powerful features to help you save, organize, and find your
              bookmarks effortlessly.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join thousands of users who are already using BookMind to manage
            their bookmarks smarter.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link to="/signup">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold">BookMind</span>
          </div>

          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BookMind. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
