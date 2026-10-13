// Omo Ibadan — world content: districts, events, missions, wardrobe.
// Data only, no React and no rendering. Naira amounts come from prices.ts.
// Missions, deeds and daily hunts are scheduled to be replaced by the
// storylet engine in phase 2.

import { PRICES } from "./prices";
import type { BackgroundId } from "./backgrounds";
import type { StoryCond, StoryFx } from "./storylets";

export type HoodId =
  | "bodija"
  | "agbowo"
  | "challenge"
  | "iwo-road"
  | "ojoo"
  | "beere";

export interface MapNode {
  id: string;
  name: string;
  yoruba: string;
  zone: "academic" | "heritage" | "hustle" | "chill";
  hood: HoodId;
  blurb: string;
  unlocks: string[];
}

export const MAP_NODES: MapNode[] = [
  { id: "ui-gate", name: "UI Gate / Agbowo", yoruba: "Ẹ káàbọ̀ sí U.I.", zone: "academic", hood: "agbowo", blurb: "Student quarter. Cheap chop, exam pressure, hostel runs.", unlocks: ["exam", "chop"] },
  { id: "sango", name: "Sango – Poly", yoruba: "Sango Poly", zone: "academic", hood: "agbowo", blurb: "Poly hustle. Street smart, balancing school + work.", unlocks: ["micra"] },
  { id: "samonda", name: "Samonda / Ventura", yoruba: "Samonda", zone: "academic", hood: "bodija", blurb: "Mall + lounge axis. Small flex, big window-shopping.", unlocks: ["flex"] },
  { id: "bodija", name: "Bodija Market + Amala Skye", yoruba: "Bọ́dìjà", zone: "academic", hood: "bodija", blurb: "Planned estate + biggest food market. Haggle capital.", unlocks: ["market"] },
  { id: "mokola", name: "Mokola Hill", yoruba: "Oke Mokola", zone: "academic", hood: "bodija", blurb: "Hill climb start. Micra engine test.", unlocks: ["micra"] },
  { id: "dugbe", name: "Dugbe / Cocoa House", yoruba: "Ilé Àwọn Àgbẹ̀", zone: "heritage", hood: "beere", blurb: "Commercial nerve centre. Ile Awon Agbe — first skyscraper.", unlocks: ["job"] },
  { id: "mapo", name: "Mapo Hall / Oke Mapo", yoruba: "Oke Mapo", zone: "heritage", hood: "beere", blurb: "Brown roofs viewpoint. Olubadan coronation ground.", unlocks: ["title"] },
  { id: "oja-oba", name: "Oja Oba", yoruba: "Ọjà Ọba", zone: "heritage", hood: "beere", blurb: "King's market. Buy low here, sell high in Bodija.", unlocks: ["market"] },
  { id: "oje", name: "Oje Market", yoruba: "Ọjà Oje", zone: "heritage", hood: "beere", blurb: "Traditional + spiritual goods. Elders watch your Iwa.", unlocks: ["market"] },
  { id: "agodi", name: "Agodi Gardens + Zoo", yoruba: "Agodi", zone: "heritage", hood: "bodija", blurb: "Chill + family picnic. Restore energy fast.", unlocks: ["rest"] },
  { id: "challenge", name: "Challenge", yoruba: "Challenge", zone: "hustle", hood: "challenge", blurb: "Traffic knot. Honk or be honked at.", unlocks: ["micra"] },
  { id: "molete", name: "Molete", yoruba: "Molete", zone: "hustle", hood: "challenge", blurb: "Bridge + interchange hustle. Deliver amala before it cools.", unlocks: ["mission"] },
  { id: "ring-road", name: "Ring Road / Palms", yoruba: "Ring Road", zone: "hustle", hood: "challenge", blurb: "Rain locks here first. Keep fuel reserve.", unlocks: ["flex"] },
  { id: "iwo-road", name: "Iwo Road Park + Gbagi", yoruba: "Iwo Road", zone: "hustle", hood: "iwo-road", blurb: "Final boss motor park. Load fast, dodge VIO.", unlocks: ["micra", "market"] },
  { id: "eleyele", name: "Eleyele", yoruba: "Eleyele", zone: "chill", hood: "ojoo", blurb: "Lake view + barracks calm. Late-game flex unlock.", unlocks: ["flex"] },
  // added with the OpenStreetMap city map; street scenes for these land in phase 3
  { id: "beere", name: "Beere", yoruba: "Bẹẹrẹ", zone: "heritage", hood: "beere", blurb: "Old-city compounds under brown roofs. Mama's room is here.", unlocks: [] },
  { id: "agbowo", name: "Agbowo", yoruba: "Agbowo", zone: "academic", hood: "agbowo", blurb: "Face-me-I-face-you rooms full of UI students.", unlocks: [] },
  { id: "ojoo", name: "Ojoo", yoruba: "Ojoo", zone: "hustle", hood: "ojoo", blurb: "Where Oyo Road meets the expressway. Buses north.", unlocks: [] },
  { id: "moniya", name: "Moniya", yoruba: "Moniya", zone: "hustle", hood: "ojoo", blurb: "Edge of the city. Cheaper rent, longer ride.", unlocks: [] },
  { id: "akobo", name: "Akobo", yoruba: "Akobo", zone: "chill", hood: "bodija", blurb: "New estates going up. Quiet streets, big gates.", unlocks: [] },
  { id: "gbagi", name: "Gbagi Market", yoruba: "Ọjà Gbági", zone: "hustle", hood: "iwo-road", blurb: "Wholesale city off the Ife road: textiles, provisions, everything by the carton.", unlocks: [] },
  { id: "alakia", name: "Alakia / Airport", yoruba: "Alákíà", zone: "chill", hood: "iwo-road", blurb: "Ibadan Airport and the Omololu Olunloyo Recreational Park. Planes to Lagos and Abuja.", unlocks: [] },
  { id: "sabo", name: "Sabo / Recreation Club", yoruba: "Sabo", zone: "chill", hood: "beere", blurb: "Hausa quarter by Adamasingba; the old Recreation Club and the Golf Club next door.", unlocks: [] },
  { id: "agbeni", name: "Agbeni Market", yoruba: "Ọjà Agbẹni", zone: "heritage", hood: "beere", blurb: "Old market between Dugbe and Ogunpa: foodstuff, enamel, everything at retail.", unlocks: [] },
  { id: "aleshinloye", name: "Aleshinloye Market", yoruba: "Ọjà Aláṣínlóyè", zone: "hustle", hood: "challenge", blurb: "Big modern market off Ring Road by Jericho: foodstuff wholesale, frozen food, phones.", unlocks: [] },
  { id: "old-bodija", name: "Old Bodija", yoruba: "Bọ́dìjà Àtijọ́", zone: "chill", hood: "bodija", blurb: "Planned 1950s estate: wide plots, high fences, gatemen. Daddy's house is here.", unlocks: [] },
  { id: "jericho", name: "Jericho", yoruba: "Jẹ́ríkò", zone: "chill", hood: "beere", blurb: "Old GRA: big compounds, tall trees, doctors' quarters.", unlocks: [] },
];

