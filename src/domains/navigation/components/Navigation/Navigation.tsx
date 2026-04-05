import React, { useRef } from "react";

import "./navigation.scss";

import { useTranslation } from "../../../../i18n/hooks/useTranslation";
import { useAppContext } from "../../../../shared/context";
import { SECTION_IDS, SectionIdType } from "../../../browser/types/types";
import { useScrollNavigation } from "../../hooks/useScrollNavigation";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

interface NavigationItem {
  id: SectionIdType;
  label: string;
}

interface NavigationProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const Navigation: React.FC<NavigationProps> = ({ containerRef }) => {
  const { t } = useTranslation();
  const appContext = useAppContext();

  // Handle case where context might be undefined
  if (!appContext) {
    console.error("Navigation: AppContext not found");
    return null;
  }

  // Navigation items based on sections
  const navigationItems: NavigationItem[] = [
    { id: SECTION_IDS.OVERVIEW, label: t.navigation.overview },
    { id: SECTION_IDS.ABOUT, label: t.navigation.about },
    { id: SECTION_IDS.SERVICE, label: t.navigation.service },
    { id: SECTION_IDS.CONTACT, label: t.navigation.contact },
  ];

  const navbarRef = useRef<HTMLElement | null>(null);

  // Use the scroll navigation hook
  const { activeSection, isScrolled, scrollToSection } = useScrollNavigation({
    containerRef,
  });

  const handleSectionClick = (sectionId: SectionIdType) => {
    scrollToSection(sectionId);
  };

  return (
    <nav
      ref={navbarRef}
      className={`navigation ${isScrolled ? "scrolled" : ""}`}
    >
      <div className="navigation-container">
        <div className="navigation-links">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => handleSectionClick(item.id)}
              aria-label={`Navigate to ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="navigation-actions">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
