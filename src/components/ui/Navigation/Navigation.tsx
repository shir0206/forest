import React, { useEffect, useState, useRef } from "react";
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
  const navbarRef = useRef<HTMLElement | null>(null);

  // Handle smooth scrolling to section within the container
  const scrollToSection = (sectionId: string) => {
    const container = containerRef.current;
    const element = document.getElementById(sectionId);

    if (element && container) {
      // Calculate actual navbar height using ref
      const navbar = navbarRef.current;
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;

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

  // Set up intersection observers for active section detection with responsive margins
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateObservers = () => {
      const containerHeight = container.clientHeight;

      // Calculate actual navbar height using ref
      const navbar = navbarRef.current;
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;

      // Calculate responsive margins based on container height
      const topMargin = navbarHeight;
      const bottomMargin = Math.floor(containerHeight * 0.6); // 60% of container height

      const observerOptions: IntersectionObserverInit = {
        root: container,
        rootMargin: `-${topMargin}px 0px -${bottomMargin}px 0px`,
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

      return observers;
    };

    let observers = updateObservers();

    // Recreate observers on resize
    const handleResize = () => {
      observers.forEach((observer) => observer.disconnect());
      observers = updateObservers();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef]);

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
