import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import pt from "../locales/pt/common";
import en from "../locales/en/common";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // lng: "pt",
    fallbackLng: "pt",
    supportedLngs: ["pt", "en"],
    resources: {
      pt: { common: pt },
      en: { common: en },
    },
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["cookie", "localStorage", "navigator"],
      caches: ["cookie"],
      lookupCookie: "lang",
    },
  });

export default i18n;
