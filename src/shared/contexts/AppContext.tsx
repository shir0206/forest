import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  BROWSER_MODE,
  BrowserModeType,
  SectionIdType,
} from "../../domains/browser/types";
import { AppContextType } from "../../domains/context/types";
import { detectDevice, DeviceType } from "../../domains/device";
import { LANGUAGE, LanguageType } from "../../i18n/types";

export const AppContext = createContext<AppContextType | undefined>(undefined);

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [runIntro, setRunIntroState] = useState<boolean>(true);
  const [browserMode, setBrowserModeState] = useState<BrowserModeType>(
    BROWSER_MODE.CLOSED
  );
  const [visibleSectionIds, setVisibleSectionIdsState] = useState<
    Set<SectionIdType>
  >(new Set());
  const [language, setLanguageState] = useState<LanguageType>(LANGUAGE.EN);
  const [device, setDeviceState] = useState<DeviceType>(detectDevice());

  const setRunIntro = useCallback((run: boolean) => {
    setRunIntroState(run);
  }, []);

  const setBrowserMode = useCallback(
    (state: BrowserModeType | ((prev: BrowserModeType) => BrowserModeType)) => {
      setBrowserModeState(
        typeof state === "function" ? state(browserMode) : state
      );
    },
    [browserMode]
  );

  const setVisibleSectionIds = useCallback((sections: Set<SectionIdType>) => {
    setVisibleSectionIdsState(sections);
  }, []);

  const clearVisible = useCallback(() => {
    setVisibleSectionIdsState(new Set());
  }, []);

  const setLanguage = useCallback((lang: LanguageType) => {
    setLanguageState(lang);
  }, []);

  const setDevice = useCallback((device: DeviceType) => {
    setDeviceState(device);
  }, []);

  const contextValue = useMemo(
    () => ({
      runIntro,
      browserMode,
      visibleSectionIds,
      language,
      device,
      setRunIntro,
      setBrowserMode,
      setVisibleSectionIds,
      clearVisible,
      setLanguage,
      setDevice,
    }),
    [
      runIntro,
      browserMode,
      visibleSectionIds,
      language,
      device,
      setRunIntro,
      setBrowserMode,
      setVisibleSectionIds,
      clearVisible,
      setLanguage,
      setDevice,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
