// Ranges the client is allowed to ask for
export type DateRangeName = "daily" | "weekly" | "monthly" | "yearly";

// Start and end of the period to filter by
export type DateRange = {
  start: Date;
  end: Date;
};

// Returns the start (midnight) and end (now) of the requested period.
// Any unknown value falls back to "monthly".

const getDateRange = (range: DateRangeName | string): DateRange => {
  const now = new Date();
  let start: Date;

  switch (range) {
    case "daily":
      // Today at 00:00
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;

    case "weekly": {
      // Sunday of this week at 00:00 (getDay() is 0 for Sunday)
      const firstDayOfWeek = now.getDate() - now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
      break;
    }

    case "yearly":
      // January 1st at 00:00
      start = new Date(now.getFullYear(), 0, 1);
      break;

    case "monthly":
    default:
      // 1st of this month at 00:00 (also the default)
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end: now };
};

export default getDateRange;
