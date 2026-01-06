export type PositionThreeD = [number, number, number];

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
