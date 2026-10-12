// IbadanLife — 25 careers × 5 levels (LagosLife parity, Ibadan workplaces).
// Pay is per shift in virtual naira. Promotion checks the listed skill.

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
  { id: "micra-driver", name: "Micra Driver", yoruba: "Awakọ̀ micra", workplace: "Iwo Road Park", areaId: "iwo-road", skill: "driving", shiftHour: 7, blurb: "Mokola → Iwo Road. Full load or nothing.", levels: [L(1,"Loader",900,0),L(2,"Conductor",1400,1),L(3,"Driver",2200,2),L(4,"Park Chairman",3400,3),L(5,"Transport Mogul",5200,4)] },
  { id: "okada-rider", name: "Okada Rider", yoruba: "Okada", workplace: "Sango Junction", areaId: "sango", skill: "driving", shiftHour: 8, blurb: "Fast. Hold on tight.", levels: [L(1,"Learner",700,0),L(2,"Rider",1200,1),L(3,"Express Rider",1900,2),L(4,"Fleet Lead",2900,3),L(5,"Okada King",4500,4)] },
  { id: "market-trader", name: "Market Trader", yoruba: "Oníṣòwò", workplace: "Bodija Market", areaId: "bodija", skill: "hustle", shiftHour: 9, blurb: "Buy low Oja Oba, sell high Bodija.", levels: [L(1,"Head Porter",800,0),L(2,"Stall Hand",1300,1),L(3,"Stall Owner",2100,2),L(4,"Major Distributor",3300,3),L(5,"Market Iyalaje",5100,4)] },
  { id: "amala-cook", name: "Amala Cook", yoruba: "Oníṣè Amala", workplace: "Amala Skye, Bodija", areaId: "bodija", skill: "cooking", shiftHour: 10, blurb: "Gbegiri must never burn.", levels: [L(1,"Washer",750,0),L(2,"Assistant Cook",1250,1),L(3,"Head Cook",2000,2),L(4,"Buka Owner",3200,3),L(5,"Food Chain Boss",5000,4)] },
  { id: "fuji-performer", name: "Fuji Performer", yoruba: "Olórin Fuji", workplace: "Owambe Hall, Ring Road", areaId: "ring-road", skill: "music", shiftHour: 21, blurb: "Spraying season is salary season.", levels: [L(1,"Backup Singer",800,0),L(2,"Chorus Lead",1350,1),L(3,"Band Front",2150,2),L(4,"Star Act",3400,3),L(5,"Fuji Legend",5400,4)] },
  { id: "dj", name: "Owambe DJ", yoruba: "DJ", workplace: "Club, Dugbe", areaId: "dugbe", skill: "music", shiftHour: 22, blurb: "Drop amala-jam at midnight.", levels: [L(1,"Plug Boy",700,0),L(2,"Warm-up DJ",1200,1),L(3,"Resident DJ",2000,2),L(4,"Headliner",3200,3),L(5,"Superstar DJ",5000,4)] },
  { id: "tailor", name: "Aso-Ebi Tailor", yoruba: "Aránṣọ", workplace: "Oje Market", areaId: "oje", skill: "hustle", shiftHour: 9, blurb: "Owambe deadlines are sacred.", levels: [L(1,"Apprentice",650,0),L(2,"Machinist",1100,1),L(3,"Designer",1850,2),L(4,"Fashion House",3000,3),L(5,"Owambe Couturier",4800,4)] },
  { id: "barber", name: "Barber", yoruba: "Gẹ̀dẹ́", workplace: "Agbowo Shops", areaId: "ui-gate", skill: "charisma", shiftHour: 10, blurb: "Shape-up + gist = repeat customers.", levels: [L(1,"Sweeper",600,0),L(2,"Apprentice",1050,1),L(3,"Chair Owner",1750,2),L(4,"Studio Lead",2800,3),L(5,"Celebrity Barber",4600,4)] },
  { id: "hairdresser", name: "Hairdresser", yoruba: "Onídìrí", workplace: "Bodija Shops", areaId: "bodija", skill: "charisma", shiftHour: 10, blurb: "Gele tying premium on Saturdays.", levels: [L(1,"Washer",600,0),L(2,"Stylist",1100,1),L(3,"Senior Stylist",1850,2),L(4,"Salon Owner",2950,3),L(5,"Beauty Empire",4700,4)] },
  { id: "teacher", name: "Lesson Teacher", yoruba: "Olùkọ́", workplace: "Prep Centre, Sango", areaId: "sango", skill: "brain", shiftHour: 8, blurb: "JAMB + WAEC season pays.", levels: [L(1,"Usher",700,0),L(2,"Assistant Tutor",1200,1),L(3,"Subject Head",2000,2),L(4,"Principal",3200,3),L(5,"School Owner",5100,4)] },
  { id: "ui-researcher", name: "UI Research Assistant", yoruba: "Olùwádìí", workplace: "University of Ibadan", areaId: "ui-gate", skill: "brain", shiftHour: 9, blurb: "First and the best.", levels: [L(1,"Intern",800,0),L(2,"Assistant",1400,1),L(3,"Researcher",2300,2),L(4,"Lecturer II",3600,3),L(5,"Professor",5800,4)] },
  { id: "nurse", name: "Nurse", yoruba: "Nọ́ọ̀sì", workplace: "UCH, Ibadan", areaId: "mokola", skill: "brain", shiftHour: 7, blurb: "Night shifts, big heart.", levels: [L(1,"Auxiliary",900,0),L(2,"Staff Nurse",1600,1),L(3,"Senior Nurse",2600,2),L(4,"Matron",4000,3),L(5,"Consultant Matron",6200,4)] },
  { id: "cocoa-clerk", name: "Cocoa House Clerk", yoruba: "Akọ̀wé", workplace: "Cocoa House, Dugbe", areaId: "dugbe", skill: "brain", shiftHour: 9, blurb: "First skyscraper energy.", levels: [L(1,"Office Assistant",850,0),L(2,"Clerk",1450,1),L(3,"Admin Officer",2350,2),L(4,"Manager",3700,3),L(5,"Director",5900,4)] },
  { id: "banker", name: "Banker", yoruba: "Oníbáǹkì", workplace: "Bank, Ring Road", areaId: "ring-road", skill: "brain", shiftHour: 9, blurb: "Targets + ties.", levels: [L(1,"Contract Staff",1000,0),L(2,"Teller",1700,1),L(3,"Customer Service",2700,2),L(4,"Branch Manager",4300,3),L(5,"Regional Head",6800,4)] },
  { id: "tech-dev", name: "Tech Developer", yoruba: "Tech bro/sis", workplace: "Hub, Bodija", areaId: "bodija", skill: "coding", shiftHour: 10, blurb: "Light + laptop = salary.", levels: [L(1,"Intern",1100,0),L(2,"Junior Dev",1900,1),L(3,"Mid Dev",3100,2),L(4,"Senior Dev",5000,3),L(5,"CTO",8000,4)] },
  { id: "photographer", name: "Owambe Photographer", yoruba: "Olùyàwòrán", workplace: "Agodi Gardens", areaId: "agodi", skill: "photography", shiftHour: 11, blurb: "Golden hour at Eleyele lake.", levels: [L(1,"Assistant",750,0),L(2,"Shooter",1300,1),L(3,"Studio Hand",2100,2),L(4,"Studio Owner",3400,3),L(5,"Celebrity Photog",5400,4)] },
  { id: "comedian", name: "Comedian / MC", yoruba: "Apànilẹ́rìn-ín", workplace: "Cultural Centre, Mokola", areaId: "mokola", skill: "comedy", shiftHour: 20, blurb: "Crack Mapo Hall ribs.", levels: [L(1,"Open Mic",650,0),L(2,"Opener",1150,1),L(3,"Headliner",1900,2),L(4,"Tour Act",3100,3),L(5,"Arena MC",5000,4)] },
  { id: "dancer", name: "Fuji Dancer", yoruba: "Oníjó", workplace: "Owambe Hall", areaId: "ring-road", skill: "dance", shiftHour: 21, blurb: "Knees of steel.", levels: [L(1,"Backup",650,0),L(2,"Troupe Member",1150,1),L(3,"Lead Dancer",1900,2),L(4,"Choreographer",3050,3),L(5,"Dance Icon",4900,4)] },
  { id: "footballer", name: "3SC Footballer", yoruba: "Olùṣeré", workplace: "Lekan Salami Stadium", areaId: "molete", skill: "fitness", shiftHour: 16, blurb: "Oluyole Warriors.", levels: [L(1,"Academy",700,0),L(2,"Reserve",1300,1),L(3,"First Team",2200,2),L(4,"Captain",3600,3),L(5,"Super Eagles Call-up",6000,4)] },
  { id: "gym-coach", name: "Gym Coach", yoruba: "Olùkọ́ni", workplace: "Gym, Jericho", areaId: "eleyele", skill: "fitness", shiftHour: 6, blurb: "No pain, no gain.", levels: [L(1,"Cleaner",600,0),L(2,"Assistant",1100,1),L(3,"Coach",1900,2),L(4,"Head Coach",3000,3),L(5,"Fitness Brand",4800,4)] },
  { id: "radio-host", name: "Radio Host", yoruba: "Oníròyìn", workplace: "Fresh FM, Challenge", areaId: "challenge", skill: "charisma", shiftHour: 15, blurb: "Voice of Ibadan.", levels: [L(1,"Intern",800,0),L(2,"OAP",1400,1),L(3,"Drive-time Host",2300,2),L(4,"Station Voice",3700,3),L(5,"Media Mogul",6000,4)] },
  { id: "journalist", name: "Journalist", yoruba: "Oníròyìn ìwé", workplace: "Tribune House, Imalefalafia", areaId: "molete", skill: "brain", shiftHour: 9, blurb: "Oldest newspaper city.", levels: [L(1,"Stringer",750,0),L(2,"Reporter",1350,1),L(3,"Senior Reporter",2200,2),L(4,"Editor",3500,3),L(5,"Publisher",5600,4)] },
  { id: "driver-logistics", name: "Logistics Driver", yoruba: "Dírẹ́bà", workplace: "Gbagi Market", areaId: "iwo-road", skill: "driving", shiftHour: 7, blurb: "Ibadan → Lagos runs.", levels: [L(1,"Motor Boy",800,0),L(2,"Driver",1400,1),L(3,"Route Lead",2300,2),L(4,"Fleet Manager",3600,3),L(5,"Haulage Owner",5800,4)] },
  { id: "caterer", name: "Owambe Caterer", yoruba: "Oníṣè oúnjẹ", workplace: "Oje Market", areaId: "oje", skill: "cooking", shiftHour: 11, blurb: "Party jollof decides legacy.", levels: [L(1,"Server",700,0),L(2,"Assistant",1200,1),L(3,"Head Caterer",2000,2),L(4,"Event Company",3300,3),L(5,"Owambe Empire",5300,4)] },
  { id: "oil-exec", name: "Depot Executive", yoruba: "Olówó epo", workplace: "Depot, Apata", areaId: "challenge", skill: "hustle", shiftHour: 9, blurb: "Top of the ladder.", levels: [L(1,"Graduate Trainee",1500,0),L(2,"Analyst",2600,1),L(3,"Manager",4200,2),L(4,"GM",6500,3),L(5,"Executive Director",9500,4)] },
];

export function careerPay(careerId: string, level: number): number {
  const c = CAREERS.find((x) => x.id === careerId);
  return c?.levels[level - 1]?.pay ?? 0;
}
