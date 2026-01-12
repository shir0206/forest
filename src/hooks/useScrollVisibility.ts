import { useEffect } from "react";

type Options = {
  container: HTMLElement;
  elements: Map<string, HTMLElement>;
  threshold?: number;
  onVisible: (id: string) => void;
};

export function useScrollVisibility({
  container,
  elements,
  threshold = 0.3,
  onVisible,
}: Options) {
  useEffect(() => {
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();

      elements.forEach((el, id) => {
        const rect = el.getBoundingClientRect();

        const visibleHeight =
          Math.min(rect.bottom, containerRect.bottom) -
          Math.max(rect.top, containerRect.top);

        const ratio = visibleHeight / rect.height;

        if (ratio >= threshold) {
          onVisible(id);
        }
      });
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // initial run

    return () => container.removeEventListener("scroll", handleScroll);
  }, [container, elements, threshold, onVisible]);
}
