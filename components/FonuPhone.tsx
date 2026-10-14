"use client";

import Nokia3310 from "./Nokia3310";
import type { PhoneMsg } from "@/lib/engine/phone";

export default function FonuPhone({ msgs, clock, dateLabel }: { msgs: PhoneMsg[]; clock: string; dateLabel: string }) {
  return (
    <div className="rounded-3xl border border-roof/15 bg-gradient-to-b from-white to-cream p-4 shadow-[0_20px_50px_-20px_rgba(122,74,43,0.4)] sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-extrabold tracking-tight">📱 Fọ́nu Mi</h3>
          <p className="text-xs text-charcoal/60">Nokia 3310 · {dateLabel} · texts and alerts land as your day goes on</p>
        </div>
        <span className="rounded-full bg-agodi/10 px-3 py-1 text-xs font-bold text-agodi">{msgs.length} new</span>
      </div>
      <div className="mt-4">
        <Nokia3310 sms={msgs} clock={clock} />
      </div>
    </div>
  );
}
