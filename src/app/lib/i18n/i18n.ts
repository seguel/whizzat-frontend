"use client";

import { useTranslation as useTranslationOrg } from "react-i18next";

export const useTranslation = (ns?: string) => {
  return useTranslationOrg(ns);
};
