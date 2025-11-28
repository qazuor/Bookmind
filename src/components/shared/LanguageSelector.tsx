/**
 * LanguageSelector Component (P8-005)
 *
 * Dropdown component for selecting application language.
 */

import { Check, ChevronDown, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

export interface LanguageSelectorProps {
  /** Show flag emoji instead of globe icon */
  showFlag?: boolean;
  /** Show language name next to icon */
  showLabel?: boolean;
  /** Button variant */
  variant?: "default" | "outline" | "ghost";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Language selector dropdown component
 *
 * @example
 * ```tsx
 * // Icon only (compact)
 * <LanguageSelector />
 *
 * // With flag and label
 * <LanguageSelector showFlag showLabel />
 *
 * // Ghost variant
 * <LanguageSelector variant="ghost" />
 * ```
 */
export function LanguageSelector({
  showFlag = false,
  showLabel = false,
  variant = "ghost",
  size = "sm",
  className,
}: LanguageSelectorProps) {
  const { language, languages, changeLanguage, t } = useI18n();

  const currentLanguage = languages.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-1", className)}
          aria-label={t("settings.appearance.language")}
        >
          {showFlag && currentLanguage ? (
            <span className="text-base">{currentLanguage.flag}</span>
          ) : (
            <Globe className="h-4 w-4" />
          )}
          {showLabel && currentLanguage && (
            <span className="hidden sm:inline">{currentLanguage.name}</span>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
            {lang.isActive && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact language toggle button
 * Toggles between available languages on click
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { language, languages, toggleLanguage } = useI18n();

  const currentLanguage = languages.find((l) => l.code === language);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className={className}
      aria-label={`Language: ${currentLanguage?.name}`}
      title={`Switch language (${currentLanguage?.name})`}
    >
      <span className="text-lg">{currentLanguage?.flag}</span>
    </Button>
  );
}
