"use client";

import { MAP_NODES } from "@/lib/game";

export default function MapGraph({
  active,
  onSelect,
  getFare,
}: {
  active: string;
  onSelect: (id: string) => void;
  travelFrom?: string;
  getFare?: (id: string) => string | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {MAP_NODES.map((n) => {
        const fare = getFare?.(n.id);
        return (
          <button
            key={n.id}
            onClick={() => onSelect(n.id)}
            className={`rounded-xl border p-3 text-left transition ${
              active === n.id
                ? "border-roof bg-roof text-cream shadow"
                : "border-roof/20 bg-white hover:border-roof"
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="font-display text-sm font-bold">{n.name}</div>
              {fare && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${active === n.id ? "bg-cream/20" : "bg-mapo/20 text-charcoal"}`}>
                  {fare}
                </span>
              )}
            </div>
            <div className="text-xs opacity-70">{n.yoruba} · {n.zone}</div>
            <div className="mt-1 text-xs opacity-80">{n.blurb}</div>
          </button>
        );
      })}
    </div>
  );
}
