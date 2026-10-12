"use client";

import type { ReactNode } from "react";
import type { Door } from "@/lib/world";

// In-world door: step off the street straight into the action.
// Hosts the REAL mini-games (same components, same economy) — no tabs.
export default function DoorModal({
  door,
  zoneName,
  onClose,
  children,
}: {
  door: Door;
  zoneName: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-label={door.label}
      className="fixed inset-0 z-30 flex items-end justify-center bg-charcoal/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-cream shadow-2xl ring-1 ring-roof/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-charcoal px-4 py-3 text-cream">
          <div>
            <div className="text-[10px] font-extrabold tracking-[0.25em] text-mapo">
              {zoneName.toUpperCase()} · WALKED IN
            </div>
            <div className="font-display text-base font-extrabold">🚪 {door.label}</div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold hover:bg-white/25"
          >
            Step out →
          </button>
        </div>
        <div className="space-y-3 p-4">{children}</div>
      </div>
    </div>
  );
}
