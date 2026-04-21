"use client";

import Script from "next/script";
import { useEffect } from "react";

type AdSenseSlotProps = {
  slot: string;
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSenseSlot({ slot, className }: AdSenseSlotProps) {
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!isEnabled || !adClient) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore duplicate initialization errors from ad script race conditions.
    }
  }, [isEnabled, adClient, slot]);

  if (!isEnabled || !adClient) return null;

  return (
    <div className={className}>
      <p className="font-sarabun text-xs text-text-muted text-center mb-2">โฆษณา</p>
      {/* min-h prevents layout shift while ad loads */}
      <div className="min-h-[250px] flex items-center justify-center">
        {/* Use a standard script tag to avoid Next.js data-nscript attribute which AdSense warns about */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
          crossOrigin="anonymous"
        />
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={adClient}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}