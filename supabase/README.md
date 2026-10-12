# Omo Ibadan — backend setup (15 minutes, free tier)

The game runs **offline-first**: without keys it plays fully on localStorage.
Add keys to unlock accounts, cloud saves, honest online counts, and the
global hood board.

## 1) Supabase (accounts + cloud + realtime)

1. Go to https://supabase.com → New project (free). Name it `omo-ibadan`.
2. Open **SQL Editor** → paste `supabase/schema.sql` from this repo → Run.
3. **Authentication → Providers** → enable **Email**. OTP (magic link) is on by default — no passwords needed, best for students.
4. **Project Settings → API**: copy `Project URL` + `anon public` key.
5. Create `.env.local` in the project root (copy from `.env.local.example`) and paste both values.
6. Restart `npm run dev`.

What unlocks, in order:
- **Sign in** (HUD → ⚙️ → Account): email OTP, 6-digit code.
- **Cloud save**: on sign-in we pull your cloud profile if newer, then auto-push local progress (debounced). Sign out keeps playing locally.
- **Honest online pill**: presence channel counts real players per hood — no fabricated numbers.
- **Global turf**: your hustle adds to the shared hood board via the capped `add_turf` RPC (server-side, can't subtract or overflow).

## 2) Paystack (real naira, later)

Wardrobe items already carry `ngn` prices. To switch on:

1. Create a Paystack business account → get **public key** + **secret key**.
2. Add to `.env.local`: `NEXT_PUBLIC_PAYSTACK_KEY=pk_...`, `PAYSTACK_SECRET_KEY=sk_...` (server only).
3. Implement `app/api/pay/route.ts` (initialize) + webhook verify (see `lib/paystack.ts` notes), then flip Buy-tab buttons from virtual to Paystack checkout.

Until then every real-price tag shows "later" and checkout explains itself — no dead buttons, no fake charges.
