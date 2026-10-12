"use client";

import { useEffect, useRef, useState } from "react";
import { MAP_NODES } from "@/lib/game";
import { DOORS, type Door } from "@/lib/world";
import { sceneFor } from "@/lib/districts";

type Phase = "amber" | "dusk" | "night";

export interface SceneTeleport {
  x: number; // % coords
  y: number;
  key: number;
}

export default function DistrictScene({
  zone,
  playerName,
  playerColor,
  teleport,
  weather,
  saver,
  npcMeets,
  onGate,
  onDoor,
  onGreetNpc,
}: {
  zone: string;
  playerName: string;
  playerColor: string;
  teleport: SceneTeleport | null;
  weather: "clear" | "rain";
  saver: boolean;
  npcMeets: Record<string, number>;
  onGate: (id: string) => void;
  onDoor: (door: Door | null) => void;
  onGreetNpc: (id: string) => void;
}) {
  const scene = sceneFor(zone);
  const [pos, setPos] = useState(scene.spawn);
  const [phase, setPhase] = useState<Phase>("amber");
  const wrapRef = useRef<HTMLDivElement>(null);
  const doorCb = useRef(onDoor);
  doorCb.current = onDoor;
  const doorKey = useRef<string | null>(null);

  // reset position when district changes
  useEffect(() => {
    setPos(sceneFor(zone).spawn);
    doorKey.current = null;
    doorCb.current(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone]);

  // teleport (E2E hook + go-home), % coords
  useEffect(() => {
    if (!teleport) return;
    setPos({ x: teleport.x, y: teleport.y });
  }, [teleport?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // door proximity (8% radius): nearest anchor wins
  useEffect(() => {
    const def = sceneFor(zone);
    let best: Door | null = null;
    let bestD = 8;
    for (const a of def.doors) {
      const dd = Math.hypot(pos.x - a.x, pos.y - a.y);
      if (dd < bestD) {
        bestD = dd;
        best = DOORS.find((d) => d.id === a.doorId) ?? null;
      }
    }
    const key = best ? best.id : null;
    if (key !== doorKey.current) {
      doorKey.current = key;
      doorCb.current(best);
    }
  }, [pos, zone]);

  const tapMove = (e: React.MouseEvent) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = Math.min(96, Math.max(4, ((e.clientX - r.left) / r.width) * 100));
    const rawY = ((e.clientY - r.top) / r.height) * 100;
    const y = Math.min(scene.walkBand.bottom, Math.max(scene.walkBand.top, rawY));
    setPos({ x, y });
  };

  const goDoor = (doorId: string) => {
    const a = scene.doors.find((d) => d.doorId === doorId);
    if (!a) return;
    setPos({ x: a.x, y: Math.min(scene.walkBand.bottom, a.y + 4) });
  };

  const zoneName = (id: string) => MAP_NODES.find((n) => n.id === id)?.name ?? id;

  return (
    <div>
      <div
        ref={wrapRef}
        onClick={tapMove}
        className="relative aspect-[16/10] w-full cursor-pointer touch-manipulation select-none overflow-hidden rounded-3xl shadow ring-1 ring-roof/20"
      >
        {/* painting */}
        <div className="absolute inset-0 bg-charcoal" style={{ backgroundImage: `url(${scene.img.blur})`, backgroundSize: "cover" }} />
        <img
          src={scene.img.hero}
          srcSet={`${scene.img.small} 800w, ${scene.img.hero} 1600w`}
          sizes="(max-width: 768px) 100vw, 900px"
          alt={`${zoneName(zone)} — illustrated street scene`}
          className={`absolute inset-0 h-full w-full object-cover ${saver ? "" : "animate-[scene-drift_46s_ease-in-out_infinite_alternate]"}`}
          draggable={false}
        />
        {/* day grade */}
        {phase === "dusk" && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#4a1f4d]/45 via-[#c25a2e]/20 to-transparent" />}
        {phase === "night" && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[#0b1026]/60" />
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 30% 22% at 20% 72%, rgba(232,160,32,0.28), transparent 70%), radial-gradient(ellipse 24% 18% at 68% 60%, rgba(232,160,32,0.22), transparent 70%)" }} />
          </div>
        )}
        {weather === "rain" && (
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "repeating-linear-gradient(105deg, transparent 0 9px, rgba(200,220,255,0.5) 9px 10px)" }} />
        )}

        {/* door markers */}
        {scene.doors.map((a) => {
          const d = DOORS.find((dd) => dd.id === a.doorId);
          if (!d) return null;
          const near = doorKey.current === d.id;
          return (
            <button
              key={a.doorId}
              onClick={(e) => { e.stopPropagation(); goDoor(a.doorId); }}
              className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-[11px] font-extrabold shadow-lg ring-2 transition ${near ? "animate-pulse bg-gradient-to-r from-mapo to-[#f5c04a] text-charcoal ring-cream" : "bg-charcoal/85 text-cream ring-white/30 backdrop-blur-sm"}`}
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
            >
              🚪 {d.label}
            </button>
          );
        })}

        {/* NPC markers: portraits cropped from the scene itself */}
        {scene.npcs.map((n) => {
          const meets = npcMeets[n.npcId] ?? 0;
          return (
            <button
              key={n.npcId}
              onClick={(e) => { e.stopPropagation(); onGreetNpc(n.npcId); }}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              title={`${n.npcId} — tap to greet`}
            >
              <span className="block h-12 w-12 overflow-hidden rounded-full shadow-xl ring-[3px] ring-mapo">
                {n.portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.portrait} alt={n.npcId} className="h-full w-full object-cover" draggable={false} />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-charcoal text-lg font-extrabold text-cream">{n.npcId[0]}</span>
                )}
              </span>
              <span className="mt-1 rounded-full bg-charcoal/85 px-2 py-0.5 text-[10px] font-bold text-cream backdrop-blur-sm">
                {n.npcId}{meets >= 3 ? " · Familiar" : ""}
              </span>
            </button>
          );
        })}

        {/* player token */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <span className="block h-9 w-9 rounded-full shadow-xl ring-[3px] ring-cream" style={{ background: `conic-gradient(${playerColor} 0 65%, #1c1917 65% 100%)` }} />
          <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-mapo px-2 py-0.5 text-[10px] font-extrabold text-charcoal">
            @{playerName}
          </span>
        </div>

        {/* phase toggle */}
        <div className="absolute right-2 top-2 z-10 flex gap-1 rounded-full bg-charcoal/70 p-1 backdrop-blur-sm">
          {(["amber", "dusk", "night"] as Phase[]).map((p) => (
            <button
              key={p}
              onClick={(e) => { e.stopPropagation(); setPhase(p); }}
              className={`rounded-full px-2 py-1 text-xs ${phase === p ? "bg-mapo" : "opacity-60"}`}
              title={p}
            >
              {p === "amber" ? "☀️" : p === "dusk" ? "🌇" : "🌙"}
            </button>
          ))}
        </div>
        <div className="absolute left-2 top-2 z-10 rounded-full bg-charcoal/70 px-3 py-1 text-[11px] font-extrabold text-cream backdrop-blur-sm">
          📍 {zoneName(zone)}
        </div>
      </div>

      {/* travel gates */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {scene.gates.map((g) => (
          <button
            key={g}
            onClick={() => onGate(g)}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-charcoal shadow ring-1 ring-roof/15 transition hover:bg-mapo/25 active:scale-95"
          >
            → {zoneName(g)}
          </button>
        ))}
      </div>
      <style>{`@keyframes scene-drift { from { transform: scale(1); } to { transform: scale(1.09); } }`}</style>
    </div>
  );
}
