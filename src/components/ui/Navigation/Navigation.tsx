import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../contexts/AppContext";
import { useTranslation } from "../../../hooks/useTranslation";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import "./navigation.scss";

interface NavigationItem {
  id: string;
  label: string;
}

const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const appContext = useAppContext();

  // Handle case where context might be undefined
  if (!appContext) {
    console.error("Navigation: AppContext not found");
    return null;
  }

  const { setLanguage } = appContext;

  // Navigation items based on screens
  const navigationItems: NavigationItem[] = [
    { id: "overview", label: t.navigation.overview },
    { id: "about", label: t.navigation.about },
    { id: "expertise", label: t.navigation.expertise },
    { id: "contact", label: t.navigation.contact },
  ];

  const [activeSection, setActiveSection] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle smooth scrolling to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate offset for fixed navigation
      const navbarHeight = 80; // Adjust based on your navigation height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleSectionClick = (sectionId: string) => {
    scrollToSection(sectionId);
  };

  // Set up intersection observers for active section detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set up intersection observers for active section detection
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const sectionIds = ["overview", "about", "expertise", "contact"];
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
  }, []); // Empty dependency array - runs once

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
