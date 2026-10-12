// Real-world walking: GPS distance → steps → rewards.
// Phones have no web pedometer API, so distance is the source of truth:
// geolocation.watchPosition tracks outdoor walks, ~1300 steps per km.
// Anti-spoof: accuracy gate, speed cap, daily counted cap.

export const STEPS_PER_KM = 1300;
export const MAX_ACCURACY_M = 30;
export const MAX_SPEED_MS = 4; // faster than this = vehicle, points dropped
export const DAILY_STEP_CAP = 20000;
export const OLA_PER_1000_STEPS = 100;
export const ENERGY_PER_1000_STEPS = 4;
export const IWA_WALK_BONUS = 3;
export const IWA_WALK_MIN_STEPS = 2000;

/** Monday (Africa/Lagos) key for the weekly board. */
export function walkWeekKey(now = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const asDate = new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00Z`);
  const dow = (asDate.getUTCDay() + 6) % 7; // Monday = 0
  asDate.setUTCDate(asDate.getUTCDate() - dow);
  return asDate.toISOString().slice(0, 10);
}

export interface WalkPoint {
  lat: number;
  lon: number;
  acc: number; // metres
  t: number; // epoch ms
}

export function haversineM(a: WalkPoint, b: WalkPoint): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Accept a point if accurate and human-speed from the last accepted one. */
export function acceptPoint(prev: WalkPoint | null, next: WalkPoint): { ok: boolean; distM: number } {
  if (next.acc > MAX_ACCURACY_M) return { ok: false, distM: 0 };
  if (!prev) return { ok: true, distM: 0 };
  const distM = haversineM(prev, next);
  const dtS = Math.max(1, (next.t - prev.t) / 1000);
  if (distM / dtS > MAX_SPEED_MS) return { ok: false, distM: 0 };
  if (distM < 2) return { ok: false, distM: 0 }; // GPS jitter floor
  return { ok: true, distM };
}

export function stepsForKm(km: number): number {
  return Math.floor(km * STEPS_PER_KM);
}

export function fmtKm(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
}

export function fmtPace(m: number, secs: number): string {
  if (m < 20 || secs < 10) return "-- /km";
  const perKm = secs / (m / 1000);
  const mm = Math.floor(perKm / 60);
  const ss = Math.floor(perKm % 60);
  return `${mm}:${ss.toString().padStart(2, "0")} /km`;
}

/** Party codes: 4 readable chars, no lookalikes. */
export function makePartyCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  const buf = new Uint32Array(4);
  try {
    crypto.getRandomValues(buf);
    for (let i = 0; i < 4; i++) s += chars[buf[i] % chars.length];
  } catch {
    for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}
