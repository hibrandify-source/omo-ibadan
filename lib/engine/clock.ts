// Omo Ibadan — the clock and calendar.
//
// Time only moves when you do something: hustles, shifts, trips, meals and
// sleep each cost real minutes. Crossing midnight starts a new day. Day 1 is
// Monday 4 January 2027, the week after you turn 18.

/** Minutes after midnight when a fresh day (and a night's sleep) begins. */
export const WAKE_MINUTE = 6 * 60;
export const START_AGE = 18;
/** Day 1 of every life. */
export const START_DATE = Date.UTC(2027, 0, 4);
const DAY_MS = 24 * 60 * 60 * 1000;

/** What each kind of action costs, in minutes. */
export const MINUTES = {
  hustle: 90,
  exam: 30,
  shift: 8 * 60,
  interstate: 6 * 60,
  chop: 30,
  freshen: 20,
  toilet: 10,
  familyDuty: 3 * 60,
  rest: 2 * 60,
  dance: 60,
  spray: 10,
  greet: 10,
  shop: 20,
  /** waiting at the park for a micra to fill up */
  micraWait: 10,
} as const;

/** Add minutes to the time of day; returns the new time and how many midnights were crossed. */
export function advanceClock(minute: number, add: number): { minute: number; newDays: number } {
  const total = minute + Math.max(0, add);
  return { minute: total % 1440, newDays: Math.floor(total / 1440) };
}

/** Minutes from now until the next 6:00 wake-up. */
export function minutesUntilMorning(minute: number): number {
  return minute < WAKE_MINUTE ? WAKE_MINUTE - minute : 1440 - minute + WAKE_MINUTE;
}

export type DayPart = "morning" | "afternoon" | "evening" | "night";

export function partOfDay(minute: number): DayPart {
  const h = minute / 60;
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

/** "7:30 am" */
export function formatTime(minute: number): string {
  const h = Math.floor(minute / 60) % 24;
  const m = minute % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface CalendarDay {
  weekday: string;
  /** 0 = Sunday */
  weekdayIndex: number;
  date: number;
  month: string;
  year: number;
  /** "Mon 4 Jan 2027" */
  label: string;
}

export function calendarFor(day: number): CalendarDay {
  const d = new Date(START_DATE + (Math.max(1, day) - 1) * DAY_MS);
  const weekdayIndex = d.getUTCDay();
  const date = d.getUTCDate();
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return { weekday: WEEKDAYS[weekdayIndex], weekdayIndex, date, month, year, label: `${WEEKDAYS[weekdayIndex]} ${date} ${month} ${year}` };
}

/** You turn 18 the week before day 1, so birthdays fall on day 1 + 365·n (minus that week). */
const BIRTHDAY_OFFSET = 7;
export function ageOn(day: number): number {
  return START_AGE + Math.floor((Math.max(1, day) - 1 + BIRTHDAY_OFFSET) / 365);
}

/** True on the day you turn a year older (never day 1). */
export function isBirthday(day: number): boolean {
  return day > 1 && ageOn(day) > ageOn(day - 1);
}

/**
 * Can a shift that starts at `shiftHour` be worked now? You may clock in from
 * an hour early to three hours late; outside that, the shift is closed.
 */
export function shiftOpen(minute: number, shiftHour: number): boolean {
  const start = shiftHour * 60;
  let diff = minute - start;
  if (diff < -12 * 60) diff += 1440; // night shifts that start before midnight
  if (diff > 12 * 60) diff -= 1440;
  return diff >= -60 && diff <= 180;
}

/** Hustling late at night tires you more. */
export function isLateNight(minute: number): boolean {
  return minute >= 22 * 60 || minute < 5 * 60;
}
