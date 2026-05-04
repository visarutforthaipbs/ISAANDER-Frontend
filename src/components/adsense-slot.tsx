"use client";

import { useEffect, useRef, useState } from "react";

type AdSenseSlotProps = {
  slot: string;
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_SCRIPT_ID = "adsense-script";

// Inject the AdSense script tag at most once per page load. Returns the
// existing element on subsequent calls so all slots share the same script.
function ensureAdSenseScript(adClient: string) {
  if (typeof document === "undefined") return null;
  let el = document.getElementById(ADSENSE_SCRIPT_ID) as HTMLScriptElement | null;
  if (el) return el;
  el = document.createElement("script");
  el.id = ADSENSE_SCRIPT_ID;
  el.async = true;
  el.crossOrigin = "anonymous";
  el.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
  document.head.appendChild(el);
  return el;
}

export function AdSenseSlot({ slot, className }: AdSenseSlotProps) {
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  // Stage 1: defer rendering the slot until it's ~600px from the viewport.
  // This keeps AdSense off the critical path entirely on initial load.
  useEffect(() => {
    if (!isEnabled || !adClient) return;
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isEnabled, adClient]);

  // Stage 2: once the slot is near the viewport, load the AdSense script
  // (idempotent across slots) and push the ad into the queue.
  useEffect(() => {
    if (!shouldRender || !adClient) return;
    ensureAdSenseScript(adClient);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore duplicate initialization errors from ad script race conditions.
    }
  }, [shouldRender, adClient, slot]);

  if (!isEnabled || !adClient) return null;

  return (
    <div ref={containerRef} className={className}>
      <p className="font-sarabun text-xs text-text-muted text-center mb-2">โฆษณา</p>
      {/* min-h prevents layout shift while ad loads */}
      <div className="min-h-[250px] w-full text-center">
        {shouldRender && (
          <ins
            className="adsbygoogle block"
            style={{ display: "block", width: "100%" }}
            data-ad-client={adClient}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}
      </div>
    </div>
  );
}