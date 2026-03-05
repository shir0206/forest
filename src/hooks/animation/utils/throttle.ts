/**
 * Throttle function calls to a maximum frequency
 * @param func The function to throttle
 * @param delay The minimum delay between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    const now = performance.now();

    if (now - lastCall >= delay) {
      // If enough time has passed, call the function immediately
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      func(...args);
    } else {
      // Otherwise, schedule it for later
      lastArgs = args;
      if (timeoutId === null) {
        timeoutId = window.setTimeout(() => {
          lastCall = performance.now();
          timeoutId = null;
          if (lastArgs) {
            func(...lastArgs);
            lastArgs = null;
          }
        }, delay - (now - lastCall));
      }
    }
  };
}

/**
 * Throttle function calls using requestAnimationFrame for 60fps maximum
 * @param func The function to throttle
 * @returns Throttled function
 */
export function throttleRAF<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let isScheduled = false;

  return (...args: Parameters<T>) => {
    lastArgs = args;

    if (!isScheduled) {
      isScheduled = true;
      rafId = requestAnimationFrame(() => {
        isScheduled = false;
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null;
        }
      });
    }
  };
}
