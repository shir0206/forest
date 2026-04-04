import React, { useCallback, useEffect, useRef, useState } from "react";

import { SECTIONS } from "../../../domains/browser/config/screens";
import { SectionIdType } from "../../browser/types/types";

/**
 * Configuration interface for section visibility detection
 */
export interface SectionVisibilityConfig {
  /** Threshold for considering a section visible (0-1) */
  threshold: number;
  /** Whether to use passive scroll listeners */
  passive: boolean;
}

/**
 * Default configuration for section visibility
 */
const DEFAULT_CONFIG: SectionVisibilityConfig = {
  threshold: 0.3,
  passive: true,
};

/**
 * Calculates the visibility ratio of an element within a container
 */
const calculateVisibilityRatio = (
  elementRect: DOMRect,
  containerRect: DOMRect
): number => {
  const visibleHeight =
    Math.min(elementRect.bottom, containerRect.bottom) -
    Math.max(elementRect.top, containerRect.top);

  return visibleHeight / elementRect.height;
};

/**
 * Checks if an element is within the container bounds
 */
const isElementInContainer = (
  elementRect: DOMRect,
  containerRect: DOMRect
): boolean => {
  return (
    elementRect.top < containerRect.bottom &&
    elementRect.bottom > containerRect.top
  );
};

/**
 * Handles scroll events to update visible sections
 */
const createScrollHandler = (
  container: HTMLDivElement,
  sectionRefs: React.MutableRefObject<Map<string, HTMLDivElement>>,
  markVisible: (id: SectionIdType) => void,
  threshold: number
) => {
  return () => {
    const containerRect = container.getBoundingClientRect();

    sectionRefs.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();

      // Only check visibility if element is within container bounds
      if (isElementInContainer(rect, containerRect)) {
        const ratio = calculateVisibilityRatio(rect, containerRect);

        if (ratio >= threshold) {
          markVisible(id as SectionIdType);
        }
      }
    });
  };
};

/**
 * Hook for managing section visibility detection
 */
export function useSectionVisibility(
  contentRef: React.RefObject<HTMLDivElement | null>,
  ready: boolean,
  config: Partial<SectionVisibilityConfig> = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const [visibleSections, setVisibleSections] = useState<Set<SectionIdType>>(
    () => new Set([SECTIONS[0].id])
  );

  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const markVisible = useCallback((id: SectionIdType) => {
    setVisibleSections((prev) => {
      if (prev.has(id)) return prev;
      return new Set(prev).add(id);
    });
  }, []);

  const clearVisible = useCallback(() => {
    setVisibleSections(new Set());
  }, []);

  const setSectionRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        sectionRefs.current.set(id, el);
      } else {
        sectionRefs.current.delete(id);
      }
    },
    []
  );

  useEffect(() => {
    if (!ready || !contentRef.current) return;

    const container = contentRef.current;
    const handleScroll = createScrollHandler(
      container,
      sectionRefs,
      markVisible,
      mergedConfig.threshold
    );

    container.addEventListener("scroll", handleScroll, {
      passive: mergedConfig.passive,
    });

    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [ready, markVisible, mergedConfig, contentRef]);

  return {
    visibleSections,
    clearVisible,
    setSectionRef,
    config: mergedConfig,
  };
}
