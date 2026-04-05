import {
  BrowserModeType,
  SectionIdType,
} from "../../../domains/browser/types/types";
import { DeviceType } from "../../device";
import { LanguageType } from "../../../i18n/types";

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
  visibleSectionIds: Set<SectionIdType>;
  setVisibleSectionIds: (sections: Set<SectionIdType>) => void;
  clearVisible: () => void;
}
