// Omo Ibadan — Ibadan radio stations (flavour + small buffs).

export interface Station { id: string; name: string; freq: string; show: string; bonus: string; }
export const STATIONS: Station[] = [
  { id: "fresh", name: "Fresh FM", freq: "105.9", show: "Morning Cruise", bonus: "Social +2/hr while travelling" },
  { id: "splash", name: "Splash FM", freq: "105.5", show: "Oyinmomo Talk", bonus: "Charisma XP +10%" },
  { id: "lagelu", name: "Lagelu FM", freq: "96.7", show: "Ibadan Classics", bonus: "Fun +2/hr" },
  { id: "petals", name: "Petals FM", freq: "102.3", show: "Owambe Countdown", bonus: "Dance XP +10%" },
  { id: "agidigbo", name: "Agidigbo FM", freq: "88.7", show: "Kokoro Alate", bonus: "Hustle XP +10%" },
  { id: "star", name: "Star FM", freq: "91.5", show: "Night Cruise", bonus: "Night energy drain -10%" },
  { id: "amuludun", name: "Amuludun FM", freq: "99.1", show: "Yoruba Proverbs Hour", bonus: "Brain XP +10%" },
];
