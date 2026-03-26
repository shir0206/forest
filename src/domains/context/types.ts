import { Language } from "../../i18n/types";

import { WindowState } from "../browser/types";

export type DeviceType = "mobile" | "tablet" | "desktop";

export const DEVICE_TYPE = {
  MOBILE: "mobile" as DeviceType,
  TABLET: "tablet" as DeviceType,
  DESKTOP: "desktop" as DeviceType,
} as const;

export interface AppState {
  windowState: WindowState;
  language: Language;
  device: DeviceType;
}

export interface AppContextType extends AppState {
  language: Language;
  setWindowState: (windowState: WindowState) => void;
  setLanguage: (language: Language) => void;
  setDevice: (device: DeviceType) => void;
  runIntro: boolean;
  setRunIntro: (runIntro: boolean) => void;
}
