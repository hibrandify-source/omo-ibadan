"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import CompoundView, { type CompoundTemplate } from "./CompoundView";
import { hasWebGL } from "@/lib/webgl";

const Compound3D = dynamic(() => import("./Compound3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-2xl bg-black text-sm text-cream/70">
      Opening your compound in 3D…
    </div>
  ),
});

function Toggle({ mode, setMode }: { mode: "3d" | "2d"; setMode: (m: "3d" | "2d") => void }) {
  return (
    <div className="mb-2 flex items-center justify-end">
      <div className="flex gap-1 rounded-full bg-cream p-0.5 text-[11px] font-bold ring-1 ring-roof/15">
        <button onClick={() => setMode("3d")} className={`rounded-full px-3 py-1 ${mode === "3d" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>3D compound</button>
        <button onClick={() => setMode("2d")} className={`rounded-full px-3 py-1 ${mode === "2d" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>2D view</button>
      </div>
    </div>
  );
}

export default function CompoundCard({
  compound,
  greeted,
  onGreet,
}: {
  compound: CompoundTemplate;
  greeted: boolean;
  onGreet: () => void;
}) {
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  useEffect(() => {
    if (!hasWebGL()) setMode("2d");
  }, []);
  const template: CompoundTemplate = compound;
  const blurb =
    template === "courtyard"
      ? "Old-city courtyard — well, elders' tree, everybody knows everybody."
      : template === "gra"
        ? "Old Bodija calm — fence, gate, gateman, green grass."
        : "Face-me block — corridor gist, shared tap.";
  return (
    <div>
      <Toggle mode={mode} setMode={setMode} />
      {mode === "3d" ? (
        <div className="space-y-2">
          <Compound3D template={template} saver={false} />
          <button
            onClick={onGreet}
            disabled={greeted}
            className="w-full rounded-full bg-charcoal py-2.5 text-sm font-bold text-cream disabled:opacity-40"
          >
            {greeted ? "✅ Elder greeted today — Ẹ ṣeun, ọmọ mi." : "🙏 Dobale — greet the elder (+2 Iwa, once daily)"}
          </button>
        </div>
      ) : (
        <CompoundView template={template} greeted={greeted} onGreet={onGreet} />
      )}
      <p className="mt-2 text-xs text-charcoal/55">{blurb}</p>
    </div>
  );
}
