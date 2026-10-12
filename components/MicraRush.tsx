"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ECONOMY } from "@/lib/game";
import { DRIVE_ROUTES } from "@/lib/world";
import DriveStage, { type HazardKind } from "./DriveStage";

const Drive3D = dynamic(() => import("./Drive3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] items-center justify-center rounded-2xl bg-black text-sm text-cream/70">
      Starting engine in 3D…
    </div>
  ),
});

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function MicraRush({
  onEarn,
  saver,
  weather,
  fareMult,
}: {
  onEarn: (ola: number, iwa: number, msg: string) => void;
  saver?: boolean;
  weather: "clear" | "rain";
  fareMult?: number; // Ajala Traveller transport discount (0.85)
}) {
  const [mode, setMode] = useState<"ride" | "drive">("drive");
  const [view, setView] = useState<"3d" | "2d">("3d");
  const [phase, setPhase] = useState<"dusk" | "night">(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 6 ? "night" : "dusk";
  });
  const [routeId, setRouteId] = useState(DRIVE_ROUTES[0].id);
  const [passengers, setPassengers] = useState(0);
  const [running, setRunning] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [log, setLog] = useState("Pick a real corridor, load up, and drive it like na your papa road — with sense.");

  const route = DRIVE_ROUTES.find((r) => r.id === routeId) ?? DRIVE_ROUTES[0];

  useEffect(() => {
    if (!hasWebGL()) setView("2d");
  }, []);

  const load = () => {
    if (running) return;
    if (passengers >= 6) return;
    const next = passengers + 1;
    setPassengers(next);
    setLog(next > 4 ? "⚠️ Overload! VIO fit catch you for this corridor." : `Loaded ${next}/6. Conductor dey shout destination!`);
  };

  const startRide = () => {
    setPassengers(0);
    setRunning(true);
    setRunKey((k) => k + 1);
    setLog(`🧍 Riding ${route.name}. Fare ₦150 on arrival — enjoy the corridors.`);
  };

  const startDrive = () => {
    if (passengers === 0) {
      setLog("Load passengers first before hustle.");
      return;
    }
    setRunning(true);
    setRunKey((k) => k + 1);
    setLog(`🛣️ Hustling ${route.name}! Steer lanes, dodge wahala, STOP at yellow bus bays.`);
  };

  const onHazard = (kind: HazardKind) => {
    if (mode === "ride") return;
    if (kind === "signal") {
      onEarn(-100, -2, "🚦 Beat red light! LASTMA wahala -₦100, Iwa -2.");
      setLog("🚦 You beat red light! -₦100 fine. Iwa -2. Calm down.");
      return;
    }
    if (kind === "vio") {
      if (passengers <= 4) {
        setLog("VIO wave you pass — clean load. 👍");
        return;
      }
      onEarn(-200, -5, "🚨 VIO catch overload! Fine -₦200, Iwa -5.");
      setLog("🚨 VIO catch overload for corridor! -₦200, Iwa -5.");
      return;
    }
    if (kind === "pothole") {
      onEarn(-50, 0, "🕳️ Pothole jam! Repair -₦50.");
      setLog("🕳️ Pothole for road! -₦50. This corridor wicked.");
    } else {
      onEarn(-100, -2, `💥 ${kind} bash! Settle -₦100, Iwa -2.`);
      setLog(`💥 ${kind} bash! -₦100. Dodge with ◀ ▶.`);
    }
  };

  const onBay = (ok: boolean) => {
    if (mode === "ride") return;
    if (ok) {
      const fare = passengers * 40;
      onEarn(fare, 2, `🟢 Clean stop! Collected ₦${fare}, Iwa +2.`);
      setLog(`🟢 Inside bay! +₦${fare}. Conductor: "O wa o!"`);
    } else {
      onEarn(0, -1, "Missed the bay — passengers no pay. Iwa -1.");
      setLog("🔴 Missed bay! They no go pay. Watch for yellow boxes.");
    }
  };

  const onFinish = () => {
    setRunning(false);
    if (mode === "ride") {
      const fare = Math.round(150 * (fareMult ?? 1));
      onEarn(-fare, 1, `Rode micra ${route.short} -₦${fare}. Rested + Iwa +1.`);
      setLog(`✅ Arrived ${route.endLabel} as passenger. -₦${fare}, Iwa +1. No wahala.`);
      return;
    }
    const caught = passengers > 4 && Math.random() < 0.25;
    if (caught) {
      onEarn(0, -5, "VIO catch overload at the park! Iwa -5.");
      setLog("🚨 Park VIO catch you at finish! Overload wahala.");
    } else {
      const fare = passengers * ECONOMY.MICRA_FARE_BASE;
      const full = passengers >= 6 ? " (6/6 FULL LOAD!)" : "";
      onEarn(fare, passengers > 4 ? -2 : 3, `Micra hustle complete: +₦${fare}${full}`);
      setLog(`✅ ${route.endLabel}! +₦${fare}. ${passengers > 4 ? "Overload paid but Iwa -2." : "Clean run. Iwa +3."}`);
    }
    setPassengers(0);
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-charcoal text-cream shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-0 sm:p-5 sm:pb-0">
        <div>
          <h3 className="font-display text-lg font-extrabold tracking-tight">🚐 Micra Rush</h3>
          <p className="text-xs text-cream/60">Real Ibadan corridors · top-down · face the road</p>
        </div>
        <div className="flex rounded-full bg-white/10 p-1 text-sm font-bold">
          <button onClick={() => { if (!running) { setMode("ride"); setLog("Ride mode: autopilot, fare ₦150, no steering."); } }} className={`rounded-full px-4 py-1.5 ${mode === "ride" ? "bg-cream text-charcoal" : ""}`}>🧍 Ride</button>
          <button onClick={() => { if (!running) { setMode("drive"); setLog("Hustle mode: you steer lanes + STOP at bays."); } }} className={`rounded-full px-4 py-1.5 ${mode === "drive" ? "bg-mapo text-charcoal" : ""}`}>🛣️ Hustle</button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {DRIVE_ROUTES.map((r) => (
            <button
              key={r.id}
              disabled={running}
              onClick={() => { setRouteId(r.id); setLog(`${r.name}. Pothole level ${"🕳️".repeat(Math.max(1, r.potholes))}${r.potholes === 0 ? " Smooth!" : ""}`); }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ring-1 transition disabled:opacity-40 ${routeId === r.id ? "bg-mapo text-charcoal ring-mapo" : "bg-white/10 text-cream/75 ring-white/10"}`}
            >
              {r.name}
            </button>
          ))}
          <div className="ml-auto flex gap-1 rounded-full bg-white/10 p-0.5 text-[11px] font-bold">
            <button onClick={() => !running && setView("3d")} className={`rounded-full px-3 py-1 ${view === "3d" ? "bg-mapo text-charcoal" : "text-cream/70"}`}>3D chase</button>
            <button onClick={() => !running && setView("2d")} className={`rounded-full px-3 py-1 ${view === "2d" ? "bg-cream text-charcoal" : "text-cream/70"}`}>2D top</button>
            <button onClick={() => !running && setPhase((p) => (p === "night" ? "dusk" : "night"))} className="rounded-full px-3 py-1 text-cream/85" title="Time of day">
              {phase === "night" ? "🌙" : "🌇"}
            </button>
          </div>
        </div>

        {running &&
          (view === "3d" ? (
            <Drive3D
              key={`3d-${route.id}-${mode}-${runKey}`}
              route={route}
              passengers={passengers}
              autopilot={mode === "ride"}
              saver={!!saver}
              onHazard={onHazard}
              onBay={onBay}
              onFinish={onFinish}
              phase={phase}
              onHonk={(msg) => {
                setLog(msg);
              }}
              weather={weather}
              onWeak={() => {
                setView("2d");
                setLog("📉 3D too heavy — dropped to 2D road. Same hustle.");
              }}
            />
          ) : (
            <DriveStage
              key={`2d-${route.id}-${mode}-${runKey}`}
              route={route}
              passengers={passengers}
              autopilot={mode === "ride"}
              saver={!!saver}
              onHazard={onHazard}
              onBay={onBay}
              onFinish={onFinish}
              onHonk={(msg) => {
                setLog(msg);
              }}
              weather={weather}
            />
          ))}

        <p className="mt-2 min-h-[2.5rem] text-sm text-cream/85">{log}</p>
        <div className="mt-1 text-sm">Seats: {"🪑".repeat(passengers) || "—"} <span className="opacity-60">({passengers}/6)</span></div>

        {mode === "ride" ? (
          <div className="mt-3 flex gap-2">
            <button onClick={startRide} disabled={running} className="flex-1 rounded-full bg-cream py-2.5 text-sm font-bold text-charcoal disabled:opacity-40">Board micra — auto ride ₦{Math.round(150 * (fareMult ?? 1))}</button>
          </div>
        ) : (
          <div className="mt-3">
            {!running && (
              <div className="flex flex-wrap gap-2">
                <button onClick={load} className="rounded-full bg-mapo px-4 py-2 text-sm font-bold text-charcoal">Load +1</button>
                <button onClick={startDrive} className="flex-1 rounded-full bg-agodi px-4 py-2 text-sm font-bold text-white">Depart hustle 🛣️</button>
                <button onClick={() => setPassengers(0)} className="rounded-full bg-white/10 px-4 py-2 text-sm">Reset</button>
              </div>
            )}
            <p className="mt-2 text-[11px] text-cream/50">Desktop: ← → steer, Space = stop. Mobile: tap ◀ ▶ + STOP on the road.</p>
          </div>
        )}
      </div>
    </div>
  );
}
