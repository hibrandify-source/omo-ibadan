# Omo Ibadan

A browser life-sim set in Ibadan. Every player is born into one of two lives
through the birth lottery: **Omo Iya Lobe** (a soup seller's child from Beere)
or **Alowonle** (born into money in Old Bodija).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # game-logic unit tests (Vitest)
npx playwright test  # end-to-end tests (needs `npx playwright install chromium` once)
```

In development, `/play?birth=alowonle` or `/play?birth=omo-iya-lobe` forces
the lottery result. This is ignored in production builds.

## Where things live

- `lib/game/` — all game logic and content. No React, no rendering.
  - `prices.ts` — every naira figure in the game. Change prices here only.
  - `backgrounds.ts` — the two lives: pockets, family, obligations, allowance, connections.
  - `content.ts` — districts, life events, missions, wardrobe, exam questions.
  - `needs.ts`, `skills.ts`, `careers.ts`, `traits.ts`, `housing.ts`, `transport.ts`, `places.ts`, `groceries.ts`, `radio.ts`.
- `lib/world.ts` — the walkable map grid, homes and furniture.
- `app/play/page.tsx` — the game screen.
- `components/` — minigames, scenes and panels.
- `tests/` — unit tests for `lib/game`. `e2e/` — Playwright tests.
- `supabase/` — optional cloud saves, leaderboards and presence.

## Saves

Local saves are versioned (`v: 2`). Older saves load automatically: their
archetype is mapped to a background and their wallet is scaled ×10 to match
the recalibrated prices.
