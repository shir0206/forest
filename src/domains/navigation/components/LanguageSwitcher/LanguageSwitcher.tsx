import React from "react";

import "./languageSwitcher.scss";

import { useTranslation } from "../../../../i18n/hooks/useTranslation";
import { LANGUAGE, LanguageType } from "../../../../i18n/types";
import { Icon } from "../../../../shared/components/Icon/Icon";
import { useAppContext } from "../../../../shared/context";
import { useLanguageDropdown } from "./useLanguageDropdown";

interface LanguageSwitcherProps {
  onLanguageChange?: (langCode: LanguageType) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  onLanguageChange,
}) => {
  const { language } = useTranslation();
  const appContext = useAppContext();

  if (!appContext) {
    console.error("LanguageSwitcher: AppContext not found");
    return null;
  }

  const { setLanguage } = appContext;

  const {
    isOpen,
    toggleDropdown,
    selectLanguage,
    dropdownRef,
    buttonRef,
    handleButtonKeyDown,
    handleOptionKeyDown,
  } = useLanguageDropdown({
    onLanguageChange: (langCode: string) => {
      setLanguage(langCode as LanguageType);
      if (onLanguageChange) {
        onLanguageChange(langCode as LanguageType);
      }
    },
  });

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
              <span>English</span>
              {language === LANGUAGE.EN && (
                <Icon name="check" size={16} className="check-icon" />
              )}
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
              <span>עברית</span>
              {language === LANGUAGE.HE && (
                <Icon name="check" size={16} className="check-icon" />
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
