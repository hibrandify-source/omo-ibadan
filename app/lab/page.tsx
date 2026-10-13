"use client";

// Art lab: every piece of the code-drawn art kit, for realism sign-off
// before it goes into the map and scenes. Not linked from the game.

import { useEffect, useRef, useState } from "react";
import { G, TILT_AERIAL, TILT_STREET, setTilt, type Ctx, type Dir } from "@/lib/art/core";
import { PAL } from "@/lib/art/palette";
import { CAST } from "@/lib/art/cast";
import { drawPerson } from "@/lib/art/people";
import { CARS, drawCar, drawKeke, drawOkada } from "@/lib/art/vehicles";
import { drawBuilding, drawFence, drawGenerator, drawKiosk, drawWaterTank } from "@/lib/art/buildings";
import {
  drawBench, drawLaterite, drawPalm, drawPole, drawRoad, drawSignboard,
  drawSpeedBump, drawTree, drawUmbrellaStall, drawWires,
} from "@/lib/art/ground";

/** w/h are the panel size in screen metres. */
type Painter = (ctx: Ctx, t: number, w: number, h: number) => void;

function Panel({ title, note, height, ppm, paint, tilt, animate = false }: {
  title: string;
  note: string;
  height: number;
  /** pixels per metre */
  ppm: number;
  paint: Painter;
  tilt: number;
  animate?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let raf = 0;
    const start = performance.now();
    const frame = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssW = cv.clientWidth;
      if (cv.width !== Math.round(cssW * dpr)) {
        cv.width = Math.round(cssW * dpr);
        cv.height = Math.round(height * dpr);
      }
      const ctx = cv.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, height);
      setTilt(tilt);
      ctx.save();
      ctx.scale(ppm, ppm);
      paint(ctx, (performance.now() - start) / 1000, cssW / ppm, height / ppm);
      ctx.restore();
      if (animate) raf = requestAnimationFrame(frame);
    };
    frame();
    const onResize = () => frame();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [animate, height, paint, ppm, tilt]);
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-extrabold tracking-tight">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm text-charcoal/70">{note}</p>
      <canvas ref={ref} className="mt-3 block w-full rounded-2xl ring-1 ring-roof/15" style={{ height }} />
    </section>
  );
}

/** Draw at a world ground point (metres); y is squashed by the camera tilt. */
const at = (ctx: Ctx, x: number, y: number, draw: () => void) => {
  ctx.save();
  ctx.translate(x, y * G);
  draw();
  ctx.restore();
};

/** Draw at a screen position (metres), for line-ups that aren't a scene. */
const onScreen = (ctx: Ctx, x: number, y: number, draw: () => void) => {
  ctx.save();
  ctx.translate(x, y);
  draw();
  ctx.restore();
};

// ---------------------------------------------------------------- panels

const paintPeople: Painter = (ctx, _t, w, h) => {
  drawLaterite(ctx, 0, 0, w, h / G, 3, 0.1);
  const names = Object.keys(CAST);
  const per = Math.max(1, Math.floor(w / 1.05));
  names.forEach((n, i) => {
    const col = i % per;
    const row = Math.floor(i / per);
    onScreen(ctx, 0.6 + col * 1.05, 2.55 + row * 2.6, () => drawPerson(ctx, CAST[n], "S"));
  });
};

const paintWalk: Painter = (ctx, t, w, h) => {
  drawLaterite(ctx, 0, 0, w, h / G, 9, 0.1);
  const dirs: Dir[] = ["S", "E", "N", "W"];
  const who = [CAST.mamaBisi, CAST.uiStudent, CAST.marketWoman, CAST.chief, CAST.nursingMother, CAST.okadaMan];
  who.forEach((p, i) => {
    dirs.forEach((d, j) => {
      const x = 0.7 + (i * 4 + j) * 1.0;
      if (x > w - 0.4) return;
      onScreen(ctx, x, 2.4, () => drawPerson(ctx, p, d, "walk", t * 7 + i));
    });
  });
};

