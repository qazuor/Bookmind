/**
 * ActivityChart Component (P6-037)
 *
 * Bar chart showing recent activity over time.
 */

import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface ActivityData {
  date: string;
  count: number;
}

export interface ActivityChartProps {
  /** Array of activity data by date */
  data: ActivityData[];
  /** Maximum count for scaling bars (defaults to max in data or 10) */
  maxCount?: number;
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Whether to show the icon in the title */
  showIcon?: boolean;
  /** Date format options for labels */
  dateFormat?: Intl.DateTimeFormatOptions;
  /** Locale for date formatting */
  locale?: string;
}

export function ActivityChart({
  data,
  maxCount,
  title = "Recent Activity",
  description = "Bookmarks added in the last 7 days.",
  showIcon = true,
  dateFormat = { weekday: "short" },
  locale = "en-US",
}: ActivityChartProps) {
  const max = maxCount ?? Math.max(...data.map((d) => d.count), 10);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {showIcon && <Calendar className="h-5 w-5" />}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-end justify-between gap-2">
          {data.map((day) => (
            <ActivityBar
              key={day.date}
              date={day.date}
              count={day.count}
              maxCount={max}
              dateFormat={dateFormat}
              locale={locale}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityBarProps {
  date: string;
  count: number;
  maxCount: number;
  dateFormat: Intl.DateTimeFormatOptions;
  locale: string;
}

function ActivityBar({
  date,
  count,
  maxCount,
  dateFormat,
  locale,
}: ActivityBarProps) {
  const percentage = (count / maxCount) * 100;

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div
        className="w-full rounded-t bg-primary transition-all"
        style={{ height: `${percentage}%` }}
        title={`${count} bookmarks`}
      />
      <span className="text-xs text-muted-foreground">
        {new Date(date).toLocaleDateString(locale, dateFormat)}
      </span>
    </div>
  );
}
