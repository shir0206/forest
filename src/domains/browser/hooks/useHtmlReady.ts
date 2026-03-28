import { useEffect, useRef, useState } from "react";

export function useHtmlReady<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let raf: number;

    const check = () => {
      if (ref.current) {
        setReady(true);
      } else {
        raf = requestAnimationFrame(check);
      }
    };

    check();

    return () => cancelAnimationFrame(raf);
  }, []);

  return { ref, ready };
}
