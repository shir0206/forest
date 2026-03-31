import en from "./text/en.json";
import he from "./text/he.json";
import type { LanguageType, TextStructure } from "./types";

export type { TextStructure };

const translations: Record<LanguageType, TextStructure> = {
  en,
  he,
};

export function getText(language: LanguageType): TextStructure {
  return translations[language];
}
