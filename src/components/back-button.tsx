"use client";

import { ArrowLeft } from "lucide-react";

export function BackButton({ label = "กลับหน้าก่อนหน้า" }: { label?: string }) {
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/";
        }
      }}
      className="min-w-11 min-h-11 flex items-center justify-center -ml-2 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
      aria-label={label}
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}