// ---- Identity: Ọkùnrin / Obìnrin (visuals + story flavor) ----
export type Gender = "okunrin" | "obinrin";

export const GENDERS: { id: Gender; name: string; yoruba: string; desc: string }[] = [
  { id: "okunrin", name: "Ọkùnrin", yoruba: "Ọmọ ọkùnrin", desc: "Fila cap, agbada. Baba Ade calls you ọmọ ọkùnrin mi." },
  { id: "obinrin", name: "Obìnrin", yoruba: "Ọmọ obìnrin", desc: "Gele, iro and buba. Mama Put calls you fine girl." },
];

/** Gendered address lines — light flavor, economy untouched. */
export function address(g: Gender, who: "landlord" | "mama" | "elder" | "tout"): string {
  const son = g === "okunrin";
  switch (who) {
    case "landlord": return son ? "Ọmọ ọkùnrin mi, rent due Friday o. No story." : "Ọmọ obìnrin mi, rent due Friday o. No story.";
    case "mama": return son ? "Fine boy, amala + gbegiri ready. Come chop." : "Fine girl, amala + gbegiri ready. Come chop.";
    case "elder": return son ? "Ọmọlúàbí ọkùnrin — carry our name well." : "Ọmọlúàbí obìnrin — carry our name well.";
    case "tout": return son ? "Chairman! Enter micra, full load dey go!" : "Sister! Enter micra, full load dey go!";
  }
}

