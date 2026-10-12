// Omo Ibadan — six needs.
// Needs decay on their own; actions cost in-game minutes; mood gates pay.

export type NeedId = "hunger" | "energy" | "fun" | "social" | "hygiene" | "toilet";

export interface NeedDef {
  id: NeedId;
  name: string;
  yoruba: string;
  icon: string;
  /** points lost per in-game hour when ignored */
  decayPerHour: number;
  /** flavor for hitting zero */
  crash: string;
}

export const NEEDS: NeedDef[] = [
  { id: "hunger", name: "Hunger", yoruba: "Ebi", icon: "🍲", decayPerHour: 6, crash: "Hungry — work pay drops. Find Amala Skye or Mama Put." },
  { id: "energy", name: "Energy", yoruba: "Agbara", icon: "⚡", decayPerHour: 5, crash: "Exhausted — sleep at home or rest at Agodi." },
  { id: "fun", name: "Fun", yoruba: "Inú dídùn", icon: "🎉", decayPerHour: 4, crash: "Bored — /owambe Fuji night or Agodi Gardens." },
  { id: "social", name: "Social", yoruba: "Ẹgbẹ́", icon: "👥", decayPerHour: 4, crash: "Lonely — gist at Ojude square or call family." },
  { id: "hygiene", name: "Hygiene", yoruba: "Ìmọ́tótó", icon: "🚿", decayPerHour: 5, crash: "Dirty — shower at home. A bucket and some soap will do." },
  { id: "toilet", name: "Toilet", yoruba: "Àpòòtọ́", icon: "🚻", decayPerHour: 8, crash: "Pressed — use any toilet now or embarrassment -Iwa." },
];

export type Needs = Record<NeedId, number>; // 0..100

export const FULL_NEEDS: Needs = {
  hunger: 80, energy: 80, fun: 70, social: 70, hygiene: 75, toilet: 85,
};

/** Advance needs by in-game minutes. Returns crash warnings. */
export function tickNeeds(n: Needs, minutes: number): { needs: Needs; warnings: string[] } {
  const hours = minutes / 60;
  const next = { ...n };
  const warnings: string[] = [];
  for (const d of NEEDS) {
    next[d.id] = Math.max(0, Math.min(100, next[d.id] - d.decayPerHour * hours));
    if (next[d.id] <= 10) warnings.push(`${d.icon} ${d.name} critical — ${d.crash}`);
  }
  return { needs: next, warnings };
}

/** 0..100 mood score → pay multiplier + label. */
export function moodOf(n: Needs): { score: number; label: string; payMult: number } {
  const score = Math.round(
    (n.hunger + n.energy + n.fun + n.social + n.hygiene + n.toilet) / 6
  );
  if (score >= 75) return { score, label: "😄 Very Happy", payMult: 1.15 };
  if (score >= 55) return { score, label: "🙂 Happy", payMult: 1.0 };
  if (score >= 35) return { score, label: "😐 Managing", payMult: 0.85 };
  if (score >= 15) return { score, label: "😩 Drained", payMult: 0.65 };
  return { score, label: "🤢 Miserable", payMult: 0.45 };
}

export function applyNeedEffects(n: Needs, fx: Partial<Needs>): Needs {
  const next = { ...n };
  (Object.keys(fx) as NeedId[]).forEach((k) => {
    next[k] = Math.max(0, Math.min(100, next[k] + (fx[k] ?? 0)));
  });
  return next;
}
