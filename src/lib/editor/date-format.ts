const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ordinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

/**
 * Format an ISO date string (YYYY-MM-DD) as a wedding date.
 * Returns e.g. "Saturday 21st September 2029"
 */
export function formatWeddingDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayName = DAYS[date.getDay()];
  const monthName = MONTHS[date.getMonth()];
  return `${dayName} ${ordinal(day)} ${monthName} ${year}`;
}

/**
 * Try to reverse-parse a formatted wedding date back to ISO (YYYY-MM-DD).
 * Returns null if the string doesn't match the expected format.
 */
export function parseWeddingDate(formatted: string): string | null {
  // Match e.g. "Saturday 21st September 2029" (case-insensitive)
  const match = formatted.match(
    /^\w+\s+(\d{1,2})(?:st|nd|rd|th)\s+(\w+)\s+(\d{4})$/i
  );
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthName = match[2].toLowerCase();
  const year = parseInt(match[3], 10);

  const monthIndex = MONTHS.findIndex((m) => m.toLowerCase() === monthName);
  if (monthIndex === -1) return null;

  const mm = String(monthIndex + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}
