"use client";

import dynamic from "next/dynamic";
import type { ShopKind } from "./StoreInterior3D";

const StoreInterior3D = dynamic(() => import("./StoreInterior3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-2xl bg-black text-sm text-cream/70">
      Opening shop…
    </div>
  ),
});

const PROVISIONS = [
  { id: "water", name: "Pure water + Gala", cost: 50, gain: 8, blurb: "Hold body till real food." },
  { id: "combo", name: "Gala + La Casera", cost: 200, gain: 18, blurb: "Traffic classic." },
  { id: "pack", name: "Family provisions pack", cost: 500, gain: 40, blurb: "Household secured." },
];

export default function ShopEntryModal({
  shop,
  ola,
  greetedShop,
  onBuyEnergy,
  onHaircut,
  onWatch,
  onGreet,
  onBrowseClothes,
  onClose,
}: {
  shop: ShopKind;
  ola: number;
  greetedShop: boolean;
  onBuyEnergy: (cost: number, gain: number, msg: string) => void;
  onHaircut: () => void;
  onWatch: () => void;
  onGreet: () => void;
  onBrowseClothes: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-charcoal/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-3xl bg-cream p-4 shadow-2xl ring-1 ring-roof/20" onClick={(e) => e.stopPropagation()}>
        <StoreInterior3D shop={shop} saver={false} />
        {(shop === "food" || shop === "provisions") && (
          <div className="mt-3 grid gap-2">
            {(shop === "food"
              ? [
                  { id: "amala", name: "Amala + gbegiri", cost: 150, gain: 30, blurb: "Mama's pot." },
                  { id: "special", name: "⭐ Mama Special", cost: 250, gain: 45, blurb: "Ofada + meat. Bodija remembers." },
                ]
              : PROVISIONS
            ).map((g) => (
              <button
                key={g.id}
                onClick={() => (ola >= g.cost ? onBuyEnergy(g.cost, g.gain, `🛒 ${g.name} (−₦${g.cost}). Energy +${g.gain}.`) : undefined)}
                disabled={ola < g.cost}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-2.5 text-left text-sm font-bold ring-1 ring-roof/10 disabled:opacity-40"
              >
                <span>{g.name}<span className="block text-xs font-semibold text-charcoal/55">{g.blurb}</span></span>
                <span className="shrink-0 rounded-full bg-charcoal px-3 py-1 text-xs text-cream">₦{g.cost}</span>
              </button>
            ))}
          </div>
        )}
        {shop === "boutique" && (
          <button onClick={onBrowseClothes} className="mt-3 w-full rounded-2xl bg-charcoal px-4 py-3 text-sm font-bold text-cream">
            👗 Full rack lives in the Buy tab →
          </button>
        )}
        {shop === "barber" && (
          <button
            onClick={onHaircut}
            disabled={ola < 200}
            className="mt-3 w-full rounded-2xl bg-charcoal px-4 py-3 text-sm font-bold text-cream disabled:opacity-40"
          >
            💈 Sharp lowcut — ₦200
          </button>
        )}
        {shop === "viewing" && (
          <button
            onClick={onWatch}
            disabled={ola < 100}
            className="mt-3 w-full rounded-2xl bg-charcoal px-4 py-3 text-sm font-bold text-cream disabled:opacity-40"
          >
            📺 Watch match — ₦100 (gist + Iwa once daily)
          </button>
        )}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button onClick={onGreet} disabled={greetedShop} className="rounded-2xl bg-white px-4 py-2.5 text-sm font-bold ring-1 ring-roof/10 disabled:opacity-40">
            {greetedShop ? "✅ Greeted today" : "🙏 Greet (+1 Iwa)"}
          </button>
          <button onClick={onClose} className="rounded-2xl bg-white px-4 py-2.5 text-sm font-bold ring-1 ring-roof/10">
            Step out →
          </button>
        </div>
      </div>
    </div>
  );
}
