import { CONTACT_CONFIG } from "../config/links";
import type { TextStructure } from "../types/translations";

/**
 * Configuration types for link generation
 */
export interface WhatsAppConfig {
  phoneNumber: string;
  text: string;
}

export interface GoogleCalendarConfig {
  action: string;
  text: string;
  dates: {
    start: string;
    end: string;
  };
  details: string;
  location: string;
  addGuests: string[];
  conferenceDataVersion?: number;
  conferenceSolution?: string;
}

export interface EmailConfig {
  to: string;
  subject: string;
  body: string;
}

/**
 * Contact link configuration types
 */
export type ContactLinkType = "external" | "email" | "whatsapp" | "calendar";

export interface ContactLinkConfig {
  id: string;
  icon: string;
  type: ContactLinkType;
  config: WhatsAppConfig | GoogleCalendarConfig | EmailConfig | { url: string };
}

/**
 * Generates a WhatsApp link with the provided configuration
 */
export const generateWhatsAppLink = (config: WhatsAppConfig): string =>
  `https://wa.me/${config.phoneNumber}?text=${encodeURIComponent(config.text)}`;

/**
 * Generates a Google Calendar link with the provided configuration
 */
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

/**
 * Generates an email link with the provided configuration
 */
export const generateEmailLink = (config: EmailConfig): string =>
  `mailto:${config.to}?subject=${encodeURIComponent(
    config.subject
  )}&body=${encodeURIComponent(config.body)}`;

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
    dates: CONTACT_CONFIG.calendar.dates,
    details: CONTACT_CONFIG.calendar.details,
    location: CONTACT_CONFIG.calendar.location,
    addGuests: [...CONTACT_CONFIG.calendar.addGuests],
    conferenceDataVersion: CONTACT_CONFIG.calendar.conferenceDataVersion,
    conferenceSolution: CONTACT_CONFIG.calendar.conferenceSolution,
  }),
});

/**
 * Validates if a phone number is in the correct format for WhatsApp
 */
export const isValidWhatsAppNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  // Check if it's a valid international phone number (10-15 digits)
  return cleanNumber.length >= 10 && cleanNumber.length <= 15;
};

/**
 * Formats a phone number for display
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  if (cleanNumber.length === 10) {
    // Format as (XXX) XXX-XXXX
    return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(
      3,
      6
    )}-${cleanNumber.slice(6)}`;
  }
  return phoneNumber;
};

/**
 * Contact links configuration - Single source of truth for link structure
 */
export const CONTACT_LINKS_CONFIG: ContactLinkConfig[] = [
  {
    id: "linkedin",
    icon: "linkedin",
    type: "external",
    config: {
      url: "https://www.linkedin.com/in/shirzabolotny/",
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
      dates: {
        start: "20240101T110000Z",
        end: "20240101T120000Z",
      },
      details: "",
      location: "Google Meet",
      addGuests: ["shirzabolotny@gmail.com"],
      conferenceDataVersion: 1,
      conferenceSolution: "hangoutsMeet",
    },
  },
];

/**
 * Generates contact links by combining configuration with translations
 */
export const generateContactLinks = (
  translations: TextStructure["contact"]["links"]
) => {
  return CONTACT_LINKS_CONFIG.map((linkConfig) => {
    const translation =
      translations[linkConfig.id as keyof typeof translations];

    switch (linkConfig.type) {
      case "external":
        return {
          id: linkConfig.id,
          name: translation.name,
          icon: linkConfig.icon,
          url: (linkConfig.config as { url: string }).url,
        };
      case "whatsapp":
        return {
          id: linkConfig.id,
          name: translation.name,
          icon: linkConfig.icon,
          url: generateWhatsAppLink({
            phoneNumber: (linkConfig.config as WhatsAppConfig).phoneNumber,
            text: (translation as any).text,
          }),
        };
      case "email":
        return {
          id: linkConfig.id,
          name: translation.name,
          icon: linkConfig.icon,
          url: generateEmailLink({
            to: (linkConfig.config as EmailConfig).to,
            subject: (translation as any).subject,
            body: (translation as any).body,
          }),
        };
      case "calendar":
        return {
          id: linkConfig.id,
          name: translation.name,
          icon: linkConfig.icon,
          url: generateGoogleCalendarLink({
            action: (linkConfig.config as GoogleCalendarConfig).action,
            text: (translation as any).text,
            dates: (linkConfig.config as GoogleCalendarConfig).dates,
            details: (translation as any).details,
            location: "Google Meet",
            addGuests: (linkConfig.config as GoogleCalendarConfig).addGuests,
            conferenceDataVersion: (linkConfig.config as GoogleCalendarConfig)
              .conferenceDataVersion,
            conferenceSolution: (linkConfig.config as GoogleCalendarConfig)
              .conferenceSolution,
          }),
        };
      default:
        throw new Error(`Unknown link type: ${(linkConfig as any).type}`);
    }
  });
};
