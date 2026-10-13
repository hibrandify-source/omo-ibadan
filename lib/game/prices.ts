// Omo Ibadan — every naira figure in the game lives here.
//
// Values are rough Ibadan street prices for late 2026, rounded to numbers a
// player would actually hear. They are ESTIMATES: before launch, walk them
// past someone who shops in Bodija and Oja'ba every week and adjust.
// Nothing else in the codebase should hard-code a naira amount.

export const PRICES = {
  // ---- Food ----
  food: {
    amalaPlate: 2000, // amala + gbegiri + ewedu + 1 meat, buka
    mamaSpecial: 3500, // ofada + dodo + extra meat
    pureWaterGala: 400,
    galaLaCasera: 900,
    provisionsPack: 6000,
  },

  // ---- Around town ----
  suyaPlate: 1500, // a wrap of suya at Sabo
  clubGuestFee: 3000, // Recreation Club day guest
  caddieRound: 4000, // what a caddie earns carrying a bag for a round
  alabaruTrip: 2500, // a porter's pay for a morning of loads at the market
  cinemaTicket: 3500, // a film at the mall cinema
  agodiGate: 1000, // gate fee at Agodi Gardens
  coldRoomShift: 3500, // a half-day carrying cartons at an Aleshinloye cold room
  lessonTutor: 3000, // an afternoon teaching JAMB maths/English at a Samonda lesson centre
  printShift: 2500, // a shift binding projects at an Agbowo printing shop
  farmDay: 2000, // a day clearing and harvesting on a Moniya yam farm
  clinicVisit: 2500, // consultation card + check-up at Jericho

  // ---- Personal ----
  bucketBath: 300, // water + soap for the day
  barberLowcut: 1500,
  viewingCentre: 500, // watch match

  // ---- Moving around (per drop / per km) ----
  transport: {
    micraFarePerKm: 120, // shared micra/taxi, roughly ₦300–₦700 per drop
    micraRideFare: 500, // flat autopilot ride in Micra Rush
    driverFarePerPassenger: 400, // what the driver collects per head
    cleanStopPerPassenger: 100, // small tip/bonus for a clean bay stop
    trafficFine: 2000, // OYRTMA "settle" for beating a light
    vioOverloadFine: 5000,
    potholeRepair: 1500,
    bashSettle: 3000,
    carFuelPerDay: 4000, // Alowonle's car, city driving
  },

  // ---- Interstate runs from Iwo Road ----
  interstate: {
    ife: { fare: 4000, lo: 5000, hi: 6800 },
    lagos: { fare: 7000, lo: 8500, hi: 11500 },
    abuja: { fare: 30000, lo: 36000, hi: 46000 },
  },

  // ---- Trading (Oja'ba → Bodija flip) ----
  market: {
    stockBag: 8000, // buy at Oja'ba
    askStart: 11000,
    fairBase: 12000, // customer accepts up to fairBase + mood * moodStep
    moodStep: 20,
    askMin: 8000,
    askMax: 16000,
    haggleStep: 500,
  },

  // ---- Owambe ----
  spray: [1000, 5000, 10000] as const,

  // ---- Exams / small rewards ----
  examReward: 2500,

  // ---- Walking (real GPS steps) ----
  perThousandSteps: 500,

  // ---- Referral (virtual only) ----
  referral: { giver: 5000, joinerExtra: 3000, weeklyCap: 20 },

  // ---- Housing (Ibadan rents yearly, upfront) ----
  housing: {
    // one-off cost to move up a tier: 1 year rent + agent (10%) + caution/legal
    moveCost: (yearlyRent: number) => Math.round(yearlyRent * 1.25),
    rentYear: {
      faceMeRoom: 150000,
      selfContain: 350000,
      miniFlat: 600000,
      bodijaFlat: 1500000,
      jerichoDuplex: 4000000,
    },
  },

  // ---- Furniture ----
  furniture: {
    mattress: 45000,
    fan: 35000,
    rug: 20000,
    curtains: 15000,
    shelf: 30000,
    gen: 180000,
    tv: 250000,
    fridge: 350000,
    sofa: 300000,
    ac: 650000,
    dining: 400000,
  },
} as const;

/** Format naira the way people write it: ₦12,500. */
export function naira(n: number): string {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}