// Economy shortcuts (virtual naira only — no cashout). Values live in prices.ts.
export const ECONOMY = {
  REFERRAL_GIVER: PRICES.referral.giver,
  REFERRAL_JOINER_EXTRA: PRICES.referral.joinerExtra,
  REFERRAL_WEEKLY_CAP: PRICES.referral.weeklyCap,
  CHOP_COST: PRICES.food.amalaPlate,
  MICRA_FARE_BASE: PRICES.transport.driverFarePerPassenger,
  MARKET_BUY_LOW: PRICES.market.stockBag,
} as const;

export function makeReferralCode(username: string): string {
  const clean = username.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 4) || "OMO";
  const rand = Math.floor(100 + Math.random() * 900);
  return `${clean}${rand}`;
}

export interface NpcSms {
  id: string;
  from: string;
  text: string;
  action?: string;
}

export const NPC_SMS_SEED: NpcSms[] = [
  { id: "sms1", from: "Landlord (Agbowo)", text: "Omo mi, tell Mama the balance must land before month end. No story. — Baba Ade", action: "Check obligations" },
  { id: "sms2", from: "Mama Put (Bodija)", text: "Amala + gbegiri ready. Come chop before work. Energy +30.", action: "Chop" },
  { id: "sms3", from: "Mogaji Elder", text: "Je Omoluabi. Ko Ola, Ko Iwa. Family meeting Sunday — attend and gain Iwa.", action: "+Iwa" },
  { id: "sms4", from: "IBEDC Alert", text: "Light-out 6pm–10pm Mokola–Challenge. Charge phone + buy fuel early.", action: "Buy fuel" },
  { id: "sms5", from: "Iwo Road Tout", text: "Micra full load! 6 passengers dey wait. Overload? VIO dey around o.", action: "Micra Rush" },
];

export interface QuizQ {
  q: string;
  options: string[];
  answer: number;
}

