// Omo Ibadan — storylets: life events that fire when their conditions hold.
//
// The early random events (NEPA, rain, family meeting…) are storylets with no
// conditions. The ones here follow the long life: JAMB, school, NYSC, the
// people you grow close to, marriage, children, and the pressures of each
// background. Text can use {partner}, {score}, {school}, {posting}, {grade}.

import { LIFE_EVENTS, type LifeEvent } from "./content";
import { JAMB_FORM, LOVE, SCHOOLS, type EduStage, type RelStage, type School } from "./life";
import type { BackgroundId } from "./backgrounds";

export interface StoryCond {
  bg?: BackgroundId[];
  minAge?: number;
  maxAge?: number;
  edu?: EduStage[];
  school?: School;
  minScore?: number;
  maxScore?: number;
  flags?: string[];
  notFlags?: string[];
  /** a person's relationship: at least `min`, at most `max`, bond at least `minBond` */
  rel?: { id: string; min?: RelStage; max?: RelStage; minBond?: number };
  /** has someone you're dating, engaged to, or married to */
  partner?: boolean;
  /** partner's stage at least this */
  partnerMin?: RelStage;
  /** partner's bond at most this */
  partnerMaxBond?: number;
  /** days at the partner's current stage */
  partnerDays?: number;
  minOla?: number;
  minBond?: number;
  maxBond?: number;
  minDay?: number;
  /** day-of-year window [from, to], 0 = 4 Jan */
  doy?: [number, number];
  career?: boolean;
  /** title rung (0 Omo Adugbo … 4 Olubadan of Hustle) at least */
  minTitle?: number;
  minChildren?: number;
}

export interface StoryFx {
  flag?: string[];
  unflag?: string[];
  edu?: { stage?: EduStage; school?: School | null; posting?: string | null; extraYears?: number };
  /** "@partner" targets whoever you're with */
  rel?: { id: string; bond?: number; stage?: RelStage }[];
  children?: number;
  milestone?: string;
  fun?: number;
  social?: number;
}

const ev = (e: LifeEvent): LifeEvent => e;

