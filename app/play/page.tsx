"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ARCHETYPES,
  ECONOMY,
  EXAM_POOL,
  HOODS,
  LIFE_EVENTS,
  MAP_NODES,
  MISSIONS,
  DISTRICT_DEEDS,
  DAILY_HUNTS,
  GENDERS,
  TITLE_LADDER,
  address,
  makeReferralCode,
  type Gender,
  type HoodId,
  type LifeEvent,
  type WardrobeItem,
} from "@/lib/game";
import { NEEDS } from "@/lib/ibadanlife/needs";
import { TRAITS } from "@/lib/ibadanlife/traits";
import { SKILLS, emptySkills, grantXp, type SkillId, type SkillMap } from "@/lib/ibadanlife/skills";
import { CAREERS, careerPay } from "@/lib/ibadanlife/careers";
import { DISTANCES } from "@/lib/ibadanlife/transport";
import MapGraph from "@/components/MapGraph";
import DistrictScene from "@/components/DistrictScene";
import { sceneFor } from "@/lib/districts";
import RoomCard from "@/components/RoomCard";
import type { SceneTeleport as Teleport } from "@/components/DistrictScene";
import HomeTab from "@/components/HomeTab";
import CompoundCard from "@/components/CompoundCard";
import StreetCard from "@/components/StreetCard";
import StoreModal from "@/components/StoreModal";
import DoorModal from "@/components/DoorModal";
import ShopEntryModal from "@/components/ShopEntryModal";
import type { ShopKind } from "@/components/StoreInterior3D";
import {
  ARCH_HOME_ZONE,
  ARCH_COLOR,
  SKINS,
  CLOTHS,
  FURNITURE,
  NPCS,
  emptyHome,
  zoneCenter,
  ZONES,
  type HomeSave,
  type Door,
} from "@/lib/world";
import MicraRush from "@/components/MicraRush";
import BodijaMarket from "@/components/BodijaMarket";
import Terminal from "@/components/Terminal";
import WardrobeShop from "@/components/WardrobeShop";
import OwambeHall from "@/components/OwambeHall";
import WalkTab from "@/components/WalkTab";
import FonuPhone from "@/components/FonuPhone";
import OjudeFeed from "@/components/OjudeFeed";
import AdSlot from "@/components/AdSlot";
import dynamic from "next/dynamic";
import { usePresence } from "@/lib/usePresence";
import { useRiders } from "@/lib/useRiders";
import { payRealNaira } from "@/lib/paystack";
import {
  DAILY_STEP_CAP, OLA_PER_1000_STEPS, ENERGY_PER_1000_STEPS,
  IWA_WALK_MIN_STEPS, IWA_WALK_BONUS, walkWeekKey,
} from "@/lib/walk";
import { ensureAudio, rainStart, rainStop, coin, blip, isMuted, setMuted } from "@/lib/sound";

const AuthCard = dynamic(() => import("@/components/AuthCard"), {
  ssr: false,
  loading: () => <p className="px-1 pt-2 text-[11px] text-charcoal/55">Loading account…</p>,
});

const backendOn = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Tab = "map" | "hustle" | "exam" | "story" | "ile" | "fonu" | "ojude" | "ra" | "owambe" | "rin";

const SECTIONS: Record<Tab, { kicker: string; title: string; lede: string }> = {
  map: { kicker: "AYÉ · THE WORLD", title: "Waka Ibadan", lede: "Your avatar, your legs. WASD, joystick, or tap — the city is yours." },
  hustle: { kicker: "ISÉ · WORK", title: "Hustle ground", lede: "Micra park and Bodija stalls. Sweat first, Ola follows." },
  exam: { kicker: "ÌMỌ̀ · BRAIN", title: "UI Exam hall", lede: "Proverbs, history, street sense. Pass and unlock better life." },
  story: { kicker: "ÌTÀN · STORY", title: "Your Ibadan story", lede: "Missions across arrival, hustle, ordeal, and title." },
  ile: { kicker: "ILÉ · HOME", title: "Your home", lede: "Start empty, hustle to setup — room today, duplex tomorrow." },
  ra: { kicker: "RÀ · SHOP", title: "Aso-ebi market", lede: "Game money today, real naira later. Dress like the title you want." },
  rin: { kicker: "RÌN · WALK", title: "Take a walk", lede: "Real GPS steps, solo or party. Highest walkers top the board." },
  owambe: { kicker: "OWAMBE · PARTY", title: "Fuji night", lede: "Live band, dance floor, spraying battles. Flex responsibly." },
  fonu: { kicker: "FỌ́NU · PHONE", title: "Messages", lede: "Landlord, Mama Put, and the elders dey your phone." },
  ojude: { kicker: "OJÚDE · SQUARE", title: "Town square", lede: "Hood turf, town gist, and your referral link." },
};

// Which zones open which game when your avatar walks in.
const ENTER_MAP: Record<string, { label: string; tab: Tab }> = {
  bodija: { label: "Enter Bodija Market", tab: "hustle" },
  "oja-oba": { label: "Enter Oja Oba", tab: "hustle" },
  oje: { label: "Enter Oje Market", tab: "hustle" },
  "iwo-road": { label: "Enter Iwo Road Park", tab: "hustle" },
  mokola: { label: "Hustle Mokola route", tab: "hustle" },
  sango: { label: "Hustle Sango route", tab: "hustle" },
  challenge: { label: "Hustle Challenge route", tab: "hustle" },
  molete: { label: "Hustle Molete route", tab: "hustle" },
  "ring-road": { label: "Hustle Ring Road", tab: "hustle" },
  "ui-gate": { label: "Enter UI hall (exam)", tab: "exam" },
  samonda: { label: "Enter study hall (exam)", tab: "exam" },
  mapo: { label: "Greet the elders", tab: "story" },
  dugbe: { label: "Cocoa House plans", tab: "story" },
  agodi: { label: "Rest story", tab: "story" },
  eleyele: { label: "Lakeside story", tab: "story" },
};

const startHoods = (): Record<HoodId, number> => ({
  bodija: 1200, agbowo: 1500, challenge: 900, "iwo-road": 1800, ojoo: 600, beere: 1100,
});

