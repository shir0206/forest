import { useContext } from "react";

import { AppContext } from "./AppContext";
import { AppContextType } from "./types/types";

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
};

/**
 * Enhanced hook with better error handling and debugging
 */
export const useEnhancedAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    console.error("useEnhancedAppContext: context not found");
    return null;
  }

  return context;
};
