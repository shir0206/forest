import React, { useCallback, useEffect, useRef, useState } from "react";

import { SCREEN_IDS, ScreenIdType } from "@/domains/browser/types";

export interface ScreenVisibilityConfig {
  threshold: number;
  passive: boolean;
}

const DEFAULT_CONFIG: ScreenVisibilityConfig = {
  threshold: 0.3,
  passive: true,
};

const calculateVisibilityRatio = (
  elementRect: DOMRect,
  containerRect: DOMRect
): number => {
  const visibleHeight =
    Math.min(elementRect.bottom, containerRect.bottom) -
    Math.max(elementRect.top, containerRect.top);

  return visibleHeight / elementRect.height;
};

const isElementInContainer = (
  elementRect: DOMRect,
  containerRect: DOMRect
): boolean => {
  return (
    elementRect.top < containerRect.bottom &&
    elementRect.bottom > containerRect.top
  );
};

const createScrollHandler = (
  container: HTMLDivElement,
  screenRefs: React.MutableRefObject<Map<string, HTMLDivElement>>,
  markVisible: (id: ScreenIdType) => void,
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
          markVisible(id as ScreenIdType);
        }
      }
    });
  };
};

export function useScreenVisibility(
  contentRef: React.RefObject<HTMLDivElement | null>,
  ready: boolean,
  config: Partial<ScreenVisibilityConfig> = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const [visibleScreens, setVisibleScreens] = useState<Set<ScreenIdType>>(
    () => new Set([SCREEN_IDS.OVERVIEW])
  );

  const screenRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const markVisible = useCallback((id: ScreenIdType) => {
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

    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [ready, markVisible, mergedConfig, contentRef]);

  return {
    visibleScreens,
    clearVisible,
    setScreenRef,
    config: mergedConfig,
  };
}
