/**
 * useI18n Hook (P8-004)
 *
 * Custom hook for internationalization with language switching.
 */

import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/lib/i18n";

/**
 * Hook return type
 */
export interface UseI18nReturn {
  /** Current language code */
  language: SupportedLanguage;
  /** Translation function */
  t: (key: string, options?: Record<string, unknown>) => string;
  /** Change the current language */
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  /** Toggle between available languages */
  toggleLanguage: () => Promise<void>;
  /** Check if a language is supported */
  isSupported: (lang: string) => lang is SupportedLanguage;
  /** List of supported languages with metadata */
  languages: Array<{
    code: SupportedLanguage;
    name: string;
    flag: string;
    isActive: boolean;
  }>;
  /** Whether i18n is ready */
  isReady: boolean;
}

/**
 * Custom hook for internationalization
 *
 * @example
 * ```tsx
 * const { t, language, changeLanguage, languages } = useI18n();
 *
 * return (
 *   <div>
 *     <p>{t('common.welcome')}</p>
 *     <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
 *       {languages.map((lang) => (
 *         <option key={lang.code} value={lang.code}>
 *           {lang.flag} {lang.name}
 *         </option>
 *       ))}
 *     </select>
 *   </div>
 * );
 * ```
 */
export function useI18n(): UseI18nReturn {
  const { t, i18n, ready } = useTranslation();

  const language = (i18n.language ?? DEFAULT_LANGUAGE) as SupportedLanguage;

  const changeLanguage = useCallback(
    async (lang: SupportedLanguage) => {
      if (SUPPORTED_LANGUAGES.includes(lang)) {
        await i18n.changeLanguage(lang);
      }
    },
    [i18n],
  );

  const toggleLanguage = useCallback(async () => {
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(language);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    const nextLang = SUPPORTED_LANGUAGES[nextIndex] ?? DEFAULT_LANGUAGE;
    await changeLanguage(nextLang);
  }, [language, changeLanguage]);

  const isSupported = useCallback((lang: string): lang is SupportedLanguage => {
    return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
  }, []);

  const languages = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((code) => ({
        code,
        name: LANGUAGE_NAMES[code],
        flag: LANGUAGE_FLAGS[code],
        isActive: code === language,
      })),
    [language],
  );

  return {
    language,
    t: t as UseI18nReturn["t"],
    changeLanguage,
    toggleLanguage,
    isSupported,
    languages,
    isReady: ready,
  };
}
