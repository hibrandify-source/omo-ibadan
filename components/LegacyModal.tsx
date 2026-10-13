"use client";

// The end of a life: the score, the verdict, and the oriki the city sings.

import type { Legacy } from "@/lib/engine/life";

export default function LegacyModal({ legacy, name, onClose, onNewLife }: { legacy: Legacy; name: string; onClose: () => void; onNewLife: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-charcoal/80 p-4 backdrop-blur-sm" role="dialog" aria-label="Your legacy">
      <div className="my-auto w-full max-w-md rounded-3xl bg-cream p-6 shadow-2xl ring-1 ring-roof/20">
        <div className="text-[10px] font-extrabold tracking-[0.25em] text-roof">ÌTÀN · LEGACY</div>
        <h2 className="font-display mt-1 text-2xl font-extrabold tracking-tight">{name || "Omo Ibadan"}</h2>
        <p className="mt-1 text-sm font-bold text-agodi">{legacy.verdict}</p>
        <div className="mt-3 text-4xl font-extrabold">{legacy.score}<span className="text-base text-charcoal/50"> points</span></div>
        <ul className="mt-3 space-y-1 text-sm text-charcoal/80">
          {legacy.lines.map((l) => <li key={l}>{l}</li>)}
        </ul>
        <blockquote className="mt-4 whitespace-pre-line rounded-2xl bg-white p-4 font-display text-sm italic leading-relaxed text-charcoal/80 ring-1 ring-roof/10">
          {legacy.oriki}
        </blockquote>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button onClick={onClose} className="rounded-full bg-white px-4 py-2.5 text-sm font-bold ring-1 ring-roof/20">Keep looking around</button>
          <button onClick={onNewLife} className="rounded-full bg-charcoal px-4 py-2.5 text-sm font-bold text-cream">Start a new life</button>
        </div>
      </div>
    </div>
  );
}
