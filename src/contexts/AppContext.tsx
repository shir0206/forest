import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { AppContextType, WindowState, ScreenId } from "../types/app";

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
  const [isAboutOpen, setIsAboutOpenState] = useState<boolean>(false);
  const [runIntro, setRunIntroState] = useState<boolean>(true);
  const [windowState, setWindowStateState] = useState<WindowState>("default");
  const [visibleScreens, setVisibleScreensState] = useState<Set<ScreenId>>(
    new Set()
  );

  const setIsAboutOpen = useCallback((open: boolean) => {
    setIsAboutOpenState(open);
  }, []);

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
      isAboutOpen,
      runIntro,
      windowState,
      visibleScreens,
      setIsAboutOpen,
      setRunIntro,
      setWindowState,
      setVisibleScreens,
      clearVisible,
    }),
    [
      isAboutOpen,
      runIntro,
      windowState,
      visibleScreens,
      setIsAboutOpen,
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
