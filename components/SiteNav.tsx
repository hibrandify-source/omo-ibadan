"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/play", label: "Play" },
  { href: "/how-to-play", label: "How to play" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function SiteNav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-roof/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-roof to-mapo text-lg font-extrabold text-cream shadow">O</span>
          <span className="font-display text-base font-extrabold tracking-tight">
            Omo Ibadan
            <span className="ml-2 hidden rounded-full bg-agodi/10 px-2 py-0.5 text-[10px] font-bold text-agodi sm:inline">BROWN ROOF HUSTLE</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 transition ${path === l.href ? "bg-charcoal text-cream" : "text-charcoal/70 hover:bg-roof/10"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/play" className="ml-1 hidden rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] px-4 py-1.5 font-bold text-charcoal shadow sm:inline">
            Play free →
          </Link>
        </nav>
      </div>
    </header>
  );
}
