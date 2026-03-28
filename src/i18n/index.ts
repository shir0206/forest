import type { LanguageType } from "./types";
import en from "./en.json";
import he from "./he.json";
import type { TextStructure } from "./types";

export type { TextStructure };

const translations: Record<LanguageType, TextStructure> = {
  en,
  he,
};

export function getText(language: LanguageType): TextStructure {
  return translations[language];
}
