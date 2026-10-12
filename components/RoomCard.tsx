"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import RoomView from "./RoomView";
import type { HomeSave } from "@/lib/world";

const Room3D = dynamic(() => import("./Room3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-2xl bg-black text-sm text-cream/70">
      Opening your room in 3D…
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

export default function RoomCard({ home, avatarColor, onSleep }: { home: HomeSave; avatarColor: string; onSleep: () => void }) {
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  const [zzz, setZzz] = useState(false);
  useEffect(() => {
    if (!hasWebGL()) setMode("2d");
  }, []);
  useEffect(() => {
    if (!zzz) return;
    const t = setTimeout(() => setZzz(false), 4000);
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
          😴 Sleep here
        </button>
        <div className="flex gap-1 rounded-full bg-cream p-0.5 text-[11px] font-bold ring-1 ring-roof/15">
          <button onClick={() => setMode("3d")} className={`rounded-full px-3 py-1 ${mode === "3d" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>3D dollhouse</button>
          <button onClick={() => setMode("2d")} className={`rounded-full px-3 py-1 ${mode === "2d" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>2D plan</button>
        </div>
      </div>
      {mode === "3d" ? <Room3D home={home} avatarColor={avatarColor} saver={false} zzz={zzz} /> : <RoomView home={home} />}
    </div>
  );
}
