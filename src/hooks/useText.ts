import { useContext } from "react";
import { useAppContext } from "../contexts/AppContext";
import { Language } from "../types/app";

// Hook to get text with current language context
export function useText(path: string, lang?: Language): string {
  const { t } = useAppContext();

  // Navigate through the translation object using the path
  const keys = path.split(".");
  let current: any = t;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      console.warn(`Text path "${path}" not found in translation object`);
      return path; // Return the path as fallback
    }
  }

  return current as string;
}

// Hook to get current language
export function useCurrentLanguage(): Language {
  const { language } = useAppContext();
  return language;
}

// Hook to switch language
export function useLanguageSwitcher() {
  const { setLanguage } = useAppContext();

  const switchLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return { switchLanguage };
}
