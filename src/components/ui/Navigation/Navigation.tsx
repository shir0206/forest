import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../../../contexts/AppContext";
import { SCREENS } from "../../../helper/const";
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

  const { setLanguage, language } = appContext;

  // Navigation items based on screens
  const navigationItems: NavigationItem[] = [
    { id: "overview", label: t.navigation.overview },
    { id: "about", label: t.navigation.about },
    { id: "expertise", label: t.navigation.expertise },
    { id: "contact", label: t.navigation.contact },
  ];

  const [activeSection, setActiveSection] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const observerRefs = useRef<Map<string, IntersectionObserver>>(new Map());
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

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

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    if (newLanguage === "en" || newLanguage === "he") {
      setLanguage(newLanguage as "en" | "he");
    }
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
    const options = {
      root: null,
      rootMargin: "-20% 0px -80% 0px",
      threshold: 0.1,
    };

    navigationItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        sectionRefs.current.set(item.id, element);

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(item.id);
            }
          });
        }, options);

        observer.observe(element);
        observerRefs.current.set(item.id, observer);
      }
    });

    // Set initial active section
    const firstVisible = document.getElementById(navigationItems[0].id);
    if (firstVisible) {
      setActiveSection(navigationItems[0].id);
    }

    return () => {
      // Clean up observers
      observerRefs.current.forEach((observer) => {
        observer.disconnect();
      });
      observerRefs.current.clear();
    };
  }, [navigationItems]);

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
              onClick={() => scrollToSection(item.id)}
              aria-label={`Navigate to ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Language Switcher */}
        <div className="navigation-actions">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
