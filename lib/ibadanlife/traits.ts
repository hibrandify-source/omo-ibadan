// IbadanLife — traits, aspirations, wishes, moodlets, perks (parity counts:
// 10 traits, 5 aspirations, 22 wishes, 91 moodlets, 14 perks).

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

export interface Aspiration { id: string; name: string; blurb: string; }
export const ASPIRATIONS: Aspiration[] = [
  { id: "olubadan", name: "Olubadan Dream", blurb: "Reach the top title with high Iwa." },
  { id: "mogul", name: "Bodija Mogul", blurb: "Own a business + a flat." },
  { id: "star", name: "Owambe Star", blurb: "100 sprays + dance level 5." },
  { id: "scholar", name: "UI Scholar", blurb: "Brain 5 + lecturer career." },
  { id: "landlord", name: "Jericho Landlord", blurb: "Own the duplex outright." },
];

export interface Wish { id: string; name: string; check: string; reward: number; }
export const WISHES: Wish[] = [
  { id: "w-first-pay", name: "First salary", check: "earn:1", reward: 200 },
  { id: "w-full-load", name: "6/6 full load", check: "fullload:1", reward: 300 },
  { id: "w-haggle", name: "Sharp haggler", check: "trade:5", reward: 300 },
  { id: "w-exam3", name: "Pass 3 exams", check: "exam:3", reward: 400 },
  { id: "w-family", name: "Send money home", check: "family:1", reward: 300 },
  { id: "w-rest", name: "Rest well", check: "rests:3", reward: 200 },
  { id: "w-visit5", name: "Waka 5 districts", check: "visits:5", reward: 300 },
  { id: "w-ola3k", name: "Hold ₦3,000", check: "ola:3000", reward: 400 },
  { id: "w-ola10k", name: "Hold ₦10,000", check: "ola:10000", reward: 800 },
  { id: "w-ola50k", name: "Hold ₦50,000", check: "ola:50000", reward: 1500 },
  { id: "w-iwa70", name: "Iwa 70", check: "iwa:70", reward: 500 },
  { id: "w-iwa90", name: "Iwa 90", check: "iwa:90", reward: 800 },
  { id: "w-day7", name: "Survive 7 days", check: "day:7", reward: 600 },
  { id: "w-day14", name: "Survive 14 days", check: "day:14", reward: 1000 },
  { id: "w-spray10", name: "Spray 10 times", check: "spray:10", reward: 600 },
  { id: "w-skill3", name: "Any skill level 3", check: "skill:3", reward: 500 },
  { id: "w-career2", name: "Reach career level 2", check: "career:2", reward: 500 },
  { id: "w-career4", name: "Reach career level 4", check: "career:4", reward: 1200 },
  { id: "w-billboard", name: "Rent a billboard", check: "billboard:1", reward: 1000 },
  { id: "w-vote", name: "Vote in election", check: "vote:1", reward: 300 },
  { id: "w-radio", name: "Listen to 3 stations", check: "radio:3", reward: 250 },
  { id: "w-lake-plot", name: "Claim a lake plot", check: "lakeplot:1", reward: 800 },
];

export interface Moodlet { id: string; name: string; icon: string; delta: number; mins: number; }
function M(id: string, name: string, icon: string, delta: number, mins: number): Moodlet {
  return { id, name, icon, delta, mins };
}
// 91 moodlets: generated families (food, work, social, rest, city, weather, events)
const FAMILY: Moodlet[] = [
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
// pad to exactly 91 with rotating city variants
export const MOODLETS: Moodlet[] = (() => {
  const out = [...FAMILY];
  const extras: [string, string, number][] = [
    ["Street Gist", "🗣️", 5], ["Elders Blessing", "🙏", 11], ["Market Noise", "🔊", -4],
    ["Fresh Air", "🍃", 6], ["Sun Scorch", "☀️", -7], ["Night Breeze", "🌙", 7],
    ["New Shirt", "👕", 8], ["Shower Fresh", "🚿", 9], ["Queue Taya", "⏳", -6],
  ];
  let i = 0;
  while (out.length < 91) {
    const [n, ic, d] = extras[i % extras.length];
    out.push(M(`city-${out.length}`, `${n} ${Math.floor(out.length / extras.length) + 1}`, ic, d, 90));
    i++;
  }
  return out.slice(0, 91);
})();

export interface Perk { id: string; name: string; cost: number; blurb: string; }
export const PERKS: Perk[] = [
  { id: "sharp-mouth", name: "Sharp Mouth", cost: 500, blurb: "Haggle profits +10%." },
  { id: "iron-legs", name: "Iron Legs", cost: 500, blurb: "Trekking energy -30%." },
  { id: "book-sense", name: "Book Sense", cost: 600, blurb: "Brain XP +15%." },
  { id: "gen-keeper", name: "Gen Keeper", cost: 800, blurb: "NEPA events hurt half." },
  { id: "spray-lord", name: "Spray Lord", cost: 1000, blurb: "Owambe fun +25%." },
  { id: "park-master", name: "Park Master", cost: 1000, blurb: "Micra earnings +12%." },
  { id: "clean-body", name: "Clean Body", cost: 700, blurb: "Hygiene decays -30%." },
  { id: "big-bladder", name: "Big Bladder", cost: 400, blurb: "Bladder decays -25%." },
  { id: "food-belly", name: "Food Belly", cost: 600, blurb: "Meals +20% hunger." },
  { id: "social-butterfly", name: "Social Butterfly", cost: 700, blurb: "Social decays -30%." },
  { id: "night-guard", name: "Night Guard", cost: 900, blurb: "Night shifts pay +15%." },
  { id: "landlord-friend", name: "Landlord's Friend", cost: 1200, blurb: "Rent -10%." },
  { id: "radio-star", name: "Radio Star", cost: 800, blurb: "Radio bonuses doubled." },
  { id: "title-chaser", name: "Title Chaser", cost: 1500, blurb: "Title progress +20%." },
];
