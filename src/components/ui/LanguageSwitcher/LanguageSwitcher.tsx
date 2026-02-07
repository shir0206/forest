import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useAppContext } from "../../../contexts/AppContext";
import { LANGUAGE, Language } from "../../../types/app";
import { Icon } from "../Icon/Icon";
import "./languageSwitcher.scss";

interface LanguageSwitcherProps {
  onLanguageChange?: (langCode: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  onLanguageChange,
}) => {
  const { language } = useTranslation();
  const appContext = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!appContext) {
    console.error("LanguageSwitcher: AppContext not found");
    return null;
  }

  const { setLanguage } = appContext;

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

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
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

  const handleOptionKeyDown = (event: React.KeyboardEvent, lang: Language) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectLanguage(lang);
    }
  };

  return (
    <div
      className="language-switcher"
      ref={dropdownRef}
      data-open={isOpen ? "true" : "false"}
    >
      <button
        ref={buttonRef}
        className="language-trigger"
        onClick={toggleDropdown}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Language switcher"
      >
        <Icon name="globe" size={20} className="globe-icon" />
        <span className="language-label">
          {language === LANGUAGE.EN ? "English" : "עברית"}
        </span>
        <Icon
          name="chevron"
          size={16}
          className={`chevron-icon ${isOpen ? "rotated" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <ul
            role="listbox"
            aria-label="Available languages"
            className="language-options"
          >
            <li
              role="option"
              aria-selected={language === LANGUAGE.EN}
              className={`language-option ${
                language === LANGUAGE.EN ? "active" : ""
              }`}
              onClick={() => selectLanguage(LANGUAGE.EN)}
              onKeyDown={(e) => handleOptionKeyDown(e, LANGUAGE.EN)}
              tabIndex={0}
            >
              English
            </li>
            <li
              role="option"
              aria-selected={language === LANGUAGE.HE}
              className={`language-option ${
                language === LANGUAGE.HE ? "active" : ""
              }`}
              onClick={() => selectLanguage(LANGUAGE.HE)}
              onKeyDown={(e) => handleOptionKeyDown(e, LANGUAGE.HE)}
              tabIndex={0}
            >
              עברית
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
