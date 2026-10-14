// Omo Ibadan — Fọ́nu Mi: the phone's inbox, built from what is happening in
// your life right now. Each message lands at its own minute of the day, so the
// inbox fills up as the day goes on.

import { naira, type Background, type LifeEvent, type LifeState } from "@/lib/game";
import { formatTime } from "./clock";
import { partnerOf, relOf } from "./life";

export interface PhoneMsg {
  id: string;
  from: string;
  text: string;
  /** minute of today it arrived; earlier days are negative */
  at: number;
  /** label shown under the sender */
  time: string;
}

export interface PhoneInput {
  day: number;
  minute: number;
  bg: Background;
  paidObligations: string[];
  life: LifeState;
  event: LifeEvent | null;
  weather: "clear" | "rain";
  /** recent feed lines (newest first), for bank alerts */
  feed: string[];
}

const pick = <T,>(list: T[], seed: number): T => list[((seed % list.length) + list.length) % list.length];

/** Who sends the message about a storylet. */
function eventSender(e: LifeEvent, partner: string | null, bg: Background): string {
  const id = e.id;
  if (id.startsWith("jamb")) return "JAMB";
  if (id === "fees-ui") return "UI Bursary";
  if (id === "fees-poly") return "Poly Bursary";
  if (id.startsWith("nysc") || id === "passing-out") return "NYSC";
  if (id === "carryover" || id === "graduation") return "Course Adviser";
  if ((id.startsWith("partner") || id === "meet-family" || id === "expecting") && partner) return partner;
  if (id === "emeka-credit" || id === "kiosk-thief") return "Oga Emeka";
  if (id === "tobi-solar") return "Tobi";
  if (id === "ada-birthday") return "Ada";
  if (id === "chief-letter") return "Kabiru the caddie";
  if (id === "mama-sick" || id === "tunde-waec") return "Tunde";
  if (id === "cut-off" || id === "daddy-dinner" || id === "daddy-partner") return "Daddy";
  if (id === "hangers-on") return "Cousin Kunle";
  if (id === "club-table") return "Tolu (SS3 class)";
  if (id === "church-levy") return "Church Secretary";
  if (id === "nepa") return "IBEDC";
  if (id === "rain") return "NiMet";
  if (id === "family" || id === "task-force" || id === "neighbour-loan") return bg.id === "omo-iya-lobe" ? "Mama" : "Mummy";
  return "Notification";
}

const FRIEND_TEXTS: Record<string, string[]> = {
  Ada: ["Lecturer cancelled the 2pm class 🙌 Library later?", "Did you see the new handout price? ₦1,500 for 12 pages. Wicked.", "NEPA took light in hall again. Faculty is where I'll be."],
  Tobi: ["Arsenal vs Chelsea at the viewing centre tonight. You dey?", "Fixed another phone today. Somebody owes me suya.", "Saw a solar kit at Gbagi for a fair price. Let's talk."],
  Kemi: ["New lace just landed at Mummy's shop. Come and see.", "Owambe at Ring Road on Saturday. What are you wearing?", "The Palms is boring without you. Small chops later?"],
  Femi: ["Print rush is crazy today. Final-years everywhere.", "Amala at the buka after closing?", "Uncle's photocopier broke again. Pray for me."],
  "Oga Emeka": ["Carton prices go up next week. Buy now if you're buying.", "When you're ready to stand on your own, come and see me."],
  "Chief on the green": ["Young person. Tee off is 7am sharp. Don't be late."],
  "Coach Bisola": ["6am session tomorrow. Bring water, not excuses."],
  Tunde: ["Egbon, mock exams start Monday. Maths is killing me.", "Mama says come and eat. She made gbegiri."],
  Kunle: ["Bro, quick one. Are you around? Business matter.", "Cousin! Long time. Call me when you see this."],
};
const SWEET = ["Thinking about you. Suya later? 😊", "Get home safe, okay?", "Did you eat? Don't skip lunch again.", "Can't wait to see you this weekend ❤️"];

