import React from "react";
import "./overview.scss";
import { ReactComponent as Branch } from "../../../assets/images/branch.svg";
import { useTranslation } from "../../../hooks/useTranslation";

const Overview: React.FC = () => {
  const { t } = useTranslation();

  function parseBoldText(text: string): React.ReactNode[] {
    return text.split("**").map((part, index) => {
      const isBold = index % 2 === 1;

      return isBold ? (
        <strong key={index}>{part}</strong>
      ) : (
        <span key={index}>{part}</span>
      );
    });
  }
  return (
    <div className="overview-content">
      <h1 className="overview-name">{t.overview.name}</h1>
      <div>
        <p className="overview-subtitle">{t.overview.subtitle}</p>
        <div className="overview-skills">
          <span>{t.overview.skills.architecture}</span>
          <span className="dot dot-left">●</span>
          <span>{t.overview.skills.design}</span>
          <span className="dot dot-right">●</span>
          <span>{t.overview.skills.userExperience}</span>
        </div>
      </div>
      <div className="background-branch-wrapper">
        <Branch aria-hidden className="background-branch branch-left" />
        <Branch aria-hidden className="background-branch branch-right" />
      </div>
      <p className="overview-quote">{parseBoldText(t.overview.quote)}</p>
      <p className="overview-cta">{t.overview.cta}</p>
    </div>
  );
};

export default Overview;
