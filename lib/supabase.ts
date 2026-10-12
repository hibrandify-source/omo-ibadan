"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

export function supabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Browser client, or null when env keys are missing (offline-first local mode). */
export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  if (!supabaseConfigured()) {
    cached = null;
    return cached;
  }
  cached = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return cached;
}

export interface CloudProfile {
  username: string;
  arch_id: string;
  gender: string;
  look: unknown;
  wallet: { ola: number; iwa: number; energy: number };
  progress: Record<string, unknown>;
  hoods: Record<string, number>;
  my_hood: string;
  wardrobe: string[];
  equipped: string | null;
  updated_at: string;
}
