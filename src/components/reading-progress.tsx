"use client";

import { useEffect, useRef } from "react";
import { useScrollDirection } from "@/components/navigation";

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastProgress = useRef(0);
  const headerVisible = useScrollDirection();

  useEffect(() => {
    function update() {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const total = scrollHeight - clientHeight;
      const progress = total > 0 ? (scrollTop / total) * 100 : 0;

      // Only update DOM if value changed (avoids unnecessary paint)
      if (Math.abs(progress - lastProgress.current) > 0.1) {
        lastProgress.current = progress;
        if (barRef.current) {
          barRef.current.style.setProperty("--rp", `${progress}%`);
          barRef.current.setAttribute("aria-valuenow", String(Math.round(progress)));
        }
      }
      rafRef.current = 0;
    }

    function onScroll() {
      if (rafRef.current) return; // skip if RAF already queued
      rafRef.current = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // initial
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={barRef}
      role="progressbar"
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="ความคืบหน้าการอ่าน"
      className={`fixed top-14 left-0 z-50 h-[3px] bg-gradient-to-r from-[#E65C00] via-[#FF8C00] to-[#FBC02D] transition-transform duration-300 ${
        headerVisible ? "translate-y-0" : "-translate-y-14"
      }`}
      style={{ width: "var(--rp, 0%)" }}
    />
  );
}
