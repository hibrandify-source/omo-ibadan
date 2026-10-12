"use client";

import { useState } from "react";
import { ECONOMY } from "@/lib/game";

export default function BodijaMarket({
  ola,
  onTrade,
}: {
  ola: number;
  onTrade: (deltaOla: number, deltaIwa: number, msg: string) => void;
}) {
  const [stock, setStock] = useState(0);
  const [ask, setAsk] = useState(600);
  const [mood, setMood] = useState(80);
  const [log, setLog] = useState("Buy at Oja Oba ₦400, sell in Bodija. Customer mood 80.");

  const buy = () => {
    if (ola < ECONOMY.MARKET_BUY_LOW) {
      setLog("Ola no reach to buy stock. Go run Micra first.");
      return;
    }
    setStock(stock + 1);
    onTrade(-ECONOMY.MARKET_BUY_LOW, 0, "Bought stock Oja Oba -₦400");
    setLog("Bought 1 bag Oja Oba. Carry go Bodija.");
  };

  const haggle = (dir: 1 | -1) => {
    setAsk(Math.max(400, Math.min(900, ask + dir * 25)));
  };

  const sell = () => {
    if (stock <= 0) {
      setLog("No stock to sell. Buy first.");
      return;
    }
    // Customer accepts if ask <= 650 + mood/10, else walks + mood drops
    const fair = 650 + Math.floor(mood / 10);
    if (ask <= fair) {
      setStock(stock - 1);
      setMood(Math.min(100, mood + 5));
      onTrade(ask, 2, `Sold Bodija +₦${ask}. Iwa +2.`);
      setLog(`✅ "Oga, last price!" accepted at ₦${ask}. Customer happy.`);
      setAsk(600);
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
        <span>Ask: <b>₦{ask}</b></span>
        <span>Mood: <b>{mood}</b> 🙂</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={buy} className="rounded-full bg-roof px-4 py-2 text-sm font-bold text-cream">Buy Oja Oba ₦400</button>
        <button onClick={() => haggle(-1)} className="rounded-full bg-cream px-4 py-2 text-sm font-bold">-₦25</button>
        <button onClick={() => haggle(1)} className="rounded-full bg-cream px-4 py-2 text-sm font-bold">+₦25</button>
        <button onClick={sell} className="rounded-full bg-agodi px-4 py-2 text-sm font-bold text-white">Sell Bodija</button>
      </div>
    </div>
  );
}
