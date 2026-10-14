"use client";

import { useEffect, useState } from "react";
import InteriorView from "./InteriorView";
import type { HomeSave } from "@/lib/world";
import type { PersonSpec } from "@/lib/art/people";

export default function RoomCard({ home, player, night, bedtime, onSleep }: { home: HomeSave; player: PersonSpec; night: boolean; bedtime: boolean; onSleep: () => void }) {
  const [zzz, setZzz] = useState(false);
  useEffect(() => {
    if (!zzz) return;
    const t = setTimeout(() => setZzz(false), 3200);
    return () => clearTimeout(t);
  }, [zzz]);
  const sleep = () => {
    setZzz(true);
    onSleep();
  };
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button onClick={sleep} className="rounded-full bg-charcoal px-4 py-1.5 text-xs font-bold text-cream">
          {bedtime ? "😴 Sleep till morning" : "😴 Take a nap (2h)"}
        </button>
        <span className="text-[11px] font-bold text-charcoal/50">{home.tier === "room" ? "Bare cement floor" : home.tier === "flat" ? "Terrazzo floor" : "Tiled floor"}</span>
      </div>
      <InteriorView label="Your room" room={{ tier: home.tier, furniture: home.furniture, player, sleeping: zzz, night }} />
    </div>
  );
}
