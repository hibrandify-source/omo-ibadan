"use client";

// Iwo motor-park terminal — our answer to their airport: ticketing hall,
// route boards, white interstate buses. Pay fare, ride out, return with
// goods to offload. Costs energy (travel tires you).
const ROUTES = [
  { id: "ife", city: "Ife", fare: 800, lo: 1000, hi: 1350, time: "45 min", blurb: "Bronze heads, short trip. Sharp returns." },
  { id: "lagos", city: "Lagos", fare: 1500, lo: 1800, hi: 2450, time: "2 hrs", blurb: "Island goods, mainland prices. The classic run." },
  { id: "abuja", city: "Abuja", fare: 3000, lo: 3600, hi: 4600, time: "8 hrs", blurb: "Capital contracts. Big fare, bigger margin." },
];

export default function Terminal({
  ola,
  onTrip,
  fareMult,
}: {
  ola: number;
  onTrip: (cost: number, gain: number, msg: string) => void;
  fareMult?: number;
}) {
  const fare = (r: (typeof ROUTES)[number]) => Math.round(r.fare * (fareMult ?? 1));
  const ride = (r: (typeof ROUTES)[number]) => {
    if (ola < fare(r)) return;
    const gain = r.lo + Math.floor(Math.random() * (r.hi - r.lo));
    onTrip(
      fare(r),
      gain,
      `🚌 White bus to ${r.city} and back (−₦${fare(r).toLocaleString()}, −15⚡). Offloaded goods for +₦${gain.toLocaleString()}.`
    );
  };
  return (
    <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10 sm:p-5">
      <svg viewBox="0 0 300 96" className="block h-auto w-full" role="img" aria-label="Iwo park terminal with white buses">
        <rect x="0" y="0" width="300" height="96" fill="#e8e2d4" />
        <rect x="0" y="66" width="300" height="30" fill="#24211d" />
        <line x1="0" y1="81" x2="300" y2="81" stroke="#F5D9A8" strokeWidth="2" strokeDasharray="10 10" />
        {/* terminal block */}
        <rect x="8" y="18" width="90" height="48" fill="#EDE3D2" />
        <rect x="8" y="18" width="90" height="12" fill="#1F7A4D" />
        <text x="53" y="27" fontSize="8" fill="#fff" fontWeight="bold" textAnchor="middle">IWO TERMINAL</text>
        <rect x="16" y="38" width="30" height="20" fill="#5c3a24" />
        <rect x="52" y="38" width="38" height="20" fill="#1C1917" />
        <text x="71" y="46" fontSize="6" fill="#F5C518" fontWeight="bold" textAnchor="middle">LAGOS</text>
        <text x="71" y="54" fontSize="6" fill="#F5C518" fontWeight="bold" textAnchor="middle">IFE·ABUJA</text>
        {/* white buses */}
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${130 + i * 82},50)`}>
            <rect x="-32" y="-12" width="64" height="26" rx="4" fill="#F2EDE4" />
            <rect x="-32" y="-2" width="64" height="5" fill="#1F7A4D" />
            <rect x="-26" y="-9" width="52" height="7" fill="#334155" />
            <circle cx="-20" cy="16" r="6" fill="#111" />
            <circle cx="20" cy="16" r="6" fill="#111" />
          </g>
        ))}
      </svg>
      <h3 className="font-display mt-2 text-base font-extrabold tracking-tight">🚌 Iwo Park Terminal — interstate runs</h3>
      <p className="text-xs text-charcoal/55">White buses, route boards, Lagos traffic. Each run costs 15⚡ — travel tires you.</p>
      <div className="mt-3 grid gap-2">
        {ROUTES.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2 rounded-2xl bg-cream px-3.5 py-2.5 ring-1 ring-roof/10">
            <div>
              <div className="text-sm font-bold">{r.city} <span className="text-xs font-semibold text-charcoal/50">· {r.time}</span></div>
              <div className="text-xs text-charcoal/60">{r.blurb}</div>
              <div className="text-xs font-semibold">₦{fare(r).toLocaleString()} fare → ₦{r.lo.toLocaleString()}–₦{r.hi.toLocaleString()} goods</div>
            </div>
            <button
              onClick={() => ride(r)}
              disabled={ola < fare(r)}
              className="shrink-0 rounded-full bg-charcoal px-4 py-2 text-xs font-bold text-cream disabled:opacity-35"
            >
              Board →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
