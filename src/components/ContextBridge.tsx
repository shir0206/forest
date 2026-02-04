import React, { useContext, useMemo } from "react";
import { AppContext } from "../contexts/AppContext";

interface ContextBridgeProps {
  children: React.ReactNode;
  contextValue?: any; // Pass the context value as props
}

/**
 * Portal-safe ContextBridge that properly transfers context to portal components
 * This ensures all context states are accessible inside <Html> components
 */
export function ContextBridge({ children, contextValue }: ContextBridgeProps) {
  // If context value is provided as props, use it
  if (contextValue) {
    console.log("ContextBridge: Using provided context value", {
      runIntro: contextValue.runIntro,
      windowState: contextValue.windowState,
      visibleScreens: Array.from(contextValue.visibleScreens),
      language: contextValue.language,
    });

    return (
      <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
    );
  }

  // Fallback to regular context if no props provided
  const currentContext = useContext(AppContext);

  if (currentContext) {
    console.log("ContextBridge: Using current context", {
      runIntro: currentContext.runIntro,
      windowState: currentContext.windowState,
      visibleScreens: Array.from(currentContext.visibleScreens),
      language: currentContext.language,
    });

    return (
      <AppContext.Provider value={currentContext}>
        {children}
      </AppContext.Provider>
    );
  }

  console.error("ContextBridge: No context available");
  return <>{children}</>;
}

/**
 * Hook to access the enhanced context with better error handling
 */
export function useEnhancedAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    console.error("useEnhancedAppContext: context not found");
    return null;
  }

  return context;
}
