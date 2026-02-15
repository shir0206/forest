import React, { useEffect, useState, useRef, useCallback } from "react";
import { SCREENS } from "../../config/app";

/**
 * Configuration interface for screen visibility detection
 */
export interface ScreenVisibilityConfig {
  /** Threshold for considering a screen visible (0-1) */
  threshold: number;
  /** Whether to use passive scroll listeners */
  passive: boolean;
}

/**
 * Default configuration for screen visibility
 */
const DEFAULT_CONFIG: ScreenVisibilityConfig = {
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
 * Handles scroll events to update visible screens
 */
const createScrollHandler = (
  container: HTMLDivElement,
  screenRefs: React.MutableRefObject<Map<string, HTMLDivElement>>,
  markVisible: (id: string) => void,
  threshold: number
) => {
  return () => {
    const containerRect = container.getBoundingClientRect();

    screenRefs.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();

      // Only check visibility if element is within container bounds
      if (isElementInContainer(rect, containerRect)) {
        const ratio = calculateVisibilityRatio(rect, containerRect);

        if (ratio >= threshold) {
          markVisible(id);
        }
      }
    });
  };
};

/**
 * Hook for managing screen visibility detection
 */
export function useScreenVisibility(
  contentRef: React.RefObject<HTMLDivElement | null>,
  ready: boolean,
  config: Partial<ScreenVisibilityConfig> = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const [visibleScreens, setVisibleScreens] = useState<Set<string>>(
    () => new Set([SCREENS[0].id])
  );

  const screenRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const markVisible = useCallback((id: string) => {
    setVisibleScreens((prev) => {
      if (prev.has(id)) return prev;
      return new Set(prev).add(id);
    });
  }, []);

  const clearVisible = useCallback(() => {
    setVisibleScreens(new Set());
  }, []);

  const setScreenRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        screenRefs.current.set(id, el);
      } else {
        screenRefs.current.delete(id);
      }
    },
    []
  );

  useEffect(() => {
    if (!ready || !contentRef.current) return;

    const container = contentRef.current;
    const handleScroll = createScrollHandler(
      container,
      screenRefs,
      markVisible,
      mergedConfig.threshold
    );

    container.addEventListener("scroll", handleScroll, {
      passive: mergedConfig.passive,
    });

    handleScroll(); // Initial check

    return () => container.removeEventListener("scroll", handleScroll);
  }, [ready, markVisible, mergedConfig, contentRef]);

  return {
    visibleScreens,
    clearVisible,
    setScreenRef,
    config: mergedConfig,
  };
}
