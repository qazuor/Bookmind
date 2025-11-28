/**
 * Landing Page (P7-001)
 *
 * Public landing page with hero, features, and CTA.
 */

import type { LucideIcon } from "lucide-react";
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
import { useI18n } from "@/hooks/use-i18n";

interface Feature {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}

const featureConfigs: Feature[] = [
  {
    icon: Brain,
    titleKey: "landing.features.aiSummaries.title",
    descriptionKey: "landing.features.aiSummaries.description",
  },
  {
    icon: Sparkles,
    titleKey: "landing.features.smartTags.title",
    descriptionKey: "landing.features.smartTags.description",
  },
  {
    icon: Folder,
    titleKey: "landing.features.collections.title",
    descriptionKey: "landing.features.collections.description",
  },
  {
    icon: Tag,
    titleKey: "landing.features.tagging.title",
    descriptionKey: "landing.features.tagging.description",
  },
  {
    icon: Search,
    titleKey: "landing.features.search.title",
    descriptionKey: "landing.features.search.description",
  },
  {
    icon: Share2,
    titleKey: "landing.features.sharing.title",
    descriptionKey: "landing.features.sharing.description",
  },
  {
    icon: Cloud,
    titleKey: "landing.features.cloudSync.title",
    descriptionKey: "landing.features.cloudSync.description",
  },
  {
    icon: BookOpen,
    titleKey: "landing.features.importExport.title",
    descriptionKey: "landing.features.importExport.description",
  },
];

export function LandingPage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">{t("common.appName")}</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">{t("landing.hero.cta")}</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t("landing.hero.title")}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t("landing.hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/signup">
                <Sparkles className="mr-2 h-5 w-5" />
                {t("landing.hero.cta")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              {t("landing.features.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureConfigs.map((feature) => (
              <Card key={feature.titleKey}>
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">{t(feature.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{t(feature.descriptionKey)}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">{t("landing.cta.title")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {t("landing.cta.subtitle")}
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link to="/signup">{t("landing.cta.button")}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold">{t("common.appName")}</span>
          </div>

          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">
              {t("legal.privacy.title")}
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              {t("legal.terms.title")}
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("common.appName")}.{" "}
            {t("landing.footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
