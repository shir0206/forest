import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../contexts/AppContext";
import { useTranslation } from "../../../hooks/useTranslation";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import "./navigation.scss";
import { SCREEN_IDS } from "../../../helper/const";

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

  const [activeSection, setActiveSection] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle smooth scrolling to section within the container
  const scrollToSection = (sectionId: string) => {
    const container = containerRef.current;
    const element = document.getElementById(sectionId);

    if (element && container) {
      const navbarHeight = 40;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Calculate position relative to container
      const offsetPosition =
        elementRect.top -
        containerRect.top +
        container.scrollTop -
        navbarHeight;

      container.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleSectionClick = (sectionId: string) => {
    scrollToSection(sectionId);
  };

  // Detect scroll within the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 50);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef]);

  // Set up intersection observers for active section detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observerOptions: IntersectionObserverInit = {
      root: container, // Use the container as the root
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const sectionIds = [
      SCREEN_IDS.OVERVIEW,
      SCREEN_IDS.ABOUT,
      SCREEN_IDS.SEVICE,
      SCREEN_IDS.CONTACT,
    ];

    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(sectionId);
            }
          });
        }, observerOptions);

        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [containerRef]);

  return (
    <nav className={`navigation ${isScrolled ? "scrolled" : ""}`}>
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
