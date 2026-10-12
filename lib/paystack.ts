"use client";

// Paystack path: game money today, real naira later.
// Every WardrobeItem already carries `ngn`. This module stays dormant
// until NEXT_PUBLIC_PAYSTACK_KEY exists — then Buy-tab buttons flip
// to real checkout with zero redesign.

export function paystackReady(): boolean {
  return !!process.env.NEXT_PUBLIC_PAYSTACK_KEY;
}

/**
 * Future real-naira checkout (wired when keys land):
 *  1. POST /api/pay { itemId, email } with PAYSTACK_SECRET_KEY (server only)
 *     → returns authorization_url.
 *  2. Redirect buyer; Paystack hits /api/pay/webhook (verify with secret).
 *  3. Webhook credits the wardrobe item to profiles.wardrobe + equipped.
 * Until then, callers must fall back to virtual purchase + an honest note.
 */
export function payRealNaira(itemName: string, ngn: number | null): { ok: false; reason: string } {
  if (!paystackReady() || ngn === null) {
    return {
      ok: false,
      reason: `Real-naira checkout for “${itemName}” lands with accounts V2 — game money works today.`,
    };
  }
  return { ok: false, reason: "Paystack route not implemented yet (see supabase/README.md step 2)." };
}
