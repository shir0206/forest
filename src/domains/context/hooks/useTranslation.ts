import { getText } from "../../../i18n";
import type { TextStructure } from "../../../i18n/types";
import { LANGUAGE } from "../../../i18n/types";
import { useEnhancedAppContext } from "../../../shared/contexts/AppContext";

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
