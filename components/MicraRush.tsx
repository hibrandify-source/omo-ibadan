"use client";

// Micra Rush: drive (or ride) a real Ibadan corridor. Fares, fines and
// passengers live here; the road and its rules are in RoadRun / lib/engine/drive.

import { useMemo, useState } from "react";
import { ECONOMY, MAP_NODES, PRICES, naira } from "@/lib/game";
import { CITY } from "@/lib/map/ibadan";
import type { HazardKind } from "@/lib/engine/drive";
import RoadRun from "./RoadRun";

const TP = PRICES.transport;

/** Short stop names for bus-stop boards: "Dugbe / Cocoa House" -> "DUGBE". */
const stopName = (id: string) => (MAP_NODES.find((n) => n.id === id)?.name ?? id).split(/[/(+–-]/)[0].trim().toUpperCase();

export default function MicraRush({
  onEarn,
  weather,
  fareMult,
}: {
  onEarn: (ola: number, iwa: number, msg: string) => void;
  saver?: boolean;
  weather: "clear" | "rain";
  fareMult?: number; // Ajala Traveller transport discount (0.85)
}) {
  const [mode, setMode] = useState<"ride" | "drive">("drive");
  const [night, setNight] = useState(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 6;
  });
  const [routeId, setRouteId] = useState(CITY.corridors[0].id);
  const [passengers, setPassengers] = useState(0);
  const [running, setRunning] = useState(false);
  const [runKey, setRunKey] = useState(1);
  const [log, setLog] = useState("Pick a real corridor, load up, and drive it with sense.");

  const corridor = CITY.corridors.find((c) => c.id === routeId) ?? CITY.corridors[0];
  const stopNames = useMemo(() => corridor.stops.map(stopName), [corridor]);
  const endLabel = stopNames[stopNames.length - 1];
  const totalKm = corridor.legKm.reduce((a, b) => a + b, 0);

  const load = () => {
    if (running || passengers >= 6) return;
    const next = passengers + 1;
    setPassengers(next);
    setLog(next > 4 ? "⚠️ Overload! VIO fit catch you for this corridor." : `Loaded ${next}/6. Conductor dey shout destination!`);
  };

  const startRide = () => {
    setPassengers(0);
    setRunning(true);
    setRunKey((k) => k + 1);
    setLog(`🧍 Riding ${corridor.name}. Fare ${naira(Math.round(TP.micraRideFare * (fareMult ?? 1)))} on arrival. Sit back.`);
  };

  const startDrive = () => {
    if (passengers === 0) {
      setLog("Load passengers first before hustle.");
      return;
    }
    setRunning(true);
    setRunKey((k) => k + 1);
    setLog(`🛣️ Hustling ${corridor.name}! Keep right, dodge wahala, STOP inside the yellow bus bays.`);
  };

  const onHazard = (kind: HazardKind) => {
    if (mode === "ride") return;
    if (kind === "signal") {
      onEarn(-TP.trafficFine, -2, `🚦 Beat red light! OYRTMA wahala -${naira(TP.trafficFine)}, Iwa -2.`);
      setLog(`🚦 You beat red light! -${naira(TP.trafficFine)} fine. Iwa -2. Calm down.`);
      return;
    }
    if (kind === "vio") {
      if (passengers <= 4) {
        setLog("VIO waves you through: clean load. 👍");
        return;
      }
      onEarn(-TP.vioOverloadFine, -5, `🚨 VIO catch overload! Fine -${naira(TP.vioOverloadFine)}, Iwa -5.`);
      setLog(`🚨 VIO catch overload! -${naira(TP.vioOverloadFine)}, Iwa -5.`);
      return;
    }
    if (kind === "walker" || kind === "goat") {
      const who = kind === "walker" ? "a pedestrian" : "somebody's goat";
      onEarn(-TP.bashSettle, -3, `😬 You nearly ran over ${who}! Settle -${naira(TP.bashSettle)}, Iwa -3.`);
      setLog(`😬 You nearly ran over ${who}. Crowd gather. -${naira(TP.bashSettle)}, Iwa -3.`);
      return;
    }
    onEarn(-TP.bashSettle, -2, `💥 ${kind} bash! Settle -${naira(TP.bashSettle)}, Iwa -2.`);
    setLog(`💥 ${kind} bash! -${naira(TP.bashSettle)}. Change lane early.`);
  };

  const onBay = (ok: boolean, name: string) => {
    if (mode === "ride") return;
    if (ok) {
      const fare = passengers * TP.cleanStopPerPassenger;
      onEarn(fare, 2, `🟢 Clean stop at ${name}! Collected ${naira(fare)}, Iwa +2.`);
      setLog(`🟢 Inside the ${name} bay! +${naira(fare)}. Conductor: "O wa o!"`);
    } else {
      onEarn(0, -1, `Missed the ${name} bay: passengers no pay. Iwa -1.`);
      setLog(`🔴 Missed ${name}! Kerb lane, then STOP inside the yellow box.`);
    }
  };

  const onFinish = () => {
    setRunning(false);
    if (mode === "ride") {
      const fare = Math.round(TP.micraRideFare * (fareMult ?? 1));
      onEarn(-fare, 1, `Rode micra ${corridor.stops[0]}–${corridor.stops[corridor.stops.length - 1]} -${naira(fare)}. Rested + Iwa +1.`);
      setLog(`✅ Arrived ${endLabel} as passenger. -${naira(fare)}, Iwa +1. No wahala.`);
      return;
    }
    const caught = passengers > 4 && Math.random() < 0.25;
    if (caught) {
      onEarn(0, -5, "VIO catch overload at the park! Iwa -5.");
      setLog("🚨 Park VIO catch you at the finish! Overload wahala.");
    } else {
      const fare = passengers * ECONOMY.MICRA_FARE_BASE;
      const full = passengers >= 6 ? " (6/6 FULL LOAD!)" : "";
      onEarn(fare, passengers > 4 ? -2 : 3, `Micra hustle complete: +${naira(fare)}${full}`);
      setLog(`✅ ${endLabel}! +${naira(fare)}. ${passengers > 4 ? "Overload paid but Iwa -2." : "Clean run. Iwa +3."}`);
    }
    setPassengers(0);
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-charcoal text-cream shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-0 sm:p-5 sm:pb-0">
        <div>
          <h3 className="font-display text-lg font-extrabold tracking-tight">🚐 Micra Rush</h3>
          <p className="text-xs text-cream/60">Real Ibadan corridors from OpenStreetMap · {totalKm.toFixed(1)} km by road</p>
        </div>
        <div className="flex rounded-full bg-white/10 p-1 text-sm font-bold">
          <button onClick={() => { if (!running) { setMode("ride"); setLog(`Ride mode: sit in the back, fare ${naira(TP.micraRideFare)}.`); } }} className={`rounded-full px-4 py-1.5 ${mode === "ride" ? "bg-cream text-charcoal" : ""}`}>🧍 Ride</button>
          <button onClick={() => { if (!running) { setMode("drive"); setLog("Hustle mode: you drive, change lanes and STOP at the bays."); } }} className={`rounded-full px-4 py-1.5 ${mode === "drive" ? "bg-mapo text-charcoal" : ""}`}>🛣️ Hustle</button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {CITY.corridors.map((c) => (
            <button
              key={c.id}
              disabled={running}
              onClick={() => { setRouteId(c.id); setLog(`${c.name}: ${c.legKm.reduce((a, b) => a + b, 0).toFixed(1)} km by road, ${c.stops.length - 1} stops.`); }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ring-1 transition disabled:opacity-40 ${routeId === c.id ? "bg-mapo text-charcoal ring-mapo" : "bg-white/10 text-cream/75 ring-white/10"}`}
            >
              {c.name}
            </button>
          ))}
          <button onClick={() => !running && setNight((n) => !n)} className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-cream/85" title="Time of day">
            {night ? "🌙 Night" : "🌇 Day"}
          </button>
        </div>

        {running && (
          <RoadRun
            key={runKey}
            corridor={corridor}
            stopNames={stopNames}
            autopilot={mode === "ride"}
            seed={runKey}
            weather={weather}
            night={night}
            onHazard={onHazard}
            onBay={onBay}
            onFinish={onFinish}
            onHonk={setLog}
          />
        )}

        <p className="mt-2 min-h-[2.5rem] text-sm text-cream/85">{log}</p>
        <div className="mt-1 text-sm">Seats: {"🪑".repeat(passengers) || "—"} <span className="opacity-60">({passengers}/6)</span></div>

        {mode === "ride" ? (
          <div className="mt-3 flex gap-2">
            <button onClick={startRide} disabled={running} className="flex-1 rounded-full bg-cream py-2.5 text-sm font-bold text-charcoal disabled:opacity-40">Board micra — ride {naira(Math.round(TP.micraRideFare * (fareMult ?? 1)))}</button>
          </div>
        ) : (
          !running && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={load} className="rounded-full bg-mapo px-4 py-2 text-sm font-bold text-charcoal">Load +1</button>
              <button onClick={startDrive} className="flex-1 rounded-full bg-agodi px-4 py-2 text-sm font-bold text-white">Depart hustle 🛣️</button>
              <button onClick={() => setPassengers(0)} className="rounded-full bg-white/10 px-4 py-2 text-sm">Reset</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
