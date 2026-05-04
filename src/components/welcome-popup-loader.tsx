"use client";

import dynamic from "next/dynamic";

// Client-only wrapper so the welcome popup (and its dependencies like
// lucide-react & focus-trap) stay out of the initial JS chunk delivered
// to first-time visitors who don't see the modal anyway.
const WelcomePopup = dynamic(
  () => import("@/components/welcome-popup").then((m) => m.WelcomePopup),
  { ssr: false }
);

export function WelcomePopupLoader() {
  return <WelcomePopup />;
}
