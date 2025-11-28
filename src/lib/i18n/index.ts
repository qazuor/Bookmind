/**
 * i18n Barrel Export
 */

export type { SupportedLanguage } from "./config";
export {
  DEFAULT_LANGUAGE,
  i18n,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
} from "./config";

export {
  DATE_FORMATS,
  formatDate,
  formatDateDistance,
  formatDateToNow,
  formatRelativeDate,
  getDateLocale,
} from "./date-locale";