export const EXAM_POOL: QuizQ[] = [
  { q: "Ilé Àwọn Àgbẹ̀ is now called ___?", options: ["Cocoa House", "Mapo Hall", "Agodi Gardens", "Bower Tower"], answer: 0 },
  { q: "Oke Mapo holds which landmark?", options: ["Mapo Hall", "Palms Mall", "UI Gate", "Gbagi Market"], answer: 0 },
  { q: "Which park is the 'final boss' motor park in Ibadan?", options: ["Iwo Road", "Challenge", "Mokola", "Ojoo"], answer: 0 },
  { q: "Amala best pairs with ___?", options: ["Gbegiri + ewedu", "Pizza", "Shawarma", "Salad"], answer: 0 },
  { q: "First skyscraper in West Africa is in ___?", options: ["Dugbe, Ibadan", "Lekki, Lagos", "Wuse, Abuja", "GRA, PH"], answer: 0 },
  { q: "'Je Omoluabi' means ___?", options: ["Be a person of character", "Be rich fast", "Dodge VIO", "Haggle hard"], answer: 0 },
  { q: "Cocoa House was built from proceeds of ___?", options: ["Cocoa + farm produce", "Oil wells", "Gold mines", "Import duties"], answer: 0 },
  { q: "Bower Tower sits closest to which area?", options: ["Oke-Are / Beere axis", "Ring Road", "Sango", "Apata"], answer: 0 },
  { q: "UI is short for ___?", options: ["University of Ibadan", "Urban Institute", "Unity Initiative", "Union of Ibadan"], answer: 0 },
  { q: "Bodija Market is famous mainly for ___?", options: ["Foodstuff", "Phones", "Cars", "Gold"], answer: 0 },
  { q: "Gbagi market (Bola Ige) is famous for ___?", options: ["Fabrics", "Fish", "Cement", "Laptops"], answer: 0 },
  { q: "'O wa!' in a micra means ___?", options: ["I'm alighting / stop here", "Drive faster", "Full load", "No change"], answer: 0 },
  { q: "Agodi Gardens is best for ___?", options: ["Picnic + rest", "Exam hall", "Motor park", "Nightclub"], answer: 0 },
  { q: "The Olubadan coronation holds at ___?", options: ["Mapo Hall", "Palms Mall", "UI Gate", "Gbagi"], answer: 0 },
  { q: "'Ko Ola, Ko Iwa' means ___?", options: ["Wealth and character", "Rice and beans", "Rain and sun", "Danfo and micra"], answer: 0 },
  { q: "Which LGA HQ is at Mapo?", options: ["Ibadan South-East", "Ibadan North", "Akinyele", "Oluyole"], answer: 0 },
  { q: "Mokola is known for its ___?", options: ["Hill", "Beach", "Airport", "Seaport"], answer: 0 },
  { q: "A good Bodija trader first ___?", options: ["Buys low at Oja Oba", "Shouts loudest", "Sells on credit", "Closes early"], answer: 0 },
];

export const TITLE_LADDER = [
  "Omo Adugbo",
  "Gbajúmọ̀",
  "Mogaji",
  "Otun",
  "Olubadan of Hustle",
] as const;

// ---- Hoods (turf board) ----
export interface Hood {
  id: HoodId;
  name: string;
  oriki: string;
}

export const HOODS: Hood[] = [
  { id: "bodija", name: "Bodija", oriki: "Bodija — planned estate, market kings." },
  { id: "agbowo", name: "Agbowo / UI", oriki: "Agbowo — student brain + hostel hustle." },
  { id: "challenge", name: "Challenge / Molete", oriki: "Challenge — traffic knot, no dulling." },
  { id: "iwo-road", name: "Iwo Road", oriki: "Iwo Road — park madness, final boss." },
  { id: "ojoo", name: "Ojoo / Moniya", oriki: "Ojoo — gateway, lake-calm Eleyele." },
  { id: "beere", name: "Beere / Mapo", oriki: "Beere — brown roofs, Olubadan ground." },
];

// ---- Story missions (Itan Mi) ----
export interface Mission {
  id: string;
  chapter: string;
  title: string;
  desc: string;
  check: string;
  rewardOla: number;
  rewardIwa: number;
}

