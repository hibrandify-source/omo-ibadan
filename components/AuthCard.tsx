"use client";

import { useState } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

// Email sign-in, no passwords. The email carries a sign-in link (back to /play)
// and, when the project uses custom SMTP with {{ .Token }} in the template, a
// 6-digit code too. Either works. Renders inside HUD settings.
export default function AuthCard({
  user,
  onAuth,
}: {
  user: { id: string; email: string } | null;
  onAuth: (u: { id: string; email: string } | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <p className="px-1 pt-2 text-[11px] leading-relaxed text-charcoal/55">
        🔐 Accounts need one-time setup (free): see <b>supabase/README.md</b>. Game plays fully offline till then.
      </p>
    );
  }

  if (user) {
    return (
      <div className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-roof/10">
        <div className="text-xs font-bold">🔐 {user.email}</div>
        <div className="text-[11px] text-agodi font-semibold">Cloud save ON · global turf counting</div>
        <button
          onClick={async () => {
            setBusy(true);
            await getSupabase()?.auth.signOut();
            onAuth(null);
            setBusy(false);
          }}
          disabled={busy}
          className="mt-2 w-full rounded-full bg-charcoal/10 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
        >
          Sign out (keep playing locally)
        </button>
        {msg && <p className="mt-1 text-[11px] text-charcoal/60">{msg}</p>}
      </div>
    );
  }

  const send = async () => {
    if (!email.includes("@")) {
      setMsg("Enter correct email first.");
      return;
    }
    setBusy(true);
    setMsg("");
    const { error } = (await getSupabase()?.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/play` },
    })) ?? { error: new Error("no backend") };
    setBusy(false);
    if (error) {
      setMsg("Could not send the email. Check your network, or wait a few minutes and try again.");
      return;
    }
    setStage("code");
    setMsg("Email sent (check spam too). Tap the sign-in link in it, in this same browser, or type the code if it has one.");
  };

  const verify = async () => {
    if (code.trim().length < 6) {
      setMsg("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    setMsg("");
    const { data, error } = (await getSupabase()?.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    })) ?? { data: { user: null }, error: new Error("no backend") };
    setBusy(false);
    if (error || !data.user) {
      setMsg("Wrong/expired code — resend and try again.");
      return;
    }
    onAuth({ id: data.user.id, email: data.user.email ?? email.trim() });
    setMsg("");
  };

  return (
    <div className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-roof/10">
      <div className="text-[11px] font-extrabold tracking-widest text-charcoal/50">ACCOUNT · CLOUD SAVE</div>
      {stage === "email" ? (
        <div className="mt-2 flex gap-1.5">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            inputMode="email"
            className="w-full rounded-full bg-cream px-3 py-2 text-xs ring-1 ring-roof/10 outline-none"
          />
          <button onClick={send} disabled={busy} className="shrink-0 rounded-full bg-charcoal px-4 py-2 text-xs font-bold text-cream disabled:opacity-40">
            {busy ? "…" : "Email me →"}
          </button>
        </div>
      ) : (
        <div className="mt-2 flex gap-1.5">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code (if your email has one)"
            inputMode="numeric"
            className="w-full rounded-full bg-cream px-3 py-2 text-xs ring-1 ring-roof/10 outline-none"
          />
          <button onClick={verify} disabled={busy} className="shrink-0 rounded-full bg-agodi px-4 py-2 text-xs font-bold text-white disabled:opacity-40">
            {busy ? "…" : "Join"}
          </button>
        </div>
      )}
      {stage === "code" && (
        <button onClick={() => setStage("email")} className="mt-1 text-[11px] font-bold text-charcoal/50">
          ← change email
        </button>
      )}
      {msg && <p className="mt-1 text-[11px] text-charcoal/60">{msg}</p>}
    </div>
  );
}
