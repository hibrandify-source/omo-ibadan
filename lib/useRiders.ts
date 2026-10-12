"use client";

import { useEffect, useRef, useState } from "react";

export interface Rider {
  id: string;
  name: string;
  hood: string;
  x: number; // grid coords (shared space for 2D + 3D)
  y: number;
  moving: boolean;
  top: string;
  skin: string;
  gear: "fila" | "gele" | "none" | "braids" | "afro";
  at: number;
}

export interface RiderNet {
  ref: React.MutableRefObject<Map<string, Rider>>;
  version: number;
  send: (r: Omit<Rider, "id" | "at">) => void;
}

const SEND_MS = 200;
const PRUNE_MS = 6000;
const MAX_RIDERS = 12;

/**
 * Realtime avatar presence over Supabase broadcast (ephemeral, no tables).
 * Throttled sends, nearest-12 cap, stale pruning. Silent offline.
 */
export function useRiders(
  enabled: boolean,
  hood: string
): RiderNet {
  const ref = useRef(new Map<string, Rider>());
  const [version, setVersion] = useState(0);
  const id = useRef(`${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ch = useRef<any>(null);
  const lastSent = useRef<{ x: number; y: number; t: number }>({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    if (!enabled) return;
    let dead = false;
    (async () => {
      const { getSupabase } = await import("./supabase");
      const sb = getSupabase();
      if (!sb || dead) return;
      const channel = sb.channel("omo-walk", {
        config: { broadcast: { self: false, ack: false } },
      });
      ch.current = channel;
      channel.on("broadcast", { event: "pos" }, ({ payload }: { payload: Omit<Rider, "id" | "at"> & { id?: string } }) => {
        if (!payload || payload.id === id.current) return;
        const prevSize = ref.current.size;
        ref.current.set(payload.id ?? "", {
          ...(payload as Omit<Rider, "id" | "at">),
          id: payload.id ?? "",
          at: Date.now(),
        });
        if (ref.current.size !== prevSize) setVersion((v) => v + 1);
      });
      channel.subscribe();
    })();
    const prune = setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [k, r] of ref.current) {
        if (now - r.at > PRUNE_MS) {
          ref.current.delete(k);
          changed = true;
        }
      }
      // newest-12 cap
      if (ref.current.size > MAX_RIDERS) {
        const arr = [...ref.current.entries()].sort((a, b) => b[1].at - a[1].at);
        for (let i = MAX_RIDERS; i < arr.length; i++) {
          ref.current.delete(arr[i][0]);
          changed = true;
        }
      }
      if (changed) setVersion((v) => v + 1);
    }, 3000);
    return () => {
      dead = true;
      clearInterval(prune);
      try {
        ch.current?.unsubscribe();
      } catch {}
      ch.current = null;
    };
  }, [enabled, hood]);

  const send = (r: Omit<Rider, "id" | "at">) => {
    const c = ch.current;
    if (!c) return;
    const now = Date.now();
    const moved = Math.hypot(r.x - lastSent.current.x, r.y - lastSent.current.y);
    // 5Hz while moving, 2.5s heartbeat while idle (beats the 6s prune)
    if (now - lastSent.current.t < SEND_MS && moved < 0.4) return;
    if (moved < 0.4 && now - lastSent.current.t < 2500) return;
    lastSent.current = { x: r.x, y: r.y, t: now };
    try {
      c.send({ type: "broadcast", event: "pos", payload: { ...r, id: id.current } });
    } catch {}
  };

  return { ref, version, send };
}
