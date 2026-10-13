"use client";

import { useEffect, useRef, useState } from "react";
import {
  ECONOMY,
  HOODS,
  LIFE_EVENTS,
  MAP_NODES,
  MISSIONS,
  DISTRICT_DEEDS,
  DAILY_HUNTS,
  GENDERS,
  address,
  makeReferralCode,
  type Gender,
  type HoodId,
  type LifeEvent,
  type WardrobeItem,
  NEEDS,
  TRAITS,
  SKILLS,
  emptySkills,
  grantXp,
  xpToNext,
  type SkillId,
  type SkillMap,
  CAREERS,
  careerPay,
  entryLevel,
  distanceKm,
  TRANSPORT,
  PRICES,
  naira,
  BACKGROUNDS,
  drawBackground,
  isBackgroundId,
  type BackgroundId,
} from "@/lib/game";
import {
  SAVE_KEY,
  SAVE_VERSION,
  migrateSave,
  rawFromCloudRow,
  cloudRowFor,
  chooseSave,
  saveBody,
  startHoods,
  type SaveData,
} from "@/lib/engine/save";
import {
  EXAM_PAID_PER_DAY,
  TERMINAL_ENERGY,
  advanceDay,
  decayNeeds,
  examQuestion,
  titleFor,
} from "@/lib/engine/day";
import {
  MINUTES,
  WAKE_MINUTE,
  advanceClock,
  ageOn,
  calendarFor,
  formatTime,
  isLateNight,
  minutesUntilMorning,
  partOfDay,
  shiftOpen,
} from "@/lib/engine/clock";
import CityMap from "@/components/CityMap";
import StreetScene from "@/components/StreetScene";
import { streetSceneFor } from "@/lib/scenes";
import { playerSpec } from "@/lib/art/player";
import DistrictScene from "@/components/DistrictScene";
import { hasScene, sceneFor } from "@/lib/districts";
import RoomCard from "@/components/RoomCard";
import type { SceneTeleport as Teleport } from "@/components/DistrictScene";
import HomeTab from "@/components/HomeTab";