const STORY: LifeEvent[] = [
  // ---- JAMB and admission ----
  ev({
    id: "jamb-form",
    title: "📝 JAMB form is out",
    desc: "UTME registration is open at the CBT centres on Ring Road and Agbowo. Form plus the reading app is ₦7,700. Mama's friends' children are all registering.",
    priority: true,
    oncePerYear: true,
    when: { edu: ["none"], doy: [0, 55], maxAge: 24, minDay: 3 },
    options: [
      { label: `Register for JAMB (₦${JAMB_FORM.toLocaleString()})`, ola: -JAMB_FORM, iwa: 2, energy: -5, note: "Biometrics done, photo taken with your eyes half closed. Exam is in April. Read hard: the UI exam hall questions count.", fx: { edu: { stage: "registered" }, milestone: "Registered for JAMB UTME" } },
      { label: "Not this year. Hustle first", ola: 0, iwa: 0, energy: 0, note: "Maybe next year. The form comes out every January." },
      { label: "School is not for me. I'll learn a trade", ola: 0, iwa: 1, energy: 0, note: "Many of Ibadan's richest never saw the inside of UI. Your road is the market.", fx: { edu: { stage: "dropped" }, milestone: "Chose the hustle over school" } },
    ],
  }),
  ev({
    id: "jamb-result",
    title: "📊 JAMB result is out: {score}",
    desc: "You check the result on your phone at a cyber café in Agbowo, hands shaking. {score} out of 400.",
    priority: true,
    oncePerYear: true,
    when: { edu: ["awaiting"], doy: [117, 364] },
    options: [
      { label: "Accept UI's admission offer", ola: -25000, iwa: 5, energy: 0, note: "Acceptance fee paid. You're going to the first and the best. Resumption is in October.", when: { minScore: SCHOOLS.ui.cutoff }, fx: { edu: { stage: "admitted", school: "ui" }, milestone: "Admitted to the University of Ibadan" } },
      { label: "Accept the Poly's offer", ola: -15000, iwa: 3, energy: 0, note: "Acceptance fee paid. The Polytechnic, Ibadan. ND first, then HND. Resumption is in October.", when: { minScore: SCHOOLS.poly.cutoff }, fx: { edu: { stage: "admitted", school: "poly" }, milestone: "Admitted to The Polytechnic, Ibadan" } },
      { label: "Try again next year", ola: 0, iwa: 0, energy: 0, note: "Next January, the form comes out again. Read more past questions.", fx: { edu: { stage: "none" } } },
      { label: "Leave school, face the hustle", ola: 0, iwa: 0, energy: 0, note: "The market doesn't ask for JAMB scores.", fx: { edu: { stage: "dropped" }, milestone: "Chose the hustle over school" } },
    ],
  }),
  ev({
    id: "fees-ui",
    title: "🏛️ UI school fees",
    desc: "The new session's fees are on the portal: ₦100,000, and the bursary closes in two weeks.",
    priority: true,
    oncePerYear: true,
    when: { edu: ["student"], school: "ui", doy: [282, 364] },
    options: [
      { label: "Pay the fees (₦100,000)", ola: -100000, iwa: 2, energy: 0, note: "Paid. Course registration done. Another session." },
      { label: "Ask Daddy to pay", ola: 0, iwa: -1, energy: 0, bond: -3, note: "Daddy pays, with a speech about the value of money.", when: { bg: ["alowonle"], minBond: 40 } },
      { label: "Apply for the Oyo State bursary", ola: -50000, iwa: 3, energy: -10, note: "Three queues and two forms later, the state pays half. You pay ₦50,000.", when: { minScore: 250 } },
      { label: "Defer the session", ola: 0, iwa: -2, energy: 0, note: "You'll lose a year. Mama is quiet about it.", fx: { edu: { extraYears: 1 }, milestone: "Deferred a session at UI" } },
    ],
  }),
  ev({
    id: "fees-poly",
    title: "🏫 Poly school fees",
    desc: "Bursary says fees for the new session are ₦75,000. No payment, no exam.",
    priority: true,
    oncePerYear: true,
    when: { edu: ["student"], school: "poly", doy: [282, 364] },
    options: [
      { label: "Pay the fees (₦75,000)", ola: -75000, iwa: 2, energy: 0, note: "Paid. Another session at the Poly." },
      { label: "Ask Daddy to pay", ola: 0, iwa: -1, energy: 0, bond: -3, note: "Daddy pays. 'The Poly? With all my connections?'", when: { bg: ["alowonle"], minBond: 40 } },
      { label: "Defer the session", ola: 0, iwa: -2, energy: 0, note: "A year lost. The hustle continues.", fx: { edu: { extraYears: 1 }, milestone: "Deferred a session at the Poly" } },
    ],
  }),
  ev({
    id: "carryover",
    title: "📉 Carry-over",
    desc: "The results are on the notice board. You didn't attend enough lectures, and it shows: two carry-overs. You'll need an extra year.",
    priority: true,
    when: { flags: ["carryover-pending"] },
    options: [
      { label: "Face it. Library every day", ola: 0, iwa: 2, energy: -10, note: "Extra year. You'll attend this time.", fx: { unflag: ["carryover-pending"] } },
      { label: "'Sort' the lecturer (₦50,000)", ola: -50000, iwa: -10, energy: 0, note: "The lecturer took it, and now he knows your face. Iwa -10. It still counts as an extra year.", fx: { unflag: ["carryover-pending"] } },
    ],
  }),
  ev({
    id: "graduation",
    title: "🎓 Graduation: {grade}",
    desc: "Your name is called at convocation. {grade}. Mama ululates in the stands; your friends spray you at the gate.",
    priority: true,
    once: true,
    when: { flags: ["just-graduated"] },
    options: [
      { label: "Throw a small party (₦40,000)", ola: -40000, iwa: 2, energy: -10, note: "Jollof, small chops, a DJ from Agbowo. Everyone you know came.", fx: { unflag: ["just-graduated"], social: 30, fun: 30 } },
      { label: "Quiet family dinner", ola: 0, iwa: 3, energy: 0, bond: 6, note: "Amala and gbegiri at home. Mama prays over you for ten minutes.", fx: { unflag: ["just-graduated"] } },
    ],
  }),
  ev({
    id: "nysc-callup",
    title: "🇳🇬 NYSC call-up: {posting}",
    desc: "Your call-up letter is out. You've been posted to {posting} State for the one-year service. Camp starts in two weeks.",
    priority: true,
    once: true,
    when: { edu: ["graduate"], flags: ["callup-ready"] },
    options: [
      { label: "Pack your khaki and go", ola: 0, iwa: 5, energy: -10, note: "White shoes, mosquito net, garri. Three weeks of camp, then a year of service. The monthly allowance is ₦77,000.", fx: { edu: { stage: "nysc" }, unflag: ["callup-ready"], milestone: "Started NYSC service year" } },
      { label: "'Work' a redeployment to Oyo (₦50,000)", ola: -50000, iwa: -4, energy: 0, note: "Someone knows someone. You'll serve in Ibadan.", fx: { edu: { stage: "nysc", posting: "Oyo" }, unflag: ["callup-ready"], milestone: "Started NYSC service year in Oyo" } },
    ],
  }),
  ev({
    id: "nysc-ppa",
    title: "🏫 NYSC place of primary assignment",
    desc: "Your PPA is a community secondary school. The principal hands you a timetable: SS2 Mathematics, 40 students, no fan.",
    priority: true,
    once: true,
    when: { edu: ["nysc"], minDay: 1 },
    options: [
      { label: "Teach well, start an extra lesson", ola: 0, iwa: 6, energy: -10, note: "The students start calling you 'Corper Teacher'. Iwa +6.", fx: { flag: ["ppa-teacher"] } },
      { label: "Show up when you must", ola: 0, iwa: -2, energy: 10, note: "You sign the register and disappear. Nobody complains, yet." },
    ],
  }),
  ev({
    id: "passing-out",
    title: "🎖️ Passing out",
    desc: "Your NYSC service year is done. Discharge certificate in hand: every job advert in the country can now see you.",
    priority: true,
    once: true,
    when: { edu: ["served"], flags: ["just-served"] },
    options: [
      { label: "Frame the certificate", ola: 0, iwa: 3, energy: 0, note: "It hangs next to your degree. Mama shows every visitor.", fx: { unflag: ["just-served"] } },
    ],
  }),

  // ---- people: friendship and love ----
  ev({
    id: "ada-birthday",
    title: "🎂 Ada's birthday",
    desc: "Ada posts a countdown: 'Birthday tomorrow 🎉'. She hasn't asked you for anything.",
    oncePerYear: true,
    when: { rel: { id: "Ada", min: "friend" } },
    options: [
      { label: "Buy her a gift (₦10,000)", ola: -10000, iwa: 1, energy: 0, note: "A small perfume and a card. She texts back three hearts.", fx: { rel: [{ id: "Ada", bond: 12 }] } },
      { label: "Send a long message", ola: 0, iwa: 0, energy: 0, note: "'Thank you!! 😊' She replied fast.", fx: { rel: [{ id: "Ada", bond: 4 }] } },
    ],
  }),
  ev({
    id: "tobi-solar",
    title: "☀️ Tobi's solar idea",
    desc: "Tobi has a plan: install small solar kits for shops in Sango. He needs ₦60,000 for the first panels and a partner who can talk to customers.",
    once: true,
    when: { rel: { id: "Tobi", min: "close" } },
    options: [
      { label: "Go in with him (₦60,000)", ola: -60000, iwa: 3, energy: -5, note: "First install is a barbing salon. The barber can't stop smiling at his clippers running in a light-out.", fx: { flag: ["solar-partner"], rel: [{ id: "Tobi", bond: 12 }], milestone: "Co-founded a solar business with Tobi" } },
      { label: "Wish him well", ola: 0, iwa: 0, energy: 0, note: "He understands. 'When it blows, don't say I didn't call you.'", fx: { rel: [{ id: "Tobi", bond: -3 }] } },
    ],
  }),
  ev({
    id: "emeka-credit",
    title: "📦 Oga Emeka's offer",
    desc: "'You've been honest with me. Take provisions on credit, open a kiosk, pay me back from sales. ₦50,000 deposit, the rest we'll see.'",
    once: true,
    when: { rel: { id: "Oga Emeka", min: "close" }, notFlags: ["kiosk"] },
    options: [
      { label: "Open a kiosk (₦50,000 deposit)", ola: -50000, iwa: 3, energy: -10, note: "A green kiosk by the road, stocked from Gbagi. It earns while you hustle elsewhere.", fx: { flag: ["kiosk"], rel: [{ id: "Oga Emeka", bond: 8 }], milestone: "Opened your first kiosk" } },
      { label: "Not ready yet", ola: 0, iwa: 0, energy: 0, note: "'The offer stands. Don't wait too long.'" },
    ],
  }),
  ev({
    id: "kiosk-thief",
    title: "🚨 Your kiosk was broken into",
    desc: "The padlock is cut. Milo, Indomie, recharge cards: gone. The vigilance group says they saw nothing.",
    cooldown: 120,
    when: { flags: ["kiosk"] },
    options: [
      { label: "Restock and pay a night guard (₦30,000)", ola: -30000, iwa: 2, energy: -5, note: "New padlock, new stock, and Baba Sule sleeps beside it now." },
      { label: "Close the kiosk", ola: 0, iwa: -2, energy: 0, note: "You hand the kiosk back. Oga Emeka is disappointed but understands.", fx: { unflag: ["kiosk"], rel: [{ id: "Oga Emeka", bond: -10 }] } },
    ],
  }),
  ev({
    id: "chief-letter",
    title: "✉️ The Chief remembers you",
    desc: "'Young person. You carry a bag with patience. Here: a letter for the Director at Cocoa House. Don't disgrace me.'",
    once: true,
    when: { rel: { id: "Chief on the green", min: "friend", minBond: 35 } },
    options: [
      { label: "Thank him on your knees", ola: 0, iwa: 4, energy: 0, note: "You now hold a letter that opens doors: office careers start you one level up.", fx: { flag: ["chief-letter"], rel: [{ id: "Chief on the green", bond: 6 }], milestone: "Got a recommendation letter from the Chief" } },
    ],
  }),
  ev({
    id: "meet-family",
    title: "🏠 '{partner}, come and meet my people'",
    desc: "You've been dating a while. {partner} wants to introduce you to their family this Sunday, and wants to meet yours.",
    once: true,
    when: { partner: true, partnerDays: 45 },
    options: [
      { label: "Go, with a gift (₦15,000)", ola: -15000, iwa: 3, energy: -10, note: "You prostrated properly, ate twice, praised the stew. They like you.", fx: { rel: [{ id: "@partner", bond: 10 }] } },
      { label: "'Next month, it's too early'", ola: 0, iwa: 0, energy: 0, note: "{partner} says it's fine. It isn't, quite.", fx: { rel: [{ id: "@partner", bond: -6 }] } },
    ],
  }),
  ev({
    id: "daddy-partner",
    title: "👔 Daddy asks about {partner}",
    desc: "'Who are this person's people? What does the father do?' Daddy has heard you're serious with someone.",
    once: true,
    backgrounds: ["alowonle"],
    when: { partner: true, partnerDays: 30 },
    options: [
      { label: "'Character is what matters, sir'", ola: 0, iwa: 4, energy: 0, bond: -6, note: "Daddy grunts. Mummy winks at you from the kitchen.", fx: { rel: [{ id: "@partner", bond: 6 }] } },
      { label: "Promise to 'think about it'", ola: 0, iwa: -3, energy: 0, bond: 5, note: "Daddy is satisfied. {partner} feels the distance.", fx: { rel: [{ id: "@partner", bond: -8 }] } },
    ],
  }),
  ev({
    id: "partner-drift",
    title: "💔 '{partner}: we need to talk'",
    desc: "{partner} says you've been absent: no calls, no visits. 'Am I still part of your plans?'",
    priority: true,
    cooldown: 60,
    when: { partner: true, partnerMaxBond: 30 },
    options: [
      { label: "Apologise and make time", ola: -10000, iwa: 2, energy: -10, note: "A long evening at Agodi. Things are softer, for now.", fx: { rel: [{ id: "@partner", bond: 18 }] } },
      { label: "Let it end kindly", ola: 0, iwa: 0, energy: 0, note: "You part as friends. It hurts anyway.", fx: { rel: [{ id: "@partner", bond: 5, stage: "close" }], milestone: "A relationship ended" } },
    ],
  }),
  ev({
    id: "expecting",
    title: "👶 Good news",
    desc: "{partner} sits you down, smiling and crying at once. You're going to be a parent.",
    priority: true,
    cooldown: LOVE.childAfter + 365,
    when: { partnerMin: "married", partnerDays: LOVE.childAfter, notFlags: ["expecting"] },
    options: [
      { label: "Start saving for the naming ceremony", ola: 0, iwa: 4, energy: 0, note: "Antenatal at Adeoyo. Everyone has advice. You have nine months.", fx: { flag: ["expecting"], rel: [{ id: "@partner", bond: 10 }] } },
    ],
  }),
  ev({
    id: "naming",
    title: "🍼 Naming ceremony",
    desc: "The baby is here, healthy and loud. On the eighth day, the elders gather with honey, salt, kola, bitter kola and water.",
    priority: true,
    when: { flags: ["birth-due"] },
    options: [
      { label: `Full ceremony (₦${LOVE.naming.toLocaleString()})`, ola: -LOVE.naming, iwa: 6, energy: -15, note: "Rice, goat, a live band. Every elder in the street prays for the child.", fx: { unflag: ["birth-due", "expecting"], children: 1, milestone: "Named your child" } },
      { label: "Small family naming", ola: 0, iwa: 3, energy: -5, note: "Just family, the imam or pastor, and a pot of jollof. Enough.", fx: { unflag: ["birth-due", "expecting"], children: 1, milestone: "Named your child" } },
    ],
  }),

  // ---- background pressures as life goes on ----
  ev({
    id: "mama-sick",
    title: "🏥 Mama is sick",
    desc: "Mama collapsed at the stall. Malaria and her blood pressure, the doctor at Adeoyo says. The bill is ₦40,000.",
    backgrounds: ["omo-iya-lobe"],
    cooldown: 200,
    when: { minDay: 60 },
    options: [
      { label: "Pay the hospital (₦40,000)", ola: -40000, iwa: 6, energy: -10, bond: 12, note: "Mama is home in three days, already asking about her stall." },
      { label: "Mama refuses the hospital: agbo from Oje", ola: 0, iwa: 0, energy: 0, bond: -4, note: "Agbo and rest. She recovers slowly. Tunde looks at you for a long time." },
    ],
  }),
  ev({
    id: "tunde-waec",
    title: "📜 Tunde's WAEC result",
    desc: "Tunde passed: five credits including English and Maths. He wants to write JAMB and study engineering. 'Will you help me, egbon?'",
    backgrounds: ["omo-iya-lobe"],
    once: true,
    when: { minDay: 200 },
    options: [
      { label: "Promise to pay his JAMB and first fees", ola: -30000, iwa: 8, energy: 0, bond: 10, note: "Tunde hugs you so hard your back cracks. Mama can't speak.", fx: { rel: [{ id: "Tunde", bond: 20 }], flag: ["tunde-sponsor"], milestone: "Sponsored Tunde's education" } },
      { label: "'Learn a trade first'", ola: 0, iwa: -2, energy: 0, bond: -6, note: "He nods. He goes to learn welding at Molete.", fx: { rel: [{ id: "Tunde", bond: -8 }] } },
    ],
  }),
  ev({
    id: "cut-off",
    title: "📵 Daddy cuts the allowance",
    desc: "'You're done with school. A grown adult does not collect pocket money. Join my company or stand on your own.'",
    backgrounds: ["alowonle"],
    priority: true,
    once: true,
    when: { edu: ["served", "dropped"] },
    options: [
      { label: "'I'll stand on my own'", ola: 0, iwa: 6, energy: 0, bond: -4, note: "No more Friday alerts. It's your own money from here.", fx: { flag: ["own-feet"], milestone: "Stood on your own feet" } },
      { label: "Join Daddy's company", ola: 0, iwa: -2, energy: 0, bond: 12, note: "Office in Daddy's building on Ring Road. The staff call you 'Junior Oga'. The allowance continues as salary.", fx: { flag: ["daddys-firm"], milestone: "Joined Daddy's company" } },
    ],
  }),
  ev({
    id: "club-table",
    title: "🍾 A friend's birthday table",
    desc: "Your friend from secondary school is turning 21 at a lounge on Ring Road. Everyone is 'dropping something' for the table: ₦50,000 each.",
    backgrounds: ["alowonle"],
    cooldown: 60,
    when: { minDay: 20 },
    options: [
      { label: "Drop ₦50,000", ola: -50000, iwa: -1, energy: -15, note: "Bottles, sparklers, and a photo where you look rich. The Palms will hear.", fx: { fun: 30, social: 25 } },
      { label: "Send a voice note and stay home", ola: 0, iwa: 2, energy: 5, note: "Someone screenshots your 'happy birthday bro' to the group. You survive.", fx: { social: -10 } },
    ],
  }),
  ev({
    id: "church-levy",
    title: "⛪ Building levy",
    desc: "The new church auditorium needs every 'big family' to pledge. Your family's name is called out at service.",
    backgrounds: ["alowonle"],
    cooldown: 150,
    when: { minDay: 40 },
    options: [
      { label: "Pledge ₦100,000", ola: -100000, iwa: 5, energy: 0, bond: 6, note: "Your name is read out with thanks. Mummy glows." },
      { label: "Pledge what you can later", ola: 0, iwa: 0, energy: 0, bond: -3, note: "Mummy's friends whisper. Mummy hears." },
    ],
  }),
  ev({
    id: "chieftaincy",
    title: "👑 A chieftaincy offer",
    desc: "The Mogaji of your compound sends word: the family wants to give you a title at the next festival. It comes with expectations: at every funeral, every wedding, every levy.",
    once: true,
    when: { minTitle: 3 },
    options: [
      { label: "Accept the title", ola: -500000, iwa: 10, energy: -10, bond: 10, note: "Beaded cap, a new name, and a line of people with 'small problems' at your gate every Saturday.", fx: { flag: ["chief"], milestone: "Installed as a chief of your compound" } },
      { label: "Decline with respect", ola: 0, iwa: 2, energy: 0, note: "'When you're ready,' the Mogaji says. He means it." },
    ],
  }),
];

/** Every storylet in the game: the early random events plus the long-life stories. */
export const STORYLETS: LifeEvent[] = [
  ...LIFE_EVENTS.map((e) => ({ cooldown: 6, ...e })),
  ...STORY,
];

export const storyletById = (id: string | null | undefined): LifeEvent | undefined =>
  id ? STORYLETS.find((s) => s.id === id) : undefined;
