"use client";

import { NPC_SMS_SEED } from "@/lib/game";
import Nokia3310 from "./Nokia3310";

export default function FonuPhone() {
  return (
    <div className="rounded-3xl border border-roof/15 bg-gradient-to-b from-white to-cream p-4 shadow-[0_20px_50px_-20px_rgba(122,74,43,0.4)] sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-extrabold tracking-tight">📱 Fọ́nu Mi</h3>
          <p className="text-xs text-charcoal/60">Classic 3310 · green backlight · NPC SMS only in V1</p>
        </div>
        <span className="rounded-full bg-agodi/10 px-3 py-1 text-xs font-bold text-agodi">V1-A</span>
      </div>
      <div className="mt-4">
        <Nokia3310 sms={NPC_SMS_SEED} />
      </div>
      <p className="mt-3 text-center text-[11px] text-charcoal/50">
        Real-player chat lands in V2. Ẹ káàbọ̀ sí Ìbàdàn.
      </p>
    </div>
  );
}
