// Application Configuration
export const APP_CONFIG = {
  basePath: import.meta.env.BASE_URL || "/",
  animationDuration: 300,
  transitionDuration: 200,
  debounceDelay: 100,
} as const;

// Screen configuration
import AboutMe from "../components/sections/AboutMe/AboutMe";
import Overview from "../components/sections/Overview/Overview";
import Service from "../components/sections/Service/Service";
import Contact from "../components/ui/Contact/Contact";

export const SCREENS = [
  { id: "overview", Screen: Overview },
  { id: "about", Screen: AboutMe },
  { id: "service", Screen: Service },
  { id: "contact", Screen: Contact },
] as const;

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
