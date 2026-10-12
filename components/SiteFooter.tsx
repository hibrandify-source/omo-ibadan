import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-roof/10 bg-charcoal text-cream">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="font-display text-lg font-extrabold">Omo Ibadan</div>
          <div className="text-xs font-bold tracking-widest text-mapo">BROWN ROOF HUSTLE</div>
          <p className="mt-2 text-sm text-cream/60">Je Omoluabi. Ko Ola, Ko Iwa. A life-sim love letter to Ibadan — free in your browser.</p>
        </div>
        <div className="text-sm">
          <div className="font-bold text-cream/90">Explore</div>
          <div className="mt-2 flex flex-col gap-1.5 text-cream/60">
            <Link href="/play" className="hover:text-mapo">Play free</Link>
            <Link href="/how-to-play" className="hover:text-mapo">How to play</Link>
            <Link href="/leaderboard" className="hover:text-mapo">Hood leaderboard</Link>
          </div>
        </div>
        <div className="text-xs leading-relaxed text-cream/45">
          <div className="font-bold text-cream/90">Disclaimer</div>
          <p className="mt-2">Omo Ibadan is a fictional life-simulation game. All naira, prices, people, and events are virtual and for entertainment only — no real-money value, no cashout. Places and institutions are simplified or invented for gameplay. Ẹ káàbọ̀ sí Ìbàdàn.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-cream/40">© 2026 Omo Ibadan · Made with pride in Ibadan</div>
    </footer>
  );
}
