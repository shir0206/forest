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
} from "../types/app";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
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

  const contextValue = useMemo(
    () => ({
      runIntro,
      windowState,
      visibleScreens,
      setRunIntro,
      setWindowState,
      setVisibleScreens,
      clearVisible,
    }),
    [
      runIntro,
      windowState,
      visibleScreens,
      setRunIntro,
      setWindowState,
      setVisibleScreens,
      clearVisible,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
