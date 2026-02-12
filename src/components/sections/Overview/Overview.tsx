import React from "react";
import "./overview.scss";
import { ReactComponent as Branch } from "../../../assets/images/branch.svg";
import { useTranslation } from "../../../hooks/useTranslation";
import { useScrollNavigation } from "../../../hooks/useScrollNavigation";
import { SCREEN_IDS } from "../../../helper/const";

interface OverviewProps {
  isVisible: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const Overview: React.FC<OverviewProps> = ({ containerRef }) => {
  const { t } = useTranslation();

  // Use the scroll navigation hook
  const { scrollToSection } = useScrollNavigation({
    containerRef: containerRef || { current: null },
  });

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
      <div className="overview-quote-wrapper">
        <p className="overview-quote">{t.overview.hook}</p>
        <p className="overview-quote">{parseBoldText(t.overview.quote)}</p>
      </div>
      <p className="overview-cta">{t.overview.cta}</p>
      <button
        className="overview-link"
        onClick={() => scrollToSection(SCREEN_IDS.CONTACT)}
      >
        {t.overview.link}
      </button>
    </div>
  );
};

export default Overview;
