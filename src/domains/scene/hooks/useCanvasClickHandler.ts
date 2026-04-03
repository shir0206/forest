import { useCallback } from "react";

import { BROWSER_MODE, BrowserModeType } from "../../browser/types";

/**
 * Creates a canvas click handler that closes the browser window
 * @param browserMode - Current browser mode state
 * @param setBrowserMode - Function to update browser mode
 * @returns Memoized click handler function
 */
export function useCanvasClickHandler(
  browserMode: BrowserModeType,
  setBrowserMode: (state: BrowserModeType) => void
) {
  return useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (browserMode !== BROWSER_MODE.CLOSED) {
        setBrowserMode(BROWSER_MODE.CLOSED);
      }
    },
    [browserMode, setBrowserMode]
  );
}
