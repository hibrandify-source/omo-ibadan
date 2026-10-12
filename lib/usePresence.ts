"use client";

import { useEffect, useRef, useState } from "react";

/** Live presence counts per hood + total. Empty when backend missing. */
export function usePresence(hood: string, name: string) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const key = useRef(`${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`);

  useEffect(() => {
    let dead = false;
    let cleanup: (() => void) | undefined;
    (async () => {
      const { getSupabase } = await import("./supabase");
      const sb = getSupabase();
      if (!sb || dead) return;
    const ch = sb.channel("omo-online", {
      config: { presence: { key: key.current } },
    });
    const sync = () => {
      const state = ch.presenceState() as Record<string, { hood?: unknown }[]>;
      const per: Record<string, number> = {};
      let t = 0;
      for (const metas of Object.values(state)) {
        for (const m of metas) {
          const h = typeof m.hood === "string" ? m.hood : "unknown";
          per[h] = (per[h] ?? 0) + 1;
          t++;
        }
      }
      setCounts(per);
      setTotal(t);
    };
    ch.on("presence", { event: "sync" }, sync);
    ch.on("presence", { event: "join" }, sync);
    ch.on("presence", { event: "leave" }, sync);
    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ hood, name: name || "omo", at: Date.now() });
      }
    });
    cleanup = () => {
      ch.untrack();
      sb.removeChannel(ch);
    };
    })();
    return () => {
      dead = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hood]);

  return { counts, total };
}
