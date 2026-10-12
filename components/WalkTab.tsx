"use client";

import { useEffect, useRef, useState } from "react";
import {
  acceptPoint, fmtKm, fmtPace, makePartyCode, stepsForKm,
  type WalkPoint,
} from "@/lib/walk";

interface Member {
  name: string;
  steps: number;
  dist: number;
  at: number;
}

// Take-a-walk: real GPS steps, solo or party. Works outdoors on HTTPS;
// localhost counts as secure for dev. Spoof-guarded + daily-capped.
export default function WalkTab({
  username,
  onTick,
  onComplete,
}: {
  username: string;
  onTick: (active: boolean, steps: number) => void;
  onComplete: (r: { steps: number; km: number; partySize: number }) => void;
}) {
  const [mode, setMode] = useState<"idle" | "solo" | "party">("idle");
  const [running, setRunning] = useState(false);
  const [err, setErr] = useState("");
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState({ m: 0, steps: 0, secs: 0, startedAt: 0 });
  const watchId = useRef<number | null>(null);
  const last = useRef<WalkPoint | null>(null);
  const dist = useRef(0);
  const t0 = useRef(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ch = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sbRef = useRef<any>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const uiTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = () => {
    if (watchId.current !== null) {
      try {
        navigator.geolocation.clearWatch(watchId.current);
      } catch {}
      watchId.current = null;
    }
    if (tickTimer.current) clearInterval(tickTimer.current);
    if (uiTimer.current) clearInterval(uiTimer.current);
    tickTimer.current = uiTimer.current = null;
    try {
      ch.current?.untrack?.();
      if (ch.current && sbRef.current) sbRef.current.removeChannel(ch.current);
    } catch {}
    ch.current = null;
  };

  useEffect(() => stopAll, []);

  const pushTick = (m: number) => {
    const steps = stepsForKm(m / 1000);
    setStats((s) => ({ ...s, m, steps, secs: Math.floor((Date.now() - t0.current) / 1000) }));
    onTick(true, steps);
  };

  const beginWatch = (onFirst?: () => void) => {
    if (!("geolocation" in navigator)) {
      setErr("This browser no get GPS. Try Chrome on Android or Safari on iPhone.");
      return false;
    }
    setErr("");
    last.current = null;
    dist.current = 0;
    t0.current = Date.now();
    setStats({ m: 0, steps: 0, secs: 0, startedAt: Date.now() });
    onTick(true, 0);
    let first = true;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p: WalkPoint = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          acc: pos.coords.accuracy ?? 999,
          t: pos.timestamp,
        };
        const { ok, distM } = acceptPoint(last.current, p);
        if (!ok) return;
        last.current = p;
        if (first) {
          first = false;
          onFirst?.();
          return;
        }
        dist.current += distM;
        pushTick(dist.current);
      },
      (e) => {
        if (e.code === e.PERMISSION_DENIED) setErr("GPS permission denied — allow location, then start again.");
        else if (e.code === e.POSITION_UNAVAILABLE) setErr("GPS unavailable. Waka comot building (outdoors) and retry.");
        else setErr("GPS timeout. Check signal and retry.");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
    uiTimer.current = setInterval(() => {
      setStats((s) => ({ ...s, secs: Math.floor((Date.now() - t0.current) / 1000) }));
    }, 1000);
    return true;
  };

  const startSolo = () => {
    setMembers([]);
    if (!beginWatch()) return;
    setMode("solo");
    setRunning(true);
  };

  const startParty = async (partyCode: string) => {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    sbRef.current = sb;
    if (!sb) {
      setErr("Party walks need backend (see supabase/README). Solo works offline.");
      return;
    }
    if (!beginWatch()) return;
    setCode(partyCode.toUpperCase());
    setMode("party");
    setRunning(true);
    const channel = sb.channel(`walk-party-${partyCode.toUpperCase()}`, {
      config: { broadcast: { self: false, ack: false } },
    });
    ch.current = channel;
    channel.on("broadcast", { event: "step" }, ({ payload }: { payload: Member }) => {
      if (!payload || !payload.name) return;
      setMembers((ms) => {
        const rest = ms.filter((m) => m.name !== payload.name);
        return [...rest, { ...payload, at: Date.now() }].slice(-12);
      });
    });
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ name: username || "omo", at: Date.now() });
      }
    });
    tickTimer.current = setInterval(() => {
      try {
        channel.send({
          type: "broadcast",
          event: "step",
          payload: { name: username || "omo", steps: stepsForKm(dist.current / 1000), dist: Math.round(dist.current), at: Date.now() },
        });
      } catch {}
      setMembers((ms) => ms.filter((m) => Date.now() - m.at < 15000));
    }, 2000);
  };

  const stop = () => {
    const steps = stepsForKm(dist.current / 1000);
    const km = dist.current / 1000;
    const partySize = mode === "party" ? members.length + 1 : 1;
    stopAll();
    setRunning(false);
    setMode("idle");
    onTick(false, 0);
    onComplete({ steps, km, partySize });
  };

  const cancel = () => {
    stopAll();
    setRunning(false);
    setMode("idle");
    onTick(false, 0);
  };

  if (!running) {
    return (
      <div className="space-y-3">
        <div className="rounded-3xl bg-charcoal p-4 text-cream ring-1 ring-white/10 sm:p-5">
          <h3 className="font-display text-lg font-extrabold tracking-tight">🚶 Rìn — take a walk</h3>
          <p className="mt-1 text-xs leading-relaxed text-cream/65">
            Real steps, real rewards. GPS records your waka (outdoors, HTTPS) — solo or party.
            Cheat-proof: vehicle speeds dropped, bad signal dropped, 20k steps/day counted.
          </p>
          {err && <p className="mt-2 rounded-2xl bg-red-500/15 px-3 py-2 text-xs font-bold text-red-200">{err}</p>}
          <div className="mt-3 grid gap-2">
            <button onClick={startSolo} className="rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] py-2.5 text-sm font-extrabold text-charcoal">
              Start solo walk →
            </button>
            <div className="flex gap-2">
              <button onClick={() => startParty(makePartyCode())} className="flex-1 rounded-full bg-agodi py-2.5 text-sm font-bold text-white">
                Create party
              </button>
              <div className="flex flex-[1.2] gap-1.5">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="CODE"
                  className="w-full rounded-full bg-white/10 px-3 py-2 text-center text-sm font-extrabold tracking-widest placeholder:text-cream/30 outline-none"
                />
                <button
                  onClick={() => joinCode.trim().length === 4 && startParty(joinCode.trim())}
                  disabled={joinCode.trim().length !== 4}
                  className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-sm font-bold disabled:opacity-40"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pace = fmtPace(stats.m, stats.secs);
  const mm = Math.floor(stats.secs / 60);
  const ss = stats.secs % 60;
  return (
    <div className="space-y-3">
      <div className="rounded-3xl bg-charcoal p-5 text-center text-cream ring-1 ring-white/10">
        <div className="text-[11px] font-extrabold tracking-[0.25em] text-mapo">
          {mode === "party" ? `PARTY ${code} · LIVE` : "SOLO WAKA · LIVE"}
        </div>
        <div className="font-display mt-1 text-5xl font-extrabold tabular-nums">{stats.steps.toLocaleString()}</div>
        <div className="text-xs font-bold text-cream/60">steps · {fmtKm(stats.m)} · {mm}:{ss.toString().padStart(2, "0")} · {pace}</div>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-agodi">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          GPS recording… keep moving, stay outdoors
        </div>
        {mode === "party" && (
          <div className="mt-3 rounded-2xl bg-white/[0.07] p-3 text-left">
            <div className="text-[11px] font-extrabold tracking-widest text-cream/60">
              PARTY {code} · {members.length + 1} WALKING
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>@{username || "omo"} (you)</span>
                <span>{stats.steps.toLocaleString()} steps</span>
              </div>
              {[...members].sort((a, b) => b.steps - a.steps).map((m) => (
                <div key={m.name} className="flex justify-between text-xs text-cream/75">
                  <span>@{m.name}</span>
                  <span>{m.steps.toLocaleString()} steps · {fmtKm(m.dist)}</span>
                </div>
              ))}
              <p className="pt-1 text-[11px] text-cream/45">Share the code by mouth/WhatsApp. Party bonus +5% each if 2+ finish.</p>
            </div>
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={stop} className="rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] py-3 text-sm font-extrabold text-charcoal">
            Finish + claim →
          </button>
          <button onClick={cancel} className="rounded-full bg-white/10 py-3 text-sm font-bold text-cream/70">
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
