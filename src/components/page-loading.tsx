"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function PageLoading() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPathname = useRef(pathname);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When pathname changes, navigation is complete — hide the bar
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setLoading(false), 300);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  // Intercept same-origin link clicks to trigger loading state
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        !href.startsWith("/") ||
        href.startsWith("//") ||
        anchor.getAttribute("target") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      )
        return;
      // Don't show loader for same-page hash navigation
      if (href.includes("#")) return;
      setLoading(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!loading) return null;

  return (
    <>
      {/* Indeterminate progress bar at very top of page */}
      <div
        role="status"
        aria-label="กำลังโหลดหน้า"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-[200] h-0.5 overflow-hidden bg-primary/20"
      >
        <div className="h-full w-1/3 bg-primary motion-safe:animate-[nav-sweep_1.2s_ease-in-out_infinite] rounded-full" />
        <span className="sr-only">กำลังโหลด...</span>
      </div>
    </>
  );
}
