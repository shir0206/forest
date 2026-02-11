import { useEffect, useState, useRef } from "react";
import { SCREEN_IDS } from "../helper/const";

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

  // Handle smooth scrolling to section within the container
  const scrollToSection = (sectionId: string) => {
    const container = containerRef.current;
    const element = document.getElementById(sectionId);

    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Calculate position relative to container
      const offsetPosition =
        elementRect.top - containerRect.top + container.scrollTop;

      // Set flag to prevent observer from updating active section during programmatic scroll
      isScrollingRef.current = true;
      setActiveSection(sectionId);

      container.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Reset flag after scroll animation completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
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

      // Calculate responsive margins based on container height
      // Note: We removed navbar height dependency since it's not always available
      const topMargin = 0; // Will be calculated dynamically if needed
      const bottomMargin = Math.floor(containerHeight * 0.6); // 60% of container height

      const observerOptions: IntersectionObserverInit = {
        root: container,
        rootMargin: `-${topMargin}px 0px -${bottomMargin}px 0px`,
        threshold: 0,
      };

      const observers: IntersectionObserver[] = [];

      // Track which sections are currently intersecting
      const intersectingSections = new Set<string>();

      sectionIds.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              // Don't update active section during programmatic scrolling
              if (isScrollingRef.current) return;

              if (entry.isIntersecting) {
                intersectingSections.add(sectionId);
              } else {
                intersectingSections.delete(sectionId);
              }

              // Set the first intersecting section as active (top-most)
              if (intersectingSections.size > 0) {
                const firstIntersecting = sectionIds.find((id) =>
                  intersectingSections.has(id)
                );
                if (firstIntersecting) {
                  setActiveSection(firstIntersecting);
                }
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
  }, [containerRef, sectionIds]);

  return {
    activeSection,
    isScrolled,
    scrollToSection,
  };
};
