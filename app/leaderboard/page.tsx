"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdSlot from "@/components/AdSlot";
import { HOODS } from "@/lib/game";
import { SAVE_KEY } from "@/lib/engine/save";
import { walkWeekKey } from "@/lib/walk";

// Opening snapshot (also the SQL seed). Live totals replace these
// once the backend is configured — same numbers, real board.
const SEED: Record<string, number> = {
  bodija: 12400, agbowo: 15200, challenge: 9800, "iwo-road": 18600, ojoo: 6400, beere: 11700,
};

export default function Leaderboard() {
  const [totals, setTotals] = useState<Record<string, number>>(SEED);
  const [live, setLive] = useState(false);
  const [walkers, setWalkers] = useState<{ name: string; steps: number }[]>([]);
  const [walkLive, setWalkLive] = useState(false);
  // this phone's walks this week, from the local save (signed in or not)
  const [mine, setMine] = useState<{ name: string; steps: number } | null>(null);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");
      const w = s?.walkWeek;
      if (w && w.key === walkWeekKey() && w.steps > 0) setMine({ name: String(s.username || "omo"), steps: Number(w.steps) });
    } catch {}
  }, []);

  useEffect(() => {
    if (!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return;
    (async () => {
      const { getSupabase } = await import("@/lib/supabase");
      const sb = getSupabase();
      if (!sb) return;
      sb.from("hood_totals")
        .select("hood,total")
        .then(({ data, error }) => {
          if (error || !data || data.length === 0) return;
          const t: Record<string, number> = { ...SEED };
          for (const row of data as { hood: string; total: number }[]) {
            t[row.hood] = Number(row.total);
          }
          setTotals(t);
          setLive(true);
        });
      // weekly walkers (Monday reset, Africa/Lagos)
      const monday = (() => {
        const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" });
        const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
        const d = new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00Z`);
        d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
        return d.toISOString().slice(0, 10);
      })();
      sb.from("walk_steps")
        .select("name,steps")
        .eq("week_key", monday)
        .order("steps", { ascending: false })
        .limit(10)
        .then(({ data, error }) => {
          if (error || !data) return;
          setWalkers((data as { name: string; steps: number }[]).map((r) => ({ name: r.name, steps: Number(r.steps) })));
          setWalkLive(true);
        });
    })();
  }, []);

  const ranked = [...HOODS].sort((a, b) => (totals[b.id] ?? 0) - (totals[a.id] ?? 0));
  const max = Math.max(1, totals[ranked[0].id] ?? 1);
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-[11px] font-extrabold tracking-[0.25em] text-roof">
        TURF · {live ? "● LIVE GLOBAL BOARD" : "OPENING SNAPSHOT · GOES LIVE WITH ACCOUNTS"}
      </div>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Who be Mogaji this week?</h1>
      <p className="mt-3 text-[15px] text-charcoal/70">
        Six hoods, one crown. Every naira hustled in-game feeds a hood's total — referral bonus no dey count, only sweat.
        {live
          ? " This board is live: signed-in hustle from every phone lands here."
          : " Your runs in /play move the real board — sign in (HUD → ⚙️) to push yours global."}
      </p>
      <div className="mt-6 rounded-3xl bg-charcoal p-5 text-cream sm:p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-cream/70">SEASON OPENER</span>
          <span className="rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] px-3 py-1 text-xs font-extrabold text-charcoal">👑 {ranked[0].name}</span>
        </div>
        <div className="mt-4 space-y-3">
          {ranked.map((h, i) => (
            <div key={h.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold">{i === 0 ? "👑 " : `${i + 1}. `}{h.name}</span>
                <span className="text-cream/60">₦{(totals[h.id] ?? 0).toLocaleString()}</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${i === 0 ? "bg-gradient-to-r from-mapo to-[#f5c04a]" : "bg-white/30"}`} style={{ width: `${Math.max(5, ((totals[h.id] ?? 0) / max) * 100)}%` }} />
              </div>
              <div className="mt-0.5 text-xs text-cream/45">{h.oriki}</div>
            </div>
          ))}
        </div>
      </div>
      <AdSlot slot="leaderboard-mid" />
      <div className="mt-6 rounded-3xl bg-charcoal p-5 text-cream sm:p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-cream/70">🚶 WEEKLY WALKERS {walkLive ? "· LIVE" : ""}</span>
          {walkers.length > 0 && <span className="text-xs text-mapo font-bold">👑 {walkers[0].name}</span>}
        </div>
        <p className="mt-1 text-xs text-cream/55">Real GPS steps. Highest legs take the crown — resets Monday (Lagos).</p>
        <div className="mt-3 space-y-2">
          {mine && !walkers.some((w) => w.name === mine.name) && (
            <p className="rounded-xl bg-white/10 px-3 py-2 text-xs text-cream/75">
              On this phone: <b>@{mine.name} · {mine.steps.toLocaleString()} steps</b> this week, not on the board yet. They go up the next time you open the game online.
            </p>
          )}
          {walkers.length === 0 && (
            <p className="text-sm text-cream/55">
              No walks on the board yet this week. Open <Link href="/play" className="font-bold text-mapo">/play → Rìn</Link>, waka am, and claim this board.
            </p>
          )}
          {walkers.map((w, i) => (
            <div key={w.name + i}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold">{i === 0 ? "👑 " : `${i + 1}. `}@{w.name}</span>
                <span className="text-cream/60">{w.steps.toLocaleString()} steps</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${i === 0 ? "bg-gradient-to-r from-mapo to-[#f5c04a]" : "bg-white/30"}`} style={{ width: `${Math.max(5, (w.steps / Math.max(1, walkers[0].steps)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-3xl bg-white p-5 text-center ring-1 ring-roof/10">
        <div className="font-display font-extrabold">Put your hood on top.</div>
        <p className="mt-1 text-sm text-charcoal/60">Play free, hustle clean, and drag the crown home.</p>
        <Link href="/play" className="mt-3 inline-block rounded-full bg-charcoal px-7 py-2.5 text-sm font-bold text-cream">Play now →</Link>
      </div>
    </main>
  );
}
