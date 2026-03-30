// Section configuration
import { SECTION_IDS } from "../../browser/types";
import About from "../../sections/About/About";
import Contact from "../../sections/Contact/Contact";
import Overview from "../../sections/Overview/Overview";
import Service from "../../sections/Service/Service";

export const SECTIONS = [
  { id: SECTION_IDS.OVERVIEW, Screen: Overview },
  { id: SECTION_IDS.ABOUT, Screen: About },
  { id: SECTION_IDS.SERVICE, Screen: Service },
  { id: SECTION_IDS.CONTACT, Screen: Contact },
] as const;
