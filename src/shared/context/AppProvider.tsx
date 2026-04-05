import React, { useCallback, useMemo, useState } from "react";

import {
  BROWSER_MODE,
  BrowserModeType,
  SectionIdType,
} from "../../domains/browser/types/types";
import { LANGUAGE, LanguageType } from "../../i18n/types";
import { DeviceType } from "../device";
import { detectDevice } from "../device/hooks/useDeviceDetection";
import { AppContext } from "./AppContext";

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
  const [device, setDeviceState] = useState<DeviceType>(detectDevice().type);

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
