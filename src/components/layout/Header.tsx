/**
 * Header Component (P6-002)
 *
 * Main application header with logo, search bar, and user menu.
 * Responsive design with mobile adaptations.
 */

import {
  BookmarkIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/use-i18n";
import { signOut, useSession } from "@/lib/auth-client";
import type { Theme } from "@/stores/ui-store";
import { useUIStore } from "@/stores/ui-store";

/**
 * Get user initials from name or email
 */
function getUserInitials(name?: string | null, email?: string): string {
  if (name) {
    const parts = name.split(" ").filter((p) => p.length > 0);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      const first = parts[0][0] ?? "";
      const second = parts[1][0] ?? "";
      return `${first}${second}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

/**
 * Theme icon component
 */
function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "dark") {
    return <MoonIcon className="h-4 w-4" />;
  }
  return <SunIcon className="h-4 w-4" />;
}

export function Header() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { data: session, isPending } = useSession();
  const { theme, setTheme, toggleSidebar, toggleMobileNav } = useUIStore();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    if (nextTheme) {
      setTheme(nextTheme);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileNav}
          aria-label="Toggle mobile menu"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>

        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <BookmarkIcon className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">BookMind</span>
        </Link>

        {/* Search bar - centered, hidden on mobile */}
        <div className="flex-1 hidden md:flex justify-center max-w-md mx-auto">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search.placeholder")}
              className="w-full pl-9 pr-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value;
                  if (value) {
                    navigate(`/search?q=${encodeURIComponent(value)}`);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => navigate("/search")}
            aria-label="Search"
          >
            <SearchIcon className="h-5 w-5" />
          </Button>

          {/* Language selector */}
          <LanguageSelector />

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            aria-label={`Current theme: ${theme}. Click to change.`}
          >
            <ThemeIcon theme={theme} />
          </Button>

          {/* User menu */}
          {isPending ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image ?? undefined}
                      alt={session.user.name ?? "User avatar"}
                    />
                    <AvatarFallback>
                      {getUserInitials(session.user.name, session.user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {session.user.name && (
                      <p className="font-medium">{session.user.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    {t("nav.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">{t("nav.login")}</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">{t("nav.signup")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
