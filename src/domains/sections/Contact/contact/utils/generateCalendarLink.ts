import type { GoogleCalendarConfig } from "../types/types";

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

const getNextBusinessDay = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();

  // If Friday (5) → move to Sunday (+2)
  // If Saturday (6) → move to Sunday (+1)
  if (day === 5) result.setDate(result.getDate() + 2);
  if (day === 6) result.setDate(result.getDate() + 1);

  return result;
};

const formatGoogleDateTime = (date: Date, hours: number): string => {
  const d = new Date(date);
  d.setHours(hours, 0, 0, 0);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minutes = "00";
  const seconds = "00";

  return `${year}${month}${day}T${hour}${minutes}${seconds}`;
};

const getDatesRange = () => {
  const today = new Date();

  // Start = today + 2 days
  let start = new Date(today);
  start.setDate(start.getDate() + 2);
  start = getNextBusinessDay(start);

  // End = start + 14 days
  let end = new Date(start);
  end.setDate(end.getDate() + 14);
  end = getNextBusinessDay(end);

  return {
    start: formatGoogleDateTime(start, 11), // 11:00
    end: formatGoogleDateTime(end, 15), // 15:00
  };
};

/**
 * Builds the query parameters for Google Calendar links
 */
const buildCalendarQueryParams = (config: GoogleCalendarConfig): string => {
  const params = new URLSearchParams();
  const dates = getDatesRange();

  params.set("text", config.text);
  params.set("dates", `${dates.start}/${dates.end}`);
  params.set("details", config.details);
  params.set("location", config.location);

  const guests = buildGuestsParam(config.addGuests);
  if (guests) {
    params.set("add", guests);
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
