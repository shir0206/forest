import React, { useContext } from "react";

import { AppContextType } from "../domains/context/types";
import { AppContext } from "../shared/contexts/AppContext";

interface ContextBridgeProps {
  children: React.ReactNode;
  contextValue?: AppContextType; // Pass the context value as props
}

/**
 * Portal-safe ContextBridge that properly transfers context to portal components
 * This ensures all context states are accessible inside <Html> components
 */
export function ContextBridge({ children, contextValue }: ContextBridgeProps) {
  // If context value is provided as props, use it
  if (contextValue) {
    return (
      <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
    );
  }

  // Fallback to regular context if no props provided
  const currentContext = useContext(AppContext);

  if (currentContext) {
    return (
      <AppContext.Provider value={currentContext}>
        {children}
      </AppContext.Provider>
    );
  }

  console.error("ContextBridge: No context available");
  return <>{children}</>;
}