export const MISSIONS: Mission[] = [
  { id: "m1", chapter: "1 · Arrival", title: "Land for Ojoo", desc: "Create your character + collect welcome bonus (done on entry).", check: "auto", rewardOla: 0, rewardIwa: 2 },
  { id: "m2", chapter: "1 · Arrival", title: "Small savings", desc: "Hold at least ₦25,000 at once.", check: "ola>=25000", rewardOla: 0, rewardIwa: 5 },
  { id: "m3", chapter: "2 · Hustle", title: "First micra run", desc: "Complete one Micra hustle or ride to Iwo Road.", check: "micra>=1", rewardOla: 2000, rewardIwa: 2 },
  { id: "m4", chapter: "2 · Hustle", title: "Bodija trader", desc: "Complete one profitable Bodija sale.", check: "trade>=1", rewardOla: 2000, rewardIwa: 2 },
  { id: "m5", chapter: "2 · Hustle", title: "Pass 3 exams", desc: "Answer 3 UI Exam questions correctly.", check: "examPass>=3", rewardOla: 3000, rewardIwa: 5 },
  { id: "m6", chapter: "3 · Ordeal", title: "Survive NEPA week", desc: "Reach Day 4 (keep chopping + hustling).", check: "day>=4", rewardOla: 3000, rewardIwa: 5 },
  { id: "m7", chapter: "3 · Ordeal", title: "Family meeting", desc: "Choose the Omoluabi path in a Sunday event.", check: "family>=1", rewardOla: 0, rewardIwa: 10 },
  { id: "m8", chapter: "4 · Title", title: "Mogaji nomination", desc: "Reach ₦1,000,000 Ola AND 65 Iwa.", check: "mogaji", rewardOla: 5000, rewardIwa: 5 },
];

// ---- Life events ----
// `backgrounds` limits an event to certain lives; omit it for everyone.
// `bond` moves the family meter (Mama's trust / Daddy's approval).
export interface LifeEventOption {
  label: string;
  ola: number;
  iwa: number;
  energy: number;
  bond?: number;
  note: string;
  /** option only offered when this holds (lib/game/storylets) */
  when?: StoryCond;
  /** effects on the long life: flags, school, people */
  fx?: StoryFx;
}

/**
 * A life event, or "storylet": fires when its conditions hold. Priority
 * storylets (JAMB results, call-up letters) fire as soon as they can;
 * the rest are drawn at random among those eligible.
 */
export interface LifeEvent {
  id: string;
  title: string;
  desc: string;
  backgrounds?: BackgroundId[];
  options: LifeEventOption[];
  when?: StoryCond;
  priority?: boolean;
  once?: boolean;
  oncePerYear?: boolean;
  /** days before it can fire again */
  cooldown?: number;
  /** relative odds among eligible storylets (default 1) */
  weight?: number;
}

