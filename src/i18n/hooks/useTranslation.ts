import { getText } from "..";
import type { TextStructure } from "../types";
import { LANGUAGE } from "../types";
import { useEnhancedAppContext } from "../../domains/context/useAppContext";

const translations: Record<string, TextStructure> = {
  en: getText("en"),
  he: getText("he"),
};

export function useTranslation() {
  const context = useEnhancedAppContext();

  if (!context) {
    console.error("useTranslation: context not found");
  }

  const defaultLanguage = LANGUAGE.EN;
  const language = context?.language ?? defaultLanguage;

  const t = translations[language] as TextStructure;

  return { t, language };
}
