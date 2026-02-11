import en from "./en.json";
import he from "./he.json";
import type { TextStructure } from "./types";
import type { Language } from "../types/app";

export type { TextStructure };

const translations: Record<Language, TextStructure> = {
  en,
  he,
};

export function getText(language: Language): TextStructure {
  return translations[language];
}
