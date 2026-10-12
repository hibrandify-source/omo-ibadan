// Omo Ibadan — careers × 5 levels, tied to real Ibadan workplaces.
// Pay is per shift (one working day) in virtual naira. Promotion checks the
// listed skill. Background connections let a life enter some careers at level 2.

import type { SkillId } from "./skills";

export interface CareerLevel {
  level: number;
  title: string;
  pay: number;
  skillNeed: number; // required skill level to be promoted INTO this level
}

export interface Career {
  id: string;
  name: string;
  yoruba: string;
  workplace: string;
  areaId: string;
  skill: SkillId;
  shiftHour: number; // shift starts at this hour (game clock)
  blurb: string;
  levels: [CareerLevel, CareerLevel, CareerLevel, CareerLevel, CareerLevel];
}

const L = (level: number, title: string, pay: number, skillNeed: number): CareerLevel =>
  ({ level, title, pay, skillNeed });

export const CAREERS: Career[] = [
  { id: "micra-driver", name: "Micra Driver", yoruba: "Awakọ̀ micra", workplace: "Iwo Road Park", areaId: "iwo-road", skill: "driving", shiftHour: 7, blurb: "Mokola → Iwo Road. Full load or nothing.", levels: [L(1,"Loader",5500,0),L(2,"Conductor",8500,1),L(3,"Driver",13000,2),L(4,"Park Chairman",20500,3),L(5,"Transport Mogul",31000,4)] },
  { id: "okada-rider", name: "Okada Rider", yoruba: "Okada", workplace: "Sango Junction", areaId: "sango", skill: "driving", shiftHour: 8, blurb: "Fast. Hold on tight.", levels: [L(1,"Learner",4000,0),L(2,"Rider",7000,1),L(3,"Express Rider",11500,2),L(4,"Fleet Lead",17500,3),L(5,"Okada King",27000,4)] },
  { id: "market-trader", name: "Market Trader", yoruba: "Oníṣòwò", workplace: "Bodija Market", areaId: "bodija", skill: "hustle", shiftHour: 9, blurb: "Buy low Oja Oba, sell high Bodija.", levels: [L(1,"Head Porter",5000,0),L(2,"Stall Hand",8000,1),L(3,"Stall Owner",12500,2),L(4,"Major Distributor",20000,3),L(5,"Market Iyalaje",30500,4)] },
  { id: "amala-cook", name: "Amala Cook", yoruba: "Oníṣè Amala", workplace: "Amala Skye, Bodija", areaId: "bodija", skill: "cooking", shiftHour: 10, blurb: "Gbegiri must never burn.", levels: [L(1,"Washer",4500,0),L(2,"Assistant Cook",7500,1),L(3,"Head Cook",12000,2),L(4,"Buka Owner",19000,3),L(5,"Food Chain Boss",30000,4)] },
  { id: "fuji-performer", name: "Fuji Performer", yoruba: "Olórin Fuji", workplace: "Owambe Hall, Ring Road", areaId: "ring-road", skill: "music", shiftHour: 21, blurb: "Spraying season is salary season.", levels: [L(1,"Backup Singer",5000,0),L(2,"Chorus Lead",8000,1),L(3,"Band Front",13000,2),L(4,"Star Act",20500,3),L(5,"Fuji Legend",32500,4)] },
  { id: "dj", name: "Owambe DJ", yoruba: "DJ", workplace: "Club, Dugbe", areaId: "dugbe", skill: "music", shiftHour: 22, blurb: "Drop amala-jam at midnight.", levels: [L(1,"Plug Boy",4000,0),L(2,"Warm-up DJ",7000,1),L(3,"Resident DJ",12000,2),L(4,"Headliner",19000,3),L(5,"Superstar DJ",30000,4)] },
  { id: "tailor", name: "Aso-Ebi Tailor", yoruba: "Aránṣọ", workplace: "Oje Market", areaId: "oje", skill: "hustle", shiftHour: 9, blurb: "Owambe deadlines are sacred.", levels: [L(1,"Apprentice",4000,0),L(2,"Machinist",6500,1),L(3,"Designer",11000,2),L(4,"Fashion House",18000,3),L(5,"Owambe Couturier",29000,4)] },
  { id: "barber", name: "Barber", yoruba: "Gẹ̀dẹ́", workplace: "Agbowo Shops", areaId: "ui-gate", skill: "charisma", shiftHour: 10, blurb: "Shape-up + gist = repeat customers.", levels: [L(1,"Sweeper",3500,0),L(2,"Apprentice",6500,1),L(3,"Chair Owner",10500,2),L(4,"Studio Lead",17000,3),L(5,"Celebrity Barber",27500,4)] },
  { id: "hairdresser", name: "Hairdresser", yoruba: "Onídìrí", workplace: "Bodija Shops", areaId: "bodija", skill: "charisma", shiftHour: 10, blurb: "Gele tying premium on Saturdays.", levels: [L(1,"Washer",3500,0),L(2,"Stylist",6500,1),L(3,"Senior Stylist",11000,2),L(4,"Salon Owner",17500,3),L(5,"Beauty Empire",28000,4)] },
  { id: "teacher", name: "Lesson Teacher", yoruba: "Olùkọ́", workplace: "Prep Centre, Sango", areaId: "sango", skill: "brain", shiftHour: 8, blurb: "JAMB + WAEC season pays.", levels: [L(1,"Usher",4000,0),L(2,"Assistant Tutor",7000,1),L(3,"Subject Head",12000,2),L(4,"Principal",19000,3),L(5,"School Owner",30500,4)] },
  { id: "ui-researcher", name: "UI Research Assistant", yoruba: "Olùwádìí", workplace: "University of Ibadan", areaId: "ui-gate", skill: "brain", shiftHour: 9, blurb: "First and the best.", levels: [L(1,"Intern",5000,0),L(2,"Assistant",8500,1),L(3,"Researcher",14000,2),L(4,"Lecturer II",21500,3),L(5,"Professor",35000,4)] },
  { id: "nurse", name: "Nurse", yoruba: "Nọ́ọ̀sì", workplace: "UCH, Ibadan", areaId: "mokola", skill: "brain", shiftHour: 7, blurb: "Night shifts, big heart.", levels: [L(1,"Auxiliary",5500,0),L(2,"Staff Nurse",9500,1),L(3,"Senior Nurse",15500,2),L(4,"Matron",24000,3),L(5,"Consultant Matron",37000,4)] },
  { id: "cocoa-clerk", name: "Cocoa House Clerk", yoruba: "Akọ̀wé", workplace: "Cocoa House, Dugbe", areaId: "dugbe", skill: "brain", shiftHour: 9, blurb: "First skyscraper energy.", levels: [L(1,"Office Assistant",5000,0),L(2,"Clerk",8500,1),L(3,"Admin Officer",14000,2),L(4,"Manager",22000,3),L(5,"Director",35500,4)] },
  { id: "banker", name: "Banker", yoruba: "Oníbáǹkì", workplace: "Bank, Ring Road", areaId: "ring-road", skill: "brain", shiftHour: 9, blurb: "Targets + ties.", levels: [L(1,"Contract Staff",6000,0),L(2,"Teller",10000,1),L(3,"Customer Service",16000,2),L(4,"Branch Manager",26000,3),L(5,"Regional Head",41000,4)] },
  { id: "tech-dev", name: "Tech Developer", yoruba: "Tech bro/sis", workplace: "Hub, Bodija", areaId: "bodija", skill: "coding", shiftHour: 10, blurb: "Light + laptop = salary.", levels: [L(1,"Intern",6500,0),L(2,"Junior Dev",11500,1),L(3,"Mid Dev",18500,2),L(4,"Senior Dev",30000,3),L(5,"CTO",48000,4)] },
  { id: "photographer", name: "Owambe Photographer", yoruba: "Olùyàwòrán", workplace: "Agodi Gardens", areaId: "agodi", skill: "photography", shiftHour: 11, blurb: "Golden hour at Eleyele lake.", levels: [L(1,"Assistant",4500,0),L(2,"Shooter",8000,1),L(3,"Studio Hand",12500,2),L(4,"Studio Owner",20500,3),L(5,"Celebrity Photog",32500,4)] },
  { id: "comedian", name: "Comedian / MC", yoruba: "Apànilẹ́rìn-ín", workplace: "Cultural Centre, Mokola", areaId: "mokola", skill: "comedy", shiftHour: 20, blurb: "Crack Mapo Hall ribs.", levels: [L(1,"Open Mic",4000,0),L(2,"Opener",7000,1),L(3,"Headliner",11500,2),L(4,"Tour Act",18500,3),L(5,"Arena MC",30000,4)] },
  { id: "dancer", name: "Fuji Dancer", yoruba: "Oníjó", workplace: "Owambe Hall", areaId: "ring-road", skill: "dance", shiftHour: 21, blurb: "Knees of steel.", levels: [L(1,"Backup",4000,0),L(2,"Troupe Member",7000,1),L(3,"Lead Dancer",11500,2),L(4,"Choreographer",18500,3),L(5,"Dance Icon",29500,4)] },
  { id: "footballer", name: "3SC Footballer", yoruba: "Olùṣeré", workplace: "Lekan Salami Stadium", areaId: "molete", skill: "fitness", shiftHour: 16, blurb: "Oluyole Warriors.", levels: [L(1,"Academy",4000,0),L(2,"Reserve",8000,1),L(3,"First Team",13000,2),L(4,"Captain",21500,3),L(5,"Super Eagles Call-up",36000,4)] },
  { id: "gym-coach", name: "Gym Coach", yoruba: "Olùkọ́ni", workplace: "Gym, Jericho", areaId: "eleyele", skill: "fitness", shiftHour: 6, blurb: "No pain, no gain.", levels: [L(1,"Cleaner",3500,0),L(2,"Assistant",6500,1),L(3,"Coach",11500,2),L(4,"Head Coach",18000,3),L(5,"Fitness Brand",29000,4)] },
  { id: "radio-host", name: "Radio Host", yoruba: "Oníròyìn", workplace: "Fresh FM, Challenge", areaId: "challenge", skill: "charisma", shiftHour: 15, blurb: "Voice of Ibadan.", levels: [L(1,"Intern",5000,0),L(2,"OAP",8500,1),L(3,"Drive-time Host",14000,2),L(4,"Station Voice",22000,3),L(5,"Media Mogul",36000,4)] },
  { id: "journalist", name: "Journalist", yoruba: "Oníròyìn ìwé", workplace: "Tribune House, Imalefalafia", areaId: "molete", skill: "brain", shiftHour: 9, blurb: "Oldest newspaper city.", levels: [L(1,"Stringer",4500,0),L(2,"Reporter",8000,1),L(3,"Senior Reporter",13000,2),L(4,"Editor",21000,3),L(5,"Publisher",33500,4)] },
  { id: "driver-logistics", name: "Logistics Driver", yoruba: "Dírẹ́bà", workplace: "Gbagi Market", areaId: "iwo-road", skill: "driving", shiftHour: 7, blurb: "Ibadan → Lagos runs.", levels: [L(1,"Motor Boy",5000,0),L(2,"Driver",8500,1),L(3,"Route Lead",14000,2),L(4,"Fleet Manager",21500,3),L(5,"Haulage Owner",35000,4)] },
  { id: "caterer", name: "Owambe Caterer", yoruba: "Oníṣè oúnjẹ", workplace: "Oje Market", areaId: "oje", skill: "cooking", shiftHour: 11, blurb: "Party jollof decides legacy.", levels: [L(1,"Server",4000,0),L(2,"Assistant",7000,1),L(3,"Head Caterer",12000,2),L(4,"Event Company",20000,3),L(5,"Owambe Empire",32000,4)] },
  { id: "oil-exec", name: "Depot Executive", yoruba: "Olówó epo", workplace: "Depot, Apata", areaId: "challenge", skill: "hustle", shiftHour: 9, blurb: "Top of the ladder.", levels: [L(1,"Graduate Trainee",9000,0),L(2,"Analyst",15500,1),L(3,"Manager",25000,2),L(4,"GM",39000,3),L(5,"Executive Director",57000,4)] },
];

export function careerPay(careerId: string, level: number): number {
  const c = CAREERS.find((x) => x.id === careerId);
  return c?.levels[level - 1]?.pay ?? 0;
}

/** Starting level for a career given background connections. */
export function entryLevel(careerId: string, connections: readonly string[]): number {
  return connections.includes(careerId) ? 2 : 1;
}
