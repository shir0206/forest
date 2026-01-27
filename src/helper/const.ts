import { PositionThreeD } from "./types";
import { WhatsAppConfig, GoogleCalendarConfig, EmailConfig } from "./types";
import ExpertiseCards from "../components/expertiseCards/ExpertiseCards";
import AboutMe from "../components/AboutMe/AboutMe";
import { ScreenConfig } from "./types";
import Overview from "../components/overview/Overview";
import Contact from "@/components/contact/Contact";

export const backgroundFile: string =
  "./hdri/" + "Gemini_Generated_Image_uxx26zuxx26zuxx2 (1).exr";
export const initCameraPos: PositionThreeD = [-0.0069, -0.9996, -0.0255];
export const butterflyPos: PositionThreeD = [-0.42, -0.1635, -0.4365];

export const sceneAnimationPositions: PositionThreeD[] = [
  [-0.0069, -0.9996, -0.0255],
  [-0.0386, -0.9987, -0.0331],
  [-0.7787, -0.056, -0.6249],
  [-0.5161, 0.1915, 0.8348],
  [0.59, 0.15, 0.7885],
  [0.6, 0.24, 0.6234],
];

export const SCREENS: ReadonlyArray<ScreenConfig> = [
  { id: "overview", Screen: Overview },
  { id: "about", Screen: AboutMe },
  { id: "expertise", Screen: ExpertiseCards },
  { id: "contact", Screen: Contact },
] as const;

export const generateWhatsAppLink = (config: WhatsAppConfig): string =>
  `https://wa.me/${config.phoneNumber}?text=${encodeURIComponent(config.text)}`;

export const generateGoogleCalendarLink = (
  config: GoogleCalendarConfig
): string => {
  const guests = config.addGuests.join(",");
  const conferenceDataVersion = config.conferenceDataVersion
    ? `&conferenceDataVersion=${config.conferenceDataVersion}`
    : "";
  const conferenceSolution = config.conferenceSolution
    ? `&conferenceSolution=${config.conferenceSolution}`
    : "";
  return `https://calendar.google.com/calendar/u/0/r/eventedit?action=${
    config.action
  }&text=${encodeURIComponent(config.text)}&dates=${config.dates.start}/${
    config.dates.end
  }&details=${encodeURIComponent(config.details)}&location=${encodeURIComponent(
    config.location
  )}&add=${encodeURIComponent(
    guests
  )}${conferenceDataVersion}${conferenceSolution}`;
};

export const generateEmailLink = (config: EmailConfig): string =>
  `mailto:${config.to}?subject=${encodeURIComponent(
    config.subject
  )}&body=${encodeURIComponent(config.body)}`;
