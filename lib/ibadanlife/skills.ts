// IbadanLife — 9 skills (LagosLife parity). XP from actions; levels gate careers.

export type SkillId =
  | "cooking" | "charisma" | "fitness" | "coding" | "music"
  | "hustle" | "dance" | "comedy" | "photography" | "driving" | "brain";

export interface SkillDef { id: SkillId; name: string; icon: string; blurb: string; xpPerLevel: number; }

export const SKILLS: SkillDef[] = [
  { id: "cooking", name: "Cooking", icon: "🍲", blurb: "Amala to party jollof.", xpPerLevel: 100 },
  { id: "charisma", name: "Charisma", icon: "🗣️", blurb: "Haggle + host + host.", xpPerLevel: 100 },
  { id: "fitness", name: "Fitness", icon: "💪", blurb: "3SC trials ready.", xpPerLevel: 100 },
  { id: "coding", name: "Coding", icon: "💻", blurb: "Light + laptop.", xpPerLevel: 120 },
  { id: "music", name: "Music", icon: "🎶", blurb: "Fuji to Afrobeats.", xpPerLevel: 100 },
  { id: "hustle", name: "Hustle", icon: "🧺", blurb: "Market + micra sense.", xpPerLevel: 100 },
  { id: "dance", name: "Dance", icon: "💃", blurb: "Owambe floor.", xpPerLevel: 100 },
  { id: "comedy", name: "Comedy", icon: "🎤", blurb: "Crack Mapo ribs.", xpPerLevel: 100 },
  { id: "photography", name: "Photography", icon: "📸", blurb: "Golden hour.", xpPerLevel: 100 },
  { id: "driving", name: "Driving", icon: "🚐", blurb: "Dodge potholes.", xpPerLevel: 100 },
  { id: "brain", name: "Brain", icon: "📚", blurb: "UI exam power.", xpPerLevel: 120 },
];

export type SkillMap = Record<SkillId, { xp: number; level: number }>;

export function emptySkills(): SkillMap {
  const m = {} as SkillMap;
  for (const s of SKILLS) m[s.id] = { xp: 0, level: 0 };
  return m;
}

export function grantXp(skills: SkillMap, id: SkillId, xp: number): { skills: SkillMap; leveled: boolean } {
  const cur = skills[id];
  const def = SKILLS.find((s) => s.id === id)!;
  let total = cur.xp + xp;
  let level = cur.level;
  let leveled = false;
  while (total >= def.xpPerLevel * (level + 1)) {
    total -= def.xpPerLevel * (level + 1);
    level += 1;
    leveled = true;
    if (level >= 10) break;
  }
  return { skills: { ...skills, [id]: { xp: total, level } }, leveled };
}
