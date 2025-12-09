import { PositionThreeD } from "./types";
import { WhatsAppConfig, GoogleCalendarConfig, EmailConfig } from "./types";

export const backgroundFile: string =
  "./hdri/Gemini_Generated_Image_oo7v4roo7v4roo7v_upscayl_2x_digital-art-4x.done2(4).exr";

export const initCameraPos: PositionThreeD = [-0.0069, -0.9996, -0.0255];
export const butterflyPos: PositionThreeD = [-0.42, -0.15, -0.4365];

export const sceneAnimationPositions: PositionThreeD[] = [
  [-0.0069, -0.9996, -0.0255],
  [-0.0386, -0.9987, -0.0331],
  [-0.7787, -0.056, -0.6249],
  [-0.5161, 0.1915, 0.8348],
  [0.59, 0.15, 0.7885],
  [0.6, 0.24, 0.6234],
];

export const generateWhatsAppLink = (config: WhatsAppConfig): string =>
  `https://wa.me/${config.phoneNumber}?text=${encodeURIComponent(config.text)}`;

export const generateGoogleCalendarLink = (
  config: GoogleCalendarConfig
): string => {
  const guests = config.addGuests.join(",");
  return `https://calendar.google.com/calendar/render?action=${
    config.action
  }&text=${encodeURIComponent(config.text)}&dates=${config.dates.start}/${
    config.dates.end
  }&details=${encodeURIComponent(config.details)}&location=${encodeURIComponent(
    config.location
  )}&add=${encodeURIComponent(guests)}`;
};

export const generateEmailLink = (config: EmailConfig): string =>
  `mailto:${config.to}?subject=${encodeURIComponent(
    config.subject
  )}&body=${encodeURIComponent(config.body)}`;
