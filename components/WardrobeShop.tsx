"use client";

import { WARDROBE, type WardrobeItem } from "@/lib/game";

// Aso-ebi market. Virtual naira today; every item carries an `ngn`
// price so the Paystack switch later needs zero redesign.
function PersonPreview({ color, gear }: { color: string; gear: "fila" | "gele" | "none" | "braids" | "afro" }) {
  return (
    <svg viewBox="0 0 60 92" className="h-20 w-auto" aria-hidden>
      <ellipse cx="30" cy="86" rx="14" ry="4" fill="#00000033" />
      <line x1="25" y1="62" x2="24" y2="84" stroke="#241a12" strokeWidth="4" strokeLinecap="round" />
      <line x1="35" y1="62" x2="36" y2="84" stroke="#241a12" strokeWidth="4" strokeLinecap="round" />
      <path d="M18,62 H42 L39,30 H21 Z" fill={color} />
      <line x1="16" y1="40" x2="12" y2="58" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="44" y1="40" x2="48" y2="58" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <circle cx="30" cy="22" r="8" fill="#5a3a26" />
      {gear === "gele" ? (
        <g fill={color}>
          <ellipse cx="30" cy="19" rx="10" ry="6" />
          <circle cx="39" cy="21" r="3" />
        </g>
      ) : gear === "fila" ? (
        <path d="M21,20 A9,9 0 0 1 39,20 Z" fill={color} />
      ) : gear === "braids" ? (
        <g stroke="#14100c" strokeWidth="2.6" strokeLinecap="round">
          <line x1="24" y1="16" x2="22" y2="34" />
          <line x1="30" y1="15" x2="30" y2="35" />
          <line x1="36" y1="16" x2="38" y2="34" />
        </g>
      ) : gear === "afro" ? (
        <circle cx="30" cy="17" r="11" fill="#14100c" />
      ) : (
        <path d="M21,21 A9,9 0 0 1 39,21 L39,19 A9,9 0 0 0 21,19 Z" fill="#14100c" />
      )}
    </svg>
  );
}

export default function WardrobeShop({
  ola,
  owned,
  equippedId,
  myGear,
  onBuy,
  onEquip,
  onRealInfo,
}: {
  ola: number;
  owned: string[];
  equippedId: string | null;
  myGear: "fila" | "gele" | "none" | "braids" | "afro";
  onBuy: (item: WardrobeItem) => void;
  onEquip: (item: WardrobeItem | null) => void;
  onRealInfo?: (item: WardrobeItem) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-3xl bg-charcoal p-4 text-cream ring-1 ring-white/10 sm:p-5">
        <h3 className="font-display text-lg font-extrabold tracking-tight">🛍️ Aso-Ebi Market</h3>
        <p className="mt-1 text-xs text-cream/60">
          Game money today — every tag carries its future real-naira price, so nothing redesigns later.
          Equipping changes your avatar everywhere: street, dance floor, rooms.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {WARDROBE.map((w) => {
          const has = owned.includes(w.id);
          const eq = equippedId === w.id;
          return (
            <div key={w.id} className={`flex gap-3 rounded-3xl bg-white p-3 ring-1 ${eq ? "ring-2 ring-agodi" : "ring-roof/10"}`}>
              <div className="flex shrink-0 items-center rounded-2xl bg-cream px-2">
                <PersonPreview color={w.color} gear={w.gear ?? myGear} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">{eq && "✅ "}{w.name}</div>
                <div className="text-xs text-charcoal/60">{w.desc}</div>
                <div className="mt-1 text-xs font-semibold text-charcoal/60">
                  ₦{w.costV.toLocaleString()} virtual
                  {w.ngn !== null && (
                    <button onClick={() => onRealInfo?.(w)} className="ml-1 underline opacity-70">
                      ₦{w.ngn.toLocaleString()} real later?
                    </button>
                  )}
                </div>
                {!has ? (
                  <button
                    onClick={() => ola >= w.costV ? onBuy(w) : undefined}
                    disabled={ola < w.costV}
                    className="mt-2 w-full rounded-full bg-charcoal px-3 py-1.5 text-xs font-bold text-cream disabled:opacity-35"
                  >
                    {ola >= w.costV ? `Buy ₦${w.costV.toLocaleString()}` : "No reach"}
                  </button>
                ) : eq ? (
                  <button onClick={() => onEquip(null)} className="mt-2 w-full rounded-full bg-cream px-3 py-1.5 text-xs font-bold ring-1 ring-roof/15">
                    Unequip (back to default)
                  </button>
                ) : (
                  <button onClick={() => onEquip(w)} className="mt-2 w-full rounded-full bg-agodi px-3 py-1.5 text-xs font-bold text-white">
                    Wear am
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