export default function Home() {
  const [started, setStarted] = useState(false);
  const [username, setUsername] = useState("");
  const [archId, setArchId] = useState(ARCHETYPES[0].id);
  const [gender, setGender] = useState<Gender>("okunrin");
  // character look: skin/top swatches + headgear (null gear follows gender)
  const [look, setLook] = useState<{ skin: number; top: number; topEx: string | null; gear: null | "fila" | "gele" | "none" | "braids" | "afro" }>({ skin: 1, top: 1, topEx: null, gear: null });
  const gear: "fila" | "gele" | "none" | "braids" | "afro" = look.gear ?? (gender === "okunrin" ? "fila" : "gele");
  const topColor = look.topEx ?? CLOTHS[look.top] ?? ARCH_COLOR[archId] ?? "#1F7A4D";
  // wardrobe / owambe / daily-hunt state
  const [wardrobe, setWardrobe] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<string | null>(null);
  const [sprays, setSprays] = useState(0);
  const [claimedDaily, setClaimedDaily] = useState<Record<number, string>>({});
  const [mode, setMode] = useState<"omo" | "ajala">("omo");
  const [refInput, setRefInput] = useState("");
  const [myCode, setMyCode] = useState("");
  const [node, setNode] = useState("bodija");
  const [tab, setTab] = useState<Tab>("map");

  const [ola, setOla] = useState(0);
  const [iwa, setIwa] = useState(50);
  const [energy, setEnergy] = useState(80);
  // life needs (from lib/ibadanlife, adapted to our day cycle)
  const [needs, setNeeds] = useState({ hunger: 80, fun: 70, social: 70, hygiene: 75, toilet: 85 });
  const [trait, setTrait] = useState<string | null>(null);
  const [lastFreshDay, setLastFreshDay] = useState(0);
  const [lastToiletDay, setLastToiletDay] = useState(0);
  // jobs ladder (from lib/ibadanlife/careers+skills, adapted to our day cycle)
  const [skills, setSkills] = useState<SkillMap>(() => emptySkills());
  const [careerId, setCareerId] = useState<string | null>(null);
  const [careerLevels, setCareerLevels] = useState<Record<string, number>>({});
  const [lastShiftDay, setLastShiftDay] = useState(0);
  const [travelMode, setTravelMode] = useState<"micra" | "trek">("micra");
  const [feed, setFeed] = useState<string[]>([]);
  const [qi, setQi] = useState(0);
  const [invites, setInvites] = useState(0);
  // V1 rest-of-build: day cycle, stats, missions, hoods, events
  const [day, setDay] = useState(1);
  const [actions, setActions] = useState(0);
  const [micraRuns, setMicraRuns] = useState(0);
  const [trades, setTrades] = useState(0);
  const [examPass, setExamPass] = useState(0);
  const [familyCount, setFamilyCount] = useState(0);
  const [rests, setRests] = useState(0);
  const [fullLoads, setFullLoads] = useState(0);
  const [visits, setVisits] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>(["m1"]);
  const [hoods, setHoods] = useState<Record<HoodId, number>>(startHoods);
  const [myHood, setMyHood] = useState<HoodId>("bodija");
  const [event, setEvent] = useState<LifeEvent | null>(null);
  // Milestone 3: avatar zone, home, teleport
  const [avatarZone, setAvatarZone] = useState("ui-gate");
  const [home, setHome] = useState<HomeSave>(emptyHome);
  const [teleport, setTeleport] = useState<Teleport | null>(null);
  // 4A shell: quality + settings menu
  const [saver, setSaver] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // backend: accounts, cloud, presence (all degrade gracefully offline)
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null);
  const [cloudReady, setCloudReady] = useState(false);
  const lastPushed = useRef("");
  const pendingTurf = useRef(0);
  const hoodMirror = useRef<HoodId>("bodija");
  hoodMirror.current = myHood;
  const { total: onlineTotal } = usePresence(myHood, username || "omo");
  const ridersNet = useRiders(backendOn() && started, myHood);
  // weather: rain starts on the rain event, clears at dawn
  const [weather, setWeather] = useState<"clear" | "rain">("clear");
  // rain audio follows weather
  useEffect(() => {
    if (weather === "rain") {
      ensureAudio();
      rainStart();
    } else {
      rainStop();
    }
  }, [weather]);

  // walk-in store
  const [storeOpen, setStoreOpen] = useState(false);
  const [mutedUi, setMutedUi] = useState(() => {
    try {
      return isMuted();
    } catch {
      return false;
    }
  });
  // take-a-walk: real GPS steps
  const [walkLive, setWalkLive] = useState({ active: false, steps: 0 });
  const [walkWeek, setWalkWeek] = useState({ key: "", steps: 0 });
  const [walkDay, setWalkDay] = useState({ date: "", steps: 0 });

  const onWalkComplete = (r: { steps: number; km: number; partySize: number }) => {
    const today = new Date().toDateString();
    const countedToday = walkDay.date === today ? walkDay.steps : 0;
    const room = Math.max(0, DAILY_STEP_CAP - countedToday);
    const counted = Math.min(r.steps, room);
    const bonus = r.partySize >= 2 ? 1.05 : 1;
    const olaGain = Math.round(Math.floor(counted / 1000) * OLA_PER_1000_STEPS * bonus);
    const energyCost = Math.floor(counted / 1000) * ENERGY_PER_1000_STEPS;
    const iwaGain = counted >= IWA_WALK_MIN_STEPS ? IWA_WALK_BONUS : 0;
    setOla((o) => o + olaGain);
    setEnergy((e) => Math.max(5, e - energyCost));
    if (iwaGain > 0) setIwa((v) => Math.min(100, v + iwaGain));
    setHoods((h) => ({ ...h, [myHood]: h[myHood] + olaGain }));
    if (authUser) pendingTurf.current += olaGain;
    setWalkDay({ date: today, steps: countedToday + counted });
    if (counted >= 2000) jot(`Day ${day}: walked ${counted.toLocaleString()} steps (${r.km.toFixed(2)} km). Legs of steel.`);
    const wk = walkWeekKey();
    setWalkWeek((w) => ({ key: wk, steps: (w.key === wk ? w.steps : 0) + counted }));
    ensureAudio();
    coin();
    push(
      counted <= 0
        ? `🚶 Walk logged (${r.km.toFixed(2)} km) — daily 20k cap reached. Legs don try.`
        : `🚶 Waka done! ${counted.toLocaleString()} steps (${r.km.toFixed(2)} km)${r.partySize >= 2 ? ` · party of ${r.partySize} +5%` : ""} → +₦${olaGain}${iwaGain > 0 ? `, Iwa +${iwaGain}` : ""}, −${energyCost}⚡.`
    );
    // cloud: weekly personal board (authed only)
    if (authUser && counted > 0) {
      (async () => {
        const { getSupabase } = await import("@/lib/supabase");
        const sb = getSupabase();
        if (!sb) return;
        try {
          await sb.rpc("add_walk_steps", {
            p_week: wk,
            p_steps: Math.min(counted, DAILY_STEP_CAP),
            p_name: (username || "omo").slice(0, 24),
          });
        } catch {}
      })();
    }
  };
  const [shopGreetDay, setShopGreetDay] = useState(0);
  const [shopEntry, setShopEntry] = useState<ShopKind | null>(null);
  // in-world doors + NPC memory + journal
  const [nearDoor, setNearDoor] = useState<Door | null>(null);
  const [doorOpen, setDoorOpen] = useState<Door | null>(null);
  const [npc, setNpc] = useState<Record<string, { meets: number }>>({});
  const [journal, setJournal] = useState<{ day: number; text: string }[]>([]);

  const meet = (name: string, n = 1) =>
    setNpc((m) => ({ ...m, [name]: { meets: (m[name]?.meets ?? 0) + n } }));

  const npcTier = (name: string): number => {
    const meets = npc[name]?.meets ?? 0;
    return meets >= 15 ? 3 : meets >= 8 ? 2 : meets >= 3 ? 1 : 0;
  };

  const jot = (text: string) =>
    setJournal((j) => [...j.slice(-49), { day, text }]);

  const greetNpc = (id: string) => {
    const p = NPCS.find((x) => x.id === id);
    if (!p) return;
    meet(id);
    setNeeds((n) => ({ ...n, social: Math.min(100, n.social + 8) }));
    push(`👋 ${id}: ${p.lines[npcTier(id)]}`);
  };
  const [shopGreets, setShopGreets] = useState<Record<string, number>>({});
  const [viewDay, setViewDay] = useState(0);
  // 4F: ile sub-view + daily elder greeting
  const [ileView, setIleView] = useState<"room" | "compound" | "street">("room");
  const [lastGreetDay, setLastGreetDay] = useState(0);

  const arch = useMemo(() => ARCHETYPES.find((a) => a.id === archId)!, [archId]);
  const moodScore = Math.round((energy + needs.hunger + needs.fun + needs.social + needs.hygiene + needs.toilet) / 6);
  const mood =
    moodScore >= 75 ? "😄 Very Happy" :
    moodScore >= 55 ? "🙂 Happy" :
    moodScore >= 35 ? "😐 Managing" :
    moodScore >= 15 ? "😩 Drained" : "🤢 Miserable";
  const title = useMemo(() => {
    const score = ola / 2000 + iwa / 40;
    return TITLE_LADDER[Math.min(TITLE_LADDER.length - 1, Math.floor(score))];
  }, [ola, iwa]);
  const nodeName = MAP_NODES.find((n) => n.id === node)?.name ?? node;

  useEffect(() => {
    const saved = localStorage.getItem("omo-ibadan-v1");
    if (saved) {
      try {
        const s = JSON.parse(saved);
        setStarted(s.started ?? false);
        setUsername(s.username ?? "");
        if (s.archId) setArchId(s.archId);
        if (s.gender) setGender(s.gender);
        if (s.look) setLook({ skin: s.look.skin ?? 1, top: s.look.top ?? 1, topEx: s.look.topEx ?? null, gear: s.look.gear ?? null });
        if (Array.isArray(s.wardrobe)) setWardrobe(s.wardrobe);
        if (typeof s.equipped === "string" || s.equipped === null) setEquipped(s.equipped ?? null);
        if (typeof s.sprays === "number") setSprays(s.sprays);
        if (s.claimedDaily) setClaimedDaily(s.claimedDaily);
        if (s.shopGreets) setShopGreets(s.shopGreets);
        if (s.walkWeek && typeof s.walkWeek === "object") {
          const w = s.walkWeek;
          setWalkWeek({ key: typeof w.key === "string" ? w.key : "", steps: typeof w.steps === "number" ? w.steps : 0 });
        }
        if (s.walkDay && typeof s.walkDay === "object") {
          const w = s.walkDay;
          setWalkDay({ date: typeof w.date === "string" ? w.date : "", steps: typeof w.steps === "number" ? w.steps : 0 });
        }
        if (typeof s.viewDay === "number") setViewDay(s.viewDay);
        setMyCode(s.myCode ?? "");
        setOla(s.ola ?? 0);
        setIwa(s.iwa ?? 50);
        setEnergy(s.energy ?? 80);
        if (s.needs && typeof s.needs === "object") {
          const n = s.needs as Record<string, number>;
          setNeeds({
            hunger: typeof n.hunger === "number" ? n.hunger : 80,
            fun: typeof n.fun === "number" ? n.fun : 70,
            social: typeof n.social === "number" ? n.social : 70,
            hygiene: typeof n.hygiene === "number" ? n.hygiene : 75,
            toilet: typeof n.toilet === "number" ? n.toilet : 85,
          });
        }
        if (typeof s.trait === "string" || s.trait === null) setTrait((s.trait as string | null) ?? null);
        if (typeof s.lastFreshDay === "number") setLastFreshDay(s.lastFreshDay);
        if (typeof s.lastToiletDay === "number") setLastToiletDay(s.lastToiletDay);
        if (s.npc && typeof s.npc === "object") setNpc(s.npc as Record<string, { meets: number }>);
        if (Array.isArray(s.journal)) setJournal((s.journal as { day: number; text: string }[]).filter((j) => j && typeof j.text === "string").slice(-50));
        if (s.walkWeek && typeof s.walkWeek === "object") {
          const w = s.walkWeek as { key?: string; steps?: number };
          setWalkWeek({ key: typeof w.key === "string" ? w.key : "", steps: typeof w.steps === "number" ? w.steps : 0 });
        }
        if (s.walkDay && typeof s.walkDay === "object") {
          const w = s.walkDay as { date?: string; steps?: number };
          setWalkDay({ date: typeof w.date === "string" ? w.date : "", steps: typeof w.steps === "number" ? w.steps : 0 });
        }
        setDay(s.day ?? 1);
        setMicraRuns(s.micraRuns ?? 0);
        setTrades(s.trades ?? 0);
        setExamPass(s.examPass ?? 0);
        setFamilyCount(s.familyCount ?? 0);
        setRests(s.rests ?? 0);
        setFullLoads(s.fullLoads ?? 0);
        if (Array.isArray(s.visits)) setVisits(s.visits);
        setDone(s.done ?? ["m1"]);
        if (s.hoods) setHoods(s.hoods);
        if (s.myHood) setMyHood(s.myHood);
        if (s.home) setHome(s.home);
        if (s.avatarZone) setAvatarZone(s.avatarZone);
        if (typeof s.saver === "boolean") setSaver(s.saver);
        if (typeof s.lastGreetDay === "number") setLastGreetDay(s.lastGreetDay);
        if (s.skills && typeof s.skills === "object") {
          const merged = emptySkills();
          for (const sk of SKILLS) {
            const v = (s.skills as Record<string, unknown>)[sk.id] as { xp?: number; level?: number } | undefined;
            if (v && typeof v.xp === "number" && typeof v.level === "number") merged[sk.id] = { xp: v.xp, level: v.level };
          }
          setSkills(merged);
        }
        if (typeof s.careerId === "string" || s.careerId === null) setCareerId((s.careerId as string | null) ?? null);
        if (s.careerLevels && typeof s.careerLevels === "object") setCareerLevels(s.careerLevels as Record<string, number>);
        if (typeof s.lastShiftDay === "number") setLastShiftDay(s.lastShiftDay);
        if (s.travelMode === "micra" || s.travelMode === "trek") setTravelMode(s.travelMode);
      } catch {}
    }
    const params = new URLSearchParams(window.location.search);
    const r = params.get("ref");
    if (r) setRefInput(r);
  }, []);

  useEffect(() => {
    if (!started && !username) {
      // Never clobber a started save with fresh defaults: on mount the load
      // effect above restores state async, and StrictMode double-mounts in dev.
      try {
        const existing = localStorage.getItem("omo-ibadan-v1");
        if (existing && JSON.parse(existing).started) return;
      } catch {}
    }
    localStorage.setItem(
      "omo-ibadan-v1",
      JSON.stringify({ started, username, myCode, ola, iwa, energy, day, micraRuns, trades, examPass, familyCount, rests, fullLoads, visits, done, hoods, myHood, home, avatarZone, archId, gender, look, wardrobe, equipped, sprays, claimedDaily, shopGreets, viewDay, saver, lastGreetDay, needs, trait, lastFreshDay, lastToiletDay, npc, journal, walkWeek, walkDay, skills, careerId, careerLevels, lastShiftDay, travelMode })
    );
  }, [started, username, myCode, ola, iwa, energy, day, micraRuns, trades, examPass, familyCount, rests, fullLoads, visits, done, hoods, myHood, home, avatarZone, archId, gender, look, wardrobe, equipped, sprays, claimedDaily, shopGreets, viewDay, saver, lastGreetDay, needs, trait, lastFreshDay, lastToiletDay, npc, journal, walkWeek, walkDay, skills, careerId, careerLevels, lastShiftDay, travelMode]);

  const push = (m: string) => setFeed((f) => [m, ...f].slice(0, 8));

  // Dev-only E2E hook (stripped from production): lets Playwright teleport + read state.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { __omo: unknown }).__omo = {
      teleport: (x: number, y: number) => setTeleport((t) => ({ x, y, key: (t?.key ?? 0) + 1 })),
      goto: (zoneId: string) => { setNode(zoneId); setAvatarZone(zoneId); recordVisit(zoneId); },
      state: () => ({ started, tab, ola, iwa, energy, day, avatarZone, nearDoor: nearDoor?.id ?? null, doorOpen: doorOpen?.id ?? null, feed: feed.slice(0, 3), journal: journal.length, npc: Object.fromEntries(Object.entries(npc).map(([k, v]) => [k, v.meets])) }),
    };
  });

  // ---- backend: session, cloud pull/push, turf flush (supabase loads on demand) ----
  useEffect(() => {
    if (!backendOn()) return;
    let dead = false;
    let unsub: (() => void) | undefined;
    (async () => {
      const { getSupabase } = await import("@/lib/supabase");
      const sb = getSupabase();
      if (!sb || dead) return;
      sb.auth.getSession().then(({ data }) => {
        if (dead) return;
        const u = data.session?.user;
        if (u) setAuthUser({ id: u.id, email: u.email ?? "" });
      });
      const { data: sub } = sb.auth.onAuthStateChange((_ev, session) => {
        const u = session?.user;
        setAuthUser(u ? { id: u.id, email: u.email ?? "" } : null);
        if (!u) setCloudReady(false);
      });
      unsub = () => sub.subscription.unsubscribe();
    })();
    return () => {
      dead = true;
      unsub?.();
    };
  }, []);

  // pull cloud profile on sign-in (cloud wins), else seed cloud from local
  useEffect(() => {
    if (!backendOn()) return;
    if (!authUser || !started) return;
    (async () => {
      const { getSupabase } = await import("@/lib/supabase");
      const sb = getSupabase();
      if (!sb) return;
      const { data, error } = await sb.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
      if (error || !data) {
        await pushCloud(true);
        setCloudReady(true);
        push("☁️ Cloud save started — progress go dey follow you.");
        return;
      }
      const w = (data.wallet ?? {}) as { ola?: number; iwa?: number; energy?: number };
      const p = (data.progress ?? {}) as Record<string, unknown>;
      const num = (v: unknown, d: number) => (typeof v === "number" ? v : d);
      const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
      setUsername(str(data.username, username));
      setArchId(str(data.arch_id, archId));
      setGender((data.gender === "obinrin" ? "obinrin" : "okunrin") as Gender);
      if (data.look && typeof data.look === "object") {
        const l = data.look as { skin?: number; top?: number; topEx?: string | null; gear?: null | "fila" | "gele" | "none" | "braids" | "afro" };
        setLook({ skin: l.skin ?? 1, top: l.top ?? 1, topEx: l.topEx ?? null, gear: l.gear ?? null });
      }
      setOla(num(w.ola, ola));
      setIwa(num(w.iwa, iwa));
      setEnergy(num(w.energy, energy));
      if (typeof p.day === "number") setDay(p.day);
      if (typeof p.micraRuns === "number") setMicraRuns(p.micraRuns);
      if (typeof p.trades === "number") setTrades(p.trades);
      if (typeof p.examPass === "number") setExamPass(p.examPass);
      if (typeof p.familyCount === "number") setFamilyCount(p.familyCount);
      if (typeof p.rests === "number") setRests(p.rests);
      if (typeof p.fullLoads === "number") setFullLoads(p.fullLoads);
      if (Array.isArray(p.visits)) setVisits(p.visits as string[]);
      if (Array.isArray(p.done)) setDone(p.done as string[]);
      if (typeof p.sprays === "number") setSprays(p.sprays);
      if (p.claimedDaily && typeof p.claimedDaily === "object") setClaimedDaily(p.claimedDaily as Record<number, string>);
      if (p.home && typeof p.home === "object") setHome(p.home as HomeSave);
      if (typeof p.avatarZone === "string") setAvatarZone(p.avatarZone);
      if (p.hoods && typeof p.hoods === "object") setHoods(p.hoods as Record<HoodId, number>);
      if (typeof p.myHood === "string") setMyHood(p.myHood as HoodId);
      if (Array.isArray(p.wardrobe)) setWardrobe(p.wardrobe as string[]);
      if (typeof p.equipped === "string" || p.equipped === null) setEquipped(p.equipped as string | null);
      if (p.needs && typeof p.needs === "object") {
        const n = p.needs as Record<string, number>;
        setNeeds({
          hunger: typeof n.hunger === "number" ? n.hunger : 80,
          fun: typeof n.fun === "number" ? n.fun : 70,
          social: typeof n.social === "number" ? n.social : 70,
          hygiene: typeof n.hygiene === "number" ? n.hygiene : 75,
          toilet: typeof n.toilet === "number" ? n.toilet : 85,
        });
      }
      if (typeof p.trait === "string" || p.trait === null) setTrait((p.trait as string | null) ?? null);
      if (typeof p.lastFreshDay === "number") setLastFreshDay(p.lastFreshDay);
      if (typeof p.lastToiletDay === "number") setLastToiletDay(p.lastToiletDay);
      if (p.npc && typeof p.npc === "object") setNpc(p.npc as Record<string, { meets: number }>);
      if (Array.isArray(p.journal)) setJournal((p.journal as { day: number; text: string }[]).filter((j) => j && typeof j.text === "string").slice(-50));
      if (p.skills && typeof p.skills === "object") {
        const merged = emptySkills();
        for (const sk of SKILLS) {
          const v = (p.skills as Record<string, unknown>)[sk.id] as { xp?: number; level?: number } | undefined;
          if (v && typeof v.xp === "number" && typeof v.level === "number") merged[sk.id] = { xp: v.xp, level: v.level };
        }
        setSkills(merged);
      }
      if (typeof p.careerId === "string" || p.careerId === null) setCareerId((p.careerId as string | null) ?? null);
      if (p.careerLevels && typeof p.careerLevels === "object") setCareerLevels(p.careerLevels as Record<string, number>);
      if (typeof p.lastShiftDay === "number") setLastShiftDay(p.lastShiftDay);
      setStarted(true);
      setCloudReady(true);
      push("☁️ Cloud save loaded — welcome back.");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  async function pushCloud(force = false) {
    if (!backendOn() || !authUser) return;
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    if (!sb) return;
    const snap = JSON.stringify({
      username, archId, gender, look, ola, iwa, energy, day, micraRuns, trades,
      examPass, familyCount, rests, fullLoads, visits, done, sprays, claimedDaily,
      shopGreets, viewDay, home, avatarZone, hoods, myHood, wardrobe, equipped, myCode,
    });
    if (!force && snap === lastPushed.current) return;
    lastPushed.current = snap;
    await sb.from("profiles").upsert(
      {
        id: authUser.id,
        username: username || "omo",
        arch_id: archId,
        gender,
        look,
        wallet: { ola, iwa, energy },
        progress: {
          day, micraRuns, trades, examPass, familyCount, rests, fullLoads, visits,
          done, sprays, claimedDaily, shopGreets, viewDay, home, avatarZone, myCode, walkWeek, walkDay,
          needs, trait, lastFreshDay, lastToiletDay, npc, journal, skills, careerId, careerLevels, lastShiftDay,
        },
        hoods,
        my_hood: myHood,
        wardrobe,
        equipped,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  }

  // debounced cloud push on progress change
  useEffect(() => {
    if (!authUser || !cloudReady || !started) return;
    const t = setTimeout(() => {
      pushCloud();
    }, 8000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, cloudReady, ola, iwa, energy, day, done, hoods, wardrobe, equipped, home, look, needs, trait]);

  // global turf flush (real shared board)
  useEffect(() => {
    if (!backendOn()) return;
    const t = setInterval(async () => {
      if (!authUser || pendingTurf.current <= 0) return;
      const { getSupabase } = await import("@/lib/supabase");
      const sb = getSupabase();
      if (!sb) return;
      const amt = Math.min(100000, Math.floor(pendingTurf.current));
      pendingTurf.current = 0;
      try {
        await sb.rpc("add_turf", { p_hood: hoodMirror.current, p_amount: amt });
      } catch {
        pendingTurf.current += amt;
      }
    }, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const recordVisit = (id: string) =>
    setVisits((v) => (v.includes(id) ? v : [...v, id]));

  const start = () => {
    if (!username.trim()) return;
    const code = makeReferralCode(username);
    setMyCode(code);
    let bonus = ECONOMY.WELCOME_BONUS + arch.ola;
    let extra = "";
    if (refInput.trim()) {
      bonus += ECONOMY.REFERRAL_JOINER_EXTRA;
      extra = ` + referral +₦${ECONOMY.REFERRAL_JOINER_EXTRA} (code ${refInput.toUpperCase()})`;
      push(`🎁 Friend code ${refInput.toUpperCase()} accepted. Sharer gets ₦${ECONOMY.REFERRAL_GIVER} (capped weekly).`);
    }
    setOla(bonus);
    setIwa(arch.iwa);
    setEnergy(arch.energy);
    setStarted(true);
    const homeZone = ARCH_HOME_ZONE[archId] ?? "ui-gate";
    recordVisit(homeZone);
    const g = GENDERS.find((x) => x.id === gender)!;
    push(`Ẹ káàbọ̀ sí Ìbàdàn, ${username}! ${g.yoruba} · ${arch.name}. Welcome ₦${ECONOMY.WELCOME_BONUS} + base ₦${arch.ola}${extra}.`);
  };

  const earn = (dOla: number, dIwa: number, msg: string, tag?: "micra" | "trade" | "exam" | "fullload") => {
    // trait pay modifiers (from lib/ibadanlife/traits, adapted to our paths)
    let ola = dOla;
    let iwa = dIwa;
    if (trait === "streetwise" && (tag === "micra" || tag === "trade") && ola > 0) ola = Math.round(ola * 1.1);
    if (trait === "hustleking" && ola > 0) ola = Math.round(ola * 1.08);
    if (trait === "bookwarm" && tag === "exam" && ola > 0) ola = Math.round(ola * 1.2);
    if (trait === "omoluabi" && iwa > 0) iwa = Math.ceil(iwa * 1.15);
    setOla((o) => Math.max(0, o + ola));
    setIwa((v) => Math.max(0, Math.min(100, v + iwa)));
    setEnergy((e) => Math.max(5, e - (trait === "hustleking" ? 6 : 5)));
    if (ola > 0) {
      setHoods((h) => ({ ...h, [myHood]: h[myHood] + ola }));
      if (authUser) pendingTurf.current += ola;
    }
    if (tag === "micra") { setMicraRuns((n) => n + 1); meet("Iwo Tout"); meet("Sani"); }
    if (tag === "trade") { setTrades((n) => n + 1); meet("Mama Put"); }
    if (dOla > 0 && tag === "micra") addSkill("driving", 8);
    if (dOla > 0 && tag === "trade") addSkill("hustle", 8);
    if (tag === "fullload") {
      setMicraRuns((n) => n + 1);
      setFullLoads((n) => n + 1);
      meet("Iwo Tout"); meet("Sani");
      jot("Full 6/6 load out of the park — tout hail am.");
    }
    push(msg);
    // Day advances every 6 hustle actions; new day may bring wahala
    setActions((a) => {
      const na = a + 1;
      if (na % 6 === 0) {
        const nd = day + 1;
        setDay(nd);
        setWeather("clear");
        push(`🌅 Day ${nd} for Ibadan. ${nd % 3 === 0 ? "Baba Ade go knock for rent soon o." : "New mercy, new hustle."}`);
        // needs decay (adapted from lib/ibadanlife/needs to our day cycle)
        const hyg = trait === "cleanfreak" ? 6 : 12;
        const dn = {
          hunger: Math.max(0, needs.hunger - 12),
          fun: Math.max(0, needs.fun - 10),
          social: Math.max(0, needs.social - 10),
          hygiene: Math.max(0, needs.hygiene - hyg),
          toilet: Math.max(0, needs.toilet - 15),
        };
        setNeeds(dn);
        if (needs.hunger > 0 && dn.hunger === 0) {
          setEnergy((e) => Math.max(5, e - 10));
          push("🍲 Hunger crash! -10⚡. Ebi no be mate.");
        }
        if (needs.toilet > 0 && dn.toilet === 0) {
          setIwa((v) => Math.max(0, v - 3));
          push("🚻 Embarrassment for public! Iwa -3. Toilet first next time.");
        }
        if (dn.hunger <= 15 && dn.hunger > 0) push("🍲 Ebi dey wire you — find food before hustle pay suffers.");
        if (dn.fun <= 15) push("🎉 Boredom — owambe or Agodi dey call.");
        if (dn.social <= 15) push("👥 Lonely — gist for Ojude or greet somebody.");
        if (dn.hygiene <= 15) push("🚿 Freshen up — body dey tell.");
        if (dn.toilet <= 15 && dn.toilet > 0) push("🚻 Pressed — find toilet now.");
        if (!event && Math.random() < 0.75) {
          const pool = LIFE_EVENTS.filter((e) => e.id !== "rent" || nd % 3 === 0);
          setEvent(pool[Math.floor(Math.random() * pool.length)]);
        }
      }
      return na;
    });
  };

  const missionMet = (id: string): boolean => {
    switch (id) {
      case "m1": return true;
      case "m2": return ola >= 800;
      case "m3": return micraRuns >= 1;
      case "m4": return trades >= 1;
      case "m5": return examPass >= 3;
      case "m6": return day >= 4;
      case "m7": return familyCount >= 1;
      case "m8": return ola >= 3000 && iwa >= 60;
      default: return false;
    }
  };

  const claim = (id: string) => {
    const m = MISSIONS.find((x) => x.id === id);
    if (!m || done.includes(id) || !missionMet(id)) return;
    const olaR = trait === "earlyriser" ? Math.round(m.rewardOla * 1.15) : m.rewardOla;
    setOla((o) => o + olaR);
    setIwa((v) => Math.min(100, v + m.rewardIwa));
    setHoods((h) => ({ ...h, [myHood]: h[myHood] + olaR }));
    if (authUser) pendingTurf.current += m.rewardOla;
    setDone((d) => [...d, id]);
    ensureAudio();
    coin();
    jot(`Day ${day}: mission complete — ${m.title}.`);
    push(`🏅 Mission complete: ${m.title}! +₦${m.rewardOla}, Iwa +${m.rewardIwa}.`);
  };

  const takeEvent = (ev: LifeEvent, optIdx: number) => {
    const o = ev.options[optIdx];
    let rentAmt = 0;
    if (ev.id === "rent") {
      rentAmt = myHood === "bodija" ? ECONOMY.RENT_WEEKLY_BODIJA : ECONOMY.RENT_WEEKLY_AGBOWO;
      if (optIdx === 0) {
        if (ola < rentAmt) {
          push(`Baba Ade no gree — ₦${rentAmt} no complete. Beg day lost, Iwa -3.`);
          setIwa((v) => Math.max(0, v - 3));
          setEvent(null);
          return;
        }
        setOla((x) => x - rentAmt);
        setIwa((v) => Math.min(100, v + 5));
        meet("Baba Ade");
        push(`🏠 Rent paid ₦${rentAmt}. Roof secured. Iwa +5.`);
        setEvent(null);
        return;
      }
    }
    setOla((x) => Math.max(0, x + o.ola));
    setIwa((v) => Math.max(0, Math.min(100, v + o.iwa)));
    setEnergy((e) => Math.max(5, Math.min(100, e + o.energy)));
    if (ev.id === "family" && optIdx === 0) {
      setFamilyCount((n) => n + 1);
    setNeeds((n) => ({ ...n, social: Math.min(100, n.social + 10) }));
      push(`👪 Mama: "${address(gender, "mama")}" — soup secured, dues paid.`);
    }
    if (ev.id === "rain") {
      setWeather("rain");
      push("🌧️ Rain start to fall for real — everywhere don wet. E go clear by dawn.");
    }
    push(`${ev.title} ${o.note}`);
    setEvent(null);
  };

  const chop = () => {
    if (ola < ECONOMY.CHOP_COST) {
      push("Ola no reach for chop. Run Micra first.");
      return;
    }
    const hungry = trait === "foodie" ? 38 : 30;
    const pow = trait === "nightowl" ? 25 : 30;
    setOla((o) => o - ECONOMY.CHOP_COST);
    setEnergy((e) => Math.min(100, e + pow));
    setNeeds((n) => ({ ...n, hunger: Math.min(100, n.hunger + hungry) }));
    ensureAudio();
    blip();
    push(`🍲 Amala + gbegiri @ Bodija. Energy +${pow}, hunger +${hungry}.`);
  };

  // Milestone 3: home economy (spending never feeds hood board)
  const buyFurniture = (cost: number, iwa: number, msg: string, fid: string) => {
    setOla((o) => o - cost);
    setIwa((v) => Math.min(100, v + iwa));
    setHome((h) => ({ ...h, furniture: [...h.furniture, fid] }));
    ensureAudio();
    coin();
    push(msg);
  };

  const upgradeHome = (cost: number, tier: "room" | "flat" | "duplex", msg: string) => {
    setOla((o) => o - cost);
    setHome((h) => ({ ...h, tier }));
    setIwa((v) => Math.min(100, v + 3));
    ensureAudio();
    coin();
    push(msg);
  };

  const restHome = (energy: number, msg: string) => {
    setEnergy((e) => Math.min(100, e + energy));
    setRests((n) => n + 1);
    setNeeds((n) => ({ ...n, hunger: Math.min(100, n.hunger + 8) }));
    push(msg);
  };

  // freshen up + toilet (once per game day each)
  const freshen = () => {
    if (ola < 50) {
      push("Freshen up na ₦50 — pure water no dey free.");
      return;
    }
    if (lastFreshDay === day) {
      push("🚿 You don fresh already today. Shine go last.");
      return;
    }
    setOla((o) => o - 50);
    setLastFreshDay(day);
    setNeeds((n) => ({ ...n, hygiene: Math.min(100, n.hygiene + 30) }));
    ensureAudio();
    blip();
    push("🚿 Bucket bath + sponge. Hygiene +30. Fresh pikin.");
  };
  const useToilet = () => {
    if (lastToiletDay === day) {
      push("🚻 Done already. Bladder clear.");
      return;
    }
    setLastToiletDay(day);
    setNeeds((n) => ({ ...n, toilet: Math.min(100, n.toilet + 40) }));
    push("🚻 Relieved. Toilet +40. No story.");
  };

  const goHome = () => {
    const hz = ZONES.find((z) => z.id === (ARCH_HOME_ZONE[archId] ?? "ui-gate")) ?? ZONES[0];
    const c = zoneCenter(hz);
    setTeleport((t) => ({ x: c.x, y: c.y + 1.2, key: (t?.key ?? 0) + 1 }));
    setTab("map");
    push(`🏠 Walking home — ${hz.label}. Your room dey wait.`);
  };

  const onAvatarZone = (id: string) => {
    setAvatarZone(id);
    recordVisit(id);
    const label = MAP_NODES.find((n) => n.id === id)?.name ?? id;
    const enter = ENTER_MAP[id];
    push(`🚶 You waka enter ${label}.${enter ? ` ${enter.label} →` : ""}`);
  };

  const teleportTo = (id: string) => {
    const s = sceneFor(id);
    if (!s) return;
    setTeleport((t) => ({ x: s.spawn.x, y: s.spawn.y, key: (t?.key ?? 0) + 1 }));
  };

  // ---- jobs ladder (skills + careers, adapted to our day cycle) ----
  const addSkill = (id: SkillId, xp: number) => {
    setSkills((sk) => {
      const { skills: next, leveled } = grantXp(sk, id, xp);
      if (leveled) {
        const def = SKILLS.find((s) => s.id === id);
        push(`🎓 ${def?.name ?? id} level ${next[id].level}! Promotion requirements just got closer.`);
      }
      return next;
    });
  };

  const workShift = () => {
    const c = CAREERS.find((x) => x.id === careerId);
    if (!c) {
      push("💼 Pick a career first — 25 Ibadan hustles dey wait.");
      return;
    }
    if (lastShiftDay === day) {
      push(`💼 Shift done for Day ${day}. Rest, come back tomorrow.`);
      return;
    }
    if (energy < 20) {
      push("💼 Too tired for shift. Chop or rest first (−20⚡ needed).");
      return;
    }
    const level = careerLevels[c.id] ?? 1;
    const pay = careerPay(c.id, level);
    setLastShiftDay(day);
    addSkill(c.skill, 20);
    earn(pay, 2, `💼 Shift complete: ${c.levels[level - 1].title} @ ${c.workplace}. +₦${pay.toLocaleString()}, ${c.skill} +20 XP.`);
  };

  const promote = () => {
    const c = CAREERS.find((x) => x.id === careerId);
    if (!c) return;
    const level = careerLevels[c.id] ?? 1;
    if (level >= 5) {
      push(`👑 ${c.name}: you don reach the top — ${c.levels[4].title}. Legend.`);
      return;
    }
    const next = c.levels[level];
    const have = skills[c.skill]?.level ?? 0;
    if (have < next.skillNeed) {
      push(`📈 Promotion needs ${c.skill} Lv${next.skillNeed} (you dey Lv${have}). Work shifts + exams to grow am.`);
      return;
    }
    setCareerLevels((m) => ({ ...m, [c.id]: level + 1 }));
    ensureAudio();
    coin();
    jot(`Day ${day}: promoted to ${next.title} (${c.name}).`);
    push(`🎉 PROMOTED: ${c.levels[level - 1].title} → ${next.title}! New pay ₦${next.pay.toLocaleString()}/shift.`);
  };

  // ---- travel fares (DISTANCES, adapted: ₦15/km micra, 2⚡/km trek) ----
  const getDist = (a: string, b: string): number => {
    if (a === b) return 0;
    return DISTANCES[a]?.[b] ?? DISTANCES[b]?.[a] ?? 5;
  };

  const travelTo = (id: string) => {
    if (id === node) {
      setNode(id);
      return;
    }
    const km = getDist(node, id);
    const label = MAP_NODES.find((n) => n.id === id)?.name ?? id;
    if (km <= 2) {
      setNode(id);
      setAvatarZone(id);
      recordVisit(id);
      teleportTo(id);
      push(`🚶 Short waka to ${label} — free. Legs still dey.`);
      return;
    }
    if (travelMode === "trek") {
      const cost = Math.round(km * 2);
      if (energy < cost + 5) {
        push(`🚶 Trek to ${label} needs ${cost}⚡ — you too tired. Take micra or rest.`);
        return;
      }
      setEnergy((e) => Math.max(5, e - cost));
      setNode(id);
      setAvatarZone(id);
      recordVisit(id);
      teleportTo(id);
      push(`🚶 Trekked ${km}km to ${label} (−${cost}⚡). Free, but legs don hear am.`);
      return;
    }
    const fare = Math.round(km * 15);
    if (ola < fare) {
      push(`🚐 Micra to ${label} na ₦${fare} (${km}km) — insufficient. Trek (free) or hustle first.`);
      return;
    }
    setOla((o) => o - fare);
    setEnergy((e) => Math.max(5, e - Math.round(km)));
    setNode(id);
    setAvatarZone(id);
    recordVisit(id);
    teleportTo(id);
    push(`🚐 Micra to ${label}, ${km}km — ₦${fare}. Conductor shout your change complete.`);
  };

  // wardrobe: game money now, real naira later (ngn tags ride along)
  const buyWardrobe = (item: { id: string; name: string; costV: number; color: string; gear: "fila" | "gele" | null }) => {
    setOla((o) => o - item.costV);
    setWardrobe((w) => [...w, item.id]);
    setLook((l) => ({ ...l, topEx: item.color, gear: item.gear ?? l.gear }));
    setEquipped(item.id);
    ensureAudio();
    coin();
    push(`🛍️ Copped ${item.name} for ₦${item.costV.toLocaleString()} — rocking it everywhere now.`);
  };
  const equipWardrobe = (item: { id: string; name: string; color: string; gear: "fila" | "gele" | null } | null) => {
    if (!item) {
      setEquipped(null);
      setLook((l) => ({ ...l, topEx: null }));
      push("👕 Back to default fit.");
      return;
    }
    setEquipped(item.id);
    setLook((l) => ({ ...l, topEx: item.color, gear: item.gear ?? l.gear }));
    push(`✨ Rocking ${item.name}. The street notices.`);
  };

  // owambe: spraying is a money sink; half rains on the hood
  const sprayOwambe = (amt: number) => {
    setOla((o) => o - amt);
    setHoods((h) => ({ ...h, [myHood]: h[myHood] + Math.floor(amt / 2) }));
    if (authUser) pendingTurf.current += Math.floor(amt / 2);
    setSprays((n) => n + 1);
    if (amt >= 500) jot(`Day ${day}: sprayed ₦${amt.toLocaleString()} at Fuji night. Owambe shake!`);
    setNeeds((n) => ({
      ...n,
      fun: Math.min(100, n.fun + (trait === "alaso" ? 12 : 10)),
      social: Math.min(100, n.social + 5),
    }));
    push(`💸 You spray ₦${amt.toLocaleString()} at Fuji night! Half rains on ${HOODS.find((h) => h.id === myHood)?.name}.`);
  };
  const danceOwambe = () => {
    if (energy < 10) return;
    const fun = trait === "alaso" ? 18 : 15;
    const iw = trait === "nightowl" ? 2 : 1;
    setEnergy((e) => e - 10);
    setIwa((v) => Math.min(100, v + iw));
    setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + fun) }));
    push(`💃 You shut down the dance floor. Iwa +${iw}, fun +${fun}. Knees −10⚡.`);
  };

  // interstate terminal runs (Ajala discount applied in Terminal display)
  const tripTerminal = (cost: number, gain: number, msg: string) => {
    setOla((o) => Math.max(0, o - cost + gain));
    setEnergy((e) => Math.max(5, e - 15));
    setHoods((h) => ({ ...h, [myHood]: h[myHood] + gain }));
    if (authUser) pendingTurf.current += gain;
    jot(`Day ${day}: interstate run done — goods offloaded.`);
    push(msg);
  };

  // daily hunt claim (one per weekday per real date)
  const claimDaily = (weekday: number, rewardOla: number, rewardIwa: number, title: string) => {
    const today = new Date().toDateString();
    setClaimedDaily((c) => ({ ...c, [weekday]: today }));
    const olaH = trait === "earlyriser" ? Math.round(rewardOla * 1.15) : rewardOla;
    setOla((o) => o + olaH);
    setIwa((v) => Math.min(100, v + rewardIwa));
    setHoods((h) => ({ ...h, [myHood]: h[myHood] + olaH }));
    if (authUser) pendingTurf.current += rewardOla;
    ensureAudio();
    coin();
    jot(`Day ${day}: cleared daily hunt — ${title}.`);
    push(`🎯 Daily hunt cleared: ${title}! +₦${rewardOla}, Iwa +${rewardIwa}. See you tomorrow.`);
  };

  const deedMet = (check: string): boolean => {
    const stats: Record<string, number> = {
      micra: micraRuns, trade: trades, exam: examPass, ola, iwa,
      day, rests, fullload: fullLoads, family: familyCount, spray: sprays,
    };
    return check.split("+").every((part) => {
      const [k, v] = part.split(":");
      if (k === "visit") return visits.includes(v);
      return (stats[k] ?? 0) >= Number(v);
    });
  };

  const claimDeed = (id: string) => {
    const d = DISTRICT_DEEDS.find((x) => x.id === id);
    if (!d || done.includes(id) || !deedMet(d.check)) return;
    const olaD = trait === "earlyriser" ? Math.round(d.rewardOla * 1.15) : d.rewardOla;
    setOla((o) => o + olaD);
    setIwa((v) => Math.min(100, v + d.rewardIwa));
    setHoods((h) => ({ ...h, [myHood]: h[myHood] + olaD }));
    if (authUser) pendingTurf.current += d.rewardOla;
    setDone((x) => [...x, id]);
    const dl = DISTRICT_DEEDS.find((y) => y.id === id);
    if (dl) jot(`Day ${day}: sealed ${dl.title} for ${(MAP_NODES.find((nn) => nn.id === dl.zone)?.name ?? dl.zone)}.`);
    const label = MAP_NODES.find((n) => n.id === d.zone)?.name ?? d.zone;
    ensureAudio();
    coin();
    push(`🏅 Deed sealed in ${label}: ${d.title}! +₦${d.rewardOla}, Iwa +${d.rewardIwa}.`);
  };

  const answer = (idx: number) => {
    const q = EXAM_POOL[qi % EXAM_POOL.length];
    if (idx === q.answer) {
      setExamPass((n) => n + 1);
      meet("Ada");
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 5) }));
      addSkill("brain", 25);
      earn(250, 3, `✅ Exam correct! +₦250, Iwa +3. (${q.q})`, "exam");
    } else {
      earn(0, 0, `❌ Fail. Correct: ${q.options[q.answer]}. Try again — no Iwa loss.`, "exam");
    }
    setQi((v) => v + 1);
    setEnergy((e) => Math.max(5, e - 3));
  };

  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/?ref=${myCode}` : `?ref=${myCode}`;

  if (!started) {
    return (
      <main className="min-h-screen bg-cream bg-[radial-gradient(ellipse_at_top,#F5D9A8_0%,#FAF6F0_55%)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <nav className="mb-4 flex items-center justify-between text-xs font-semibold text-charcoal/55">
            <span>
              <a href="/" className="hover:text-roof">Home</a>
              <span className="mx-1.5 opacity-50">/</span>
              <span className="text-charcoal">Join</span>
            </span>
            <a href="/how-to-play" className="hover:text-roof">How to play →</a>
          </nav>
          <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[28px] bg-charcoal text-cream shadow-[0_32px_80px_-24px_rgba(28,25,23,0.6)] ring-1 ring-white/10">
            <div className="bg-gradient-to-r from-roof via-[#a8642f] to-mapo px-6 pb-5 pt-6 sm:px-8">
              <div className="text-[11px] font-extrabold tracking-[0.25em] text-cream/90">JOIN · FREE · Ẹ KÁÀBỌ̀ SÍ ÌBÀDÀN</div>
              <h1 className="font-display mt-2 text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">Create your Ibadan self</h1>
              <p className="font-display mt-1 text-base font-semibold text-cream/90">Three steps. One minute. Then the city is yours.</p>
            </div>
            <div className="px-6 py-6 sm:px-8">
              <p className="text-sm leading-relaxed text-cream/80">
                Je Omoluabi. Ko Ola, Ko Iwa. Walk the diorama, hustle micra, trade Bodija, survive NEPA weeks.
                {mode === "ajala" && " Visitor mode: we go explain everything small-small."}
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-1.5 text-[11px] font-extrabold tracking-widest text-mapo">01 · YOUR @NAME</div>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Pick @name e.g. AdeBodija" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-cream placeholder:text-cream/40 outline-none focus:border-mapo" />
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-extrabold tracking-widest text-mapo">02 · YOUR BACKGROUND</div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {ARCHETYPES.map((a) => (
                      <button key={a.id} onClick={() => setArchId(a.id)} className={`rounded-2xl p-3 text-left text-sm ring-1 transition ${archId === a.id ? "bg-mapo text-charcoal ring-mapo" : "bg-white/[0.07] ring-white/10 hover:bg-white/[0.12]"}`}>
                        <div className="font-bold">{a.name}</div>
                        <div className="text-xs opacity-80">{a.desc}</div>
                        <div className="mt-1 text-xs font-semibold">₦{a.ola} · Iwa {a.iwa} · {a.perk}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-extrabold tracking-widest text-mapo">03 · YOUR BODY</div>
                  <div className="grid grid-cols-2 gap-2">
                    {GENDERS.map((g) => (
                      <button key={g.id} onClick={() => setGender(g.id)} className={`rounded-2xl p-3 text-left text-sm ring-1 transition ${gender === g.id ? "bg-mapo text-charcoal ring-mapo" : "bg-white/[0.07] ring-white/10 hover:bg-white/[0.12]"}`}>
                        <div className="text-xl">{g.id === "okunrin" ? "🤠" : "👩🏾"}</div>
                        <div className="font-bold">{g.name} <span className="font-semibold opacity-70">· {g.yoruba}</span></div>
                        <div className="text-xs opacity-80">{g.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-extrabold tracking-widest text-mapo">04 · YOUR TRAIT (locked for life — choose well)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {TRAITS.map((t) => (
                      <button key={t.id} onClick={() => setTrait(trait === t.id ? null : t.id)} className={`rounded-2xl p-2.5 text-left text-sm ring-1 transition ${trait === t.id ? "bg-mapo text-charcoal ring-mapo" : "bg-white/[0.07] ring-white/10 hover:bg-white/[0.12]"}`}>
                        <div className="font-bold">{t.icon} {t.name}</div>
                        <div className="text-xs opacity-80">{t.blurb}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-extrabold tracking-widest text-mapo">05 · YOUR LENS</div>
                  <div className="flex gap-2">
                    <button onClick={() => setMode("omo")} className={`flex-1 rounded-full py-2.5 text-sm font-bold transition ${mode === "omo" ? "bg-agodi text-white" : "bg-white/10 text-cream/70"}`}>Omo Ibadan</button>
                    <button onClick={() => setMode("ajala")} className={`flex-1 rounded-full py-2.5 text-sm font-bold transition ${mode === "ajala" ? "bg-agodi text-white" : "bg-white/10 text-cream/70"}`}>Ajala (Visitor)</button>
                  </div>
                </div>
                <input value={refInput} onChange={(e) => setRefInput(e.target.value)} placeholder="Referral code (optional) e.g. ADE24" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-cream placeholder:text-cream/40 outline-none focus:border-mapo" />
                <button onClick={start} disabled={!username.trim()} className="w-full rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] py-3.5 font-display text-base font-extrabold text-charcoal shadow-lg disabled:opacity-40">
                  Enter Ibadan → Welcome ₦{ECONOMY.WELCOME_BONUS}
                </button>
                <p className="text-center text-xs text-cream/50">Virtual Naira only. No cashout. Iwa no dey buyable. <a href="/how-to-play" className="underline">Learn the loop first →</a></p>
              </div>
            </div>
          </div>
          {/* Side panel: why Ibadan */}
          <aside className="space-y-4 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-roof via-[#a8642f] to-mapo p-6 text-cream shadow-xl sm:p-8">
              <div className="text-[11px] font-extrabold tracking-[0.25em] text-cream/85">WHY IBADAN?</div>
              <div className="font-display mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">A whole city,<br />not a mini-game.</div>
              <ul className="mt-4 space-y-2.5 text-sm font-semibold text-cream/90">
                <li>🗺️ Walkable diorama — 15 real districts</li>
                <li>🚐 Drive micra on real corridors</li>
                <li>🧺 Haggle Bodija, survive NEPA weeks</li>
                <li>📖 8 story missions, Olubadan titles</li>
                <li>⚔️ 6 hoods, one weekly crown</li>
                <li>⚡ Smooth on 2GB Androids</li>
              </ul>
              <div className="mt-4 rounded-2xl bg-black/25 p-3 text-sm italic text-cream/90">
                “Je Omoluabi. Ko Ola, Ko Iwa.”
              </div>
            </div>
            <div className="rounded-[28px] bg-charcoal p-6 text-cream sm:p-6">
              <div className="text-[11px] font-extrabold tracking-[0.25em] text-mapo">TONIGHT'S TURF TALK</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {HOODS.map((h) => (
                  <span key={h.id} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cream/85">{h.name}</span>
                ))}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-cream/55">Every naira hustled in-game feeds a hood. Iwo Road holds the crown — for now.</p>
              <a href="/leaderboard" className="mt-3 inline-block rounded-full bg-cream px-4 py-1.5 text-xs font-extrabold text-charcoal">See the board →</a>
            </div>
          </aside>
          </div>
          <AdSlot slot="landing-footer" />
        </div>
      </main>
    );
  }

  const q = EXAM_POOL[qi % EXAM_POOL.length];

  return (
    <main className="min-h-screen bg-cream bg-[radial-gradient(ellipse_at_top,#F5D9A8_0%,#FAF6F0_50%)]">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:py-8">
        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center justify-between text-xs font-semibold text-charcoal/55">
          <span>
            <a href="/" className="hover:text-roof">Home</a>
            <span className="mx-1.5 opacity-50">/</span>
            <span className="text-charcoal">Play</span>
            <span className="mx-1.5 opacity-50">·</span>
            <span>🌅 Day {day}</span>
          </span>
          <a href="/how-to-play" className="hover:text-roof">How to play →</a>
        </nav>
        {/* HUD command bar */}
        <div className="sticky top-3 z-20 rounded-3xl bg-charcoal/95 p-4 text-cream shadow-[0_20px_50px_-16px_rgba(28,25,23,0.55)] ring-1 ring-white/10 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-display text-base font-extrabold tracking-tight">@{username} <span className="text-mapo">· {title}</span></div>
              <div className="text-xs text-cream/60">{nodeName} · {arch.name} · {gender === "okunrin" ? "Ọkùnrin" : "Obìnrin"}</div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[13px]">
              <span className="rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] px-3 py-1 font-extrabold text-charcoal">₦{ola}</span>
              <span className="rounded-full bg-agodi px-3 py-1 font-bold text-white">🕊 {iwa}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 font-semibold">⚡{energy}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 font-semibold" title="Mood: from your energy + Iwa">{mood}</span>
              {onlineTotal > 0 && (
                <span className="rounded-full bg-white/15 px-3 py-1 font-semibold" title="Real players online now">🟢 {onlineTotal >= 1000 ? `${(onlineTotal / 1000).toFixed(1)}k` : onlineTotal} online</span>
              )}
              {walkLive.active && (
                <button onClick={() => setTab("rin")} className="rounded-full bg-agodi px-3 py-1 font-bold text-white" title="Walk in progress — tap to open">
                  🚶 {walkLive.steps.toLocaleString()} steps
                </button>
              )}
              <div className="relative">
                <button onClick={() => setMenuOpen((o) => !o)} aria-label="Settings" className="rounded-full bg-white/15 px-3 py-1 font-semibold hover:bg-white/25">⚙️</button>
                {menuOpen && (
                  <div className="absolute right-0 top-9 z-30 w-56 rounded-2xl bg-cream p-3 text-charcoal shadow-2xl ring-1 ring-roof/20">
                    <div className="px-1 pb-2 text-[11px] font-extrabold tracking-widest text-charcoal/50">SETTINGS</div>
                    <button onClick={() => setSaver((s) => !s)} className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2.5 text-left text-sm font-bold ring-1 ring-roof/10">
                      <span>📶 Quality</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs ${saver ? "bg-agodi text-white" : "bg-mapo/25 text-charcoal"}`}>{saver ? "Saver" : "Full"}</span>
                    </button>
                    <button onClick={() => { const m = !mutedUi; setMuted(m); setMutedUi(m); if (!m) { ensureAudio(); blip(); } }} className="mt-1.5 flex w-full items-center justify-between rounded-xl bg-white px-3 py-2.5 text-left text-sm font-bold ring-1 ring-roof/10">
                      <span>🔊 Sound</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs ${mutedUi ? "bg-charcoal/10 text-charcoal/50" : "bg-agodi text-white"}`}>{mutedUi ? "Off" : "On"}</span>
                    </button>
                    <p className="px-1 pt-2 text-[11px] leading-relaxed text-charcoal/55">Saver caps effects + lights for 2GB Androids. Gameplay unchanged.</p>
                    <div className="mt-2">
                      <AuthCard user={authUser} onAuth={setAuthUser} />
                    </div>
                    <a href="/how-to-play" className="mt-2 block rounded-xl bg-white px-3 py-2.5 text-sm font-bold ring-1 ring-roof/10">📖 How to play →</a>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(["map", "hustle", "exam", "story", "ile", "ra", "owambe", "rin", "fonu", "ojude"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition ${tab === t ? "bg-cream text-charcoal shadow" : "bg-white/10 text-cream/75 hover:bg-white/15"}`}>
                {t === "map" && "🗺 Map"}{t === "hustle" && "🚐 Hustle"}{t === "exam" && "📝 Exam"}{t === "story" && "📖 Itan"}{t === "ile" && "🏠 Ilé"}{t === "ra" && "🛍️ Rà"}{t === "owambe" && "💃 Owambe"}{t === "rin" && "🚶 Rìn"}{t === "fonu" && "📱 Fọ́nu"}{t === "ojude" && "📣 Ojude"}
              </button>
            ))}
            <button onClick={chop} className="rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold hover:bg-white/15">🍲 Chop ₦{ECONOMY.CHOP_COST}</button>
            <button onClick={goHome} className="rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold hover:bg-white/15">🏠 Go home</button>
          </div>
        </div>

        {/* Door chip (walked up to a door) wins over the zone chip */}
        {nearDoor ? (
          <button onClick={() => setDoorOpen(nearDoor)} className="mt-3 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-mapo to-[#f5c04a] px-4 py-2.5 text-left text-sm font-extrabold text-charcoal shadow ring-2 ring-cream/40">
            <span>🚪 {nearDoor.label} — step inside, no tabs</span>
            <span>→</span>
          </button>
        ) : (
          (() => {
            const enter = ENTER_MAP[avatarZone];
            if (!enter) return null;
            const label = MAP_NODES.find((n) => n.id === avatarZone)?.name ?? avatarZone;
            return (
              <button onClick={() => setTab(enter.tab)} className="mt-3 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-mapo to-[#f5c04a] px-4 py-2.5 text-left text-sm font-extrabold text-charcoal shadow">
                <span>📍 You dey {label} — {enter.label}</span>
                <span>→</span>
              </button>
            );
          })()
        )}

        {/* Town feed lives in the sidebar below */}

        {/* Life-event modal (NEPA / rain / family / rent) */}
        {event && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-charcoal/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-cream p-5 shadow-2xl ring-1 ring-roof/20">
              <h3 className="font-display text-lg font-extrabold tracking-tight">{event.title}</h3>
              <p className="mt-1 text-sm text-charcoal/70">{event.desc}</p>
              <div className="mt-4 grid gap-2">
                {event.options.map((o, i) => (
                  <button key={i} onClick={() => takeEvent(event, i)} className={`rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1 transition active:scale-[0.99] ${i === 0 ? "bg-charcoal text-cream ring-charcoal" : "bg-white ring-roof/15 hover:bg-mapo/20"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-[11px] text-charcoal/50">Day {day} · choices shape your Iwa</p>
            </div>
          </div>
        )}

        {/* Walk-in store */}
        {storeOpen && (
          <StoreModal
            stall={avatarZone === "bodija" ? "Mama Put's Stall" : avatarZone === "oja-oba" ? "Alaba's Stall" : "Baba Oje's Corner"}
            greeting={
              avatarZone === "oje"
                ? address(gender, "elder")
                : address(gender, "mama")
            }
            canChopSpecial={avatarZone === "bodija"}
            greeted={shopGreetDay === day}
            onChop={() => { chop(); }}
            onSpecial={() => {
              if (ola < 250) {
                push("Mama Special na ₦250 — hustle come back.");
                return;
              }
              setOla((o) => o - 250);
              setEnergy((e) => Math.min(100, e + 45));
              setNeeds((n) => ({ ...n, hunger: Math.min(100, n.hunger + 45) }));
              push("⭐ Mama Special: ofada + fried plantain, extra meat. Energy +45. Bodija remembers you.");
            }}
            onGreet={() => {
              if (shopGreetDay === day) return;
              setShopGreetDay(day);
              setIwa((v) => Math.min(100, v + 1));
              meet("Mama Put");
              setNeeds((n) => ({ ...n, social: Math.min(100, n.social + 8) }));
              push("🙏 You greet the trader with both hands. Iwa +1. Customer forever.");
            }}
            onHaggle={() => {
              setStoreOpen(false);
              push("🧺 You face the trader across the counter. Name your price — no long talk.");
            }}
            onClose={() => setStoreOpen(false)}
          />
        )}

        {/* Street shop interiors (3D walk-ins) */}
        {shopEntry && (
          <ShopEntryModal
            shop={shopEntry}
            ola={ola}
            greetedShop={(shopGreets[shopEntry] ?? 0) === day}
            onBuyEnergy={(cost, gain, msg) => {
              if (ola < cost) return;
              setOla((o) => o - cost);
              setEnergy((e) => Math.min(100, e + gain));
              setNeeds((n) => ({ ...n, hunger: Math.min(100, n.hunger + gain) }));
              push(msg);
            }}
            onHaircut={() => {
              if (ola < 200) {
                push("Lowcut na ₦200 — clippers no dey on credit.");
                return;
              }
              setOla((o) => o - 200);
              setLook((l) => ({ ...l, gear: "none" }));
              setIwa((v) => Math.min(100, v + 1));
              push("💈 Fresh lowcut! Mirror confesses: fine pikin. Iwa +1.");
            }}
            onWatch={() => {
              if (ola < 100) {
                push("Gate fee na ₦100. No free match.");
                return;
              }
              setOla((o) => o - 100);
              setEnergy((e) => Math.max(5, e - 5));
              if (viewDay !== day) {
                setViewDay(day);
                setIwa((v) => Math.min(100, v + 2));
                push("📺 WHAT A GOAL! You hug strangers. Iwa +2. Best ₦100 this week.");
              } else {
                push("📺 Second half gist. Same noise, same joy.");
              }
            }}
            onGreet={() => {
              if ((shopGreets[shopEntry] ?? 0) === day) return;
              setShopGreets((g) => ({ ...g, [shopEntry]: day }));
              setIwa((v) => Math.min(100, v + 1));
              meet("Mama Put");
              setNeeds((n) => ({ ...n, social: Math.min(100, n.social + 8) }));
              push("🙏 Greeted with both hands. Iwa +1. Customer forever.");
            }}
            onBrowseClothes={() => {
              setShopEntry(null);
              setTab("ra");
              push("👗 Full aso-ebi rack dey Buy tab. Go choose your owambe look.");
            }}
            onClose={() => setShopEntry(null)}
          />
        )}

        {/* In-world doors: the real games, right where you stand */}
        {doorOpen && (
          <DoorModal
            door={doorOpen}
            zoneName={MAP_NODES.find((n) => n.id === doorOpen.zone)?.name ?? doorOpen.zone}
            onClose={() => setDoorOpen(null)}
          >
            {doorOpen.action === "market" && (
              <BodijaMarket ola={ola} onTrade={(dO, dI, m) => earn(dO, dI, m, dO > 0 ? "trade" : undefined)} />
            )}
            {doorOpen.action === "terminal" && (
              <Terminal ola={ola} onTrip={tripTerminal} fareMult={trait === "ajala" ? 0.85 : 1} />
            )}
            {doorOpen.action === "exam" && (
              <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10">
                <h3 className="font-display text-base font-extrabold tracking-tight">📝 Exam hall — live desk</h3>
                <p className="text-xs text-charcoal/55">Same desk, same brain. +₦250 + Iwa +3 per pass.</p>
                <p className="mt-3 text-[15px] font-bold">{q.q}</p>
                <div className="mt-2 grid gap-2">
                  {q.options.map((o, i) => (
                    <button key={i} onClick={() => answer(i)} className="rounded-2xl bg-cream px-4 py-2.5 text-left text-sm font-semibold ring-1 ring-roof/10 transition hover:bg-mapo/25 active:scale-[0.99]">{o}</button>
                  ))}
                </div>
              </div>
            )}
            {(doorOpen.action === "store-food" || doorOpen.action === "store-prov" || doorOpen.action === "store-omo") && (
              <div className="rounded-3xl bg-white p-4 text-center ring-1 ring-roof/10">
                <p className="text-sm text-charcoal/70">Trader dey inside with full shelves.</p>
                <button
                  onClick={() => {
                    const kind = doorOpen.action === "store-food" ? "food" : doorOpen.action === "store-prov" ? "provisions" : "boutique";
                    setDoorOpen(null);
                    setShopEntry(kind as ShopKind);
                  }}
                  className="mt-2 w-full rounded-full bg-charcoal py-2.5 text-sm font-bold text-cream"
                >
                  🏪 Step inside the stall →
                </button>
              </div>
            )}
          </DoorModal>
        )}

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
          <div className="mb-3 px-1">
            <div className="text-[10px] font-extrabold tracking-[0.25em] text-roof">{SECTIONS[tab].kicker}</div>
            <h2 className="font-display text-xl font-extrabold tracking-tight">{SECTIONS[tab].title}</h2>
            <p className="text-[13px] text-charcoal/60">{SECTIONS[tab].lede}</p>
          </div>
          {tab === "map" && (
            <div className="space-y-3">
              <div className="rounded-3xl bg-charcoal p-4 shadow-[0_16px_40px_-20px_rgba(28,25,23,0.55)] ring-1 ring-white/10 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-extrabold tracking-tight text-cream">🌇 Ibadan — illustrated streets</h3>
                    <p className="text-xs text-cream/55">Tap to waka · 🚪 markers na doors, no tabs · tap people to greet</p>
                  </div>
                </div>
                <DistrictScene
                  zone={avatarZone}
                  playerName={username}
                  playerColor={topColor}
                  teleport={teleport}
                  weather={weather}
                  saver={saver}
                  npcMeets={Object.fromEntries(Object.entries(npc).map(([k, v]) => [k, v.meets]))}
                  onGate={(id) => travelTo(id)}
                  onDoor={(d) => setNearDoor(d)}
                  onGreetNpc={greetNpc}
                />
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-[0_16px_40px_-20px_rgba(122,74,43,0.35)] ring-1 ring-roof/10 sm:p-5">
                <h3 className="font-display text-base font-extrabold tracking-tight">🗺 Districts</h3>
                <p className="mb-2 text-xs text-charcoal/55">Travel costs by real distance — micra ₦15/km, trek free but tiring. ≤2km na free waka.</p>
                <div className="mb-3 flex gap-1.5 rounded-full bg-cream p-1 text-xs font-bold ring-1 ring-roof/10">
                  <button onClick={() => setTravelMode("micra")} className={`flex-1 rounded-full py-1.5 ${travelMode === "micra" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>🚐 Micra</button>
                  <button onClick={() => setTravelMode("trek")} className={`flex-1 rounded-full py-1.5 ${travelMode === "trek" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>🚶 Trek (free)</button>
                </div>
                <MapGraph
                  active={node}
                  travelFrom={node}
                  getFare={(id) => {
                    const km = getDist(node, id);
                    if (km <= 2 || id === node) return null;
                    return travelMode === "trek" ? `${km}km · ${Math.round(km * 2)}⚡` : `${km}km · ₦${Math.round(km * 15)}`;
                  }}
                  onSelect={(id) => travelTo(id)}
                />
              </div>
            </div>
          )}
          {tab === "hustle" && (
            <div className="space-y-3">
              {(avatarZone === "bodija" || avatarZone === "oja-oba" || avatarZone === "oje") && (
                <button
                  onClick={() => setStoreOpen(true)}
                  className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-roof to-[#a8642f] px-4 py-3 text-left text-sm font-extrabold text-cream shadow"
                >
                  <span>🏪 You dey {MAP_NODES.find((n) => n.id === avatarZone)?.name} — step inside the stall</span>
                  <span>→</span>
                </button>
              )}
              <div className="rounded-3xl bg-charcoal p-4 text-cream ring-1 ring-white/10 sm:p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-extrabold tracking-tight">💼 Career — 25 Ibadan hustles</h3>
                  {lastShiftDay === day && (
                    <span className="rounded-full bg-agodi px-3 py-1 text-[11px] font-bold text-white">Shift done ✅</span>
                  )}
                </div>
                {(() => {
                  const c = CAREERS.find((x) => x.id === careerId);
                  const level = c ? (careerLevels[c.id] ?? 1) : 1;
                  const next = c && level < 5 ? c.levels[level] : null;
                  const haveXp = c ? (skills[c.skill]?.level ?? 0) : 0;
                  return (
                    <div className="mt-3">
                      <select
                        value={careerId ?? ""}
                        onChange={(e) => {
                          setCareerId(e.target.value || null);
                          const nc = CAREERS.find((x) => x.id === e.target.value);
                          if (nc) push(`💼 You sign up as ${nc.levels[0].title} — ${nc.name} @ ${nc.workplace}. First shift pays ₦${nc.levels[0].pay.toLocaleString()}.`);
                        }}
                        className="w-full rounded-2xl bg-white/10 px-3 py-2.5 text-sm font-bold outline-none focus:border-mapo"
                      >
                        <option value="">— Pick your hustle —</option>
                        {CAREERS.map((x) => (
                          <option key={x.id} value={x.id} className="text-charcoal">
                            {x.name} · {x.workplace} · ₦{x.levels[0].pay.toLocaleString()}/shift
                          </option>
                        ))}
                      </select>
                      {c && (
                        <div className="mt-3 rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                          <div className="text-sm font-bold">{c.levels[level - 1].title} <span className="font-semibold text-cream/60">· Lv{level}/5 · {c.name}</span></div>
                          <div className="text-xs text-cream/60">{c.blurb} · shift: ₦{careerPay(c.id, level).toLocaleString()} · −20⚡ · +20 {c.skill} XP</div>
                          <div className="mt-1.5">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span>{SKILLS.find((s) => s.id === c.skill)?.icon} {c.skill} Lv{haveXp}</span>
                              <span className="opacity-60">{skills[c.skill]?.xp ?? 0}/{SKILLS.find((s) => s.id === c.skill)?.xpPerLevel ?? 100} XP</span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-mapo" style={{ width: `${Math.min(100, ((skills[c.skill]?.xp ?? 0) / (SKILLS.find((s) => s.id === c.skill)?.xpPerLevel ?? 100)) * 100)}%` }} />
                            </div>
                          </div>
                          <div className="mt-2.5 flex gap-2">
                            <button onClick={workShift} disabled={lastShiftDay === day} className="flex-1 rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] py-2 text-sm font-extrabold text-charcoal disabled:opacity-40">
                              {lastShiftDay === day ? "Shift done ✅" : "Work shift −20⚡"}
                            </button>
                            {next && (
                              <button onClick={promote} className="flex-1 rounded-full bg-white/10 py-2 text-sm font-bold hover:bg-white/15">
                                Promote → {next.title} ({c.skill} Lv{next.skillNeed})
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      <details className="mt-2 rounded-2xl bg-white/[0.05] px-3 py-2 ring-1 ring-white/10">
                        <summary className="cursor-pointer text-xs font-bold text-cream/70">📚 All skills ({Object.values(skills).filter((s) => (s as { level: number }).level > 0).length}/{SKILLS.length} unlocked)</summary>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          {SKILLS.map((s) => (
                            <div key={s.id} className="rounded-xl bg-white/[0.06] px-2 py-1.5 text-[11px]">
                              <span className="font-bold">{s.icon} {s.name}</span>
                              <span className="float-right font-extrabold text-mapo">Lv{skills[s.id]?.level ?? 0}</span>
                              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-mapo/70" style={{ width: `${Math.min(100, ((skills[s.id]?.xp ?? 0) / s.xpPerLevel) * 100)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  );
                })()}
              </div>
              <MicraRush saver={saver} weather={weather} fareMult={trait === "ajala" ? 0.85 : 1} onEarn={(dO, dI, m) => earn(dO, dI, m, /6\/6 FULL LOAD/.test(m) ? "fullload" : /complete|Rode micra|Iwo Road park/.test(m) ? "micra" : undefined)} />
              <BodijaMarket ola={ola} onTrade={(dO, dI, m) => earn(dO, dI, m, dO > 0 ? "trade" : undefined)} />
              <Terminal ola={ola} onTrip={tripTerminal} fareMult={trait === "ajala" ? 0.85 : 1} />
            </div>
          )}
          {tab === "ra" && (
            <WardrobeShop
              ola={ola}
              owned={wardrobe}
              equippedId={equipped}
              myGear={gear}
              onBuy={buyWardrobe}
              onEquip={equipWardrobe}
              onRealInfo={(w) => push(`💳 ${payRealNaira(w.name, w.ngn).reason}`)}
            />
          )}
          {tab === "owambe" && (
            <OwambeHall ola={ola} energy={energy} onSpray={sprayOwambe} onDance={danceOwambe} />
          )}
          {tab === "rin" && (
            <div className="space-y-3">
              <WalkTab
                username={username}
                onTick={(active, steps) => setWalkLive({ active, steps })}
                onComplete={onWalkComplete}
              />
              <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10">
                <div className="text-[10px] font-extrabold tracking-[0.25em] text-roof">THIS WEEK · LEGS DON TRY</div>
                <div className="font-display mt-1 text-2xl font-extrabold">
                  {(walkWeek.key === walkWeekKey() ? walkWeek.steps : 0).toLocaleString()} <span className="text-sm font-bold text-charcoal/50">steps</span>
                </div>
                <p className="mt-1 text-xs text-charcoal/55">
                  100 Ola per 1,000 steps · +3 Iwa on 2,000+ days · 20k steps/day counted · top walkers crowned on the leaderboard.
                </p>
                <a href="/leaderboard" className="mt-2 inline-block text-xs font-bold text-roof">Walkers board →</a>
              </div>
            </div>
          )}
          {tab === "exam" && (
            <div className="rounded-3xl bg-white p-5 shadow-[0_16px_40px_-20px_rgba(122,74,43,0.35)] ring-1 ring-roof/10">
              <h3 className="font-display text-lg font-extrabold tracking-tight">📝 UI Exam Survival</h3>
              <p className="text-xs text-charcoal/55">+₦250 + Iwa +3 per pass · unlocks better jobs in V2</p>
              <p className="mt-3 text-[15px] font-bold">{q.q}</p>
              <div className="mt-2 grid gap-2">
                {q.options.map((o, i) => (
                  <button key={i} onClick={() => answer(i)} className="rounded-2xl bg-cream px-4 py-2.5 text-left text-sm font-semibold ring-1 ring-roof/10 transition hover:bg-mapo/25 active:scale-[0.99]">{o}</button>
                ))}
              </div>
            </div>
          )}
          {tab === "ile" && (
            <div className="space-y-3">
            <div className="flex gap-1.5 rounded-full bg-white p-1 ring-1 ring-roof/10">
              {(["room", "compound", "street"] as const).map((v) => (
                <button key={v} onClick={() => setIleView(v)} className={`flex-1 rounded-full py-1.5 text-[13px] font-bold transition ${ileView === v ? "bg-charcoal text-cream shadow" : "text-charcoal/60 hover:bg-cream"}`}>
                  {v === "room" && "🛏️ Room"}{v === "compound" && "🏘️ Compound"}{v === "street" && "🛣️ Street"}
                </button>
              ))}
            </div>
            <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10">
              <div className="text-[10px] font-extrabold tracking-[0.25em] text-roof">ÌDÁNIMỌ̀ · IDENTITY (change anytime)</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {GENDERS.map((g) => (
                  <button key={g.id} onClick={() => { setGender(g.id); push(g.id === "okunrin" ? "🤠 Fila on. Baba Ade: “Ọmọ ọkùnrin mi!”" : "👩🏾 Gele tied. Mama Put: “Fine girl!”"); }} className={`rounded-2xl p-3 text-left text-sm ring-1 transition ${gender === g.id ? "bg-charcoal text-cream ring-charcoal" : "bg-cream ring-roof/10"}`}>
                    <div className="font-bold">{g.id === "okunrin" ? "🤠" : "👩🏾"} {g.name}</div>
                    <div className="text-xs opacity-70">{g.yoruba}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3 text-[11px] font-extrabold tracking-widest text-charcoal/50">SKIN</div>
              <div className="mt-1.5 flex gap-2">
                {SKINS.map((c, i) => (
                  <button key={c} onClick={() => setLook((l) => ({ ...l, skin: i }))} aria-label={`skin ${i + 1}`}
                    className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ${look.skin === i ? "ring-charcoal" : "ring-transparent"}`}
                    style={{ background: c }} />
                ))}
              </div>
              <div className="mt-3 text-[11px] font-extrabold tracking-widest text-charcoal/50">TOP (agbada / buba)</div>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {CLOTHS.map((c, i) => (
                  <button key={c + i} onClick={() => setLook((l) => ({ ...l, top: i }))} aria-label={`top ${i + 1}`}
                    className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ${look.top === i ? "ring-charcoal" : "ring-transparent"}`}
                    style={{ background: c }} />
                ))}
              </div>
              <div className="mt-3 text-[11px] font-extrabold tracking-[0.25em] text-charcoal/50">HEAD</div>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {([["fila", "🤠 Fila"], ["gele", "👩🏾 Gele"], ["braids", "🪮 Braids"], ["afro", "🦁 Afro"], ["none", "💇🏾 Lowcut"]] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setLook((l) => ({ ...l, gear: l.gear === id ? null : id }))}
                    className={`rounded-full py-1.5 text-xs font-bold ring-1 transition ${gear === id ? "bg-charcoal text-cream ring-charcoal" : "bg-cream ring-roof/10"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-charcoal/50">Tap again to return to gender default.</p>
              {(() => {
                const t = TRAITS.find((x) => x.id === trait);
                return t ? (
                  <p className="mt-1.5 rounded-2xl bg-mapo/15 px-3 py-2 text-xs font-bold ring-1 ring-mapo/30">
                    {t.icon} {t.name} — {t.blurb} <span className="font-semibold opacity-60">(locked for life)</span>
                  </p>
                ) : null;
              })()}
            </div>
            {ileView === "room" && (
              <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10 sm:p-5">
                <h3 className="font-display text-base font-extrabold tracking-tight">🛏️ Your room — live view</h3>
                <p className="mb-3 text-xs text-charcoal/55">Every purchase appears here. Bare floor today, showroom tomorrow.</p>
                <RoomCard
                  home={home}
                  avatarColor={topColor}
                  onSleep={() => {
                    const bonus = 40 + home.furniture.reduce((s, id) => s + (FURNITURE.find((f) => f.id === id)?.rest ?? 0), 0);
                    restHome(bonus, `😴 Slept in your own bed. Energy +${bonus}.`);
                  }}
                />
              </div>
            )}
            {ileView === "compound" && (
              <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10 sm:p-5">
                <h3 className="font-display text-base font-extrabold tracking-tight">🏘️ Your compound</h3>
                <p className="mb-3 text-xs text-charcoal/55">Walk it in 3D or survey it in 2D — same elders, same chickens.</p>
                <CompoundCard
                  archId={archId}
                  greeted={lastGreetDay === day}
                  onGreet={() => {
                    if (lastGreetDay === day) return;
                    setLastGreetDay(day);
                    setIwa((v) => Math.min(100, v + 2));
                    meet("Elder");
                    setNeeds((n) => ({ ...n, social: Math.min(100, n.social + 8) }));
                    push(`🙏 You dobale for the elder. "${address(gender, "elder")}" Iwa +2.`);
                  }}
                />
              </div>
            )}
            {ileView === "street" && (
              <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10 sm:p-5">
                <h3 className="font-display text-base font-extrabold tracking-tight">🛣️ Your street</h3>
                <p className="mb-3 text-xs text-charcoal/55">Between compound and city: stall, kiosk, barber, match-day viewing centre.</p>
                <StreetCard
                  onStepOut={() => { goHome(); setTab("map"); }}
                  onEnterShop={(s) => setShopEntry(s)}
                />
              </div>
            )}
            <HomeTab
              archId={archId}
              archName={arch.name}
              home={home}
              ola={ola}
              onBuy={buyFurniture}
              onUpgrade={upgradeHome}
              onRest={restHome}
            />
            </div>
          )}
          {tab === "story" && (
            <div className="space-y-3">
            {(() => {
              const hunt = DAILY_HUNTS[new Date().getDay()];
              const today = new Date().toDateString();
              const claimed = claimedDaily[hunt.weekday] === today;
              const met = deedMet(hunt.check);
              return (
                <div className="rounded-3xl bg-charcoal p-5 text-cream ring-1 ring-white/10">
                  <div className="text-[10px] font-extrabold tracking-[0.25em] text-mapo">ONÍṢẸ́ ỌJỌ́ · TODAY'S HUNT</div>
                  <div className="font-display mt-1 text-base font-extrabold">🎯 {hunt.title}</div>
                  <div className="mt-1 text-sm text-cream/70">{hunt.desc}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-cream/60">+₦{hunt.rewardOla} · Iwa +{hunt.rewardIwa} · once daily</span>
                    {claimed ? (
                      <span className="rounded-full bg-agodi px-4 py-1.5 text-xs font-bold text-white">✅ Cleared</span>
                    ) : (
                      <button
                        onClick={() => met && claimDaily(hunt.weekday, hunt.rewardOla, hunt.rewardIwa, hunt.title)}
                        disabled={!met}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold ${met ? "bg-mapo text-charcoal" : "bg-white/10 text-cream/40"}`}
                      >
                        {met ? "Claim" : "Not yet"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
            <div className="rounded-3xl bg-white p-5 shadow-[0_16px_40px_-20px_rgba(122,74,43,0.35)] ring-1 ring-roof/10">
              <h3 className="font-display text-lg font-extrabold tracking-tight">📖 Itan Mi — My Story</h3>
              <p className="text-xs text-charcoal/55">Day {day} · {done.length - 1}/{MISSIONS.length - 1} missions claimed · choices build Ola + Iwa</p>
              <div className="mt-3 space-y-2">
                {MISSIONS.map((m) => {
                  const isDone = done.includes(m.id);
                  const met = missionMet(m.id);
                  return (
                    <div key={m.id} className={`rounded-2xl p-3.5 ring-1 ${isDone ? "bg-agodi/10 ring-agodi/30" : "bg-cream ring-roof/10"}`}>
                      <div className="text-[10px] font-extrabold tracking-widest text-roof">{m.chapter}</div>
                      <div className="text-sm font-bold">{isDone ? "✅ " : ""}{m.title}</div>
                      <div className="text-xs text-charcoal/60">{m.desc}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-charcoal/60">+₦{m.rewardOla} · Iwa +{m.rewardIwa}</span>
                        {!isDone && (
                          <button onClick={() => claim(m.id)} disabled={!met} className={`rounded-full px-4 py-1.5 text-xs font-bold ${met ? "bg-charcoal text-cream" : "bg-charcoal/10 text-charcoal/40"}`}>
                            {met ? "Claim" : "Locked"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <h4 className="font-display mt-5 text-base font-extrabold tracking-tight">📍 District deeds — {done.filter((d) => d.startsWith("d-")).length}/{DISTRICT_DEEDS.length} sealed</h4>
              <p className="text-xs text-charcoal/55">Walk every district. Each deed na that area real life.</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {DISTRICT_DEEDS.map((d) => {
                  const isDone = done.includes(d.id);
                  const met = deedMet(d.check);
                  const label = MAP_NODES.find((n) => n.id === d.zone)?.name ?? d.zone;
                  return (
                    <div key={d.id} className={`rounded-2xl p-3 ring-1 ${isDone ? "bg-agodi/10 ring-agodi/30" : "bg-cream ring-roof/10"}`}>
                      <div className="text-[10px] font-extrabold tracking-widest text-roof">{label.toUpperCase()}</div>
                      <div className="text-sm font-bold">{isDone ? "✅ " : ""}{d.title}</div>
                      <div className="text-xs text-charcoal/60">{d.desc}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-charcoal/60">+₦{d.rewardOla} · Iwa +{d.rewardIwa}</span>
                        {!isDone && (
                          <button onClick={() => claimDeed(d.id)} disabled={!met} className={`rounded-full px-3 py-1 text-[11px] font-bold ${met ? "bg-charcoal text-cream" : "bg-charcoal/10 text-charcoal/40"}`}>
                            {met ? "Seal" : "Locked"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <h4 className="font-display mt-5 text-base font-extrabold tracking-tight">📜 Itan Rẹ — your week, auto-written</h4>
              <p className="text-xs text-charcoal/55">The city remembers what your mouth forgets.</p>
              <div className="mt-2 space-y-1.5">
                {journal.length === 0 && (
                  <p className="rounded-2xl bg-cream px-3 py-2.5 text-xs text-charcoal/55 ring-1 ring-roof/10">
                    Blank page. Go hustle, spray, travel, waka — the journal go fill am.
                  </p>
                )}
                {[...journal].reverse().map((j, i) => (
                  <div key={`${j.day}-${i}`} className="rounded-2xl bg-cream px-3 py-2 text-xs ring-1 ring-roof/10">
                    <span className="font-extrabold text-roof">Day {j.day} · </span>
                    <span className="text-charcoal/80">{j.text}</span>
                  </div>
                ))}
              </div>
            </div>
            </div>
          )}
          {tab === "fonu" && <FonuPhone />}
          {tab === "ojude" && (
            <div className="space-y-3">
              <OjudeFeed />
              <div className="rounded-3xl bg-white p-5 shadow ring-1 ring-roof/10">
                <h3 className="font-display font-extrabold tracking-tight">🧑🏾‍🤝‍🧑🏾 People — who knows your name</h3>
                <p className="mt-1 text-xs text-charcoal/55">Hustle beside them, greet them, buy from them — strangers become family.</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {NPCS.map((p) => {
                    const tier = npcTier(p.id);
                    const meets = npc[p.id]?.meets ?? 0;
                    const tierName = ["Stranger", "Familiar", "Regular", "Family"][tier];
                    return (
                      <div key={p.id} className={`rounded-2xl p-3 ring-1 ${tier >= 2 ? "bg-agodi/10 ring-agodi/30" : "bg-cream ring-roof/10"}`}>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-bold">{p.name}</div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${tier >= 2 ? "bg-agodi text-white" : "bg-charcoal/10 text-charcoal/60"}`}>
                            {tierName} · {meets}
                          </span>
                        </div>
                        <div className="mt-1 text-xs italic text-charcoal/65">{p.lines[tier]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-3xl bg-charcoal p-5 text-cream shadow ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold tracking-tight">⚔️ Hood Turf — this week</h3>
                  <span className="rounded-full bg-mapo px-3 py-1 text-xs font-bold text-charcoal">Mogaji 👑 {[...HOODS].sort((a, b) => hoods[b.id] - hoods[a.id])[0].name}</span>
                </div>
                <p className="mt-1 text-xs text-cream/60">Every naira you hustle counts for your hood. Referral bonus no dey count — only sweat.</p>
                <div className="mt-3 space-y-2">
                  {[...HOODS].sort((a, b) => hoods[b.id] - hoods[a.id]).map((h, i) => {
                    const max = Math.max(...HOODS.map((x) => hoods[x.id]));
                    return (
                      <div key={h.id}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold">{i === 0 ? "👑 " : ""}{h.name} {myHood === h.id && "· you"}</span>
                          <span className="opacity-70">₦{hoods[h.id].toLocaleString()}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full rounded-full ${i === 0 ? "bg-gradient-to-r from-mapo to-[#f5c04a]" : "bg-white/30"}`} style={{ width: `${Math.max(4, (hoods[h.id] / max) * 100)}%` }} />
                        </div>
                        {myHood !== h.id && (
                          <button onClick={() => { setMyHood(h.id); push(`You don port to ${h.name}! ${HOODS.find((x) => x.id === h.id)?.oriki}`); }} className="mt-1 text-[11px] font-bold text-mapo/90">Represent {h.name} →</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow ring-1 ring-roof/10">
                <h3 className="font-display font-extrabold tracking-tight">🔗 Referral — invite your guys</h3>
                <p className="mt-1 text-sm text-charcoal/65">Your code: <b className="text-roof">{myCode}</b> · You +₦{ECONOMY.REFERRAL_GIVER}/friend (max {ECONOMY.REFERRAL_WEEKLY_CAP}/week) · Friend +₦{ECONOMY.REFERRAL_JOINER_EXTRA}. Virtual only.</p>
                <div className="mt-3 flex gap-2">
                  <input readOnly value={shareLink} className="w-full rounded-full bg-cream px-4 py-2.5 text-sm ring-1 ring-roof/10" />
                  <button onClick={() => { navigator.clipboard?.writeText(shareLink); setInvites(invites + 1); push("Referral link copied. Share for WhatsApp!"); }} className="shrink-0 rounded-full bg-charcoal px-4 py-2.5 text-sm font-bold text-cream">Copy</button>
                </div>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Ẹ káàbọ̀ sí Ìbàdàn! Join Omo Ibadan with my code ${myCode}: ${shareLink}`)}`} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white shadow">Share WhatsApp 💬</a>
              </div>
            </div>
          )}
          </div>
          {/* Sidebar: meters, missions, town feed */}
          <aside className="space-y-3 xl:sticky xl:top-24">
            <div className="rounded-3xl bg-charcoal p-4 text-cream ring-1 ring-white/10">
              <div className="text-[10px] font-extrabold tracking-[0.25em] text-mapo">METER RECAP</div>
              <div className="font-display mt-1 text-2xl font-extrabold">₦{ola.toLocaleString()} <span className="text-sm font-bold text-cream/60">Ola</span></div>
              <div className="mt-2 text-xs font-bold">🕊 Iwa {iwa} <span className="font-semibold text-cream/50">· {title}</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-agodi" style={{ width: `${iwa}%` }} />
              </div>
              <div className="mt-2 text-xs font-bold">⚡ Energy {energy}</div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-mapo" style={{ width: `${energy}%` }} />
              </div>
              <div className="mt-2 text-[10px] font-extrabold tracking-[0.2em] text-cream/50">NEEDS · EBI TO BLADDER</div>
              <div className="mt-1 space-y-1.5">
                {NEEDS.filter((d) => d.id !== "energy").map((d) => {
                  const v = needs[d.id as keyof typeof needs] ?? 50;
                  return (
                    <div key={d.id}>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span>{d.icon} {d.name} <span className="font-semibold opacity-60">· {d.yoruba}</span></span>
                        <span className={v <= 15 ? "text-red-400" : "opacity-70"}>{v}</span>
                      </div>
                      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${v <= 15 ? "bg-red-500" : "bg-cream/70"}`} style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <button onClick={freshen} className="rounded-full bg-white/10 px-2 py-1.5 text-[11px] font-bold hover:bg-white/15">🚿 Freshen ₦50</button>
                <button onClick={useToilet} className="rounded-full bg-white/10 px-2 py-1.5 text-[11px] font-bold hover:bg-white/15">🚻 Toilet</button>
              </div>
              <div className="mt-2 text-xs text-cream/55">🌅 Day {day} · {nodeName}</div>
            </div>
            <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10">
              <div className="text-[10px] font-extrabold tracking-[0.25em] text-roof">NEXT MISSIONS</div>
              <div className="mt-2 space-y-2">
                {MISSIONS.filter((m) => !done.includes(m.id)).slice(0, 3).map((m) => {
                  const met = missionMet(m.id);
                  return (
                    <div key={m.id} className="flex items-center justify-between gap-2 rounded-2xl bg-cream px-3 py-2 ring-1 ring-roof/10">
                      <div>
                        <div className="text-xs font-bold">{m.title}</div>
                        <div className="text-[11px] text-charcoal/55">+₦{m.rewardOla} · Iwa +{m.rewardIwa}</div>
                      </div>
                      <button onClick={() => claim(m.id)} disabled={!met} className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${met ? "bg-charcoal text-cream" : "bg-charcoal/10 text-charcoal/40"}`}>
                        {met ? "Claim" : "···"}
                      </button>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setTab("story")} className="mt-2 text-xs font-bold text-roof">All missions →</button>
            </div>
            <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10">
              <div className="text-[10px] font-extrabold tracking-[0.25em] text-roof">TOWN FEED</div>
              <div className="mt-2 max-h-64 space-y-1.5 overflow-y-auto">
                {feed.length === 0 && <p className="text-xs text-charcoal/50">Quiet for now. Go hustle — the town go hear am.</p>}
                {feed.map((m, i) => (
                  <div key={i} className={`rounded-xl px-3 py-2 text-xs ring-1 ${i === 0 ? "bg-charcoal text-cream ring-charcoal" : "bg-cream text-charcoal/80 ring-roof/10"}`}>{m}</div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <AdSlot slot="game-footer" />
        <p className="mt-4 pb-6 text-center text-xs text-charcoal/45">Omo Ibadan V1 · Next 14 web · virtual ₦ only, no cashout · Iwa no dey buyable · Ẹ káàbọ̀ sí Ìbàdàn</p>
      </div>
    </main>
  );
}