export const LIFE_EVENTS: LifeEvent[] = [
  {
    id: "nepa",
    title: "⚡ IBEDC light-out!",
    desc: "Light-out 6pm–10pm Mokola–Challenge. Phone dying, food go spoil.",
    options: [
      { label: "Buy fuel for the gen (₦3,500)", ola: -3500, iwa: 1, energy: 10, note: "Gen on. Omoluabi plans ahead. Iwa +1." },
      { label: "Manage in the dark", ola: 0, iwa: 0, energy: -25, note: "Hot, dark night. Energy -25." },
    ],
  },
  {
    id: "rain",
    title: "🌧️ Rain lock Ring Road!",
    desc: "Rain don lock Ring Road. Fares double today, but potholes hide under the water.",
    options: [
      { label: "Hustle in the rain (+risk)", ola: 4000, iwa: 0, energy: -15, note: "+₦4,000 risk money. Energy -15." },
      { label: "Stay indoors", ola: 0, iwa: 2, energy: 5, note: "Patience na virtue. Iwa +2." },
    ],
  },
  {
    id: "family",
    title: "👪 Sunday family meeting",
    desc: "Mama needs ₦5,000 for soup ingredients and meeting dues. A friend's owambe is the same day.",
    backgrounds: ["omo-iya-lobe"],
    options: [
      { label: "Send Mama ₦5,000", ola: -5000, iwa: 10, energy: 0, bond: 8, note: "Omoluabi! Iwa +10, Mama's trust +8." },
      { label: "Go to the owambe instead", ola: 0, iwa: -5, energy: 10, bond: -6, note: "Fun now, Mama's face later. Iwa -5." },
    ],
  },
  {
    id: "task-force",
    title: "🚨 Task force at Oja'ba!",
    desc: "The task force is clearing stalls on the road. Mama's pot and table are on the list.",
    backgrounds: ["omo-iya-lobe"],
    options: [
      { label: "Settle them (₦5,000)", ola: -5000, iwa: -2, energy: 0, bond: 4, note: "Stall saved. Mama is relieved, you're not proud. Iwa -2." },
      { label: "Help Mama carry everything inside", ola: 0, iwa: 4, energy: -20, bond: 6, note: "Back aching, stall safe. Iwa +4, Mama's trust +6." },
    ],
  },
  {
    id: "neighbour-loan",
    title: "🤝 Iya Basira's offer",
    desc: "The neighbour heard about Tunde's fees. She offers to lend you ₦10,000, payable when you can.",
    backgrounds: ["omo-iya-lobe"],
    options: [
      { label: "Accept with thanks", ola: 10000, iwa: -1, energy: 0, note: "+₦10,000. The whole compound will know by evening." },
      { label: "Decline politely", ola: 0, iwa: 3, energy: 0, note: "Pride intact. Iwa +3." },
    ],
  },
  {
    id: "hangers-on",
    title: "📞 Cousin Kunle calling…",
    desc: "Kunle has 'a sure deal' on a POS business and needs ₦30,000 to start. He swears on his mother.",
    backgrounds: ["alowonle"],
    options: [
      { label: "Give him ₦30,000", ola: -30000, iwa: 4, energy: 0, bond: -2, note: "Kunle is praying for you loudly. Daddy thinks you're soft. Iwa +4." },
      { label: "Say no", ola: 0, iwa: -3, energy: 0, bond: 2, note: "Kunle tells the family you've changed. Iwa -3." },
    ],
  },
  {
    id: "daddy-dinner",
    title: "🍽️ Dinner with Daddy",
    desc: "Daddy puts his fork down. 'So, what exactly are you doing with your life?'",
    backgrounds: ["alowonle"],
    options: [
      { label: "'I'll join your firm, sir.'", ola: 0, iwa: 0, energy: -5, bond: 12, note: "Daddy smiles for the first time this month. Approval +12." },
      { label: "'I'm building my own thing.'", ola: 0, iwa: 3, energy: 0, bond: -10, note: "Silence. Then: 'We'll see.' Approval -10, Iwa +3." },
    ],
  },
  {
    id: "gen-diesel",
    title: "🛢️ Diesel finished",
    desc: "The estate generator is out of diesel and Daddy is in Abuja. The gateman is looking at you.",
    backgrounds: ["alowonle"],
    options: [
      { label: "Pay for diesel (₦25,000)", ola: -25000, iwa: 2, energy: 10, bond: 4, note: "Light restored. Mummy calls you 'my responsible child'." },
      { label: "Let it be till Daddy returns", ola: 0, iwa: -2, energy: -15, bond: -4, note: "Sweaty night. Mummy is not impressed." },
    ],
  },
];

/** Events that can fire for a given life. */
export function eventsFor(bg: BackgroundId): LifeEvent[] {
  return LIFE_EVENTS.filter((e) => !e.backgrounds || e.backgrounds.includes(bg));
}

// ---- District deeds: one mission rooted in each district's real life ----
// check keys: visit:<zone> | micra:<n> | trade:<n> | exam:<n> | ola:<n> |
// iwa:<n> | day:<n> | rests:<n> | fullload:<n> | family:<n>
// Compound keys join with "+" (ALL must hold).
export interface Deed {
  id: string;
  zone: string;
  title: string;
  desc: string;
  check: string;
  rewardOla: number;
  rewardIwa: number;
}

