/**
 * Stats Page (P7-014)
 *
 * Dashboard with charts and statistics.
 */

import {
  BarChart3,
  BookOpen,
  Calendar,
  Folder,
  Tag,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { StatCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookmarks
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookmarks}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.bookmarksThisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Collections
                </CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalCollections}
                </div>
                <p className="text-xs text-muted-foreground">
                  Organize your links
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tags</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTags}</div>
                <p className="text-xs text-muted-foreground">
                  Unique tags used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.growth}%</div>
                <p className="text-xs text-muted-foreground">From last month</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Bookmarks by Category
            </CardTitle>
            <CardDescription>
              Distribution of bookmarks across categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{category.name}</span>
                    <span className="text-muted-foreground">
                      {category.count}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(category.count / stats.totalBookmarks) * 100}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Top Tags
            </CardTitle>
            <CardDescription>Most frequently used tags.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topTags.map((tag) => (
                <Link
                  key={tag.name}
                  to={`/bookmarks?tags=${tag.name}`}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/80"
                >
                  <span>{tag.name}</span>
                  <span className="text-muted-foreground">({tag.count})</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Bookmarks added in the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-end justify-between gap-2">
              {recentActivity.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-t bg-primary transition-all"
                    style={{ height: `${(day.count / 10) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