/** The inbox for right now, newest first. */
export function phoneInbox(p: PhoneInput): PhoneMsg[] {
  const msgs: PhoneMsg[] = [];
  const add = (id: string, from: string, text: string, at: number) => {
    if (at > p.minute) return; // hasn't arrived yet
    msgs.push({ id, from, text, at, time: at < 0 ? "Yesterday" : formatTime(at) });
  };
  const partner = partnerOf(p.life);
  const lobe = p.bg.id === "omo-iya-lobe";

  // what needs you today
  if (p.event) add(`ev-${p.event.id}`, eventSender(p.event, partner, p.bg), `${p.event.title}: ${p.event.desc}`, 6 * 60);

  // bills
  for (const o of p.bg.obligations) {
    if (p.paidObligations.includes(o.id)) continue;
    const from = o.id === "mama-rent" ? "Baba Ade (Landlord)" : o.id === "waec-fees" ? "Tunde" : lobe ? "Mama" : "Mummy";
    if (p.day > o.dueDay) add(`ob-${o.id}`, from, `${o.title} (${naira(o.amount)}) was due on Day ${o.dueDay}. Please, it's overdue.`, 7 * 60);
    else if (o.dueDay - p.day <= 3) add(`ob-${o.id}`, from, `Reminder: ${o.title}, ${naira(o.amount)}, by Day ${o.dueDay}.`, 7 * 60);
  }

  // money in
  const allowance = p.feed.find((f) => f.includes("allowance landed"));
  if (allowance) add("bank-allow", lobe ? "Bank" : "GTBank", `Credit alert: ${allowance.replace(/^.*?:\s*/, "").replace(/\.$/, "")}. Avail. bal. updated.`, 6 * 60 + 5);
  const nysc = p.feed.find((f) => f.includes("NYSC allowance"));
  if (nysc) add("bank-nysc", "Remita", "Credit alert: NYSC monthly allowance ₦77,000. Ẹ ṣé, corper.", 6 * 60 + 5);

  // family, by the time of day
  add("fam-am", lobe ? "Mama" : "Mummy", lobe ? pick(["Did you eat before going out? There's ogi in the pot.", "Bring me two derica of beans when you're coming back.", "Greet Iya Basira for me. Don't forget."], p.day) : pick(["Your father's meeting is at 4. Don't embarrass him.", "Driver is off today. Use your car, not the micra.", "Aunty Funke's daughter is getting married. Save the date."], p.day), 6 * 60 + 40);
  if (lobe) add("mamaput", "Mama Put (Bodija)", "Amala + gbegiri ready. Come and chop before night.", 17 * 60 + 30);

  // the city
  if (p.weather === "rain") add("rain", "NiMet", "Heavy rain over Ibadan. Ring Road and Challenge flooding. Drive carefully.", Math.min(p.minute, 13 * 60));
  if (p.day % 4 === 0) add("ibedc", "IBEDC", "Planned outage 6pm–10pm on your feeder for maintenance. We regret any inconvenience.", 15 * 60);

  // school and service
  const st = p.life.edu.stage;
  if (st === "student" && p.day % 5 === 0) add("portal", p.life.edu.school === "poly" ? "Poly Portal" : "UI Portal", "Course registration closes Friday. Late registration attracts a fine.", 9 * 60);
  if (st === "nysc" && p.day % 7 === 4) add("cds", "NYSC", "Reminder: CDS meeting this Thursday, 10am, LGEA office. Attendance is compulsory.", 8 * 60);

  // people you know
  if (partner) {
    const r = relOf(p.life, partner);
    const gap = p.day - r.lastDay;
    add("partner", partner, gap > 6 ? "You've been quiet. Everything okay with us?" : pick(SWEET, p.day), gap > 6 ? 12 * 60 : 21 * 60 + 30);
  }
  for (const [id, r] of Object.entries(p.life.rel)) {
    if (id === partner || r.stage === "stranger") continue;
    const texts = FRIEND_TEXTS[id];
    if (!texts) continue;
    const seed = p.day + id.length * 7;
    if (seed % 3 !== 0) continue; // friends don't text every day
    add(`fr-${id}`, id, pick(texts, seed), 10 * 60 + (id.length * 37) % 480);
  }

  return msgs.sort((a, b) => b.at - a.at).slice(0, 12);
}
