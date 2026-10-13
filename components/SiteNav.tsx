"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/play", label: "Play" },
  { href: "/how-to-play", label: "How to play" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function SiteNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  // the game screen has its own top bar; the site header would only steal height
  if (path === "/play") return null;
  return (
    <header className="sticky top-0 z-40 border-b border-roof/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-roof to-mapo text-lg font-extrabold text-cream shadow">O</span>
          <span className="font-display truncate text-base font-extrabold tracking-tight">
            Omo Ibadan
            <span className="ml-2 hidden rounded-full bg-agodi/10 px-2 py-0.5 text-[10px] font-bold text-agodi sm:inline">BROWN ROOF HUSTLE</span>
          </span>
        </Link>
        {/* wide screens: inline links */}
        <nav className="hidden items-center gap-1 text-sm font-semibold sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 transition ${path === l.href ? "bg-charcoal text-cream" : "text-charcoal/70 hover:bg-roof/10"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/play" className="ml-1 rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] px-4 py-1.5 font-bold text-charcoal shadow">
            Play free →
          </Link>
        </nav>
        {/* phones: play button + menu */}
        <div className="flex shrink-0 items-center gap-2 sm:hidden">
          <Link href="/play" className="rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] px-4 py-2 text-sm font-bold text-charcoal shadow">
            Play →
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg ring-1 ring-roof/15"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-roof/10 px-4 pb-3 sm:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`mt-1 block rounded-xl px-3 py-2.5 text-sm font-bold ${path === l.href ? "bg-charcoal text-cream" : "text-charcoal/80"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
