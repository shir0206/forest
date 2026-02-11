import { SCREEN_IDS } from "../types/app";
import {
  generateWhatsAppLink,
  generateGoogleCalendarLink,
  generateEmailLink,
} from "../utils/links";
import Service from "../components/sections/Service/Service";
import AboutMe from "../components/sections/AboutMe/AboutMe";
import Overview from "../components/sections/Overview/Overview";
import Contact from "../components/ui/Contact/Contact";

// Re-export the functions for backward compatibility
export { generateWhatsAppLink, generateGoogleCalendarLink, generateEmailLink };

// Re-export screen IDs for backward compatibility
export { SCREEN_IDS };

// Screen configuration for backward compatibility
export const SCREENS = [
  { id: SCREEN_IDS.OVERVIEW, Screen: Overview },
  { id: SCREEN_IDS.ABOUT, Screen: AboutMe },
  { id: SCREEN_IDS.SEVICE, Screen: Service },
  { id: SCREEN_IDS.CONTACT, Screen: Contact },
] as const;
