// Window State Types
export const WINDOW_STATE = {
  DEFAULT: "default",
  MINIMIZED: "minimized",
  MAXIMIZED: "maximized",
  CLOSED: "closed",
} as const;

export type WindowState = (typeof WINDOW_STATE)[keyof typeof WINDOW_STATE];

// Screen IDs
export const SCREEN_IDS = {
  OVERVIEW: "overview",
  ABOUT: "about",
  EXPERTISE: "expertise",
  CONTACT: "contact",
} as const;

export type ScreenId = (typeof SCREEN_IDS)[keyof typeof SCREEN_IDS];

// Screen Configuration Types
export interface ScreenConfig {
  id: ScreenId;
  Screen: React.ComponentType<{ isVisible: boolean }>;
}

// Application State Types
export interface AppState {
  isAboutOpen: boolean;
  runIntro: boolean;
  windowState: WindowState;
  visibleScreens: Set<ScreenId>;
}

// Context Types
export interface AppContextType extends AppState {
  setIsAboutOpen: (open: boolean) => void;
  setRunIntro: (run: boolean) => void;
  setWindowState: (state: WindowState) => void;
  setVisibleScreens: (screens: Set<ScreenId>) => void;
}

// Animation Types
export interface AnimationConfig {
  type: "spring" | "ease";
  damping?: number;
  stiffness?: number;
  duration?: number;
}
