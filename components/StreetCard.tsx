"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import StreetView from "./StreetView";
import type { ShopKind } from "./StoreInterior3D";
import { hasWebGL } from "@/lib/webgl";

const Street3D = dynamic(() => import("./Street3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-2xl bg-black text-sm text-cream/70">
      Opening your street in 3D…
    </div>
  ),
});

const SHOP_DOORS: { id: ShopKind; label: string }[] = [
  { id: "food", label: "🍲 Mama Put" },
  { id: "provisions", label: "🧃 Kiosk" },
  { id: "barber", label: "💈 Barber" },
  { id: "viewing", label: "📺 Viewing" },
  { id: "boutique", label: "👗 Boutique" },
];

export default function StreetCard({ onStepOut, onEnterShop }: { onStepOut: () => void; onEnterShop: (s: ShopKind) => void }) {
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  useEffect(() => {
    if (!hasWebGL()) setMode("2d");
  }, []);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button onClick={onStepOut} className="rounded-full bg-charcoal px-4 py-1.5 text-xs font-bold text-cream">
          🚶 Step out — spawn at home zone
        </button>
        <div className="flex gap-1 rounded-full bg-cream p-0.5 text-[11px] font-bold ring-1 ring-roof/15">
          <button onClick={() => setMode("3d")} className={`rounded-full px-3 py-1 ${mode === "3d" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>3D street</button>
          <button onClick={() => setMode("2d")} className={`rounded-full px-3 py-1 ${mode === "2d" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>2D view</button>
        </div>
      </div>
      {mode === "3d" ? <Street3D saver={false} /> : <StreetView onStepOut={onStepOut} />}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SHOP_DOORS.map((s) => (
          <button
            key={s.id}
            onClick={() => onEnterShop(s.id)}
            className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold ring-1 ring-roof/15 hover:bg-mapo/20"
          >
            {s.label} →
          </button>
        ))}
      </div>
    </div>
  );
}
