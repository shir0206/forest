import type { GoogleCalendarConfig } from "../types";

/**
 * Encodes URL parameters safely
 */
const encodeUrlParam = (value: string): string => encodeURIComponent(value);

/**
 * Builds optional conference parameters for Google Calendar links
 */
const buildConferenceParams = (
  conferenceDataVersion?: number,
  conferenceSolution?: string
): string => {
  const params: string[] = [];

  if (conferenceDataVersion !== undefined) {
    params.push(`&conferenceDataVersion=${conferenceDataVersion}`);
  }

  if (conferenceSolution) {
    params.push(`&conferenceSolution=${conferenceSolution}`);
  }

  return params.join("");
};

/**
 * Builds guest list parameter for Google Calendar links
 */
const buildGuestsParam = (guests: string[]): string => {
  return guests.length > 0 ? guests.join(",") : "";
};

/**
 * Builds the base URL for Google Calendar events
 */
const buildCalendarBaseUrl = (action: string): string => {
  return `https://calendar.google.com/calendar/u/0/r/eventedit?action=${action}`;
};

/**
 * Builds the query parameters for Google Calendar links
 */
const buildCalendarQueryParams = (config: GoogleCalendarConfig): string => {
  const params = new URLSearchParams();

  params.set("text", encodeUrlParam(config.text));
  params.set("dates", `${config.dates.start}/${config.dates.end}`);
  params.set("details", encodeUrlParam(config.details));
  params.set("location", encodeUrlParam(config.location));

  const guests = buildGuestsParam(config.addGuests);
  if (guests) {
    params.set("add", encodeUrlParam(guests));
  }

  return params.toString();
};

/**
 * Generates a Google Calendar link with the provided configuration
 */
export const generateGoogleCalendarLink = (
  config: GoogleCalendarConfig
): string => {
  const baseUrl = buildCalendarBaseUrl(config.action);
  const queryParams = buildCalendarQueryParams(config);
  const conferenceParams = buildConferenceParams(
    config.conferenceDataVersion,
    config.conferenceSolution
  );

  return `${baseUrl}&${queryParams}${conferenceParams}`;
};
