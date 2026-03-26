import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en/translation.json';
import esTranslations from './locales/es/translation.json';
import ptTranslations from './locales/pt/translation.json';

import enAltCommon from './locales/en/alt-common.json';
import enAltVenuesById from './locales/en/alt-venues-byId.json';
import esAltCommon from './locales/es/alt-common.json';
import esAltVenuesById from './locales/es/alt-venues-byId.json';
import ptAltCommon from './locales/pt/alt-common.json';
import ptAltVenuesById from './locales/pt/alt-venues-byId.json';

function mergeAltLocales<T extends Record<string, unknown>>(
  base: T,
  altCommon: Record<string, unknown>,
  altVenuesById: Record<string, unknown>,
): T & { alt: Record<string, unknown> } {
  return {
    ...base,
    alt: {
      ...altCommon,
      venues: {
        byId: altVenuesById,
      },
    },
  };
}

const resources = {
  en: {
    translation: mergeAltLocales(enTranslations, enAltCommon, enAltVenuesById),
  },
  es: {
    translation: mergeAltLocales(esTranslations, esAltCommon, esAltVenuesById),
  },
  pt: {
    translation: mergeAltLocales(ptTranslations, ptAltCommon, ptAltVenuesById),
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es', // Default to Spanish
    debug: false,

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

export default i18n;
