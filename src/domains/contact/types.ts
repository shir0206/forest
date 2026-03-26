export interface WhatsAppConfig {
  phoneNumber: string;
  message?: string;
}

export interface GoogleCalendarConfig {
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
}

export interface EmailConfig {
  to: string;
  subject?: string;
  body?: string;
  cc?: string;
  bcc?: string;
}
