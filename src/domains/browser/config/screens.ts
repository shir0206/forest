// Screen configuration
import AboutMe from "../../../components/sections/AboutMe/AboutMe";
import Overview from "../../../components/sections/Overview/Overview";
import Service from "../../../components/sections/Service/Service";
import Contact from "../../../components/ui/Contact/Contact";
import { SCREEN_IDS } from "../../browser/types";

export const SCREENS = [
  { id: SCREEN_IDS.OVERVIEW, Screen: Overview },
  { id: SCREEN_IDS.ABOUT, Screen: AboutMe },
  { id: SCREEN_IDS.SERVICE, Screen: Service },
  { id: SCREEN_IDS.CONTACT, Screen: Contact },
] as const;
