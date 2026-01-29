import { WindowState, ScreenId } from "../types/app";

// Application Configuration
export const APP_CONFIG = {
  basePath: import.meta.env.BASE_URL || "/",
  animationDuration: 300,
  transitionDuration: 200,
  debounceDelay: 100,
} as const;

// Window State Constants
export const WINDOW_STATES = {
  DEFAULT: "default" as WindowState,
  MINIMIZED: "minimized" as WindowState,
  MAXIMIZED: "maximized" as WindowState,
  CLOSED: "closed" as WindowState,
} as const;

// Re-export screen IDs from types
export { SCREEN_IDS } from "../types/app";

// Default window state
export const DEFAULT_WINDOW_STATE: WindowState = WINDOW_STATES.DEFAULT;

// Animation configurations
export const ANIMATION_CONFIG = {
  spring: {
    type: "spring",
    damping: 25,
    stiffness: 300,
  },
  ease: {
    type: "ease",
    duration: 0.3,
  },
} as const;
