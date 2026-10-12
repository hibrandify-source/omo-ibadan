// IbadanLife — 23 Ibadan places with hours + entry (LagosLife parity).
// Real landmarks: Bodija, Dugbe/Cocoa House, Mapo, Oja Oba, Oje, UI,
// Agodi, Challenge, Molete, Ring Road, Iwo Road/Gbagi, Eleyele/Jericho, Sango...

import type { NeedId } from "./needs";
import type { SkillId } from "./skills";

export interface PlaceAction {
  id: string;
  name: string;
  minutes: number;
  cost: number;
  needs: Partial<Record<NeedId, number>>;
  earn?: number;
  skill?: { id: SkillId; xp: number };
  needSkill?: { id: SkillId; level: number };
  blurb: string;
}

export interface Place {
  id: string;
  name: string;
  yoruba: string;
  area: string;
  open: string; // "06:00-22:00"
  entry: number;
  blurb: string;
  actions: PlaceAction[];
}

const A = (id: string, name: string, minutes: number, cost: number, needs: PlaceAction["needs"], blurb: string, extra?: Partial<PlaceAction>): PlaceAction =>
  ({ id, name, minutes, cost, needs, blurb, ...extra });

export const PLACES: Place[] = [
  { id: "amala-skye", name: "Amala Skye, Bodija", yoruba: "Amala Skye", area: "Bodija", open: "07:00-22:00", entry: 0, blurb: "Cheapest proper meal. Smoky gbegiri.", actions: [
    A("chop-amala", "Chop amala + gbegiri", 30, 500, { hunger: 35, energy: 10, fun: 5 }, "The bowl that built Bodija."),
    A("buka-gig", "Buka gig shift", 120, 0, { hunger: -5, energy: -20, social: 5 }, "Wash plates, earn respect.", { earn: 900, skill: { id: "cooking", xp: 15 } }),
    A("mama-special", "Mama Special (ofada + plantain)", 40, 1200, { hunger: 55, energy: 20 }, "Extra meat. Bodija remembers you."),
  ]},
  { id: "bodija-market", name: "Bodija Market", yoruba: "Ọjà Bọ́dìjà", area: "Bodija", open: "06:00-19:00", entry: 0, blurb: "Haggle capital of Ibadan.", actions: [
    A("flip-tomatoes", "Flip tomatoes", 60, 2000, { energy: -12 }, "Buy crates, sell retail.", { earn: 2800, skill: { id: "hustle", xp: 12 } }),
    A("carry-loads", "Carry loads (alabaru)", 60, 0, { energy: -25 }, "Back strong, pocket stronger.", { earn: 1200, skill: { id: "fitness", xp: 10 } }),
    A("price-watch", "Price watch + gist", 30, 0, { social: 12, fun: 8 }, "Know tomorrow's price today.", { skill: { id: "hustle", xp: 8 } }),
  ]},
  { id: "oja-oba", name: "Oja Oba (King's Market)", yoruba: "Ọjà Ọba", area: "Mapo/Beere", open: "06:00-19:00", entry: 0, blurb: "Buy low here.", actions: [
    A("bulk-buy", "Bulk buy provisions", 45, 5000, { energy: -8 }, "Resell in Bodija.", { earn: 6500, skill: { id: "hustle", xp: 14 } }),
    A("haggle-drill", "Haggle drill", 30, 0, { social: 10 }, "Aunty, last price?", { skill: { id: "charisma", xp: 12 } }),
  ]},
  { id: "oje-market", name: "Oje Market", yoruba: "Ọjà Oje", area: "Oje", open: "08:00-18:00", entry: 0, blurb: "Traditional goods. Elders watch.", actions: [
    A("aso-ebi-run", "Aso-ebi fabric run", 60, 3000, { social: 8 }, "Owambe season gold.", { earn: 4200, skill: { id: "hustle", xp: 12 } }),
    A("greet-elders", "Greet elders properly", 20, 0, { social: 15 }, "Both hands. Iwa +.", { skill: { id: "charisma", xp: 10 } }),
  ]},
  { id: "cocoa-house", name: "Cocoa House, Dugbe", yoruba: "Ilé Àwọn Àgbẹ̀", area: "Dugbe", open: "08:00-17:00", entry: 200, blurb: "First skyscraper in tropical Africa. View from the top.", actions: [
    A("tower-view", "Tower view + photos", 45, 200, { fun: 20, social: 10 }, "Brown roofs to the horizon.", { skill: { id: "photography", xp: 12 } }),
    A("office-hustle", "Office errand gig", 90, 0, { energy: -15 }, "Dispatch + filings.", { earn: 1800, skill: { id: "brain", xp: 10 } }),
  ]},
  { id: "mapo-hall", name: "Mapo Hall", yoruba: "Oke Mapo", area: "Mapo/Beere", open: "08:00-18:00", entry: 0, blurb: "Coronation ground of Olubadan.", actions: [
    A("pay-homage", "Pay homage", 30, 0, { social: 12 }, "Prostrate well.", { skill: { id: "charisma", xp: 8 } }),
    A("history-walk", "History walk", 60, 0, { fun: 12 }, "Seven hills gist.", { skill: { id: "brain", xp: 10 } }),
  ]},
  { id: "ui-campus", name: "University of Ibadan", yoruba: "U.I.", area: "UI/Agbowo", open: "00:00-23:59", entry: 0, blurb: "First and the best. 33 things to do.", actions: [
    A("read-library", "Read at Kenneth Dike Library", 120, 0, { energy: -12, fun: -5 }, "Silent + cold AC.", { skill: { id: "brain", xp: 25 } }),
    A("exam-prep", "Exam prep drill", 60, 100, { energy: -10 }, "Past questions.", { skill: { id: "brain", xp: 18 } }),
    A("gist-sub", "Gist at SUB", 45, 200, { fun: 18, social: 18, hunger: -5 }, "Student union vibes.", { skill: { id: "charisma", xp: 10 } }),
  ]},
  { id: "agbowo-hostel", name: "Agbowo Hostel Strip", yoruba: "Agbowo", area: "UI/Agbowo", open: "00:00-23:59", entry: 0, blurb: "Cheap chop, loud gist.", actions: [
    A("indomie-night", "Indomie night", 25, 600, { hunger: 25, social: 10 }, "Egg optional but encouraged."),
    A("night-class", "Night class", 180, 0, { energy: -25 }, "Torch + chair.", { skill: { id: "brain", xp: 20 } }),
  ]},
  { id: "sango-poly", name: "Sango – Poly Gate", yoruba: "Sango", area: "Sango", open: "06:00-22:00", entry: 0, blurb: "Street-smart axis.", actions: [
    A("phone-accessories", "Flip phone accessories", 60, 1500, { energy: -8 }, "Chargers + pouches.", { earn: 2200, skill: { id: "hustle", xp: 10 } }),
    A("street-football", "Street football", 60, 0, { fun: 20, energy: -20, hygiene: -10 }, "Sweat + bragging rights.", { skill: { id: "fitness", xp: 14 } }),
  ]},
  { id: "mokola-hill", name: "Mokola Hill + Cultural Centre", yoruba: "Oke Mokola", area: "Mokola", open: "08:00-22:00", entry: 0, blurb: "Drama, comedy, hill breeze.", actions: [
    A("stage-open-mic", "Open mic comedy", 60, 0, { fun: 15, social: 12 }, "Crack the hall.", { skill: { id: "comedy", xp: 15 } }),
    A("hill-jog", "Hill jog", 45, 0, { energy: -22, hygiene: -12 }, "Legs of iron.", { skill: { id: "fitness", xp: 16 } }),
  ]},
  { id: "dugbe-market", name: "Dugbe Market + Gbagi Link", yoruba: "Dugbe", area: "Dugbe", open: "07:00-20:00", entry: 0, blurb: "Commercial nerve.", actions: [
    A("dispatch-run", "Dispatch run", 90, 500, { energy: -15 }, "Dugbe → Bodija parcels.", { earn: 2400, skill: { id: "driving", xp: 10 } }),
  ]},
  { id: "agodi-gardens", name: "Agodi Gardens + Zoo", yoruba: "Agodi", area: "Agodi", open: "08:00-20:00", entry: 500, blurb: "Picnic + paddle boats.", actions: [
    A("picnic-rest", "Picnic + rest", 90, 500, { energy: 30, fun: 25, social: 10 }, "Grass + breeze."),
    A("zoo-tour", "Zoo tour + photos", 60, 800, { fun: 22 }, "Lion gist.", { skill: { id: "photography", xp: 12 } }),
  ]},
  { id: "eleyele-lake", name: "Eleyele Lake / Jericho", yoruba: "Eleyele", area: "Eleyele", open: "07:00-21:00", entry: 300, blurb: "Sunset + GRA calm.", actions: [
    A("lakeside-shoot", "Lakeside photoshoot", 60, 300, { fun: 18 }, "Golden hour premium.", { earn: 1500, skill: { id: "photography", xp: 16 }, needSkill: { id: "photography", level: 2 } }),
    A("evening-walk", "Evening walk", 45, 0, { energy: 10, fun: 12 }, "Reset the head."),
  ]},
  { id: "iwo-road-park", name: "Iwo Road Park", yoruba: "Iwo Road", area: "Iwo Road", open: "05:00-23:00", entry: 0, blurb: "Final boss motor park.", actions: [
    A("load-micra", "Load micra (full load)", 45, 0, { energy: -15 }, "Shout + arrange.", { earn: 1600, skill: { id: "driving", xp: 12 } }),
    A("interstate-gig", "Interstate shore-up gig", 120, 0, { energy: -20 }, "Lagos run loading.", { earn: 2800, skill: { id: "hustle", xp: 12 } }),
  ]},
  { id: "gbagi-market", name: "Gbagi Market", yoruba: "Gbagi", area: "Iwo Road", open: "07:00-20:00", entry: 0, blurb: "Textile + wholesale.", actions: [
    A("bale-split", "Split bale (okrika)", 90, 8000, { energy: -12 }, "First-selection wins.", { earn: 11000, skill: { id: "hustle", xp: 16 } }),
  ]},
  { id: "challenge-junction", name: "Challenge Junction", yoruba: "Challenge", area: "Challenge", open: "00:00-23:59", entry: 0, blurb: "Honk or be honked at.", actions: [
    A("traffic-hawk", "Hawk in traffic", 60, 1000, { energy: -12 }, "Plantain chips + drinks.", { earn: 1900, skill: { id: "hustle", xp: 10 } }),
  ]},
  { id: "ring-road-club", name: "Owambe Hall, Ring Road", yoruba: "Owambe", area: "Ring Road", open: "22:00-04:00", entry: 1000, blurb: "Fuji night. Spraying battles.", actions: [
    A("dance-floor", "Shut down dance floor", 60, 1000, { fun: 30, energy: -20, social: 15 }, "Knees −10, glory +100.", { skill: { id: "dance", xp: 18 } }),
    A("spray-battle", "Spraying battle", 30, 5000, { fun: 20, social: 20 }, "Half rains on your hood.", { skill: { id: "charisma", xp: 10 } }),
  ]},
  { id: "quilox-ibadan", name: "Club, Dugbe Night Strip", yoruba: "Night strip", area: "Dugbe", open: "22:00-04:00", entry: 2000, blurb: "DJs + dance battles.", actions: [
    A("dj-battle", "DJ dance battle", 45, 2000, { fun: 28, energy: -15 }, "Winner takes the floor.", { skill: { id: "dance", xp: 16 } }),
  ]},
  { id: "molete-bridge", name: "Molete Bridge", yoruba: "Molete", area: "Molete", open: "00:00-23:59", entry: 0, blurb: "Interchange hustle.", actions: [
    A("amala-delivery", "Amala delivery run", 40, 300, { energy: -12 }, "Before it cools.", { earn: 1500, skill: { id: "driving", xp: 10 } }),
  ]},
  { id: "stadium", name: "Lekan Salami Stadium", yoruba: "Adamasingba", area: "Molete", open: "06:00-20:00", entry: 300, blurb: "Oluyole Warriors home.", actions: [
    A("train-trial", "Train + trials", 120, 300, { energy: -30, hygiene: -15, fun: 10 }, "Scouts dey watch.", { skill: { id: "fitness", xp: 22 } }),
    A("match-day", "Match day shift (vendor)", 120, 500, { energy: -15 }, "Hawk + watch.", { earn: 2200 }),
  ]},
  { id: "church-mosque", name: "Church / Mosque (Beere)", yoruba: "Ilé ìjọ́sìn", area: "Beere", open: "05:00-21:00", entry: 0, blurb: "Thanksgiving + community.", actions: [
    A("service", "Attend service", 90, 0, { fun: 10, social: 18 }, "Peace + people.", { skill: { id: "charisma", xp: 8 } }),
    A("welfare-gig", "Welfare volunteer gig", 60, 0, { social: 15 }, "Serve food, gain Iwa.", { skill: { id: "charisma", xp: 10 } }),
  ]},
  { id: "polling-unit", name: "Polling Unit 001, Mapo", yoruba: "Ìbò", area: "Mapo/Beere", open: "08:00-20:00", entry: 0, blurb: "Vote or run. Weekly governor race.", actions: [
    A("vote", "Vote in governor race", 20, 0, { social: 10 }, "One ballot per race."),
    A("rally", "Join rally", 60, 0, { fun: 12, social: 15, energy: -10 }, "Shout + dance."),
  ]},
  { id: "ibedc-office", name: "IBEDC Office, Ring Road", yoruba: "IBEDC", area: "Ring Road", open: "08:00-16:00", entry: 0, blurb: "Pay light bill. Or buy solar.", actions: [
    A("pay-light", "Pay light bill", 30, 2500, { energy: 5 }, "Fridge stays cold. Every Saturday with rent."),
    A("solar-shopping", "Price solar setup", 30, 0, { fun: -2 }, "Freedom costs ₦150,000."),
  ]},
];

export function findPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

export function allActions(): { place: Place; action: PlaceAction }[] {
  return PLACES.flatMap((place) => place.actions.map((action) => ({ place, action })));
}
