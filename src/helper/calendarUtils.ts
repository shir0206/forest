export const getNextWeekdayAt11AM = (): { start: string; end: string } => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Calculate days to add to get to next weekday (Monday-Thursday)
  let daysToAdd = 0;
  if (dayOfWeek === 0) {
    // If today is Sunday, next weekday is Monday (add 1 day)
    daysToAdd = 1;
  } else if (dayOfWeek === 6) {
    // If today is Saturday, next weekday is Monday (add 2 days)
    daysToAdd = 2;
  } else if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    // If today is Monday-Thursday, check if it's past 11AM
    if (hours > 10) {
      // If past 11AM, go to next Monday (add 1 day)
      daysToAdd = 1;
    } else {
      // If before 11AM, use today
      daysToAdd = 0;
    }
  } else {
    // If today is Friday or Saturday, next weekday is Monday (add 3 days)
    daysToAdd = 3;
  }

  // Calculate start date
  const startDate = new Date(now);
  startDate.setDate(now.getDate() + daysToAdd);
  startDate.setHours(11, 0, 0, 0); // Set to 11:00 AM

  // Calculate end date (1 hour later)
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 1);

  // Format dates as required (YYYYMMDDTHHMMSSZ)
  const formatISOString = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  return {
    start: formatISOString(startDate),
    end: formatISOString(endDate),
  };
};
