/**
 * Layout Component (P6-005)
 *
 * Main application layout wrapper.
 * Combines Header, Sidebar, MobileNav, and content area.
 */

import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav, MobileSidebar } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { ThemeProvider } from "./ThemeProvider";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {/* Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <div className="flex">
          <Sidebar />
          <main
            id="main-content"
            className="flex-1 overflow-auto pb-20 md:pb-0"
            aria-label="Main content"
          >
            <div className="container mx-auto p-4 md:p-6">
              {children ?? <Outlet />}
            </div>
          </main>
        </div>
        <MobileSidebar />
        <BottomNav />
      </div>
    </ThemeProvider>
  );
}

/**
 * Auth layout for login/signup pages
 * Minimal layout without sidebar
 */
export function AuthLayout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children ?? <Outlet />}</div>
      </div>
    </ThemeProvider>
  );
}

/**
 * Public layout for shared content
 * Read-only without user navigation
 */
export function PublicLayout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-xl">BookMind</span>
            </a>
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-6">
          {children ?? <Outlet />}
        </main>
      </div>
    </ThemeProvider>
  );
}
