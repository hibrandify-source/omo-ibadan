// Omo Ibadan — family time: what you can actually do with Mama or Daddy.
// Daytime at the stall or Daddy's site, evenings at home. Each activity can
// be done once a day; the first one each day counts as your family duty.

import type { DayPart } from "@/lib/engine/clock";
import type { BackgroundId } from "./backgrounds";
import type { NeedId } from "./needs";
import type { SkillId } from "./skills";

export interface FamilyActivity {
  id: string;
  label: string;
  blurb: string;
  /** when it's on: daytime at the stall/site, or evening at home */
  parts: DayPart[];
  minutes: number;
  energy: number;
  /** Mama's trust / Daddy's approval */
  bond: number;
  /** naira Mama or Daddy presses into your hand */
  tip: number;
  iwa: number;
  skill?: { id: SkillId; xp: number };
  needs?: Partial<Record<NeedId, number>>;
}

const DAY: DayPart[] = ["morning", "afternoon"];
const EVENING: DayPart[] = ["evening"];

export const FAMILY_ACTIVITIES: Record<BackgroundId, { day: string; evening: string; who: string; list: FamilyActivity[] }> = {
  "omo-iya-lobe": {
    day: "Mama's stall at Oja'ba",
    evening: "At home with Mama, Beere",
    who: "Mama Bisi",
    list: [
      { id: "serve", label: "Serve the lunch crowd", blurb: "Dish amala, gbegiri and ewedu while Mama takes the money.", parts: DAY, minutes: 120, energy: -15, bond: 4, tip: 2500, iwa: 2, skill: { id: "cooking", xp: 10 } },
      { id: "wash", label: "Wash plates and fetch water", blurb: "Three trips to the tap with the big bowl on your head.", parts: DAY, minutes: 60, energy: -10, bond: 3, tip: 1000, iwa: 1, needs: { hygiene: -10 } },
      { id: "errand", label: "Run to the traders for pepper and iru", blurb: "Mama's list, Mama's money, Mama's prices. Don't let them cheat you.", parts: DAY, minutes: 60, energy: -8, bond: 3, tip: 1000, iwa: 1, skill: { id: "hustle", xp: 8 } },
      { id: "stir", label: "Stir tomorrow's gbegiri", blurb: "Beans soaked, peeled and stirred till your arm burns.", parts: EVENING, minutes: 90, energy: -10, bond: 4, tip: 0, iwa: 2, skill: { id: "cooking", xp: 12 } },
      { id: "ewedu", label: "Pick ewedu leaves on the veranda", blurb: "Leaf by leaf, with the neighbours' gist for company.", parts: EVENING, minutes: 60, energy: -5, bond: 3, tip: 0, iwa: 1, needs: { social: 10 } },
      { id: "gist", label: "Sit with Mama and gist", blurb: "She tells you who owes her money, and who is marrying who.", parts: EVENING, minutes: 45, energy: 0, bond: 3, tip: 0, iwa: 1, needs: { social: 15, fun: 5 } },
    ],
  },
  alowonle: {
    day: "Daddy's site on Ring Road",
    evening: "At home in Old Bodija",
    who: "Chief Adeyemi",
    list: [
      { id: "site", label: "Sit in on Daddy's site meeting", blurb: "Contractors, cement prices, and Daddy shouting at a foreman.", parts: DAY, minutes: 180, energy: -15, bond: 4, tip: 0, iwa: 1, skill: { id: "charisma", xp: 10 }, needs: { fun: -10 } },
      { id: "accounts", label: "Reconcile the cement and iron rod accounts", blurb: "Somebody's numbers don't add up. Find out whose.", parts: DAY, minutes: 120, energy: -10, bond: 4, tip: 0, iwa: 1, skill: { id: "brain", xp: 10 } },
      { id: "gbagi", label: "Help Mummy at her Gbagi fabric shop", blurb: "Unroll lace, write receipts, smile at aunties.", parts: DAY, minutes: 120, energy: -10, bond: 3, tip: 3000, iwa: 1, skill: { id: "hustle", xp: 10 } },
      { id: "veranda", label: "Go through the day with Daddy on the veranda", blurb: "He reads the site report aloud and asks what you'd do.", parts: EVENING, minutes: 90, energy: -5, bond: 4, tip: 0, iwa: 1, skill: { id: "charisma", xp: 8 }, needs: { fun: -5 } },
      { id: "dinner", label: "Family dinner, phones away", blurb: "Pounded yam, egusi, and Mummy's questions about your friends.", parts: EVENING, minutes: 60, energy: 5, bond: 3, tip: 0, iwa: 1, needs: { social: 10, hunger: 30 } },
      { id: "fellowship", label: "Drive Mummy to her evening fellowship", blurb: "Bodija to Agodi and back, with her choir songs on repeat.", parts: EVENING, minutes: 90, energy: -5, bond: 3, tip: 0, iwa: 2, skill: { id: "driving", xp: 10 } },
    ],
  },
};
