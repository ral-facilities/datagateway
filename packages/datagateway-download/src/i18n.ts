import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const loadPath = import.meta.env.VITE_DOWNLOAD_BUILD_DIRECTORY
  ? import.meta.env.VITE_DOWNLOAD_BUILD_DIRECTORY + 'res/default.json'
  : '/res/default.json';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    backend: {
      loadPath: loadPath,
    },
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
