import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  AppContextType,
  WindowState,
  ScreenId,
  WINDOW_STATE,
  Language,
  LANGUAGE,
} from "../types/app";

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    console.error("useAppContext: context not found");

    return undefined;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [runIntro, setRunIntroState] = useState<boolean>(true);
  const [windowState, setWindowStateState] = useState<WindowState>(
    WINDOW_STATE.CLOSED
  );
  const [visibleScreens, setVisibleScreensState] = useState<Set<ScreenId>>(
    new Set()
  );
  const [language, setLanguageState] = useState<Language>(LANGUAGE.EN);

  const setRunIntro = useCallback((run: boolean) => {
    setRunIntroState(run);
  }, []);

  const setWindowState = useCallback(
    (state: WindowState | ((prev: WindowState) => WindowState)) => {
      setWindowStateState(
        typeof state === "function" ? state(windowState) : state
      );
    },
    [windowState]
  );

  const setVisibleScreens = useCallback((screens: Set<ScreenId>) => {
    setVisibleScreensState(screens);
  }, []);

  const clearVisible = useCallback(() => {
    setVisibleScreensState(new Set());
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const contextValue = useMemo(
    () => ({
      runIntro,
      windowState,
      visibleScreens,
      language,
      setRunIntro,
      setWindowState,
      setVisibleScreens,
      clearVisible,
      setLanguage,
    }),
    [
      runIntro,
      windowState,
      visibleScreens,
      language,
      setRunIntro,
      setWindowState,
      setVisibleScreens,
      clearVisible,
      setLanguage,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
