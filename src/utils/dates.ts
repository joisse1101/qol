export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  // Create a copy of the start date to prevent mutating the original object
  const currentDate = new Date(startDate.getTime());
  const dates: Date[] = [];

  // Loop until the current date passes the end date
  while (currentDate <= endDate) {
    // Push a fresh copy of the current date into the array
    dates.push(new Date(currentDate));

    // Mutate the loop variable to move forward by 1 day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysBetween(date1: Date, date2: Date): number {
  // Normalize both dates to local midnight (00:00:00)
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  const diffInMs = Math.abs(d2.getTime() - d1.getTime());

  return Math.round(diffInMs / (1000 * 60 * 60 * 24));
};

export function getMostRecentFirstDay(startDate: Date, firstDayOfWeek: number): Date {
  const result = new Date(startDate);
  const currentDay = result.getDay();

  const diff = (currentDay - firstDayOfWeek + 7) % 7;

  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

export const DayIdx = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export type DayIdxType = typeof DayIdx[keyof typeof DayIdx];

export function getDayName(idx: DayIdxType, type: 'long' | 'short' = 'long'): string {
  // Jan 4, 1970 is a known Sunday base anchor
  const date = new Date(1970, 0, 4 + idx);

  return new Intl.DateTimeFormat(undefined, { weekday: type }).format(date);
}

export const DayOptions = Array.from({ length: 7 }, (_, idx) => {
  const dayIdx = idx as DayIdxType;
  return {
    label: getDayName(dayIdx, 'short'),
    value: dayIdx,
  };
});

function normalizeDate(d: Date): number {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function isBefore(date1: Date, date2: Date): boolean {
  return normalizeDate(date1) < normalizeDate(date2);
}

export function isAfter(date1: Date, date2: Date): boolean {
  return normalizeDate(date1) > normalizeDate(date2);
}

export function parseDate(val: any, fallback: Date): Date {
  if (val === null || val === undefined) return fallback;
  const d = new Date(val);
  return isNaN(d.getTime()) ? fallback : d;
}