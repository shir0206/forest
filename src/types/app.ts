// Window State Types
export type WindowState = "open" | "minimized" | "maximized" | "closed";
export type Language = "en" | "he";
export const WINDOW_STATE = {
  OPEN: "open" as WindowState,
  MINIMIZED: "minimized" as WindowState,
  MAXIMIZED: "maximized" as WindowState,
  CLOSED: "closed" as WindowState,
} as const;

export const LANGUAGE = {
  EN: "en" as Language,
  HE: "he" as Language,
} as const;

// Screen IDs
export const SCREEN_IDS = {
  OVERVIEW: "overview",
  ABOUT: "about",
  SEVICE: "service",
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
  runIntro: boolean;
  windowState: WindowState;
  visibleScreens: Set<ScreenId>;
}

// Context Types
export interface AppContextType extends AppState {
  language: Language;
  setRunIntro: (run: boolean) => void;
  setWindowState: (state: WindowState) => void;
  setVisibleScreens: (screens: Set<ScreenId>) => void;
  clearVisible: () => void;
  setLanguage: (lang: Language) => void;
}

// Import TextStructure for the context
import type { TextStructure } from "../i18n/types";

// Animation Types
export interface AnimationConfig {
  type: "spring" | "ease";
  damping?: number;
  stiffness?: number;
  duration?: number;
}

export type MovingDirection = "left" | "right";
export const MOVING_DIRECTION = {
  LEFT: "left" as MovingDirection,
  RIGHT: "right" as MovingDirection,
} as const;

// Additional types from legacy helper/types.ts
export type PositionThreeD = [number, number, number];

export interface WhatsAppConfig {
  phoneNumber: string;
  text: string;
}

export interface GoogleCalendarConfig {
  action: string;
  text: string;
  dates: {
    start: string;
    end: string;
  };
  details: string;
  location: string;
  addGuests: string[];
  conferenceDataVersion?: number;
  conferenceSolution?: string;
}

export interface EmailConfig {
  to: string;
  subject: string;
  body: string;
}

export type SectionComponent = React.ComponentType<{
  isVisible: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}>;