import StoreModal from "@/components/StoreModal";
import DoorModal from "@/components/DoorModal";
import ShopEntryModal from "@/components/ShopEntryModal";
import type { ShopKind } from "@/lib/art/interiors";
import {
  SKINS,
  CLOTHS,
  FURNITURE,
  NPCS,
  emptyHome,
  DOORS,
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

export default function Home() {
  const [started, setStarted] = useState(false);
  const [username, setUsername] = useState("");
  // birth lottery: null until drawn on the start screen, then fixed for life
  const [bgId, setBgId] = useState<BackgroundId | null>(null);
  const bg = BACKGROUNDS[bgId ?? "omo-iya-lobe"];
  // family meter: Mama's trust (Omo Iya Lobe) / Daddy's approval (Alowonle)
  const [bond, setBond] = useState(60);
  const [paidObligations, setPaidObligations] = useState<string[]>([]);
  const [lastFamilyDay, setLastFamilyDay] = useState(0);
  const [forcedBirth, setForcedBirth] = useState<BackgroundId | null>(null);
  const drawLife = () => {
    if (bgId) return; // one draw per life, no reroll
    setBgId(forcedBirth ?? drawBackground());
    ensureAudio();
    coin();
  };
  const [gender, setGender] = useState<Gender>("okunrin");
  // character look: skin/top swatches + headgear (null gear follows gender)
  const [look, setLook] = useState<{ skin: number; top: number; topEx: string | null; gear: null | "fila" | "gele" | "none" | "braids" | "afro" }>({ skin: 1, top: 1, topEx: null, gear: null });
  const gear: "fila" | "gele" | "none" | "braids" | "afro" = look.gear ?? (gender === "okunrin" ? "fila" : "gele");
  const topColor = look.topEx ?? CLOTHS[look.top] ?? bg.outfit;
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
  const [travelMode, setTravelMode] = useState<"micra" | "trek" | "car">("micra");
  const [feed, setFeed] = useState<string[]>([]);
  const [qi, setQi] = useState(0);
  const [invites, setInvites] = useState(0);
  // V1 rest-of-build: day cycle, stats, missions, hoods, events
  const [day, setDay] = useState(1);
  // time of day in minutes after midnight (lib/engine/clock)
  const [minute, setMinute] = useState(WAKE_MINUTE);
  // mirrors `minute` so several actions in one tick all count
  const minuteRef = useRef(WAKE_MINUTE);
  const [micraRuns, setMicraRuns] = useState(0);
  const [trades, setTrades] = useState(0);
  const [examPass, setExamPass] = useState(0);
  const [exam, setExam] = useState({ day: 0, paid: 0 });
  const [lastTerminalDay, setLastTerminalDay] = useState(0);
  // true once the local save has been read; nothing is written before that
  const [hydrated, setHydrated] = useState(false);
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
  // where the player appears in a walkable scene: their door, or the gate when arriving
  const [sceneEntry, setSceneEntry] = useState<{ key: number; at: "spawn" | "arrive" }>({ key: 0, at: "spawn" });
  // 4A shell: quality + settings menu
  const [saver, setSaver] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // phones: the "More" sheet of the bottom tab bar
  const [moreOpen, setMoreOpen] = useState(false);
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
    spendMinutes(MINUTES.greet);
  };
  const [shopGreets, setShopGreets] = useState<Record<string, number>>({});
  const [viewDay, setViewDay] = useState(0);
  // 4F: ile sub-view + daily elder greeting
  const [ileView, setIleView] = useState<"room" | "compound" | "street">("room");
  const [lastGreetDay, setLastGreetDay] = useState(0);

  const moodScore = Math.round((energy + needs.hunger + needs.fun + needs.social + needs.hygiene + needs.toilet) / 6);
  const mood =
    moodScore >= 75 ? "😄 Very Happy" :
    moodScore >= 55 ? "🙂 Happy" :
    moodScore >= 35 ? "😐 Managing" :
    moodScore >= 15 ? "😩 Drained" : "🤢 Miserable";
  const title = titleFor(ola, iwa);
  const nodeName = MAP_NODES.find((n) => n.id === node)?.name ?? node;

  // ---- save: one format for local + cloud (lib/engine/save) ----
  const applySave = (s: SaveData) => {
    setStarted(s.started);
    setUsername(s.username);
    setMyCode(s.myCode);
    setBgId(s.bgId);
    setGender(s.gender);
    setLook(s.look);
    setTrait(s.trait);
    setSaver(s.saver);
    setOla(s.ola);
    setIwa(s.iwa);
    setEnergy(s.energy);
    setNeeds(s.needs);
    setBond(s.bond);
    setPaidObligations(s.paidObligations);
    setLastFamilyDay(s.lastFamilyDay);
    setDay(s.day);
    setMinute(s.minute);
    minuteRef.current = s.minute;
    setWeather(s.weather);
    setEvent(LIFE_EVENTS.find((e) => e.id === s.eventId) ?? null);
    setMicraRuns(s.micraRuns);
    setTrades(s.trades);
    setExamPass(s.examPass);
    setExam(s.exam);
    setFamilyCount(s.familyCount);
    setRests(s.rests);
    setFullLoads(s.fullLoads);
    setSprays(s.sprays);
    setLastTerminalDay(s.lastTerminalDay);
    setVisits(s.visits);
    setDone(s.done);
    setClaimedDaily(s.claimedDaily);
    setHoods(s.hoods);
    setMyHood(s.myHood);
    setAvatarZone(s.avatarZone);
    if (s.started) setNode(s.avatarZone);
    setHome(s.home);
    setTravelMode(s.travelMode);
    setWardrobe(s.wardrobe);
    setEquipped(s.equipped);
    setNpc(s.npc);
    setJournal(s.journal);
    setShopGreets(s.shopGreets);
    setViewDay(s.viewDay);
    setLastGreetDay(s.lastGreetDay);
    setLastFreshDay(s.lastFreshDay);
    setLastToiletDay(s.lastToiletDay);
    setSkills(s.skills);
    setCareerId(s.careerId);
    setCareerLevels(s.careerLevels);
    setLastShiftDay(s.lastShiftDay);
    setWalkWeek(s.walkWeek);
    setWalkDay(s.walkDay);
  };

  const current: SaveData = {
    v: SAVE_VERSION, savedAt: 0, started, username, myCode, bgId, gender, look, trait, saver,
    ola, iwa, energy, needs, bond, paidObligations, lastFamilyDay,
    day, minute, weather, eventId: event?.id ?? null,
    micraRuns, trades, examPass, exam, familyCount, rests, fullLoads, sprays, lastTerminalDay,
    visits, done, claimedDaily, hoods, myHood,
    avatarZone, home, travelMode, wardrobe, equipped,
    npc, journal, shopGreets, viewDay, lastGreetDay, lastFreshDay, lastToiletDay,
    skills, careerId, careerLevels, lastShiftDay, walkWeek, walkDay,
  };
  // stable string of the save; changes exactly when progress changes
  const body = saveBody(migrateSave(current)!);
  const lastBodyRef = useRef("");
  const savedAtRef = useRef(0);
  const latest = useRef<SaveData>(current);
  latest.current = current;
  const latestSave = (): SaveData => ({ ...latest.current, savedAt: savedAtRef.current });

  useEffect(() => {
    let local: SaveData | null = null;
    try {
      local = migrateSave(JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null"));
    } catch {}
    if (local) {
      applySave(local);
      savedAtRef.current = local.savedAt;
      lastBodyRef.current = saveBody(local);
    }
    const params = new URLSearchParams(window.location.search);
    const r = params.get("ref");
    if (r) setRefInput(r);
    // Dev/test only: ?birth=alowonle forces the lottery result.
    const forced = params.get("birth");
    if (process.env.NODE_ENV !== "production" && isBackgroundId(forced)) setForcedBirth(forced);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // write locally on every change; savedAt moves only when progress really changed
  useEffect(() => {
    if (!hydrated) return;
    if (body !== lastBodyRef.current) {
      lastBodyRef.current = body;
      savedAtRef.current = Date.now();
    }
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(latestSave()));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, hydrated]);

  const push = (m: string) => setFeed((f) => [m, ...f].slice(0, 8));

  // Dev-only E2E hook (stripped from production): lets Playwright teleport + read state.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { __omo: unknown }).__omo = {
      teleport: (x: number, y: number) => setTeleport((t) => ({ x, y, key: (t?.key ?? 0) + 1 })),
      goto: (zoneId: string) => { setNode(zoneId); setAvatarZone(zoneId); recordVisit(zoneId); },
      state: () => ({ started, tab, bg: bgId, bond, ola, iwa, energy, day, minute, avatarZone, nearDoor: nearDoor?.id ?? null, doorOpen: doorOpen?.id ?? null, feed: feed.slice(0, 3), journal: journal.length, npc: Object.fromEntries(Object.entries(npc).map(([k, v]) => [k, v.meets])) }),
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

  // on sign-in: the newer of local and cloud wins; the loser is overwritten
  useEffect(() => {
    if (!backendOn() || !authUser || !hydrated) return;
    let dead = false;
    (async () => {
      const { getSupabase } = await import("@/lib/supabase");
      const sb = getSupabase();
      if (!sb || dead) return;
      const { data, error } = await sb.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
      if (error || dead) return; // offline or denied: keep playing locally, try again next sign-in
      const cloud = data ? migrateSave(rawFromCloudRow(data as Record<string, unknown>)) : null;
      const local = latestSave();
      if (cloud && chooseSave(local, cloud) === "cloud") {
        applySave(cloud);
        savedAtRef.current = cloud.savedAt;
        lastBodyRef.current = saveBody(cloud);
        lastPushed.current = saveBody(cloud);
        push("☁️ Cloud save loaded — welcome back.");
      } else if (local.started) {
        await pushCloud(true);
        push(cloud ? "☁️ This device had newer progress — cloud updated." : "☁️ Cloud save started — progress go dey follow you.");
      }
      setCloudReady(true);
    })();
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, hydrated]);

  async function pushCloud(force = false) {
    if (!backendOn() || !authUser) return;
    const s = latestSave();
    if (!s.started) return;
    const b = saveBody(s);
    if (!force && b === lastPushed.current) return;
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.from("profiles").upsert(cloudRowFor(authUser.id, s), { onConflict: "id" });
    if (!error) lastPushed.current = b;
  }

  // push a few seconds after any progress change, and when the tab is hidden
  useEffect(() => {
    if (!authUser || !cloudReady) return;
    const t = setTimeout(() => {
      pushCloud();
    }, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, cloudReady, body]);

  useEffect(() => {
    if (!authUser || !cloudReady) return;
    const flush = () => {
      if (document.visibilityState === "hidden") pushCloud();
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, cloudReady]);

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
    if (!username.trim() || !bgId) return;
    const code = makeReferralCode(username);
    setMyCode(code);
    let pocket = bg.pocket;
    let extra = "";
    if (refInput.trim()) {
      pocket += ECONOMY.REFERRAL_JOINER_EXTRA;
      extra = ` Friend code bonus +${naira(ECONOMY.REFERRAL_JOINER_EXTRA)}.`;
      push(`🎁 Friend code ${refInput.toUpperCase()} accepted. Sharer gets ${naira(ECONOMY.REFERRAL_GIVER)} (capped weekly).`);
    }
    setOla(pocket);
    setIwa(bg.iwa);
    setEnergy(bg.energy);
    setBond(bg.bond);
    setPaidObligations([]);
    setTravelMode(bg.hasCar ? "car" : "micra");
    setStarted(true);
    setNode(bg.homeZone);
    setAvatarZone(bg.homeZone);
    recordVisit(bg.homeZone);
    teleportTo(bg.homeZone, "spawn");
    const g = GENDERS.find((x) => x.id === gender)!;
    jot(`Day 1: born ${bg.name}. ${bg.homeLabel}.`);
    push(`Ẹ káàbọ̀ sí Ìbàdàn, ${username}! ${g.yoruba} · ${bg.name}. You start with ${naira(pocket)}.${extra}`);
    // the join form is long on phones; land at the top, in your street
    window.scrollTo({ top: 0 });
  };

  const earn = (dOla: number, dIwa: number, msg: string, tag?: "micra" | "trade" | "exam" | "fullload", minutes?: number) => {
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
    // working through the night costs extra energy
    if (isLateNight(minuteRef.current)) {
      setEnergy((e) => Math.max(5, e - 5));
      push("🌙 Night hustle: −5⚡ extra. Your body wants your bed.");
    }
    spendMinutes(minutes ?? (tag === "exam" ? MINUTES.exam : MINUTES.hustle));
  };

  // ---- time: actions cost minutes; crossing midnight starts a new day (lib/engine/clock) ----
  const spendMinutes = (mins: number) => {
    const r = advanceClock(minuteRef.current, mins);
    minuteRef.current = r.minute;
    setMinute(r.minute);
    for (let i = 1; i <= r.newDays; i++) startDay(day + i);
  };

  const startDay = (nd: number) => {
    const r = advanceDay({ day: nd, bg, bond, needs, trait, paidObligations, eventPending: !!event });
    setDay(nd);
    setWeather("clear");
    setNeeds((n) => decayNeeds(n, trait));
    if (r.olaDelta) setOla((o) => Math.max(0, o + r.olaDelta));
    if (r.iwaDelta) setIwa((v) => Math.max(0, Math.min(100, v + r.iwaDelta)));
    if (r.energyDelta) setEnergy((e) => Math.max(5, Math.min(100, e + r.energyDelta)));
    if (r.bondDelta) setBond((b) => Math.max(0, Math.min(100, b + r.bondDelta)));
    r.messages.forEach(push);
    for (const text of r.journal) setJournal((j) => [...j.slice(-49), { day: nd, text }]);
    if (r.event) setEvent(r.event);
  };

  const payObligation = (id: string) => {
    const o = bg.obligations.find((x) => x.id === id);
    if (!o || paidObligations.includes(id)) return;
    if (ola < o.amount) {
      push(`${o.title} needs ${naira(o.amount)}. You hold ${naira(ola)}.`);
      return;
    }
    const late = day > o.dueDay;
    setOla((x) => x - o.amount);
    setPaidObligations((p) => [...p, id]);
    setBond((b) => Math.min(100, b + (late ? 5 : 12)));
    setIwa((v) => Math.min(100, v + (late ? 2 : 6)));
    setFamilyCount((n) => n + 1);
    ensureAudio();
    coin();
    jot(`Day ${day}: paid ${o.title}${late ? " (late)" : ""}.`);
    push(`🙏 Paid ${o.title}: −${naira(o.amount)}. ${bg.bondLabel} +${late ? 5 : 12}.`);
  };

  // once a day: Omo Iya Lobe helps at Mama's stall; Alowonle shows face at Daddy's office
  // `atHome`: done in the evening at the compound (pot / veranda) instead of at the stall or site
  const familyDuty = (atHome = false) => {
    if (lastFamilyDay === day) {
      push("You've already done your family duty today.");
      return;
    }
    if (energy < 20) {
      push("Too tired. Chop or rest first.");
      return;
    }
    setLastFamilyDay(day);
    setEnergy((e) => Math.max(5, e - 15));
    setBond((b) => Math.min(100, b + 4));
    spendMinutes(MINUTES.familyDuty);
    if (bg.id === "omo-iya-lobe") {
      const tip = 2500;
      setOla((o) => o + tip);
      setIwa((v) => Math.min(100, v + 2));
      meet("Mama Bisi");
      addSkill("cooking", 10);
      push(atHome
        ? `🍲 You stirred the gbegiri with Mama for tomorrow's market. She pressed ${naira(tip)} into your hand. Mama's trust +4.`
        : `🍲 You helped Mama sell at Oja'ba. She pressed ${naira(tip)} into your hand. Mama's trust +4.`);
    } else {
      setNeeds((n) => ({ ...n, fun: Math.max(0, n.fun - 10) }));
      meet("Chief Adeyemi");
      addSkill("charisma", 10);
      push(atHome
        ? "👔 You went through the day's site accounts with Daddy on the veranda. Approval +4, fun −10."
        : "👔 You sat through Daddy's site meeting on Ring Road and took notes. Approval +4, fun −10.");
    }
  };

  const missionMet = (id: string): boolean => {
    switch (id) {
      case "m1": return true;
      case "m2": return ola >= 25000;
      case "m3": return micraRuns >= 1;
      case "m4": return trades >= 1;
      case "m5": return examPass >= 3;
      case "m6": return day >= 4;
      case "m7": return familyCount >= 1;
      case "m8": return ola >= 1000000 && iwa >= 65;
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
    if (authUser) pendingTurf.current += olaR;
    setDone((d) => [...d, id]);
    ensureAudio();
    coin();
    jot(`Day ${day}: mission complete — ${m.title}.`);
    push(`🏅 Mission complete: ${m.title}! +${naira(olaR)}, Iwa +${m.rewardIwa}.`);
  };

  const takeEvent = (ev: LifeEvent, optIdx: number) => {
    const o = ev.options[optIdx];
    if (o.ola < 0 && ola < -o.ola) {
      push(`You need ${naira(-o.ola)} for that. Pick the other option or hustle first.`);
      return;
    }
    setOla((x) => Math.max(0, x + o.ola));
    if (o.bond) setBond((b) => Math.max(0, Math.min(100, b + (o.bond ?? 0))));
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
    spendMinutes(MINUTES.chop);
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

  const restHome = (energy: number, msg: string, minutes: number = MINUTES.rest) => {
    setEnergy((e) => Math.min(100, e + energy));
    setRests((n) => n + 1);
    setNeeds((n) => ({ ...n, hunger: Math.min(100, n.hunger + 8) }));
    push(msg);
    spendMinutes(minutes);
  };

  // sleep through to 6 am; the bed's comfort decides how much energy comes back
  const sleep = (bonus: number) => {
    const mins = minutesUntilMorning(minuteRef.current);
    const hours = Math.round(mins / 60);
    const gain = hours >= 6 ? bonus : Math.round((bonus * hours) / 6);
    restHome(gain, `😴 Slept ${hours}h in your own bed, up at 6 am. Energy +${gain}.`, mins);
  };

  // freshen up + toilet (once per game day each)
  const freshen = () => {
    if (ola < PRICES.bucketBath) {
      push(`Freshen up na ${naira(PRICES.bucketBath)} — water no dey free.`);
      return;
    }
    if (lastFreshDay === day) {
      push("🚿 You don fresh already today. Shine go last.");
      return;
    }
    setOla((o) => o - PRICES.bucketBath);
    setLastFreshDay(day);
    setNeeds((n) => ({ ...n, hygiene: Math.min(100, n.hygiene + 30) }));
    ensureAudio();
    blip();
    push("🚿 Bucket bath + sponge. Hygiene +30. Fresh pikin.");
    spendMinutes(MINUTES.freshen);
  };
  const useToilet = () => {
    if (lastToiletDay === day) {
      push("🚻 Done already. Bladder clear.");
      return;
    }
    setLastToiletDay(day);
    setNeeds((n) => ({ ...n, toilet: Math.min(100, n.toilet + 40) }));
    push("🚻 Relieved. Toilet +40. No story.");
    spendMinutes(MINUTES.toilet);
  };

  // travel home the normal way (fare/energy apply), then stand at the district spawn
  const goHome = () => {
    setTab("map");
    if (node === bg.homeZone) {
      teleportTo(bg.homeZone, "spawn");
      push(`🏠 Back at ${bg.homeLabel}. Your room dey wait.`);
      return;
    }
    travelTo(bg.homeZone);
  };

  // ---- walkable scene actions ----
  const sceneDoor = (id: string) => {
    // shared doors (market trading, Mama Put's stall) open the same panels as before
    const shared = DOORS.find((d) => d.id === id);
    if (shared) {
      setDoorOpen(shared);
      return;
    }
    const part = partOfDay(minuteRef.current);
    const daytime = part === "morning" || part === "afternoon";
    if (id === "airport-terminal") {
      push("✈️ Departure hall: a few flights a week to Abuja and Lagos. Flying lands in a later update; for now, the interstate buses at Iwo Road go everywhere.");
      spendMinutes(MINUTES.greet);
      return;
    }
    if (id === "airport-watch") {
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 8) }));
      push("✈️ A turboprop roars down the runway and climbs over Alakia. Fun +8.");
      spendMinutes(MINUTES.greet * 2);
      return;
    }
    if (id === "park-relax") {
      setEnergy((e) => Math.min(100, e + 10));
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 15), social: Math.min(100, n.social + 5) }));
      push("🌳 You sit under the trees at the Olunloyo park. Energy +10, fun +15.");
      spendMinutes(60);
      return;
    }
    if (id === "rec-tennis") {
      if (!daytime) { push("🎾 The courts are closed for the night. Come back in the morning."); return; }
      if (ola < PRICES.clubGuestFee) { push(`🎾 Guest fee is ${naira(PRICES.clubGuestFee)}. You hold ${naira(ola)}.`); return; }
      setOla((o) => o - PRICES.clubGuestFee);
      setEnergy((e) => Math.max(5, e - 15));
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 20), social: Math.min(100, n.social + 8) }));
      addSkill("fitness", 25);
      meet("Coach Bisola");
      push(`🎾 An hour of tennis at the Recreation Club (−${naira(PRICES.clubGuestFee)}). Fitness +25 XP, fun +20.`);
      spendMinutes(120);
      return;
    }
    if (id === "golf-caddie") {
      if (!daytime) { push("⛳ No rounds after dark. Kabiru says come early."); return; }
      setEnergy((e) => Math.max(5, e - 15));
      addSkill("charisma", 10);
      meet("Chief on the green");
      earn(PRICES.caddieRound, 1, `⛳ You caddied a round for the Chief: +${naira(PRICES.caddieRound)}, Charisma +10 XP. He asked your name.`, undefined, 240);
      return;
    }
    if (id === "suya") {
      if (daytime) { push("🔥 Mallam Audu lights his grill in the evening. Come back after five."); return; }
      if (ola < PRICES.suyaPlate) { push(`🔥 Suya is ${naira(PRICES.suyaPlate)}. You hold ${naira(ola)}.`); return; }
      setOla((o) => o - PRICES.suyaPlate);
      setNeeds((n) => ({ ...n, hunger: Math.min(100, n.hunger + 25), fun: Math.min(100, n.fun + 5) }));
      meet("Mallam Audu");
      push(`🔥 Suya wrapped in paper with onions and yaji (−${naira(PRICES.suyaPlate)}). Hunger +25.`);
      spendMinutes(MINUTES.chop);
      return;
    }
    if (id === "alabaru") {
      if (!daytime) { push("🛒 The loading is done for the day."); return; }
      if (energy < 25) { push("🛒 Your back can't take loads right now. Chop or rest first."); return; }
      setEnergy((e) => Math.max(5, e - 15));
      addSkill("fitness", 20);
      meet("Baba Alabaru");
      earn(PRICES.alabaruTrip, 1, `🛒 You pushed cartons to the buses all morning as alabaru: +${naira(PRICES.alabaruTrip)}, Fitness +20 XP.`, undefined, 120);
      return;
    }
    if (id === "cold-room") {
      if (energy < 25) { push("🧊 Too tired to carry cartons. Chop or rest first."); return; }
      setEnergy((e) => Math.max(5, e - 15));
      addSkill("hustle", 15);
      meet("Madam Cold Room");
      earn(PRICES.coldRoomShift, 1, `🧊 Half a day carrying frozen fish cartons: +${naira(PRICES.coldRoomShift)}, Hustle +15 XP.`, undefined, 240);
      return;
    }
    if (id === "cocoa-look") {
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 6) }));
      push("🏢 Cocoa House rises 26 floors above Dugbe. Opened in 1965 with cocoa farmers' money, the first skyscraper in West Africa.");
      spendMinutes(MINUTES.greet);
      return;
    }
    if (id === "mall-cinema") {
      if (part === "night") { push("🎬 The last show has started. Come back tomorrow."); return; }
      if (ola < PRICES.cinemaTicket) { push(`🎬 A ticket is ${naira(PRICES.cinemaTicket)}. You hold ${naira(ola)}.`); return; }
      setOla((o) => o - PRICES.cinemaTicket);
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 25), social: Math.min(100, n.social + 6) }));
      push(`🎬 A Nollywood blockbuster at the Palms cinema (−${naira(PRICES.cinemaTicket)}). Fun +25.`);
      spendMinutes(150);
      return;
    }
    if (id === "lake-rest") {
      setEnergy((e) => Math.min(100, e + 12));
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 10) }));
      push("🌊 You sit by Eleyele reservoir and watch the fishermen. Energy +12, fun +10.");
      spendMinutes(60);
      return;
    }
    if (id === "agodi-picnic") {
      if (part === "night") { push("🌳 Agodi Gardens closes at dusk."); return; }
      if (ola < PRICES.agodiGate) { push(`🌳 Gate fee is ${naira(PRICES.agodiGate)}.`); return; }
      setOla((o) => o - PRICES.agodiGate);
      setEnergy((e) => Math.min(100, e + 15));
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 20), social: Math.min(100, n.social + 6) }));
      setRests((n) => n + 1);
      push(`🌳 An afternoon in Agodi Gardens (−${naira(PRICES.agodiGate)}). Energy +15, fun +20.`);
      spendMinutes(120);
      return;
    }
    if (id === "exam-hall") {
      setTab("exam");
      window.scrollTo({ top: 0 });
      return;
    }
    if (id === "premier-view") {
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 6) }));
      push("🏨 Premier Hotel sits on Mokola hill, built in the 1960s when Ibadan was capital of the Western Region. Fun +6.");
      spendMinutes(MINUTES.greet);
      return;
    }
    if (id === "lesson-tutor") {
      if (part !== "afternoon" && part !== "evening") { push("📚 The pupils come after school. Come back in the afternoon."); return; }
      if (energy < 20) { push("📚 You're too tired to teach. Chop or rest first."); return; }
      setEnergy((e) => Math.max(5, e - 10));
      addSkill("brain", 15);
      addSkill("charisma", 5);
      meet("Lesson teacher");
      earn(PRICES.lessonTutor, 1, `📚 You taught JAMB maths to six SS3 pupils: +${naira(PRICES.lessonTutor)}, Brain +15 XP.`, undefined, 120);
      return;
    }
    if (id === "print-shop") {
      if (!daytime) { push("🖨️ The printing shop has closed for the night."); return; }
      if (energy < 20) { push("🖨️ Too tired to stand at the machine. Chop or rest first."); return; }
      setEnergy((e) => Math.max(5, e - 12));
      addSkill("hustle", 10);
      meet("Printer boy");
      earn(PRICES.printShift, 1, `🖨️ You bound twelve final-year projects at Agbowo: +${naira(PRICES.printShift)}, Hustle +10 XP.`, undefined, 180);
      return;
    }
    if (id === "farm-help") {
      if (part !== "morning") { push("🌱 Farm work starts at dawn, before the sun gets hot. Come back in the morning."); return; }
      if (energy < 30) { push("🌱 Farm work needs strength. Chop or rest first."); return; }
      setEnergy((e) => Math.max(5, e - 20));
      addSkill("fitness", 20);
      meet("Farmer");
      earn(PRICES.farmDay, 1, `🌱 You cleared weeds and dug yams at Moniya: +${naira(PRICES.farmDay)}, Fitness +20 XP. The farmer gave you two tubers to take home.`, undefined, 300);
      return;
    }
    if (id === "akobo-estate") {
      meet("Estate gateman");
      push("🏘️ The gateman: \"Two-bedroom flat is going for about ₦900k a year, plus agent and caution fee. Mini flat is cheaper. Come back when you're ready.\"");
      spendMinutes(MINUTES.greet);
      return;
    }
    if (id === "clinic") {
      if (part === "night") { push("🏥 Outpatients is closed. Emergency only at this hour."); return; }
      if (ola < PRICES.clinicVisit) { push(`🏥 Card and consultation is ${naira(PRICES.clinicVisit)}. You hold ${naira(ola)}.`); return; }
      setOla((o) => o - PRICES.clinicVisit);
      setEnergy((e) => Math.min(100, e + 20));
      push(`🏥 The doctor checked your BP and gave you vitamins (−${naira(PRICES.clinicVisit)}). "Rest more, drink water." Energy +20.`);
      spendMinutes(120);
      return;
    }
    if (id === "aso-oke") {
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 8), social: Math.min(100, n.social + 4) }));
      meet("Aso-oke weaver");
      push("🧵 The shuttle clicks back and forth. Narrow strips of aso-oke grow by the hour, to be sewn into one cloth. Fun +8.");
      spendMinutes(MINUTES.greet * 2);
      return;
    }
    if (id === "mapo-view") {
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 12) }));
      push("🌇 From Mapo hill, rusted roofs run all the way to the horizon. Fun +12. This is Ibadan.");
      spendMinutes(MINUTES.greet * 2);
      return;
    }
    if (id === "micra-rank") {
      setTab("hustle");
      window.scrollTo({ top: 0 });
      push("🚐 Sani tosses you the keys: \"Load am full before you comot. Micra Rush is on.\"");
      return;
    }
    if (id === "help-mama-stall") {
      const part = partOfDay(minuteRef.current);
      if (part !== "morning" && part !== "afternoon") {
        push("🍲 Mama has packed up for the day. She's cooking at home in Beere this evening.");
        return;
      }
      familyDuty();
      return;
    }
    if (id === "mama-room" || id === "house") {
      setTab("ile");
      setIleView("room");
      return;
    }
    if (id === "daddy-veranda") {
      if (partOfDay(minuteRef.current) !== "evening") {
        push("👔 The veranda is empty. Daddy is at a site on Ring Road until evening.");
        return;
      }
      familyDuty(true);
      return;
    }
    if (id === "car") {
      if (!bg.hasCar) return;
      setTravelMode("car");
      document.getElementById("city-map")?.scrollIntoView({ behavior: "smooth", block: "start" });
      push("🚗 Musa opens the gate. Pick where you're driving on the map; fuel is already paid for today.");
      return;
    }
    if (id === "mama-pot") {
      if (partOfDay(minuteRef.current) !== "evening") {
        push("🍲 The pot is cold. Mama is at her Oja'ba stall until evening; Oja'ba is a short walk away.");
        return;
      }
      familyDuty(true);
      return;
    }
    if (id === "shop") {
      meet("Iya Basira");
      push("🛒 Iya Basira: \"Provisions don land. Milo, sugar, Indomie, everything. Your Mama's credit is still open.\"");
      spendMinutes(MINUTES.shop);
    }
  };
  const sceneTalk = (npcId: string, line: string) => {
    meet(npcId);
    setNeeds((n) => ({ ...n, social: Math.min(100, n.social + 6) }));
    push(`💬 ${npcId}: "${line}"`);
    spendMinutes(MINUTES.greet);
  };
  const sceneExit = (to: string) => {
    if (to === "map") {
      document.getElementById("city-map")?.scrollIntoView({ behavior: "smooth", block: "start" });
      push("🚏 At the bus stop. Pick where you're going on the map.");
      return;
    }
    travelTo(to);
  };

  const onAvatarZone = (id: string) => {
    setAvatarZone(id);
    recordVisit(id);
    const label = MAP_NODES.find((n) => n.id === id)?.name ?? id;
    const enter = ENTER_MAP[id];
    push(`🚶 You waka enter ${label}.${enter ? ` ${enter.label} →` : ""}`);
  };

  const teleportTo = (id: string, at: "spawn" | "arrive" = "arrive") => {
    if (streetSceneFor(id)) setSceneEntry((e) => ({ key: e.key + 1, at }));
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
    if (!shiftOpen(minuteRef.current, c.shiftHour)) {
      push(`💼 ${c.workplace} shift starts at ${formatTime(c.shiftHour * 60)}. It's ${formatTime(minuteRef.current)} now.`);
      return;
    }
    const level = careerLevels[c.id] ?? entryLevel(c.id, bg.connections);
    const pay = careerPay(c.id, level);
    setLastShiftDay(day);
    // a shift costs 20⚡ in total: 15 here + 5 from earn()
    setEnergy((e) => Math.max(5, e - 15));
    addSkill(c.skill, 20);
    earn(pay, 2, `💼 Shift complete: ${c.levels[level - 1].title} @ ${c.workplace}. +₦${pay.toLocaleString()}, ${c.skill} +20 XP.`, undefined, MINUTES.shift);
  };

  const promote = () => {
    const c = CAREERS.find((x) => x.id === careerId);
    if (!c) return;
    const level = careerLevels[c.id] ?? entryLevel(c.id, bg.connections);
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

  // ---- travel fares (micra per km from PRICES, 2⚡/km trek, car runs on daily fuel) ----
  const getDist = distanceKm;
  const micraFare = (km: number) => Math.round(km * PRICES.transport.micraFarePerKm);

  const travelTo = (id: string) => {
    if (id === node) {
      setNode(id);
      return;
    }
    const km = getDist(node, id);
    const label = MAP_NODES.find((n) => n.id === id)?.name ?? id;
    const tripMins = (mode: "trek" | "micra" | "car") =>
      Math.round(km * (TRANSPORT.find((t) => t.id === mode)?.minPerKm ?? 6)) + (mode === "micra" ? MINUTES.micraWait : 0);
    if (km <= 2) {
      setNode(id);
      setAvatarZone(id);
      recordVisit(id);
      teleportTo(id);
      push(`🚶 Short waka to ${label} — free, ${tripMins("trek")} min. Legs still dey.`);
      spendMinutes(tripMins("trek"));
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
      push(`🚶 Trekked ${km}km to ${label} in ${tripMins("trek")} min (−${cost}⚡). Free, but legs don hear am.`);
      spendMinutes(tripMins("trek"));
      return;
    }
    if (travelMode === "car" && bg.hasCar) {
      setEnergy((e) => Math.max(5, e - Math.round(km / 2)));
      setNode(id);
      setAvatarZone(id);
      recordVisit(id);
      teleportTo(id);
      push(`🚗 Drove to ${label}, ${km}km in ${tripMins("car")} min. Fuel is already paid for today.`);
      spendMinutes(tripMins("car"));
      return;
    }
    const fare = micraFare(km);
    if (ola < fare) {
      push(`🚐 Micra to ${label} na ${naira(fare)} (${km}km) — insufficient. Trek (free) or hustle first.`);
      return;
    }
    setOla((o) => o - fare);
    setEnergy((e) => Math.max(5, e - Math.round(km)));
    setNode(id);
    setAvatarZone(id);
    recordVisit(id);
    teleportTo(id);
    push(`🚐 Micra to ${label}, ${km}km — ${naira(fare)}, ${tripMins("micra")} min with the wait. Conductor shout your change complete.`);
    spendMinutes(tripMins("micra"));
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
    spendMinutes(MINUTES.spray);
  };
  const danceOwambe = () => {
    if (energy < 10) return;
    const fun = trait === "alaso" ? 18 : 15;
    const iw = trait === "nightowl" ? 2 : 1;
    setEnergy((e) => e - 10);
    setIwa((v) => Math.min(100, v + iw));
    setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + fun) }));
    push(`💃 You shut down the dance floor. Iwa +${iw}, fun +${fun}. Knees −10⚡.`);
    spendMinutes(MINUTES.dance);
  };

  // interstate terminal runs (Ajala discount applied in Terminal display)
  // one run per day, needs energy, and eats half the day
  const terminalBlocked =
    lastTerminalDay === day ? "One interstate run per day. The buses leave at dawn."
    : energy < TERMINAL_ENERGY ? `Too tired to travel (needs ${TERMINAL_ENERGY}⚡). Chop or rest first.`
    : null;
  const tripTerminal = (cost: number, gain: number, msg: string) => {
    if (terminalBlocked) {
      push(`🚌 ${terminalBlocked}`);
      return;
    }
    setLastTerminalDay(day);
    setOla((o) => Math.max(0, o - cost + gain));
    setEnergy((e) => Math.max(5, e - TERMINAL_ENERGY));
    setHoods((h) => ({ ...h, [myHood]: h[myHood] + gain }));
    if (authUser) pendingTurf.current += gain;
    jot(`Day ${day}: interstate run done — goods offloaded.`);
    push(msg);
    spendMinutes(MINUTES.interstate);
  };

  // daily hunt claim (one per weekday per real date)
  const claimDaily = (weekday: number, rewardOla: number, rewardIwa: number, title: string) => {
    const today = new Date().toDateString();
    setClaimedDaily((c) => ({ ...c, [weekday]: today }));
    const olaH = trait === "earlyriser" ? Math.round(rewardOla * 1.15) : rewardOla;
    setOla((o) => o + olaH);
    setIwa((v) => Math.min(100, v + rewardIwa));
    setHoods((h) => ({ ...h, [myHood]: h[myHood] + olaH }));
    if (authUser) pendingTurf.current += olaH;
    ensureAudio();
    coin();
    jot(`Day ${day}: cleared daily hunt — ${title}.`);
    push(`🎯 Daily hunt cleared: ${title}! +${naira(olaH)}, Iwa +${rewardIwa}. See you tomorrow.`);
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
    if (authUser) pendingTurf.current += olaD;
    setDone((x) => [...x, id]);
    const dl = DISTRICT_DEEDS.find((y) => y.id === id);
    if (dl) jot(`Day ${day}: sealed ${dl.title} for ${(MAP_NODES.find((nn) => nn.id === dl.zone)?.name ?? dl.zone)}.`);
    const label = MAP_NODES.find((n) => n.id === d.zone)?.name ?? d.zone;
    ensureAudio();
    coin();
    push(`🏅 Deed sealed in ${label}: ${d.title}! +${naira(olaD)}, Iwa +${d.rewardIwa}.`);
  };

  const answer = (idx: number) => {
    const q = examQuestion(qi);
    if (idx === q.answer) {
      setExamPass((n) => n + 1);
      meet("Ada");
      setNeeds((n) => ({ ...n, fun: Math.min(100, n.fun + 5) }));
      addSkill("brain", 25);
      const paidToday = exam.day === day ? exam.paid : 0;
      if (paidToday < EXAM_PAID_PER_DAY) {
        setExam({ day, paid: paidToday + 1 });
        earn(PRICES.examReward, 3, `✅ Exam correct! +${naira(PRICES.examReward)}, Iwa +3. (${q.q})`, "exam");
      } else {
        earn(0, 0, `✅ Correct, but Ada's tutorial money is done for today. Brain XP still counts. (${q.q})`, "exam");
      }
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
                  <div className="mb-1.5 text-[11px] font-extrabold tracking-widest text-mapo">02 · THE LIFE YOU&apos;RE BORN INTO</div>
                  {!bgId ? (
                    <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                      <p className="text-sm leading-relaxed text-cream/80">
                        Ibadan decides where you start. Most lives begin as <b>Omo Iya Lobe</b>, a soup seller&apos;s child in Beere.
                        About one in five begin as <b>Alowonle</b>, born into money in Old Bodija. One draw. No reroll.
                      </p>
                      <button onClick={drawLife} className="mt-3 w-full rounded-full bg-cream py-2.5 text-sm font-extrabold text-charcoal">
                        🎲 Draw my life
                      </button>
                    </div>
                  ) : (
                    <div aria-live="polite" className={`rounded-2xl p-4 ring-2 ${bg.id === "alowonle" ? "bg-[#1d2a5c] ring-[#3b5bd6]" : "bg-[#3a2416] ring-roof"}`}>
                      <div className="font-display text-2xl font-extrabold leading-tight">{bg.name}</div>
                      <div className="text-xs font-semibold text-cream/70">{bg.meaning} · {bg.tagline}</div>
                      <p className="mt-2 text-sm leading-relaxed text-cream/85">{bg.story}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-bold">
                        <span className="rounded-full bg-mapo px-2.5 py-1 text-charcoal">{naira(bg.pocket)} to start</span>
                        <span className="rounded-full bg-white/10 px-2.5 py-1">Iwa {bg.iwa}</span>
                        <span className="rounded-full bg-white/10 px-2.5 py-1">{bg.bondLabel} {bg.bond}</span>
                        {bg.hasCar && <span className="rounded-full bg-white/10 px-2.5 py-1">🚗 Own car</span>}
                      </div>
                      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                        <div>
                          <div className="font-bold text-cream/90">What you have</div>
                          <ul className="mt-1 space-y-1 text-cream/70">{bg.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
                        </div>
                        <div>
                          <div className="font-bold text-cream/90">What weighs on you</div>
                          <ul className="mt-1 space-y-1 text-cream/70">{bg.pressures.map((s) => <li key={s}>{s}</li>)}</ul>
                        </div>
                      </div>
                    </div>
                  )}
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
                <button onClick={start} disabled={!username.trim() || !bgId} className="w-full rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] py-3.5 font-display text-base font-extrabold text-charcoal shadow-lg disabled:opacity-40">
                  {bgId ? `Enter Ibadan as ${bg.name}` : "Enter Ibadan — draw your life first"}
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

  const q = examQuestion(qi);

  return (
    <main className="min-h-screen bg-cream bg-[radial-gradient(ellipse_at_top,#F5D9A8_0%,#FAF6F0_50%)] pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <div className="mx-auto max-w-6xl px-3 py-2 sm:px-4 sm:py-8">
        {/* Breadcrumb (wide screens; phones get a home link in the top bar) */}
        <nav className="mb-3 hidden items-center justify-between text-xs font-semibold text-charcoal/55 sm:flex">
          <span>
            <a href="/" className="hover:text-roof">Home</a>
            <span className="mx-1.5 opacity-50">/</span>
            <span className="text-charcoal">Play</span>
            <span className="mx-1.5 opacity-50">·</span>
            <span>{calendarFor(day).label}</span>
          </span>
          <a href="/how-to-play" className="hover:text-roof">How to play →</a>
        </nav>
        {/* HUD command bar */}
        <div className="sticky top-0 z-20 -mx-3 rounded-b-2xl bg-charcoal/95 px-3 pb-2.5 pt-2 text-cream shadow-[0_12px_30px_-16px_rgba(28,25,23,0.6)] ring-1 ring-white/10 backdrop-blur sm:top-3 sm:mx-0 sm:rounded-3xl sm:p-4 sm:shadow-[0_20px_50px_-16px_rgba(28,25,23,0.55)]">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
            <div className="min-w-0">
              <div className="font-display truncate text-[15px] font-extrabold tracking-tight sm:text-base"><a href="/" aria-label="Home" className="mr-1.5 text-cream/50 sm:hidden">←</a>@{username} <span className="text-mapo">· {title}</span></div>
              <div className="hidden text-xs text-cream/60 sm:block">{nodeName} · {bg.name} · {gender === "okunrin" ? "Ọkùnrin" : "Obìnrin"} · Age {ageOn(day)}</div>
              <div className="text-[11px] text-cream/60 sm:hidden">{nodeName} · Age {ageOn(day)}</div>
              <div className="mt-0.5 text-xs font-bold text-mapo" aria-label="Time">{{ morning: "🌅", afternoon: "☀️", evening: "🌇", night: "🌙" }[partOfDay(minute)]} {formatTime(minute)} · {calendarFor(day).weekday} {calendarFor(day).date} {calendarFor(day).month}</div>
            </div>
            <div className="-mx-1 flex w-full items-center gap-1.5 overflow-x-auto px-1 text-[13px] [scrollbar-width:none] sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0">
              <span className="shrink-0 rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] px-3 py-1 font-extrabold text-charcoal">{naira(ola)}</span>
              <span className="shrink-0 rounded-full bg-agodi px-3 py-1 font-bold text-white">🕊 {iwa}</span>
              <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 font-semibold">⚡{energy}</span>
              <span className="shrink-0 whitespace-nowrap rounded-full bg-white/15 px-3 py-1 font-semibold" title="Mood: from your energy and needs">{mood}</span>
              {onlineTotal > 0 && (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-white/15 px-3 py-1 font-semibold" title="Real players online now">🟢 {onlineTotal >= 1000 ? `${(onlineTotal / 1000).toFixed(1)}k` : onlineTotal} online</span>
              )}
              {walkLive.active && (
                <button onClick={() => setTab("rin")} className="rounded-full bg-agodi px-3 py-1 font-bold text-white" title="Walk in progress — tap to open">
                  🚶 {walkLive.steps.toLocaleString()} steps
                </button>
              )}
              <div className="shrink-0 sm:relative">
                <button onClick={() => setMenuOpen((o) => !o)} aria-label="Settings" className="rounded-full bg-white/15 px-3 py-1 font-semibold hover:bg-white/25">⚙️</button>
                {menuOpen && (
                  <div className="fixed inset-x-3 top-24 z-40 rounded-2xl bg-cream p-3 text-charcoal shadow-2xl ring-1 ring-roof/20 sm:absolute sm:inset-x-auto sm:right-0 sm:top-9 sm:w-56">
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
          <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
            {(["map", "hustle", "exam", "story", "ile", "ra", "owambe", "rin", "fonu", "ojude"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition ${tab === t ? "bg-cream text-charcoal shadow" : "bg-white/10 text-cream/75 hover:bg-white/15"}`}>
                {t === "map" && "🗺 Map"}{t === "hustle" && "🚐 Hustle"}{t === "exam" && "📝 Exam"}{t === "story" && "📖 Itan"}{t === "ile" && "🏠 Ilé"}{t === "ra" && "🛍️ Rà"}{t === "owambe" && "💃 Owambe"}{t === "rin" && "🚶 Rìn"}{t === "fonu" && "📱 Fọ́nu"}{t === "ojude" && "📣 Ojude"}
              </button>
            ))}
            <button onClick={chop} className="rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold hover:bg-white/15">🍲 Chop {naira(ECONOMY.CHOP_COST)}</button>
            <button onClick={goHome} className="rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold hover:bg-white/15">🏠 Go home</button>
          </div>
        </div>

        {/* Phones: bottom tab bar within thumb reach, the rest under "More" */}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-charcoal/95 pb-[env(safe-area-inset-bottom)] text-cream backdrop-blur sm:hidden" aria-label="Game tabs">
          <div className="grid grid-cols-5">
            {([["map", "🗺", "Map"], ["hustle", "🚐", "Hustle"], ["ile", "🏠", "Ilé"], ["story", "📖", "Itan"]] as [Tab, string, string][]).map(([t, icon, label]) => (
              <button
                key={t}
                aria-label={`${icon} ${label}`}
                onClick={() => { setTab(t); setMoreOpen(false); window.scrollTo({ top: 0 }); }}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${tab === t && !moreOpen ? "text-mapo" : "text-cream/70"}`}
              >
                <span className="text-xl leading-none">{icon}</span>
                {label}
              </button>
            ))}
            <button
              onClick={() => setMoreOpen((o) => !o)}
              aria-label="More"
              aria-expanded={moreOpen}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${moreOpen || ["exam", "ra", "owambe", "rin", "fonu", "ojude"].includes(tab) ? "text-mapo" : "text-cream/70"}`}
            >
              <span className="text-xl leading-none">☰</span>
              More
            </button>
          </div>
        </nav>
        {moreOpen && (
          <div className="fixed inset-0 z-20 bg-charcoal/50 sm:hidden" onClick={() => setMoreOpen(false)}>
            <div className="absolute inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] rounded-t-3xl bg-cream p-4 pb-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-3 gap-2">
                {([["exam", "📝 Exam"], ["ra", "🛍️ Rà"], ["owambe", "💃 Owambe"], ["rin", "🚶 Rìn"], ["fonu", "📱 Fọ́nu"], ["ojude", "📣 Ojude"]] as [Tab, string][]).map(([t, label]) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setMoreOpen(false); window.scrollTo({ top: 0 }); }}
                    className={`rounded-2xl px-2 py-3 text-sm font-bold ring-1 ${tab === t ? "bg-charcoal text-cream ring-charcoal" : "bg-white ring-roof/15"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={() => { chop(); setMoreOpen(false); }} className="rounded-2xl bg-white px-3 py-3 text-sm font-bold ring-1 ring-roof/15">🍲 Chop {naira(ECONOMY.CHOP_COST)}</button>
                <button onClick={() => { goHome(); setMoreOpen(false); }} className="rounded-2xl bg-white px-3 py-3 text-sm font-bold ring-1 ring-roof/15">🏠 Go home</button>
              </div>
            </div>
          </div>
        )}

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
              if (ola < PRICES.food.mamaSpecial) {
                push(`Mama Special na ${naira(PRICES.food.mamaSpecial)} — hustle come back.`);
                return;
              }
              setOla((o) => o - PRICES.food.mamaSpecial);
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
              if (ola < PRICES.barberLowcut) {
                push(`Lowcut na ${naira(PRICES.barberLowcut)} — clippers no dey on credit.`);
                return;
              }
              setOla((o) => o - PRICES.barberLowcut);
              setLook((l) => ({ ...l, gear: "none" }));
              setIwa((v) => Math.min(100, v + 1));
              push("💈 Fresh lowcut! Mirror confesses: fine pikin. Iwa +1.");
            }}
            onWatch={() => {
              if (ola < PRICES.viewingCentre) {
                push(`Gate fee na ${naira(PRICES.viewingCentre)}. No free match.`);
                return;
              }
              setOla((o) => o - PRICES.viewingCentre);
              setEnergy((e) => Math.max(5, e - 5));
              if (viewDay !== day) {
                setViewDay(day);
                setIwa((v) => Math.min(100, v + 2));
                push(`📺 WHAT A GOAL! You hug strangers. Iwa +2. Best ${naira(PRICES.viewingCentre)} this week.`);
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
              <Terminal ola={ola} onTrip={tripTerminal} blocked={terminalBlocked} fareMult={trait === "ajala" ? 0.85 : 1} />
            )}
            {doorOpen.action === "exam" && (
              <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10">
                <h3 className="font-display text-base font-extrabold tracking-tight">📝 Exam hall — live desk</h3>
                <p className="text-xs text-charcoal/55">Same desk, same brain. +{naira(PRICES.examReward)} + Iwa +3 per pass.</p>
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
                {streetSceneFor(avatarZone) ? (
                  <StreetScene
                    scene={streetSceneFor(avatarZone)!}
                    minute={minute}
                    player={playerSpec({ gender, skin: look.skin, top: topColor, gear })}
                    entry={sceneEntry}
                    npcMeets={Object.fromEntries(Object.entries(npc).map(([k, v]) => [k, v.meets]))}
                    onDoor={sceneDoor}
                    onExit={sceneExit}
                    onTalk={sceneTalk}
                  />
                ) : hasScene(avatarZone) ? (
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
                ) : (
                  <div className="rounded-2xl bg-white/[0.06] p-6 text-center text-sm text-cream/80 ring-1 ring-white/10">
                    You are in <b>{MAP_NODES.find((n) => n.id === avatarZone)?.name ?? avatarZone}</b>. Its street is being built; use the map below to move on.
                  </div>
                )}
              </div>
              <div id="city-map" className="rounded-3xl bg-white p-4 shadow-[0_16px_40px_-20px_rgba(122,74,43,0.35)] ring-1 ring-roof/10 sm:p-5">
                <h3 className="font-display text-base font-extrabold tracking-tight">🗺 Ibadan</h3>
                <p className="mb-2 text-xs text-charcoal/55">Real roads, real distances. Micra about {naira(PRICES.transport.micraFarePerKm)}/km, trek free but tiring{bg.hasCar ? ", your car runs on the day's fuel" : ""}. ≤2km na free waka.</p>
                <div className="mb-3 flex gap-1.5 rounded-full bg-cream p-1 text-xs font-bold ring-1 ring-roof/10">
                  {bg.hasCar && (
                    <button onClick={() => setTravelMode("car")} className={`flex-1 rounded-full py-1.5 ${travelMode === "car" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>🚗 Car</button>
                  )}
                  <button onClick={() => setTravelMode("micra")} className={`flex-1 rounded-full py-1.5 ${travelMode === "micra" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>🚐 Micra</button>
                  <button onClick={() => setTravelMode("trek")} className={`flex-1 rounded-full py-1.5 ${travelMode === "trek" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>🚶 Trek (free)</button>
                </div>
                <CityMap
                  current={node}
                  playable={(id) => hasScene(id) || !!streetSceneFor(id)}
                  fareFor={(id) => {
                    const km = getDist(node, id);
                    if (km <= 2) return "short waka · free";
                    if (travelMode === "car" && bg.hasCar) return "🚗 your car";
                    return travelMode === "trek" ? `🚶 ${Math.round(km * 2)}⚡` : `🚐 ${naira(micraFare(km))}`;
                  }}
                  onTravel={(id) => travelTo(id)}
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
                  const level = c ? (careerLevels[c.id] ?? entryLevel(c.id, bg.connections)) : 1;
                  const next = c && level < 5 ? c.levels[level] : null;
                  const haveXp = c ? (skills[c.skill]?.level ?? 0) : 0;
                  return (
                    <div className="mt-3">
                      <select
                        value={careerId ?? ""}
                        onChange={(e) => {
                          setCareerId(e.target.value || null);
                          const nc = CAREERS.find((x) => x.id === e.target.value);
                          if (nc) {
                            const lv = careerLevels[nc.id] ?? entryLevel(nc.id, bg.connections);
                            const via = lv > 1 ? (bg.id === "alowonle" ? " Daddy made a call." : " Mama's people vouched for you.") : "";
                            push(`💼 You sign up as ${nc.levels[lv - 1].title} — ${nc.name} @ ${nc.workplace}. Shift pays ${naira(nc.levels[lv - 1].pay)}.${via}`);
                          }
                        }}
                        className="w-full rounded-2xl bg-white/10 px-3 py-2.5 text-sm font-bold outline-none focus:border-mapo"
                      >
                        <option value="">— Pick your hustle —</option>
                        {CAREERS.map((x) => (
                          <option key={x.id} value={x.id} className="text-charcoal">
                            {x.name} · {x.workplace} · {naira(x.levels[entryLevel(x.id, bg.connections) - 1].pay)}/shift{bg.connections.includes(x.id) ? " · connection" : ""}
                          </option>
                        ))}
                      </select>
                      {c && (
                        <div className="mt-3 rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                          <div className="text-sm font-bold">{c.levels[level - 1].title} <span className="font-semibold text-cream/60">· Lv{level}/5 · {c.name}</span></div>
                          <div className="text-xs text-cream/60">{c.blurb} · shift: {naira(careerPay(c.id, level))} · −20⚡ · +20 {c.skill} XP</div>
                          <div className="mt-1.5">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span>{SKILLS.find((s) => s.id === c.skill)?.icon} {c.skill} Lv{haveXp}</span>
                              <span className="opacity-60">{skills[c.skill]?.xp ?? 0}/{xpToNext(c.skill, haveXp)} XP</span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-mapo" style={{ width: `${Math.min(100, ((skills[c.skill]?.xp ?? 0) / xpToNext(c.skill, haveXp)) * 100)}%` }} />
                            </div>
                          </div>
                          <div className="mt-2.5 flex gap-2">
                            <button onClick={workShift} disabled={lastShiftDay === day} className="flex-1 rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] py-2 text-sm font-extrabold text-charcoal disabled:opacity-40">
                              {lastShiftDay === day ? "Shift done ✅" : `Work shift −20⚡ · starts ${formatTime(c.shiftHour * 60)}, 8h`}
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
                                <div className="h-full rounded-full bg-mapo/70" style={{ width: `${Math.min(100, ((skills[s.id]?.xp ?? 0) / xpToNext(s.id, skills[s.id]?.level ?? 0)) * 100)}%` }} />
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
              <Terminal ola={ola} onTrip={tripTerminal} blocked={terminalBlocked} fareMult={trait === "ajala" ? 0.85 : 1} />
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
              <p className="text-xs text-charcoal/55">+{naira(PRICES.examReward)} + Iwa +3 per pass</p>
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
                  player={playerSpec({ gender, skin: look.skin, top: topColor, gear })}
                  night={partOfDay(minute) === "night"}
                  onSleep={() => {
                    const bonus = 40 + home.furniture.reduce((s, id) => s + (FURNITURE.find((f) => f.id === id)?.rest ?? 0), 0);
                    sleep(bonus);
                  }}
                />
              </div>
            )}
            {ileView === "compound" && (
              <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10 sm:p-5">
                <h3 className="font-display text-base font-extrabold tracking-tight">🏘️ Your compound</h3>
                <p className="mb-3 text-xs text-charcoal/55">{bg.homeLabel}. Same yard, same people as on the map.</p>
                {streetSceneFor(bg.homeZone) && (
                  <StreetScene
                    scene={streetSceneFor(bg.homeZone)!}
                    minute={minute}
                    player={playerSpec({ gender, skin: look.skin, top: topColor, gear })}
                    entry={sceneEntry}
                    npcMeets={Object.fromEntries(Object.entries(npc).map(([k, v]) => [k, v.meets]))}
                    onDoor={sceneDoor}
                    onExit={sceneExit}
                    onTalk={sceneTalk}
                  />
                )}
                <button
                  onClick={() => {
                    if (lastGreetDay === day) return;
                    setLastGreetDay(day);
                    setIwa((v) => Math.min(100, v + 2));
                    meet("Elder");
                    setNeeds((n) => ({ ...n, social: Math.min(100, n.social + 8) }));
                    push(`🙏 You ${gender === "okunrin" ? "dobale" : "kunle"} for the elder. "${address(gender, "elder")}" Iwa +2.`);
                  }}
                  disabled={lastGreetDay === day}
                  className="mt-2 w-full rounded-full bg-charcoal py-2.5 text-sm font-bold text-cream disabled:opacity-40"
                >
                  {lastGreetDay === day ? "✅ Elder greeted today. Ẹ ṣeun, ọmọ mi." : `🙏 ${gender === "okunrin" ? "Dobale" : "Kunle"}: greet the elder (+2 Iwa, once daily)`}
                </button>
              </div>
            )}
            {ileView === "street" && (
              <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10 sm:p-5">
                <h3 className="font-display text-base font-extrabold tracking-tight">🛣️ Your street</h3>
                <p className="mb-3 text-xs text-charcoal/55">The shops on your street. Step inside any of them.</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {([["food", "🍲 Mama Put's buka"], ["provisions", "🧃 Provisions shop"], ["barber", "💈 Barber"], ["viewing", "📺 Viewing centre"], ["boutique", "👗 Boutique"]] as [ShopKind, string][]).map(([k, label]) => (
                    <button key={k} onClick={() => setShopEntry(k)} className="rounded-2xl bg-cream px-3 py-3 text-left text-sm font-bold ring-1 ring-roof/15 hover:bg-mapo/20">
                      {label} →
                    </button>
                  ))}
                </div>
                <button onClick={() => { goHome(); setTab("map"); }} className="mt-2 w-full rounded-full bg-charcoal py-2.5 text-sm font-bold text-cream">🚶 Step out to your street</button>
              </div>
            )}
            <HomeTab
              bgId={bg.id}
              bgName={bg.name}
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
                    <span className="text-xs font-semibold text-cream/60">+{naira(hunt.rewardOla)} · Iwa +{hunt.rewardIwa} · once daily</span>
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
                        <span className="text-xs font-semibold text-charcoal/60">+{naira(m.rewardOla)} · Iwa +{m.rewardIwa}</span>
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
                        <span className="text-xs font-semibold text-charcoal/60">+{naira(d.rewardOla)} · Iwa +{d.rewardIwa}</span>
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
                <p className="mt-1 text-sm text-charcoal/65">Your code: <b className="text-roof">{myCode}</b> · You +{naira(ECONOMY.REFERRAL_GIVER)}/friend (max {ECONOMY.REFERRAL_WEEKLY_CAP}/week) · Friend +{naira(ECONOMY.REFERRAL_JOINER_EXTRA)}. Virtual only.</p>
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
                <button onClick={freshen} className="rounded-full bg-white/10 px-2 py-1.5 text-[11px] font-bold hover:bg-white/15">🚿 Freshen {naira(PRICES.bucketBath)}</button>
                <button onClick={useToilet} className="rounded-full bg-white/10 px-2 py-1.5 text-[11px] font-bold hover:bg-white/15">🚻 Toilet</button>
              </div>
              <div className="mt-2 text-xs text-cream/55">{{ morning: "🌅", afternoon: "☀️", evening: "🌇", night: "🌙" }[partOfDay(minute)]} {formatTime(minute)}, {calendarFor(day).label} · {nodeName}</div>
            </div>
            <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10">
              <h3 className="font-display text-base font-extrabold tracking-tight">{bg.id === "alowonle" ? "👔 Family" : "🍲 Family"}</h3>
              <p className="text-xs text-charcoal/55">{bg.name} · {bg.homeLabel}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                <span>{bg.bondLabel}</span>
                <span className={bond < 30 ? "text-red-600" : "text-charcoal/60"}>{bond}</span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-charcoal/10">
                <div className={`h-full rounded-full ${bond < 30 ? "bg-red-500" : "bg-agodi"}`} style={{ width: `${bond}%` }} />
              </div>
              {bg.allowancePerWeek > 0 && (
                <p className="mt-1 text-[11px] text-charcoal/55">
                  Allowance {naira(bg.allowancePerWeek)} every 7th day while approval stays at {bg.allowanceMinBond}+.
                </p>
              )}
              <button
                onClick={() => familyDuty()}
                disabled={lastFamilyDay === day}
                className="mt-2 w-full rounded-full bg-charcoal py-2 text-xs font-bold text-cream disabled:opacity-40"
              >
                {lastFamilyDay === day
                  ? "Family duty done today ✅"
                  : bg.id === "alowonle"
                    ? "Sit in on Daddy's site meeting (−15⚡)"
                    : "Help Mama at the stall (−15⚡)"}
              </button>
              {bg.obligations.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {bg.obligations.map((o) => {
                    const paid = paidObligations.includes(o.id);
                    const late = !paid && day > o.dueDay;
                    return (
                      <div key={o.id} className={`rounded-2xl p-2.5 text-xs ring-1 ${late ? "bg-red-50 ring-red-200" : "bg-cream ring-roof/10"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold">{o.title}</div>
                            <div className="text-charcoal/60">{paid ? "Paid ✅" : `${naira(o.amount)} · ${late ? `overdue since Day ${o.dueDay}` : `due Day ${o.dueDay}`}`}</div>
                          </div>
                          {!paid && (
                            <button onClick={() => payObligation(o.id)} disabled={ola < o.amount} className="shrink-0 rounded-full bg-mapo px-3 py-1 font-bold text-charcoal disabled:opacity-40">
                              Pay
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                        <div className="text-[11px] text-charcoal/55">+{naira(m.rewardOla)} · Iwa +{m.rewardIwa}</div>
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
