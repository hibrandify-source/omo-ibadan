"use client";

// The real Ibadan map from the game, as a preview: tapping a district opens the game.

import { useRouter } from "next/navigation";
import CityMap from "@/components/CityMap";

export default function MapPreview() {
  const router = useRouter();
  return <CityMap current="beere" fareFor={() => "open the game"} playable={() => true} onTravel={() => router.push("/play")} />;
}