const paintVehicles: Painter = (ctx, _t, w, h) => {
  drawLaterite(ctx, 0, 0, w, h / G, 5, 0.03);
  ctx.fillStyle = PAL.asphalt;
  ctx.fillRect(0, 1.9, w, 1.9);
  ctx.fillRect(0, 6.6, w, 4.2);
  let x = 2.6;
  const cars: [keyof typeof CARS, number][] = [["micra", 4.4], ["korope", 5.4], ["corolla", 5], ["camry", 5.4], ["jeep", 5.4]];
  for (const [k, gap] of cars) {
    onScreen(ctx, x, 3.3, () => drawCar(ctx, CARS[k], "E"));
    x += gap;
  }
  onScreen(ctx, x - 0.4, 3.3, () => drawKeke(ctx, "E", [CAST.mechanic, CAST.marketWoman]));
  onScreen(ctx, x + 2.8, 3.3, () => drawOkada(ctx, "E", CAST.okadaMan, CAST.uiStudent));

  // end-on views
  let ex = 1.6;
  for (const k of ["micra", "korope", "jeep"] as const) {
    onScreen(ctx, ex, 9.6, () => drawCar(ctx, CARS[k], "S"));
    onScreen(ctx, ex + 2.3, 9.6, () => drawCar(ctx, CARS[k], "N"));
    ex += 4.8;
  }
  onScreen(ctx, ex, 9.6, () => drawKeke(ctx, "S", [CAST.mechanic]));
  onScreen(ctx, ex + 1.8, 9.6, () => drawKeke(ctx, "N"));
  onScreen(ctx, ex + 3.4, 9.6, () => drawOkada(ctx, "S", CAST.okadaMan, CAST.marketWoman));
};

const paintBuildings: Painter = (ctx, t, w, h) => {
  drawLaterite(ctx, 0, 0, w, h / G, 21, 0.3);
  // Beere face-me-I-face-you: long bungalow, many doors with curtains
  at(ctx, 1, 4, () =>
    drawBuilding(ctx, {
      w: 16, d: 8, h: 3.0, roof: "hip", wall: PAL.plaster[1], wallKind: "plaster", rust: 0.95, seed: 4,
      notice: "THIS HOUSE IS NOT FOR SALE",
      openings: [
        { x: 0.8, kind: "shutter" }, { x: 3.0, kind: "door", curtain: "#b8433a" }, { x: 4.6, kind: "louvre" },
        { x: 7.0, kind: "door", width: 1.1 }, { x: 8.8, kind: "louvre" }, { x: 11.0, kind: "door", curtain: "#2a5a8a" },
        { x: 12.8, kind: "shutter" }, { x: 14.6, kind: "louvre", width: 1.0 },
      ],
    }),
  );
  // Old Bodija family house behind a fence with broken glass
  at(ctx, 19, 2.5, () =>
    drawBuilding(ctx, {
      w: 13, d: 9, h: 5.6, roof: "hip", wall: PAL.plaster[3], wallKind: "plaster", rust: 0.45, seed: 9, storeys: 2, dish: true,
      openings: [{ x: 1.2, kind: "louvre", width: 1.6 }, { x: 4.2, kind: "door", width: 1.2 }, { x: 7.2, kind: "louvre", width: 1.6 }, { x: 10.2, kind: "louvre", width: 1.6 }],
    }),
  );
  drawFence(ctx, { x0: 18, x1: 34, y: 15.5, h: 2.2, wall: PAL.plaster[0], glassTop: true, seed: 3, gate: { x: 22.5, w: 3.6, color: "#2f4f3a" } });
  // shop row with signboard + unplastered block extension
  at(ctx, 35, 6, () =>
    drawBuilding(ctx, {
      w: 10, d: 6, h: 3.2, roof: "shed", wall: PAL.plaster[5], wallKind: "plaster", rust: 0.7, seed: 12,
      sign: { text: "IYA BASIRA PROVISIONS", bg: "#f2c230", fg: "#7a1f14" },
      openings: [{ x: 0.6, kind: "shopfront", width: 4 }, { x: 5.4, kind: "shopfront", width: 4 }],
    }),
  );
  at(ctx, 46, 7, () =>
    drawBuilding(ctx, {
      w: 6, d: 5, h: 3.0, roof: "gable", wall: PAL.block, wallKind: "block", rust: 0.2, seed: 15,
      openings: [{ x: 1.0, kind: "window", width: 1.2 }, { x: 3.4, kind: "door" }],
    }),
  );
  at(ctx, 1, 21, () => drawKiosk(ctx, "#2f6fb5", "RECHARGE CARD", 31));
  at(ctx, 6, 24, () => drawWaterTank(ctx));
  at(ctx, 9, 24, () => drawGenerator(ctx, true, t));
  at(ctx, 12.5, 24, () => drawUmbrellaStall(ctx, ["#d4402c", "#f2c230"], "tomato", 2));
  at(ctx, 16.5, 24, () => drawUmbrellaStall(ctx, ["#2f6fb5", "#f2efe6"], "provisions", 5));
  at(ctx, 20, 24, () => drawBench(ctx));
  at(ctx, 24, 24.3, () => drawSignboard(ctx, "CHRIST APOSTOLIC CHURCH", "#f3efe4", "#1f3d8a", 3.4));
  at(ctx, 29, 24.5, () => drawTree(ctx, 2.4, 8));
  at(ctx, 34, 24.5, () => drawPalm(ctx, 7, 4));
};

