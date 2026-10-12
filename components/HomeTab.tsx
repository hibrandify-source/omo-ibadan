"use client";

import { HOME_PATHS, FURNITURE, type HomeSave, type HomeTier } from "@/lib/world";

const TIER_ORDER: HomeTier[] = ["room", "flat", "duplex"];
const TIER_EMOJI: Record<HomeTier, string> = { room: "🛏️", flat: "🏠", duplex: "🏰" };

export default function HomeTab({
  archId,
  archName,
  home,
  ola,
  onBuy,
  onUpgrade,
  onRest,
}: {
  archId: string;
  archName: string;
  home: HomeSave;
  ola: number;
  onBuy: (cost: number, iwa: number, msg: string, furnitureId: string) => void;
  onUpgrade: (cost: number, tier: HomeTier, msg: string) => void;
  onRest: (energy: number, msg: string) => void;
}) {
  const path = HOME_PATHS.find((p) => p.archId === archId) ?? HOME_PATHS[0];
  const tierIdx = TIER_ORDER.indexOf(home.tier);
  const homeName =
    home.tier === "room" ? path.room : home.tier === "flat" ? path.flat : path.duplex;
  const nextTier = TIER_ORDER[tierIdx + 1] ?? null;
  const nextCost = nextTier === "flat" ? path.flatCost : nextTier === "duplex" ? path.duplexCost : 0;
  const nextName = nextTier === "flat" ? path.flat : nextTier === "duplex" ? path.duplex : "";
  const restBonus = home.furniture.reduce((sum, id) => {
    const f = FURNITURE.find((x) => x.id === id);
    return sum + (f ? f.rest : 0);
  }, 0);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl bg-charcoal text-cream shadow ring-1 ring-white/10">
        <div className="bg-gradient-to-r from-roof via-[#a8642f] to-mapo px-5 pb-4 pt-5">
          <div className="text-[11px] font-extrabold tracking-[0.25em] text-cream/85">ILÉ MI · MY HOME</div>
          <h3 className="font-display mt-1 text-xl font-extrabold tracking-tight">
            {TIER_EMOJI[home.tier]} {homeName}
          </h3>
          <p className="mt-1 text-xs text-cream/70">
            {home.tier === "room"
              ? "Empty decor — bare floor, big dreams. Hustle to set am up."
              : home.tier === "flat"
                ? "Self-contain comfort. Elders fit visit now."
                : "Duplex flex. Ibadan sees you."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-5 py-4">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">Rest power +{40 + restBonus}⚡</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{home.furniture.length} item{home.furniture.length === 1 ? "" : "s"}</span>
          <button
            onClick={() => onRest(40 + restBonus, `😴 Rested at home. Energy +${40 + restBonus}.`)}
            className="ml-auto rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] px-5 py-2 text-sm font-extrabold text-charcoal"
          >
            Rest at home
          </button>
        </div>
      </div>

      {nextTier && (
        <button
          onClick={() =>
            ola >= nextCost
              ? onUpgrade(nextCost, nextTier, `🎉 Upgraded to ${nextName}! New catalog unlocked.`)
              : undefined
          }
          disabled={ola < nextCost}
          className="w-full rounded-3xl bg-white p-4 text-left shadow ring-1 ring-mapo/30 disabled:opacity-50"
        >
          <div className="text-[11px] font-extrabold tracking-widest text-roof">NEXT MOVE-UP</div>
          <div className="font-display text-base font-extrabold">{TIER_EMOJI[nextTier]} {nextName}</div>
          <div className="mt-1 text-sm font-bold text-charcoal/70">₦{nextCost.toLocaleString()} {ola >= nextCost ? "→ Tap to move" : `(need ₦${(nextCost - ola).toLocaleString()} more)`}</div>
        </button>
      )}

      <div className="rounded-3xl bg-white p-4 shadow ring-1 ring-roof/10 sm:p-5">
        <h4 className="font-display font-extrabold tracking-tight">🪑 Furniture market</h4>
        <p className="text-xs text-charcoal/55">Start empty, hustle to setup. Rest bonus applies every rest. {archName} path.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {FURNITURE.map((f) => {
            const owned = home.furniture.includes(f.id);
            const tierOk = TIER_ORDER.indexOf(f.minTier) <= tierIdx;
            return (
              <div key={f.id} className={`rounded-2xl p-3 ring-1 ${owned ? "bg-agodi/10 ring-agodi/30" : "bg-cream ring-roof/10"}`}>
                <div className="text-sm font-bold">{owned ? "✅ " : ""}{f.name}</div>
                <div className="text-[11px] text-charcoal/55">
                  {f.cost === 0 ? "Starter" : `₦${f.cost.toLocaleString()}`} · +{f.rest}⚡ rest{f.iwa > 0 && ` · +${f.iwa} Iwa`}
                  {!tierOk && ` · needs ${f.minTier}`}
                </div>
                {!owned && (
                  <button
                    onClick={() =>
                      tierOk && ola >= f.cost
                        ? onBuy(f.cost, f.iwa, `🪑 Bought ${f.name}! Home rest +${f.rest}⚡${f.iwa > 0 ? `, Iwa +${f.iwa}` : ""}.`, f.id)
                        : undefined
                    }
                    disabled={!tierOk || ola < f.cost}
                    className="mt-2 w-full rounded-full bg-charcoal px-3 py-1.5 text-xs font-bold text-cream disabled:opacity-35"
                  >
                    {!tierOk ? `Locked (${f.minTier})` : ola >= f.cost ? `Buy ₦${f.cost.toLocaleString()}` : "No reach"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
