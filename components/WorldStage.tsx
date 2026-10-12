"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import IsoWorld, { type Teleport } from "./IsoWorld";
import type { RiderNet } from "@/lib/useRiders";
import type { Door } from "@/lib/world";

const World3D = dynamic(() => import("./World3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-2xl bg-charcoal text-sm text-cream/70 lg:h-[560px]">
      Opening Ibadan in 3D…
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

export interface WorldStageProps {
  active: string;
  onSelect: (id: string) => void;
  playerName: string;
  playerTitle: string;
  avatarColor: string;
  fem: boolean;
  lookSkin: string;
  lookGear: "fila" | "gele" | "none" | "braids" | "afro";
  homeZone: string;
  teleport: Teleport | null;
  onZoneEnter: (id: string) => void;
  saver: boolean;
  onSaver: (v: boolean) => void;
  stageClass: string;
  onWeak: () => void;
  weather: "clear" | "rain";
  hood: string;
  net: RiderNet;
  onDoor: (door: Door | null) => void;
}

export default function WorldStage(props: WorldStageProps) {
  const { saver, onWeak } = props;
  const [mode, setMode] = useState<"3d" | "2d">("3d");

  useEffect(() => {
    if (saver) {
      setMode("2d");
      return;
    }
    try {
      const stored = localStorage.getItem("omo-ibadan-renderer");
      if (stored === "2d") {
        setMode("2d");
        return;
      }
    } catch {}
    if (!hasWebGL()) setMode("2d");
  }, [saver]);

  const weak = () => {
    setMode("2d");
    try {
      localStorage.setItem("omo-ibadan-renderer", "2d");
    } catch {}
    onWeak();
  };

  const pick = (m: "3d" | "2d") => {
    setMode(m);
    try {
      localStorage.setItem("omo-ibadan-renderer", m);
    } catch {}
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold text-cream/50">
          {mode === "3d" ? "● 3D Ibadan (light build)" : "● 2D diorama (battery saver mode)"}
          {saver && " · saver forces 2D"}
        </span>
        <div className="flex gap-1 rounded-full bg-white/10 p-0.5 text-[11px] font-bold">
          <button
            onClick={() => pick("3d")}
            disabled={saver}
            className={`rounded-full px-3 py-1 ${mode === "3d" ? "bg-mapo text-charcoal" : "text-cream/70"} disabled:opacity-40`}
          >
            3D
          </button>
          <button
            onClick={() => pick("2d")}
            className={`rounded-full px-3 py-1 ${mode === "2d" ? "bg-cream text-charcoal" : "text-cream/70"}`}
          >
            2D
          </button>
        </div>
      </div>
      {mode === "3d" && !saver ? (
        <World3D
          active={props.active}
          onSelect={props.onSelect}
          saver={props.saver}
          onWeak={weak}
          playerName={props.playerName}
          playerTitle={props.playerTitle}
          avatarColor={props.avatarColor}
          fem={props.fem}
          lookSkin={props.lookSkin}
          lookGear={props.lookGear}
          homeZone={props.homeZone}
          teleport={props.teleport}
          onZoneEnter={props.onZoneEnter}
          weather={props.weather}
          hood={props.hood}
          net={props.net}
          onDoor={props.onDoor}
        />
      ) : (
        <IsoWorld
          active={props.active}
          onSelect={props.onSelect}
          playerName={props.playerName}
          playerTitle={props.playerTitle}
          avatarColor={props.avatarColor}
          homeZone={props.homeZone}
          teleport={props.teleport}
          onZoneEnter={props.onZoneEnter}
          saver={props.saver}
          onSaver={props.onSaver}
          fem={props.fem}
          weather={props.weather}
          net={props.net}
          onDoor={props.onDoor}
          playerSkin={props.lookSkin}
          playerGear={props.lookGear}
          stageClass={props.stageClass}
        />
      )}
    </div>
  );
}