const paintStreet: Painter = (ctx, t, w, hScreen) => {
  // a Beere-side street at the zoom players will see; h = visible ground depth in world metres
  const h = hScreen / G;
  drawLaterite(ctx, 0, 0, w, h, 41, 0.15);
  const roadY = h - 9;
  drawRoad(ctx, { x0: 0, x1: w, y: roadY, width: 6.8, wear: 0.8, seed: 7, markings: 0.4, gutters: true, crossings: [6.5, 22] });
  drawSpeedBump(ctx, w * 0.55, roadY - 3.4, roadY + 3.4);

  // north side: houses, then things in front of them, painter's order by y
  const north = roadY - 3.4 - 1.6;
  // back row: the old city is packed roof to roof
  [[-2, 11, 0.95, 61], [10.5, 9, 0.85, 62], [21, 12, 1, 63], [34, 8, 0.75, 64], [43, 12, 0.9, 65]].forEach(([x, bw, rust, seed]) =>
    at(ctx, x, north - 19, () =>
      drawBuilding(ctx, { w: bw, d: 7, h: 3, roof: seed % 2 ? "hip" : "gable", wall: PAL.plaster[seed % 7], wallKind: "plaster", rust, seed,
        openings: [{ x: 1, kind: "shutter" }, { x: bw / 2 - 0.45, kind: "door", curtain: "#5b3a6b" }, { x: bw - 2.2, kind: "louvre" }] }),
    ),
  );
  at(ctx, 1, north - 8.6, () =>
    drawBuilding(ctx, { w: 13, d: 7, h: 3, roof: "hip", wall: PAL.plaster[2], wallKind: "plaster", rust: 1, seed: 51,
      notice: "THIS HOUSE IS NOT FOR SALE",
      openings: [{ x: 1, kind: "shutter" }, { x: 3.2, kind: "door", curtain: "#7a2a35" }, { x: 5.4, kind: "louvre" }, { x: 8.2, kind: "door", curtain: "#2f6b3e" }, { x: 10.4, kind: "shutter" }] }),
  );
  at(ctx, 16, north - 6.4, () =>
    drawBuilding(ctx, { w: 9, d: 5, h: 3.2, roof: "shed", wall: PAL.plaster[5], wallKind: "plaster", rust: 0.8, seed: 52,
      sign: { text: "MAMA PUT · AMALA & GBEGIRI", bg: "#f2c230", fg: "#7a1f14" },
      openings: [{ x: 0.5, kind: "shopfront", width: 3.6 }, { x: 4.8, kind: "shopfront", width: 3.6 }] }),
  );
  at(ctx, 35, north - 6.6, () =>
    drawBuilding(ctx, { w: 10, d: 5.5, h: 3, roof: "gable", wall: PAL.block, wallKind: "block", rust: 0.3, seed: 54,
      openings: [{ x: 1, kind: "window" }, { x: 4, kind: "door" }, { x: 7, kind: "window" }] }),
  );
  at(ctx, 25, north - 2, () => drawTree(ctx, 2.6, 12));
  at(ctx, 27, north - 1.6, () => drawKiosk(ctx, "#2f6fb5", "POS · RECHARGE", 53));
  at(ctx, 31, north - 0.2, () => drawUmbrellaStall(ctx, ["#d4402c", "#f2c230"], "pepper", 9));
  at(ctx, 46, north - 0.6, () => drawGenerator(ctx, true, t));

  // poles + wires along the north verge
  const p1 = { x: 0, y: 0 };
  const p2 = { x: 0, y: 0 };
  at(ctx, 9.5, north + 0.3, () => Object.assign(p1, drawPole(ctx)));
  at(ctx, 32.5, north + 0.3, () => Object.assign(p2, drawPole(ctx)));
  drawWires(ctx, { x: 9.5 + p1.x, y: (north + 0.3) * G + p1.y }, { x: 32.5 + p2.x, y: (north + 0.3) * G + p2.y });

  // people on the verge
  at(ctx, 20.5, north + 0.9, () => drawPerson(ctx, CAST.mamaBisi, "S"));
  at(ctx, 22, north + 1.0, () => drawPerson(ctx, CAST.babaAde, "W"));
  at(ctx, 31, north + 1.1, () => drawPerson(ctx, CAST.marketWoman, "S"));

  // traffic keeps right: westbound on the north lane, eastbound on the south lane
  const loop = (speed: number, off: number) => ((t * speed + off) % (w + 12)) - 6;
  at(ctx, w - loop(5, 10), roadY - 1.6, () => drawOkada(ctx, "W", CAST.okadaMan, CAST.owambeAunty));
  at(ctx, w - loop(3.6, 32), roadY - 1.6, () => drawKeke(ctx, "W", [CAST.mechanic, CAST.uiStudent]));
  at(ctx, loop(4, 0), roadY + 1.7, () => drawCar(ctx, CARS.micra, "E"));
  at(ctx, loop(3.2, 25), roadY + 1.7, () => drawCar(ctx, CARS.korope, "E"));

  // south verge walkers
  const south = roadY + 3.4 + 1.3;
  at(ctx, (t * 1.3) % (w + 2) - 1, south + 0.6, () => drawPerson(ctx, CAST.tunde, "E", "walk", t * 8));
  at(ctx, w - ((t * 1.1 + 15) % (w + 2)), south + 0.9, () => drawPerson(ctx, CAST.nursingMother, "W", "walk", t * 7));
  at(ctx, w - ((t * 1.2 + 30) % (w + 2)), south + 0.7, () => drawPerson(ctx, CAST.breadSeller, "W", "walk", t * 7.5));
};

