import type { TextStructure } from "../../../../../i18n/types";
import { CONTACT_CONFIG } from "../config/config";
import type {
  ContactLinkConfig,
  EmailConfig,
  GoogleCalendarConfig,
  WhatsAppConfig,
} from "../types/types";
import { generateGoogleCalendarLink } from "./generateCalendarLink";
import { generateEmailLink } from "./generateEmailLink";
import { generateWhatsAppLink } from "./generateWhatsAppLink";

// Re-export individual generators
export { generateGoogleCalendarLink } from "./generateCalendarLink";
export { generateEmailLink } from "./generateEmailLink";
export { generateWhatsAppLink } from "./generateWhatsAppLink";
export { formatPhoneNumber, isValidWhatsAppNumber } from "./linkValidators";

// Re-export types for convenience
export type {
  ContactLinkConfig,
  ContactLinkType,
  EmailConfig,
  GoogleCalendarConfig,
  WhatsAppConfig,
} from "../types/types";

/**
 * Generates a complete set of contact links using the default configuration
 */
export const getContactLinks = () => ({
  email: generateEmailLink({
    to: CONTACT_CONFIG.email.to,
    subject: CONTACT_CONFIG.email.subject,
    body: CONTACT_CONFIG.email.body,
  }),
  whatsapp: generateWhatsAppLink({
    phoneNumber: CONTACT_CONFIG.whatsapp.phoneNumber,
    text: CONTACT_CONFIG.whatsapp.text,
  }),
  calendar: generateGoogleCalendarLink({
    action: CONTACT_CONFIG.calendar.action,
    text: CONTACT_CONFIG.calendar.text,
    details: CONTACT_CONFIG.calendar.details,
    location: CONTACT_CONFIG.calendar.location,
    addGuests: [...CONTACT_CONFIG.calendar.addGuests],
    conferenceDataVersion: CONTACT_CONFIG.calendar.conferenceDataVersion,
    conferenceSolution: CONTACT_CONFIG.calendar.conferenceSolution,
  }),
});

/**
 * Contact links configuration - Single source of truth for link structure
 */
export const CONTACT_LINKS_CONFIG: ContactLinkConfig[] = [
  {
    id: "linkedin",
    icon: "linkedin",
    type: "external",
    config: {
      url: "https://www.linkedin.com/in/shir-zabolotny-a83b18109/",
    },
  },
  {
    id: "whatsapp",
    icon: "whatsapp",
    type: "whatsapp",
    config: {
      phoneNumber: "+972542098332",
      text: "",
    },
  },
  {
    id: "email",
    icon: "mail",
    type: "email",
    config: {
      to: "shirzabolotny@gmail.com",
      subject: "",
      body: "",
    },
  },
  {
    id: "scheduleMeeting",
    icon: "calendar",
    type: "calendar",
    config: {
      action: "EVENTEDIT",
      text: "",
      details: "",
      location: "Google Meet",
      addGuests: ["shirzabolotny@gmail.com"],
      conferenceDataVersion: 1,
      conferenceSolution: "hangoutsMeet",
    },
  },
];

/**
 * Generated contact link structure
 */
export interface GeneratedContactLink {
  id: string;
  name: string;
  icon: string;
  url: string;
}

/**
 * Type-safe translation interface for contact links
 */
interface ContactTranslation {
  name: string;
  text?: string;
  subject?: string;
  body?: string;
  details?: string;
}

/**
 * Type-safe link generation for each link type
 */
const generateExternalLink = (
  linkConfig: ContactLinkConfig,
  translation: ContactTranslation
) => ({
  id: linkConfig.id,
  name: translation.name,
  icon: linkConfig.icon,
  url: (linkConfig.config as { url: string }).url,
});

const generateWhatsAppLinkWithTranslation = (
  linkConfig: ContactLinkConfig,
  translation: ContactTranslation
) => ({
  id: linkConfig.id,
  name: translation.name,
  icon: linkConfig.icon,
  url: generateWhatsAppLink({
    phoneNumber: (linkConfig.config as WhatsAppConfig).phoneNumber,
    text: translation.text || "",
  }),
});

const generateEmailLinkWithTranslation = (
  linkConfig: ContactLinkConfig,
  translation: ContactTranslation
) => ({
  id: linkConfig.id,
  name: translation.name,
  icon: linkConfig.icon,
  url: generateEmailLink({
    to: (linkConfig.config as EmailConfig).to,
    subject: translation.subject || "",
    body: translation.body || "",
  }),
});

const generateCalendarLinkWithTranslation = (
  linkConfig: ContactLinkConfig,
  translation: ContactTranslation
) => ({
  id: linkConfig.id,
  name: translation.name,
  icon: linkConfig.icon,
  url: generateGoogleCalendarLink({
    action: (linkConfig.config as GoogleCalendarConfig).action,
    text: translation.text || "",
    details: translation.details || "",
    location: "Google Meet",
    addGuests: (linkConfig.config as GoogleCalendarConfig).addGuests,
    conferenceDataVersion: (linkConfig.config as GoogleCalendarConfig)
      .conferenceDataVersion,
    conferenceSolution: (linkConfig.config as GoogleCalendarConfig)
      .conferenceSolution,
  }),
});

/**
 * Generates contact links by combining configuration with translations
 */
export const generateContactLinks = (
  translations: TextStructure["contact"]["links"]
): GeneratedContactLink[] => {
  return CONTACT_LINKS_CONFIG.map((linkConfig) => {
    const translation = translations[
      linkConfig.id as keyof TextStructure["contact"]["links"]
    ] as ContactTranslation;

    switch (linkConfig.type) {
      case "external":
        return generateExternalLink(linkConfig, translation);
      case "whatsapp":
        return generateWhatsAppLinkWithTranslation(linkConfig, translation);
      case "email":
        return generateEmailLinkWithTranslation(linkConfig, translation);
      case "calendar":
        return generateCalendarLinkWithTranslation(linkConfig, translation);
      default:
        throw new Error(`Unknown link type: ${linkConfig.type}`);
    }
  });
};
