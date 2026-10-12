"use client";

// Google AdSense display slot — renders NOTHING until approval + traction.
// Frozen rule: no placeholder cards anywhere on the site.
export const ADS_ENABLED = false;

export default function AdSlot({ slot }: { slot?: string }) {
  if (!ADS_ENABLED) return null;
  return (
    <ins
      className="adsbygoogle block text-center"
      style={{ display: "block" }}
      data-ad-client="ca-pub-XXXX"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
