export const BROWSER_MODE = {
  OPEN: "open",
  MINIMIZED: "minimized",
  MAXIMIZED: "maximized",
  CLOSED: "closed",
} as const;

export type BrowserModeType = (typeof BROWSER_MODE)[keyof typeof BROWSER_MODE];

export const SCREEN_IDS = {
  OVERVIEW: "overview",
  ABOUT: "about",
  SERVICE: "service",
  CONTACT: "contact",
} as const;

export type ScreenIdType = (typeof SCREEN_IDS)[keyof typeof SCREEN_IDS];

export interface ScreenConfig {
  id: ScreenIdType;
  title: string;
  component: React.ComponentType;
}

export interface AnimationConfig {
  type: "spring" | "tween";
  stiffness: number;
  damping: number;
  mass: number;
  duration?: number;
  ease?: number[];
}
