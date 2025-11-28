/**
 * Stats Page (P7-014)
 *
 * Dashboard with charts and statistics using extracted components.
 */

import { BookOpen, Folder, Tag, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCardSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  ActivityChart,
  CategoryChart,
  StatCard,
  TagCloud,
} from "@/components/stats";
import { Button } from "@/components/ui/button";

export function StatsPage() {
  // TODO: Replace with real data from useOverviewStats and useActivityStats hooks
  const isLoading = false;
  const stats = {
    totalBookmarks: 142,
    totalCollections: 8,
    totalCategories: 7,
    totalTags: 45,
    bookmarksThisMonth: 23,
    bookmarksLastMonth: 18,
    growth: 27.8,
  };

  const topCategories = [
    { name: "Development", count: 45, color: "#3b82f6" },
    { name: "Design", count: 32, color: "#8b5cf6" },
    { name: "Business", count: 28, color: "#10b981" },
    { name: "Marketing", count: 20, color: "#f59e0b" },
    { name: "Other", count: 17, color: "#6b7280" },
  ];

  const topTags = [
    { name: "javascript", count: 28 },
    { name: "react", count: 24 },
    { name: "typescript", count: 21 },
    { name: "css", count: 18 },
    { name: "nodejs", count: 15 },
    { name: "design", count: 14 },
    { name: "api", count: 12 },
    { name: "tutorial", count: 10 },
  ];

  const recentActivity = [
    { date: "2024-01-15", count: 5 },
    { date: "2024-01-14", count: 3 },
    { date: "2024-01-13", count: 8 },
    { date: "2024-01-12", count: 2 },
    { date: "2024-01-11", count: 6 },
    { date: "2024-01-10", count: 4 },
    { date: "2024-01-09", count: 7 },
  ];

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">
            Overview of your bookmark activity.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/export">Export Data</Link>
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={`stat-skeleton-${i}`} />
          ))
        ) : (
          <>
            <StatCard
              title="Total Bookmarks"
              value={stats.totalBookmarks}
              description={`+${stats.bookmarksThisMonth} this month`}
              icon={BookOpen}
            />
            <StatCard
              title="Collections"
              value={stats.totalCollections}
              description="Organize your links"
              icon={Folder}
            />
            <StatCard
              title="Tags"
              value={stats.totalTags}
              description="Unique tags used"
              icon={Tag}
            />
            <StatCard
              title="Growth"
              value={`+${stats.growth}%`}
              description="From last month"
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Distribution */}
        <CategoryChart
          categories={topCategories}
          total={stats.totalBookmarks}
        />

        {/* Top Tags */}
        <TagCloud tags={topTags} />

        {/* Recent Activity */}
        <ActivityChart data={recentActivity} maxCount={10} />
      </div>
    </div>
  );
}
