import React from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useAppContext } from "../../../contexts/AppContext";
import { LANGUAGE } from "../../../types/app";
import "./languageSwitcher.scss";

const LanguageSwitcher: React.FC = () => {
  //  const { language } = useTranslation();
  // const { setLanguage } = useAppContext();

  return (
    <div className="language-switcher">
      {/* <button
        onClick={() => setLanguage(LANGUAGE.EN)}
        className={`language-btn ${language === LANGUAGE.EN ? "active" : ""}`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLanguage(LANGUAGE.HE)}
        className={`language-btn ${language === LANGUAGE.HE ? "active" : ""}`}
        aria-label="Switch to Hebrew"
      >
        HE
      </button> */}
    </div>
  );
};

export default LanguageSwitcher;
