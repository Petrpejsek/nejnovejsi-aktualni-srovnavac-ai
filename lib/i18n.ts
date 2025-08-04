// i18n configuration for Comparee.ai
export const locales = ['cs', 'en', 'de', 'fr', 'es'] as const;
export const defaultLocale = 'cs' as const;

export type Locale = typeof locales[number];

// Language metadata
export const languageMetadata = {
  cs: {
    name: 'Čeština',
    nativeName: 'Čeština',
    code: 'cs',
    htmlLang: 'cs',
    locale: 'cs_CZ',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    code: 'en',
    htmlLang: 'en',
    locale: 'en_US',
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    code: 'de',
    htmlLang: 'de',
    locale: 'de_DE',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    code: 'fr',
    htmlLang: 'fr',
    locale: 'fr_FR',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    code: 'es',
    htmlLang: 'es',
    locale: 'es_ES',
  },
} as const;

// Validation function
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Get language metadata
export function getLanguageMetadata(locale: Locale) {
  return languageMetadata[locale];
}