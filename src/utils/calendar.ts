/**
 * Utility functions for calendar-related operations
 */

/**
 * Formats a date string for Google Calendar
 */
export const formatCalendarDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}00Z`;
};

/**
 * Gets the next available time slot (30 minutes from now)
 */
export const getNextAvailableTime = (): { start: string; end: string } => {
  const now = new Date();
  const start = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
  const end = new Date(start.getTime() + 60 * 60000); // 1 hour later

  return {
    start: formatCalendarDate(start),
    end: formatCalendarDate(end),
  };
};

/**
 * Creates a calendar event configuration
 */
export const createCalendarEvent = (options: {
  title?: string;
  details?: string;
  location?: string;
  duration?: number; // in minutes
  guests?: string[];
}): {
  action: string;
  text: string;
  dates: { start: string; end: string };
  details: string;
  location: string;
  addGuests: string[];
  conferenceDataVersion?: number;
  conferenceSolution?: string;
} => {
  const {
    title = "Meeting with Shir",
    details = "Let's discuss potential collaboration opportunities.",
    location = "Online",
    duration = 60,
    guests = [],
  } = options;

  const { start, end } = getNextAvailableTime();

  return {
    action: "TEMPLATE",
    text: title,
    dates: {
      start,
      end: formatCalendarDate(
        new Date(new Date(start).getTime() + duration * 60000)
      ),
    },
    details,
    location,
    addGuests: guests,
    conferenceDataVersion: 1,
    conferenceSolution: "hangoutsMeet",
  };
};
