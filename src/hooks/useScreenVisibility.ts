import React, { useEffect, useState, useRef, useCallback } from "react";
import { SCREENS } from "../helper/const";

export function useScreenVisibility(
  contentRef: React.RefObject<HTMLDivElement | null>,
  ready: boolean,
  threshold = 0.3
) {
  const [visibleScreens, setVisibleScreens] = useState<Set<string>>(
    () => new Set([SCREENS[0].id])
  );
  const screenRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const markVisible = useCallback((id: string) => {
    setVisibleScreens((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
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

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();

      screenRefs.current.forEach((el, id) => {
        const rect = el.getBoundingClientRect();
        const visibleHeight =
          Math.min(rect.bottom, containerRect.bottom) -
          Math.max(rect.top, containerRect.top);
        const ratio = visibleHeight / rect.height;

        if (ratio >= threshold) {
          markVisible(id);
        }
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => container.removeEventListener("scroll", handleScroll);
  }, [ready, markVisible, threshold, contentRef]);

  return { visibleScreens, clearVisible, setScreenRef };
}
