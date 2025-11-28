/**
 * AiTagSuggestions Component (P6-039)
 *
 * Displays AI-suggested tags that users can accept or dismiss.
 */

import { Check, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface SuggestedTag {
  id: string;
  name: string;
  confidence?: number;
}

export interface AiTagSuggestionsProps {
  /** Array of suggested tags */
  suggestions: SuggestedTag[];
  /** Whether suggestions are loading */
  isLoading?: boolean;
  /** Callback when a tag is accepted */
  onAccept?: (tag: SuggestedTag) => void;
  /** Callback when a tag is dismissed */
  onDismiss?: (tag: SuggestedTag) => void;
  /** Callback to accept all suggestions */
  onAcceptAll?: () => void;
  /** Callback to dismiss all suggestions */
  onDismissAll?: () => void;
  /** Show accept/dismiss all buttons */
  showBulkActions?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function AiTagSuggestions({
  suggestions,
  isLoading = false,
  onAccept,
  onDismiss,
  onAcceptAll,
  onDismissAll,
  showBulkActions = true,
  className = "",
}: AiTagSuggestionsProps) {
  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Analyzing content...</span>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Suggested Tags</span>
        </div>
        {showBulkActions && (onAcceptAll || onDismissAll) && (
          <div className="flex gap-2">
            {onAcceptAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAcceptAll}
                className="h-7 text-xs"
              >
                Accept all
              </Button>
            )}
            {onDismissAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismissAll}
                className="h-7 text-xs text-muted-foreground"
              >
                Dismiss all
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((tag) => (
          <SuggestedTagBadge
            key={tag.id}
            tag={tag}
            onAccept={onAccept}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
}

interface SuggestedTagBadgeProps {
  tag: SuggestedTag;
  onAccept?: (tag: SuggestedTag) => void;
  onDismiss?: (tag: SuggestedTag) => void;
}

function SuggestedTagBadge({
  tag,
  onAccept,
  onDismiss,
}: SuggestedTagBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="inline-flex items-center gap-1 pr-1 border-dashed border-primary/50 bg-primary/5"
    >
      <span>{tag.name}</span>
      {tag.confidence !== undefined && (
        <span className="text-xs text-muted-foreground">
          {Math.round(tag.confidence * 100)}%
        </span>
      )}
      {onAccept && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAccept(tag)}
          className="h-5 w-5 p-0 hover:bg-green-100 hover:text-green-600"
        >
          <Check className="h-3 w-3" />
        </Button>
      )}
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDismiss(tag)}
          className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  );
}
