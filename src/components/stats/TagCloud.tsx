/**
 * TagCloud Component (P6-036)
 *
 * Interactive cloud of tags with counts, linking to filtered bookmark views.
 */

import { Tag } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface TagData {
  name: string;
  count: number;
}

export interface TagCloudProps {
  /** Array of tag data with counts */
  tags: TagData[];
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Whether to show the icon in the title */
  showIcon?: boolean;
  /** Base URL for tag links (default: /bookmarks?tags=) */
  linkBase?: string;
  /** Maximum number of tags to display */
  maxTags?: number;
}

export function TagCloud({
  tags,
  title = "Top Tags",
  description = "Most frequently used tags.",
  showIcon = true,
  linkBase = "/bookmarks?tags=",
  maxTags,
}: TagCloudProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {showIcon && <Tag className="h-5 w-5" />}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag) => (
            <Link
              key={tag.name}
              to={`${linkBase}${tag.name}`}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/80 transition-colors"
            >
              <span>{tag.name}</span>
              <span className="text-muted-foreground">({tag.count})</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
