/**
 * AiSummary Component (P6-038)
 *
 * Displays AI-generated summary with optional regeneration capability.
 */

import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface AiSummaryProps {
  /** The AI-generated summary text */
  summary?: string | null;
  /** Whether the summary is currently loading/generating */
  isLoading?: boolean;
  /** Whether regeneration is in progress */
  isRegenerating?: boolean;
  /** Callback when regenerate is clicked */
  onRegenerate?: () => void;
  /** Whether to show the regenerate button */
  showRegenerate?: boolean;
  /** Custom placeholder text when no summary */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

export function AiSummary({
  summary,
  isLoading = false,
  isRegenerating = false,
  onRegenerate,
  showRegenerate = true,
  placeholder = "No AI summary available yet.",
  className = "",
}: AiSummaryProps) {
  if (isLoading) {
    return (
      <div className={`rounded-md bg-muted p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Generating summary...</span>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-md bg-muted p-4 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-medium">AI Summary</h3>
        </div>
        {showRegenerate && onRegenerate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="h-7 px-2"
          >
            <RefreshCw
              className={`h-3 w-3 mr-1 ${isRegenerating ? "animate-spin" : ""}`}
            />
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {summary || placeholder}
      </p>
    </div>
  );
}