export const DISTRICT_DEEDS: Deed[] = [
  { id: "d-uigate", zone: "ui-gate", title: "First gate pass", desc: "Waka through UI Gate. Feel the front-of-school breeze.", check: "visit:ui-gate", rewardOla: 1000, rewardIwa: 2 },
  { id: "d-sango", zone: "sango", title: "Sango shuttle", desc: "Run micra twice on the Sango corridor.", check: "micra:2", rewardOla: 2500, rewardIwa: 2 },
  { id: "d-samonda", zone: "samonda", title: "Samonda window-shop", desc: "Flex small with ₦50,000+ in pocket at Samonda.", check: "visit:samonda+ola:50000", rewardOla: 1500, rewardIwa: 2 },
  { id: "d-bodija", zone: "bodija", title: "Bodija bulk", desc: "Close 3 profitable Bodija sales. Haggle crown loading.", check: "trade:3", rewardOla: 4000, rewardIwa: 4 },
  { id: "d-mokola", zone: "mokola", title: "Hill climb", desc: "Climb Oke Mokola and complete a micra run.", check: "visit:mokola+micra:1", rewardOla: 2500, rewardIwa: 3 },
  { id: "d-dugbe", zone: "dugbe", title: "Cocoa ambition", desc: "Hold ₦100,000 under Cocoa House shadow. Ile Awon Agbe sees you.", check: "visit:dugbe+ola:100000", rewardOla: 3000, rewardIwa: 3 },
  { id: "d-mapo", zone: "mapo", title: "Sunset for Mapo", desc: "Stand Oke Mapo with 60+ Iwa. The brown roofs judge fairly.", check: "visit:mapo+iwa:60", rewardOla: 2000, rewardIwa: 6 },
  { id: "d-ojaoba", zone: "oja-oba", title: "Oja Oba bulk buy", desc: "Buy low twice at the King's market.", check: "trade:2", rewardOla: 2500, rewardIwa: 2 },
  { id: "d-oje", zone: "oje", title: "Greet Oje elders", desc: "Show face at Oje with 50+ Iwa. Respect opens doors.", check: "visit:oje+iwa:50", rewardOla: 1500, rewardIwa: 5 },
  { id: "d-agodi", zone: "agodi", title: "Agodi afternoon", desc: "Rest at home then picnic Agodi. Soft life, Omoluabi style.", check: "visit:agodi+rests:1", rewardOla: 1500, rewardIwa: 4 },
  { id: "d-challenge", zone: "challenge", title: "Beat the knot", desc: "Three micra runs through Challenge traffic. Honk or be honked.", check: "micra:3", rewardOla: 3500, rewardIwa: 3 },
  { id: "d-molete", zone: "molete", title: "Bridge delivery", desc: "Cross Molete bridge with goods: one market sale + a visit.", check: "visit:molete+trade:1", rewardOla: 2500, rewardIwa: 3 },
  { id: "d-ring", zone: "ring-road", title: "Rain run", desc: "Survive to Day 3 and run Ring Road in the rain season.", check: "day:3+visit:ring-road", rewardOla: 3000, rewardIwa: 3 },
  { id: "d-iwo", zone: "iwo-road", title: "Full load legend", desc: "Depart Iwo Road park with a 6/6 full micra. Tout go hail you.", check: "fullload:1", rewardOla: 5000, rewardIwa: 4 },
  { id: "d-eleyele", zone: "eleyele", title: "Lakeside calm", desc: "Reach Day 2 and chill Eleyele lake. Rest before the next climb.", check: "day:2+visit:eleyele", rewardOla: 2000, rewardIwa: 4 },
];

// ---- Wardrobe: aso-ebi looks. Virtual naira NOW, real naira later ----
// Each item carries an optional `ngn` price for the future Paystack switch.
// Buying with game money today; equipping changes your avatar everywhere.
export interface WardrobeItem {
  id: string;
  name: string;
  desc: string;
  costV: number; // virtual naira today
  ngn: number | null; // real-naira price later (null = not for sale yet)
  kind: "top" | "set";
  color: string; // top/agbada color when equipped
  gear: "fila" | "gele" | null; // forced headgear for sets, else keep yours
}

