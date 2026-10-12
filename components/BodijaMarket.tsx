"use client";

import { useState } from "react";
import { PRICES, naira } from "@/lib/game";

const M = PRICES.market;

export default function BodijaMarket({
  ola,
  onTrade,
}: {
  ola: number;
  onTrade: (deltaOla: number, deltaIwa: number, msg: string) => void;
}) {
  const [stock, setStock] = useState(0);
  const [ask, setAsk] = useState<number>(M.askStart);
  const [mood, setMood] = useState(80);
  const [log, setLog] = useState(`Buy at Oja Oba ${naira(M.stockBag)}, sell in Bodija. Customer mood 80.`);

  const buy = () => {
    if (ola < M.stockBag) {
      setLog("Ola no reach to buy stock. Go run Micra first.");
      return;
    }
    setStock(stock + 1);
    onTrade(-M.stockBag, 0, `Bought stock Oja Oba -${naira(M.stockBag)}`);
    setLog("Bought 1 bag Oja Oba. Carry go Bodija.");
  };

  const haggle = (dir: 1 | -1) => {
    setAsk(Math.max(M.askMin, Math.min(M.askMax, ask + dir * M.haggleStep)));
  };

  const sell = () => {
    if (stock <= 0) {
      setLog("No stock to sell. Buy first.");
      return;
    }
    // Customer accepts if ask <= fairBase + mood * moodStep, else walks + mood drops
    const fair = M.fairBase + mood * M.moodStep;
    if (ask <= fair) {
      setStock(stock - 1);
      setMood(Math.min(100, mood + 5));
      onTrade(ask, 2, `Sold Bodija +${naira(ask)}. Iwa +2.`);
      setLog(`✅ "Oga, last price!" accepted at ${naira(ask)}. Customer happy.`);
      setAsk(M.askStart);
    } else {
      setMood(Math.max(10, mood - 15));
      onTrade(0, -1, "Customer walk away. Iwa -1.");
      setLog(`🚶 Customer walk away! "Ole!" Too cost. Mood ${mood - 15}. Lower price.`);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <h3 className="font-display text-lg font-bold">🧺 Bodija Price War</h3>
      <p className="mt-1 text-sm text-charcoal/70">{log}</p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>Stock: <b>{stock}</b></span>
        <span>Ask: <b>{naira(ask)}</b></span>
        <span>Mood: <b>{mood}</b> 🙂</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={buy} className="rounded-full bg-roof px-4 py-2 text-sm font-bold text-cream">Buy Oja Oba {naira(M.stockBag)}</button>
        <button onClick={() => haggle(-1)} className="rounded-full bg-cream px-4 py-2 text-sm font-bold">-{naira(M.haggleStep)}</button>
        <button onClick={() => haggle(1)} className="rounded-full bg-cream px-4 py-2 text-sm font-bold">+{naira(M.haggleStep)}</button>
        <button onClick={sell} className="rounded-full bg-agodi px-4 py-2 text-sm font-bold text-white">Sell Bodija</button>
      </div>
    </div>
  );
}
