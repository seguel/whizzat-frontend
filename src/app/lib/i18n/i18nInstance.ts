import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import pt from "../locales/pt/common";
import en from "../locales/en/common";

i18n.use(initReactI18next).init({
  lng: "pt",
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
});

export default i18n;
