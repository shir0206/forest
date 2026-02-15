import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../../../shared/contexts/AppContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { useScrollNavigation } from "../../../hooks/useScrollNavigation";
import LanguageSwitcher from "../../../shared/components/LanguageSwitcher/LanguageSwitcher";
import "./navigation.scss";
import { SCREEN_IDS } from "../../../types/app";

interface NavigationItem {
  id: string;
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
    { id: SCREEN_IDS.SEVICE, label: t.navigation.service },
    { id: SCREEN_IDS.CONTACT, label: t.navigation.contact },
  ];

  const navbarRef = useRef<HTMLElement | null>(null);

  // Use the scroll navigation hook
  const { activeSection, isScrolled, scrollToSection } = useScrollNavigation({
    containerRef,
  });

  const handleSectionClick = (sectionId: string) => {
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
