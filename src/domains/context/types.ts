import { LanguageType } from "../../i18n/types";
import { BrowserModeType, ScreenIdType } from "../browser/types";
import { DeviceType } from "../device";

export interface AppState {
  browserMode: BrowserModeType;
  language: LanguageType;
  device: DeviceType;
}

export interface AppContextType extends AppState {
  language: LanguageType;
  setBrowserMode: (browserMode: BrowserModeType) => void;
  setLanguage: (language: LanguageType) => void;
  setDevice: (device: DeviceType) => void;
  runIntro: boolean;
  setRunIntro: (runIntro: boolean) => void;
  visibleScreenIds: Set<ScreenIdType>;
  setVisibleScreenIds: (screens: Set<ScreenIdType>) => void;
  clearVisible: () => void;
}
