import { useEffect, useState, useRef } from "react";
import { SCREEN_IDS } from "../types/app";

export interface UseScrollNavigationProps {
  containerRef: React.RefObject<HTMLElement | null>;
  sectionIds?: string[];
}

export interface UseScrollNavigationReturn {
  activeSection: string;
  isScrolled: boolean;
  scrollToSection: (sectionId: string) => void;
}

export const useScrollNavigation = ({
  containerRef,
  sectionIds = [
    SCREEN_IDS.OVERVIEW,
    SCREEN_IDS.ABOUT,
    SCREEN_IDS.SEVICE,
    SCREEN_IDS.CONTACT,
  ],
}: UseScrollNavigationProps): UseScrollNavigationReturn => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrollingRef = useRef(false);

  const scrollToSection = (sectionId: string) => {
    const container = containerRef.current;
    const element = document.getElementById(sectionId);

    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const offsetPosition =
        elementRect.top - containerRect.top + container.scrollTop;

      isScrollingRef.current = true;
      setActiveSection(sectionId);

      container.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 50);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef]);

  // New approach: Check which section has 50%+ visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;

      let maxVisibleSection = "";
      let maxVisiblePercentage = 0;

      sectionIds.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (!element) return;

        const elementRect = element.getBoundingClientRect();
        const elementTop = elementRect.top;
        const elementBottom = elementRect.bottom;
        const elementHeight = elementRect.height;

        // Calculate visible portion
        const visibleTop = Math.max(elementTop, containerTop);
        const visibleBottom = Math.min(elementBottom, containerBottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        const visiblePercentage = (visibleHeight / elementHeight) * 100;

        // Section becomes active when 50%+ is visible
        if (
          visiblePercentage >= 50 &&
          visiblePercentage > maxVisiblePercentage
        ) {
          maxVisibleSection = sectionId;
          maxVisiblePercentage = visiblePercentage;
        }
      });

      if (maxVisibleSection && maxVisibleSection !== activeSection) {
        setActiveSection(maxVisibleSection);
      }
    };

    container.addEventListener("scroll", handleScroll);
    // Run once on mount to set initial active section
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef, sectionIds, activeSection]);

  return {
    activeSection,
    isScrolled,
    scrollToSection,
  };
};
