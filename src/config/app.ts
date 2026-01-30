// Application Configuration
export const APP_CONFIG = {
  basePath: import.meta.env.BASE_URL || "/",
  animationDuration: 300,
  transitionDuration: 200,
  debounceDelay: 100,
} as const;

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
