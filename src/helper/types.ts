export const WINDOW_STATE = {
  DEFAULT: "default",
  MINIMIZED: "minimized",
  MAXIMIZED: "maximized",
  CLOSED: "closed",
} as const;

export type WindowState = (typeof WINDOW_STATE)[keyof typeof WINDOW_STATE];

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

export type SectionComponent = React.ComponentType<{ isVisible: boolean }>;

export interface ScreenConfig {
  id: string;
  Screen: SectionComponent;
}