export const WARDROBE: WardrobeItem[] = [
  { id: "w-adire", name: "Adire Indigo", desc: "Deep indigo dye, Bodija market classic.", costV: 16000, ngn: 500, kind: "top", color: "#1e3a8a", gear: null },
  { id: "w-asookegold", name: "Aso-Oke Gold", desc: "Ceremony-grade gold weave.", costV: 50000, ngn: 1000, kind: "top", color: "#d4af37", gear: null },
  { id: "w-emerald", name: "Ankara Emerald", desc: "Owambe-floor emerald print.", costV: 30000, ngn: 750, kind: "top", color: "#046307", gear: null },
  { id: "w-velvet", name: "Burgundy Velvet", desc: "Soft, heavy, expensive-looking.", costV: 64000, ngn: 1200, kind: "top", color: "#6d0f2c", gear: null },
  { id: "w-royal", name: "Royal Purple", desc: "Mogaji meeting purple.", costV: 40000, ngn: 900, kind: "top", color: "#5b21b6", gear: null },
  { id: "w-lagosblue", name: "Lagos Lagoon Blue", desc: "For when you visit the island boys.", costV: 24000, ngn: 600, kind: "top", color: "#0b5fa5", gear: null },
  { id: "w-set-asoebi", name: "Aso-Ebi Set (magenta)", desc: "Full party set: magenta top + orchestrated gele.", costV: 100000, ngn: 2000, kind: "set", color: "#c2185b", gear: "gele" },
  { id: "w-set-agbada", name: "Grand Agbada Set (cream-gold)", desc: "Flowing agbada + fila. Elder-tier flex.", costV: 120000, ngn: 2500, kind: "set", color: "#e9d8a6", gear: "fila" },
  { id: "w-set-owambe", name: "Owambe Shutdown Set (teal)", desc: "Dancefloor-teal + matching gele. Spray magnet.", costV: 90000, ngn: 1800, kind: "set", color: "#0e7a8a", gear: "gele" },
  { id: "w-set-royal", name: "Olubadan Court Set (purple-gold)", desc: "The crown-adjacent look. Ends conversations.", costV: 160000, ngn: 3500, kind: "set", color: "#5b21b6", gear: "fila" },
];

// ---- Daily hunts: one rotating deed per weekday (like their daily hunt) ----
// check keys reuse the deed engine: micra, trade, exam, visit, iwa, day,
// rests, fullload, family, spray.
export interface DailyHunt {
  weekday: number; // 0 = Sunday
  title: string;
  desc: string;
  check: string;
  rewardOla: number;
  rewardIwa: number;
}

export const DAILY_HUNTS: DailyHunt[] = [
  { weekday: 0, title: "Sunday Rest & Visit", desc: "Rest at home and show face at Agodi.", check: "rests:1+visit:agodi", rewardOla: 2000, rewardIwa: 5 },
  { weekday: 1, title: "Monday Bodija Bulk", desc: "Start the week: 3 profitable Bodija sales.", check: "trade:3", rewardOla: 4000, rewardIwa: 4 },
  { weekday: 2, title: "Tuesday Micra Legend", desc: "Two full micra runs. Any corridor.", check: "micra:2", rewardOla: 3500, rewardIwa: 3 },
  { weekday: 3, title: "Wednesday Brain Day", desc: "Pass 2 UI exams.", check: "exam:2", rewardOla: 3000, rewardIwa: 4 },
  { weekday: 4, title: "Thursday Hustle Double", desc: "One market sale + one micra run.", check: "trade:1+micra:1", rewardOla: 3500, rewardIwa: 3 },
  { weekday: 5, title: "Friday Owambe Spray", desc: "Spray the owambe floor once. Any amount.", check: "spray:1", rewardOla: 2000, rewardIwa: 5 },
  { weekday: 6, title: "Saturday Iwo Full Load", desc: "Depart any park with a 6/6 full micra.", check: "fullload:1", rewardOla: 5000, rewardIwa: 4 },
];
