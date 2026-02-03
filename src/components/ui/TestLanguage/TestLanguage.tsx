import React from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

const TestLanguage: React.FC = () => {
  // const { t, language } = useTranslation();

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 1000,
        fontFamily: "monospace",
      }}
    >
      <h3>Language Test</h3>
      {/* <p>Current Language: {language}</p>
      <p>Test Text: {t.overview.name}</p> */}
      <LanguageSwitcher />
    </div>
  );
};

export default TestLanguage;
