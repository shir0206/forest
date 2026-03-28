import { useEffect, useRef, useState } from "react";

export interface UseLanguageDropdownOptions {
  onLanguageChange?: (langCode: string) => void;
}

export interface UseLanguageDropdownReturn {
  isOpen: boolean;
  toggleDropdown: () => void;
  selectLanguage: (lang: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  handleButtonKeyDown: (event: React.KeyboardEvent) => void;
  handleOptionKeyDown: (event: React.KeyboardEvent, lang: string) => void;
}

export const useLanguageDropdown = (
  options: UseLanguageDropdownOptions = {}
): UseLanguageDropdownReturn => {
  const { onLanguageChange } = options;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectLanguage = (lang: string) => {
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const handleButtonKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDropdown();
    }
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent, lang: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectLanguage(lang);
    }
  };

  return {
    isOpen,
    toggleDropdown,
    selectLanguage,
    dropdownRef,
    buttonRef,
    handleButtonKeyDown,
    handleOptionKeyDown,
  };
};
