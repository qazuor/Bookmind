/**
 * StatCard Component (P6-034)
 *
 * Reusable card for displaying statistics with icon, value, and description.
 */

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StatCardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional description or subtitle */
  description?: string;
  /** Icon component from lucide-react */
  icon?: LucideIcon;
  /** Optional trend indicator (positive/negative percentage) */
  trend?: {
    value: number;
    label?: string;
  };
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p
            className={`text-xs ${trend.value >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%{trend.label && ` ${trend.label}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
