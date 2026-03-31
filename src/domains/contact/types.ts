export interface WhatsAppConfig {
  phoneNumber: string;
  text?: string;
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