export default function Lab() {
  const [tilt, setTiltUi] = useState(TILT_STREET);
  const btn = (v: number, text: string) => (
    <button
      onClick={() => setTiltUi(v)}
      className={`rounded-full px-4 py-2 text-sm font-bold ring-1 ${tilt === v ? "bg-charcoal text-cream ring-charcoal" : "bg-white text-charcoal ring-roof/20"}`}
    >
      {text}
    </button>
  );
  return (
    <main className="min-h-screen bg-cream px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-[11px] font-extrabold tracking-[0.25em] text-roof">ART LAB · REALISM SIGN-OFF</div>
        <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight">Omo Ibadan art kit</h1>
        <p className="mt-2 max-w-3xl text-sm text-charcoal/75">
          Everything here is drawn in code at real-world size (1.7 m people, 3.7 m micra, 7 m two-lane roads).
          Compare the two street cameras below; the city map itself stays straight overhead.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {btn(TILT_STREET, "Three-quarter street camera (recommended)")}
          {btn(TILT_AERIAL, "Aerial (previous)")}
        </div>
        <ul className="mt-3 max-w-3xl list-disc pl-5 text-sm text-charcoal/75">
          <li><b>Please confirm:</b> commercial vehicles in Oyo brown + yellow (2020 state directive). Keke canopy colour is a guess.</li>
          <li>Vehicle plates, shop names and church signs are placeholders, not real businesses.</li>
        </ul>

        <Panel tilt={tilt} title="Street at game zoom" note="A Beere-side street as players will see it: rusted roofs, open gutters with sachets, tarred road with patches and faded markings, poles and wires, traffic keeping right." height={560} ppm={22} animate paint={paintStreet} />
        <Panel tilt={tilt} title="People" note="Real proportions; ankara, adire, aso-oke and lace fabrics; gele, fila, headtie; baby on back, basin and bread tray on the head; elders with walking sticks. Children appear only as NPCs: the player starts at 18." height={330} ppm={95} paint={paintPeople} />
        <Panel tilt={tilt} title="Walk cycles" note="Each person walking toward you, right, away, left." height={250} ppm={95} animate paint={paintWalk} />
        <Panel tilt={tilt} title="Vehicles" note="Micra taxi, korope bus, tokunbo Corolla, Camry, family jeep, keke with passengers, okada with passenger. Side views on top, front/back below." height={520} ppm={42} paint={paintVehicles} />
        <Panel tilt={tilt} title="Buildings and street furniture" note="Face-me-I-face-you in Beere, Old Bodija storey house behind a glass-topped fence, shop row, block extension, kiosk, water tank, generator, market umbrellas, bench, church signboard, mango and palm trees." height={640} ppm={26} animate paint={paintBuildings} />
      </div>
    </main>
  );
}
