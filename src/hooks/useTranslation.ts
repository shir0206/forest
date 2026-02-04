import { useContext } from "react";
import { useAppContext } from "../contexts/AppContext";
import { getText } from "../i18n";
import type { TextStructure } from "../i18n/types";
import { LANGUAGE } from "../types/app";

const translations: Record<string, TextStructure> = {
  en: getText("en"),
  he: getText("he"),
};

export function useTranslation() {
  const context = useAppContext();

  if (!context) {
    console.error("useTranslation: context not found");
  } else {
    console.warn("ALL GOOD WITH CONTEXT");
  }

  const defaultLanguage = LANGUAGE.EN;
  const language = context?.language ?? defaultLanguage;

  const t = translations[language] as TextStructure;

  return { t, language };
}
