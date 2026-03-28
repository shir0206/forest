import React, { useRef } from "react";

import "./navigation.scss";

import { SCREEN_IDS, ScreenIdType } from "../../../domains/browser/types";
import { useTranslation } from "../../../hooks/i18n/useTranslation";
import { useScrollNavigation } from "../../../hooks/navigation/useScrollNavigation";
import LanguageSwitcher from "../../../shared/components/LanguageSwitcher/LanguageSwitcher";
import { useAppContext } from "../../../shared/contexts/AppContext";

interface NavigationItem {
  id: ScreenIdType;
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

  // Navigation items based on screens
  const navigationItems: NavigationItem[] = [
    { id: SCREEN_IDS.OVERVIEW, label: t.navigation.overview },
    { id: SCREEN_IDS.ABOUT, label: t.navigation.about },
    { id: SCREEN_IDS.SERVICE, label: t.navigation.service },
    { id: SCREEN_IDS.CONTACT, label: t.navigation.contact },
  ];

  const navbarRef = useRef<HTMLElement | null>(null);

  // Use the scroll navigation hook
  const { activeSection, isScrolled, scrollToSection } = useScrollNavigation({
    containerRef,
  });

  const handleSectionClick = (screenId: ScreenIdType) => {
    scrollToSection(screenId);
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
