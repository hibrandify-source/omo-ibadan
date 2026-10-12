// IbadanLife — city clock. Real-time day (a game day = a real day),
// in-game minutes for action costs, Saturday 9AM rent tick (Africa/Lagos).

export interface CityClock {
  /** real-world epoch ms when this life started */
  startedAt: number;
  /** in-game minutes elapsed since start (actions advance it) */
  minutes: number;
}

export function nowMinutes(c: CityClock): number {
  const realElapsedMin = Math.floor((Date.now() - c.startedAt) / 60000);
  return c.minutes + realElapsedMin * 0; // sim time advances via actions only; day label follows real day
}

export function lagosDay(date = new Date()): { dayName: string; isSaturday: boolean; hour: number } {
  const fmt = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos", weekday: "long", hour: "numeric", hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const dayName = parts.weekday ?? "";
  const hour = Number(parts.hour ?? "12");
  return { dayName, isSaturday: dayName === "Saturday", hour };
}

export function formatClock(totalMinutes: number): string {
  const day = Math.floor(totalMinutes / 1440) + 1;
  const mm = totalMinutes % 1440;
  const h = Math.floor(mm / 60);
  const m = mm % 60;
  return `Day ${day} · ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Saturday 9AM rent guard — call once per session/day. */
export function shouldChargeRent(lastRentKey: string, now = new Date()): string | null {
  const lagos = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
  }).format(now);
  const { isSaturday, hour } = lagosDay(now);
  if (!isSaturday || hour < 9) return null;
  // key = that Saturday's date so we charge once
  const key = `sat-${lagos}`;
  return key === lastRentKey ? null : key;
}
