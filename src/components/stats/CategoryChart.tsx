/**
 * CategoryChart Component (P6-035)
 *
 * Horizontal bar chart showing bookmark distribution by category.
 */

import { BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface CategoryData {
  name: string;
  count: number;
  color: string;
}

export interface CategoryChartProps {
  /** Array of category data with counts */
  categories: CategoryData[];
  /** Total count for calculating percentages */
  total: number;
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Whether to show the icon in the title */
  showIcon?: boolean;
}

export function CategoryChart({
  categories,
  total,
  title = "Bookmarks by Category",
  description = "Distribution of bookmarks across categories.",
  showIcon = true,
}: CategoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {showIcon && <BarChart3 className="h-5 w-5" />}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <CategoryBar
              key={category.name}
              name={category.name}
              count={category.count}
              color={category.color}
              percentage={(category.count / total) * 100}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface CategoryBarProps {
  name: string;
  count: number;
  color: string;
  percentage: number;
}

function CategoryBar({ name, count, color, percentage }: CategoryBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{name}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
