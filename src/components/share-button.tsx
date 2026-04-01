"use client";

import { Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  return (
    <button
      type="button"
      aria-label="แชร์บทความ"
      className="p-2 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
      onClick={() => {
        if (navigator.share) {
          navigator.share({ title, url: window.location.href });
        } else {
          navigator.clipboard.writeText(window.location.href);
        }
      }}
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
}
