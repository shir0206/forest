import { PositionThreeD } from "./types";
import { WhatsAppConfig, GoogleCalendarConfig, EmailConfig } from "./types";
import ExpertiseCards from "../components/expertiseCards/ExpertiseCards";
import AboutMe from "../components/AboutMe/AboutMe";
import { ScreenConfig } from "./types";
import Overview from "../components/overview/Overview";
import Contact from "../components/contact/Contact";

// Get the base path from Vite's environment
const basePath = import.meta.env.BASE_URL || "/";

export const backgroundFile: string =
  basePath + "hdri/Gemini_Generated_Image_c4rtmic4rtmic4rt.exr";
// "Gemini_Generated_Image_eykgkpeykgkpeykg.exr";
// "Gemini_Generated_Image_fohgzmfohgzmfohg.exr";
//  "Gemini_Generated_Image_h6the9h6the9h6th.exr";
// "Gemini_Generated_Image_hcpvyahcpvyahcpv.exr";
//  "Gemini_Generated_Image_hue2ykhue2ykhue2.exr";
// "Gemini_Generated_Image_johg4bjohg4bjohg.exr";
//  "Gemini_Generated_Image_l0uxwfl0uxwfl0ux.exr";
// "Gemini_Generated_Image_lb7h74lb7h74lb7h.exr";
// "Gemini_Generated_Image_me8b31me8b31me8b.exr";
//"Gemini_Generated_Image_mrpfnvmrpfnvmrpf.exr";
// "Gemini_Generated_Image_n3exu0n3exu0n3ex.exr";
// "Gemini_Generated_Image_pe71nhpe71nhpe71.exr";
// "Gemini_Generated_Image_s0krj8s0krj8s0kr.exr";
// "Gemini_Generated_Image_svqyyfsvqyyfsvqy.exr";
// "Gemini_Generated_Image_tyz01ityz01ityz0 (1).exr";
// "Gemini_Generated_Image_uv8utuv8utuv8utu.exr";
// "Gemini_Generated_Image_uxx26zuxx26zuxx2 (1) 2.exr";
//"Gemini_Generated_Image_x3ggayx3ggayx3gg.exr";
// "forest.exr";
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
