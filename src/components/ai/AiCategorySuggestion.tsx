/**
 * AiCategorySuggestion Component (P6-040)
 *
 * Displays AI-suggested category with accept/change options.
 */

import { Check, ChevronDown, Folder, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export interface SuggestedCategory {
  id: string;
  name: string;
  color?: string;
  confidence?: number;
}

export interface AiCategorySuggestionProps {
  /** The suggested category */
  suggestion?: SuggestedCategory | null;
  /** Alternative category options */
  alternatives?: SuggestedCategory[];
  /** Whether suggestion is loading */
  isLoading?: boolean;
  /** Callback when suggestion is accepted */
  onAccept?: (category: SuggestedCategory) => void;
  /** Callback when suggestion is dismissed */
  onDismiss?: () => void;
  /** Callback when an alternative is selected */
  onSelectAlternative?: (category: SuggestedCategory) => void;
  /** Additional CSS classes */
  className?: string;
}

export function AiCategorySuggestion({
  suggestion,
  alternatives = [],
  isLoading = false,
  onAccept,
  onDismiss,
  onSelectAlternative,
  className = "",
}: AiCategorySuggestionProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm">Analyzing content...</span>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    );
  }

  if (!suggestion) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border border-dashed border-primary/50 bg-primary/5 ${className}`}
    >
      <div className="flex items-center gap-2 flex-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Suggested Category:</span>
        <Badge
          variant="secondary"
          className="inline-flex items-center gap-1"
          style={
            suggestion.color
              ? { backgroundColor: `${suggestion.color}20` }
              : undefined
          }
        >
          <Folder className="h-3 w-3" />
          {suggestion.name}
          {suggestion.confidence !== undefined && (
            <span className="text-xs text-muted-foreground ml-1">
              ({Math.round(suggestion.confidence * 100)}%)
            </span>
          )}
        </Badge>
      </div>

      <div className="flex items-center gap-1">
        {onAccept && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAccept(suggestion)}
            className="h-7 px-2 hover:bg-green-100 hover:text-green-600"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}

        {alternatives.length > 0 && onSelectAlternative && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {alternatives.map((alt) => (
                <DropdownMenuItem
                  key={alt.id}
                  onClick={() => onSelectAlternative(alt)}
                  className="flex items-center gap-2"
                >
                  <Folder className="h-4 w-4" />
                  <span>{alt.name}</span>
                  {alt.confidence !== undefined && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {Math.round(alt.confidence * 100)}%
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-7 px-2 hover:bg-red-100 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
