/**
 * SearchBar Component (P6-030)
 *
 * Search input with debounce and keyboard shortcuts.
 */

import { LoaderIcon, SearchIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  /** Initial search value */
  defaultValue?: string;
  /** Callback on search */
  onSearch?: (query: string) => void;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Show loading state */
  isLoading?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Navigate to search page on submit */
  navigateOnSubmit?: boolean;
  /** Enable keyboard shortcut (Cmd+K / Ctrl+K) */
  enableShortcut?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Class name */
  className?: string;
}

export function SearchBar({
  defaultValue = "",
  onSearch,
  debounceMs = 300,
  placeholder = "Search bookmarks...",
  isLoading = false,
  autoFocus = false,
  navigateOnSubmit = false,
  enableShortcut = false,
  size = "md",
  className,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Sync with URL param - intentionally omit `value` to prevent re-sync on local changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: value is intentionally excluded
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== value) {
      setValue(q);
    }
  }, [searchParams]);

  // Debounced search
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSearch?.(query);
      }, debounceMs);
    },
    [onSearch, debounceMs],
  );

  // Handle input change
  const handleChange = (newValue: string) => {
    setValue(newValue);
    debouncedSearch(newValue);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (navigateOnSubmit && value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    } else {
      onSearch?.(value);
    }
  };

  // Clear search
  const handleClear = () => {
    setValue("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  // Keyboard shortcut
  useEffect(() => {
    if (!enableShortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcut]);

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10",
    lg: "h-12 text-lg",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <SearchIcon
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
          iconSizes[size],
        )}
      />
      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "pl-9",
          value && "pr-20",
          enableShortcut && !value && "pr-16",
          sizeClasses[size],
        )}
      />

      {/* Loading indicator */}
      {isLoading && (
        <LoaderIcon
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground",
            iconSizes[size],
          )}
        />
      )}

      {/* Clear button */}
      {value && !isLoading && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2"
        >
          <XIcon className={iconSizes[size]} />
        </Button>
      )}

      {/* Keyboard shortcut hint */}
      {enableShortcut && !value && !isLoading && (
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}
    </form>
  );
}

/**
 * SearchInput - Simple search input without navigation
 */
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  autoFocus = false,
  className,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="pl-9"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * GlobalSearchTrigger - Button to open global search/command palette
 */
interface GlobalSearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export function GlobalSearchTrigger({
  onClick,
  className,
}: GlobalSearchTriggerProps) {
  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClick();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClick]);

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64",
        className,
      )}
    >
      <SearchIcon className="mr-2 h-4 w-4" />
      <span className="hidden lg:inline-flex">Search bookmarks...</span>
      <span className="inline-flex lg:hidden">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
