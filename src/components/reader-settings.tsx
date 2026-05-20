"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Settings, Sliders } from "lucide-react";
import { useFocusTrap } from "@/components/focus-trap";

// Types for reader settings
type ThemeType = "default" | "sepia" | "dark";
type FontType = "sans" | "looped";
type FontSize = "sm" | "base" | "lg" | "xl";
type LineHeight = "tight" | "normal" | "wide";

const fontSizes = {
  sm: "0.9375rem",  // ~15px
  base: "1.125rem", // ~18px (default)
  lg: "1.3125rem",  // ~21px
  xl: "1.5rem",     // ~24px
};

const lineHeights = {
  tight: "1.6",
  normal: "1.9", // default
  wide: "2.2",
};

interface ReaderSettingsProps {
  layout?: "header" | "inline";
}

export function ReaderSettings({ layout = "header" }: ReaderSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeType>("default");
  const [font, setFont] = useState<FontType>("sans");
  const [size, setSize] = useState<FontSize>("base");
  const [height, setHeight] = useState<LineHeight>("normal");

  const popoverRef = useFocusTrap(isOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("reader-theme") as ThemeType;
    const savedFont = localStorage.getItem("reader-font") as FontType;
    const savedSize = localStorage.getItem("reader-size") as FontSize;
    const savedHeight = localStorage.getItem("reader-height") as LineHeight;

    if (savedTheme) setTheme(savedTheme);
    if (savedFont) setFont(savedFont);
    if (savedSize) setSize(savedSize);
    if (savedHeight) setHeight(savedHeight);
  }, []);

  // Apply settings to html element and document styles
  useEffect(() => {
    const html = document.documentElement;

    // Apply Theme
    html.classList.remove("theme-sepia", "theme-dark");
    if (theme === "sepia") html.classList.add("theme-sepia");
    if (theme === "dark") html.classList.add("theme-dark");
    localStorage.setItem("reader-theme", theme);

    // Apply Font Family
    html.classList.remove("font-preference-looped");
    if (font === "looped") html.classList.add("font-preference-looped");
    localStorage.setItem("reader-font", font);

    // Apply Font Size & Line Height to CSS variables
    html.style.setProperty("--reader-font-size", fontSizes[size]);
    html.style.setProperty("--reader-line-height", lineHeights[height]);
    
    localStorage.setItem("reader-size", size);
    localStorage.setItem("reader-height", height);
  }, [theme, font, size, height]);

  // Handle clicking outside the popover to close it
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, popoverRef]);

  // SVG Aa Icon
  const AaIcon = () => (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[18px] h-[18px] sm:w-5 sm:h-5 transition-transform"
      aria-hidden="true"
    >
      <path d="M4 20l4-12 4 12" />
      <path d="M6 14h4" />
      <path d="M15 20l2.5-6 2.5 6" />
      <path d="M16 17h3" />
    </svg>
  );

  const controlsContent = (
    <div className="space-y-5">
      {/* 1. Theme Selection */}
      <section aria-label="การตั้งค่าโทนสี">
        <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 font-prompt">
          โทนสี
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("default")}
            aria-pressed={theme === "default"}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1.5 font-prompt ${
              theme === "default"
                ? "bg-text-main text-surface border-text-main shadow-sm"
                : "bg-surface text-text-main border-black/10 hover:border-black/25"
            }`}
          >
            {theme === "default" && <Check className="w-4 h-4 shrink-0" />}
            ปกติ
          </button>
          <button
            onClick={() => setTheme("sepia")}
            aria-pressed={theme === "sepia"}
            style={{ backgroundColor: "#F4ECD8", color: "#3C2F2F" }}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1.5 font-prompt ${
              theme === "sepia"
                ? "border-[#3C2F2F] ring-2 ring-[#3C2F2F]/20 shadow-sm font-semibold"
                : "border-black/10 hover:border-black/25"
            }`}
          >
            {theme === "sepia" && <Check className="w-4 h-4 shrink-0" />}
            ซีเปีย
          </button>
          <button
            onClick={() => setTheme("dark")}
            aria-pressed={theme === "dark"}
            style={{ backgroundColor: "#1e1e1e", color: "#e2e8f0" }}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1.5 font-prompt ${
              theme === "dark"
                ? "border-[#e2e8f0] ring-2 ring-white/10 shadow-sm font-semibold"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            {theme === "dark" && <Check className="w-4 h-4 shrink-0" />}
            มืด
          </button>
        </div>
      </section>

      {/* 2. Font Family Toggle */}
      <section aria-label="การตั้งค่ารูปแบบอักษร">
        <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 font-prompt">
          รูปแบบอักษร
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setFont("sans")}
            aria-pressed={font === "sans"}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all font-prompt ${
              font === "sans"
                ? "bg-text-main text-surface border-text-main font-semibold shadow-sm"
                : "bg-surface text-text-main border-black/10 hover:border-black/25"
            }`}
          >
            ไม่มีหัว (แบรนด์)
          </button>
          <button
            onClick={() => setFont("looped")}
            aria-pressed={font === "looped"}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all font-prompt ${
              font === "looped"
                ? "bg-text-main text-surface border-text-main font-semibold shadow-sm"
                : "bg-surface text-text-main border-black/10 hover:border-black/25"
            }`}
          >
            มีหัว (อ่านง่าย)
          </button>
        </div>
      </section>

      {/* 3. Font Size Toggle */}
      <section aria-label="การตั้งค่าขนาดอักษร">
        <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 font-prompt">
          ขนาดอักษร
        </span>
        <div className="flex gap-1.5 bg-black/[0.03] p-1 rounded-lg border border-black/5">
          {(["sm", "base", "lg", "xl"] as FontSize[]).map((sz) => {
            const labels = { sm: "เล็ก", base: "ปกติ", lg: "ใหญ่", xl: "ใหญ่สุด" };
            const isActive = size === sz;
            return (
              <button
                key={sz}
                onClick={() => setSize(sz)}
                aria-pressed={isActive}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors font-prompt ${
                  isActive
                    ? "bg-surface text-text-main shadow-sm font-semibold"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {labels[sz]}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Line Height Toggle */}
      <section aria-label="การตั้งค่าระยะห่างบรรทัด">
        <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 font-prompt">
          ระยะห่างบรรทัด
        </span>
        <div className="flex gap-2">
          {(["tight", "normal", "wide"] as LineHeight[]).map((lh) => {
            const labels = { tight: "แคบ", normal: "ปกติ", wide: "กว้าง" };
            const isActive = height === lh;
            return (
              <button
                key={lh}
                onClick={() => setHeight(lh)}
                aria-pressed={isActive}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all font-prompt ${
                  isActive
                    ? "bg-text-main text-surface border-text-main font-semibold shadow-sm"
                    : "bg-surface text-text-main border-black/10 hover:border-black/25"
                }`}
              >
                {labels[lh]}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );

  // Layout 1: Floating Header Menu
  if (layout === "header") {
    return (
      <div className="relative">
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="ปรับขนาดอักษรและโทนสี"
          className={`min-w-11 min-h-11 flex items-center justify-center rounded-full transition-colors ${
            isOpen
              ? "text-primary bg-primary/10"
              : "text-text-muted hover:text-text-main hover:bg-black/5"
          }`}
        >
          <AaIcon />
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="เมนูตั้งค่าการอ่าน"
            className="absolute right-0 mt-2 w-72 bg-surface border border-black/10 rounded-xl shadow-xl p-5 z-[100] animate-slide-up origin-top-right md:w-80"
          >
            {controlsContent}
          </div>
        )}
      </div>
    );
  }

  // Layout 2: Inline Content Block
  return (
    <aside
      className="p-5 border border-black/5 bg-black/[0.01] rounded-xl my-6"
      aria-label="การตั้งค่าการอ่านสำหรับการเปิดหน้าเว็บบทความนี้"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-4 h-4 text-primary" aria-hidden="true" />
        <h3 className="font-prompt text-sm font-semibold text-text-main">
          ปรับแต่งประสบการณ์การอ่าน
        </h3>
      </div>
      {controlsContent}
    </aside>
  );
}
