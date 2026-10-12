// Omo Ibadan — traits (chosen once) and moodlets (short-lived feelings).

export interface Trait { id: string; name: string; icon: string; blurb: string; }
export const TRAITS: Trait[] = [
  { id: "omoluabi", name: "Omoluabi", icon: "🕊️", blurb: "Iwa gains +15%. Elders favour you." },
  { id: "ajala", name: "Ajala Traveller", icon: "🧳", blurb: "Transport costs -15%." },
  { id: "alaso", name: "Aso-Ebi Royalty", icon: "👗", blurb: "Owambe fun +20%." },
  { id: "bookwarm", name: "Bookwarm", icon: "📚", blurb: "Brain XP +20%." },
  { id: "streetwise", name: "Streetwise", icon: "🧠", blurb: "Hustle XP +20%. VIO dodges." },
  { id: "earlyriser", name: "Early Riser", icon: "🌅", blurb: "Morning shifts pay +10%." },
  { id: "nightowl", name: "Night Owl", icon: "🦉", blurb: "Night venues fun +20%, morning energy -10." },
  { id: "cleanfreak", name: "Clean Freak", icon: "🧼", blurb: "Hygiene decays half speed." },
  { id: "foodie", name: "Foodie", icon: "🍲", blurb: "Meals restore +25% hunger." },
  { id: "hustleking", name: "Hustle King/Queen", icon: "👑", blurb: "All earnings +8%, energy drains +8%." },
];

export interface Moodlet { id: string; name: string; icon: string; delta: number; mins: number; }
function M(id: string, name: string, icon: string, delta: number, mins: number): Moodlet {
  return { id, name, icon, delta, mins };
}
export const MOODLETS: Moodlet[] = [
  M("amala-joy", "Gbegiri Joy", "🍲", 12, 180), M("ofada-bliss", "Ofada Bliss", "🍛", 14, 180),
  M("mama-hug", "Mama Put Hug", "🤗", 8, 120), M("chop-belleful", "Belleful", "😋", 10, 150),
  M("hungry-vex", "Ebi Vex", "😤", -12, 120), M("tired-legs", "Legs Tired", "🦵", -8, 90),
  M("full-load-rush", "Full Load Rush", "🚐", 10, 120), M("haggle-win", "Haggle Win", "🧺", 9, 120),
  M("haggle-loss", "Haggle Loss", "😅", -5, 60), M("exam-pass", "Exam Pass High", "📝", 15, 240),
  M("exam-fail", "Exam Fail Gloom", "😞", -10, 120), M("nepa-heat", "NEPA Heat", "🔥", -12, 180),
  M("gen-hum", "Gen Hum Comfort", "💡", 10, 180), M("rain-lock", "Rain Lock", "🌧️", -8, 120),
  M("rent-paid", "Roof Secured", "🏠", 12, 300), M("rent-fear", "Landlord Knock", "🚪", -10, 180),
  M("spray-fame", "Spray Fame", "💸", 14, 180), M("dance-sweat", "Dance Sweat", "💃", 8, 90),
  M("gist-sweet", "Gist Sweet", "👥", 8, 120), M("owambe-glow", "Owambe Glow", "✨", 10, 150),
  M("lake-breeze", "Lake Breeze", "🌅", 9, 120), M("zoo-laugh", "Zoo Laugh", "🦁", 7, 90),
  M("tower-awe", "Tower Awe", "🏙️", 8, 120), M("mapo-pride", "Mapo Pride", "👑", 10, 180),
  M("radio-jam", "Radio Jam", "📻", 6, 90), M("traffic-vex", "Go-slow Vex", "🚗", -9, 90),
  M("okada-wind", "Okada Wind", "🏍️", 7, 60), M("keke-shake", "Keke Shake", "🛺", -4, 45),
];
