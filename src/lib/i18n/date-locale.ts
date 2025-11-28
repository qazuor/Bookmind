/**
 * Date-fns Locale Configuration (P8-007)
 *
 * Provides locale-aware date formatting utilities.
 */

import {
  format,
  formatDistance,
  formatDistanceToNow,
  formatRelative,
  type Locale,
} from "date-fns";
import { enUS, es } from "date-fns/locale";

import { DEFAULT_LANGUAGE, type SupportedLanguage } from "./config";

/**
 * Map of supported languages to date-fns locales
 */
const DATE_LOCALES: Record<SupportedLanguage, Locale> = {
  en: enUS,
  es: es,
};

/**
 * Get the date-fns locale for a language code
 */
export function getDateLocale(language: SupportedLanguage): Locale {
  return DATE_LOCALES[language] ?? DATE_LOCALES[DEFAULT_LANGUAGE];
}

/**
 * Format a date with the current locale
 *
 * @example
 * ```ts
 * formatDate(new Date(), 'PPP', 'es') // "27 de noviembre de 2025"
 * formatDate(new Date(), 'PPP', 'en') // "November 27th, 2025"
 * ```
 */
export function formatDate(
  date: Date | number,
  formatStr: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
): string {
  return format(date, formatStr, { locale: getDateLocale(language) });
}

/**
 * Format distance between two dates with locale
 *
 * @example
 * ```ts
 * formatDateDistance(pastDate, new Date(), 'es') // "hace 3 días"
 * ```
 */
export function formatDateDistance(
  date: Date | number,
  baseDate: Date | number,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
  options?: { addSuffix?: boolean; includeSeconds?: boolean },
): string {
  return formatDistance(date, baseDate, {
    locale: getDateLocale(language),
    addSuffix: options?.addSuffix ?? true,
    includeSeconds: options?.includeSeconds,
  });
}

/**
 * Format distance to now with locale
 *
 * @example
 * ```ts
 * formatDateToNow(pastDate, 'es') // "hace 2 horas"
 * formatDateToNow(pastDate, 'en') // "2 hours ago"
 * ```
 */
export function formatDateToNow(
  date: Date | number,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
  options?: { addSuffix?: boolean; includeSeconds?: boolean },
): string {
  return formatDistanceToNow(date, {
    locale: getDateLocale(language),
    addSuffix: options?.addSuffix ?? true,
    includeSeconds: options?.includeSeconds,
  });
}

/**
 * Format relative date with locale
 *
 * @example
 * ```ts
 * formatRelativeDate(tomorrow, new Date(), 'es') // "mañana a las 10:00"
 * ```
 */
export function formatRelativeDate(
  date: Date | number,
  baseDate: Date | number,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
): string {
  return formatRelative(date, baseDate, { locale: getDateLocale(language) });
}

/**
 * Common date format patterns
 */
export const DATE_FORMATS = {
  /** Full date: "November 27, 2025" */
  full: "PPP",
  /** Short date: "Nov 27, 2025" */
  short: "PP",
  /** Numeric date: "11/27/2025" */
  numeric: "P",
  /** Date with time: "Nov 27, 2025, 10:30 AM" */
  dateTime: "PPp",
  /** Time only: "10:30 AM" */
  time: "p",
  /** Month and year: "November 2025" */
  monthYear: "MMMM yyyy",
  /** Day and month: "Nov 27" */
  dayMonth: "MMM d",
  /** ISO date: "2025-11-27" */
  iso: "yyyy-MM-dd",
} as const;
