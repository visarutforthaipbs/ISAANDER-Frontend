"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="กลับขึ้นด้านบน"
      className="fixed bottom-20 right-4 z-40 w-11 h-11 rounded-full bg-surface border border-black/10 shadow-md flex items-center justify-center text-text-muted hover:text-primary hover:shadow-lg transition-shadow transition-colors"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
