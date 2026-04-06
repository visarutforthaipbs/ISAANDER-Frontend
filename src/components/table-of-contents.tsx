"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { List, X } from "lucide-react";
import type { TocHeading } from "@/components/rich-content";

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showMobileFab, setShowMobileFab] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const inlineTocRef = useRef<HTMLElement>(null);

  // Show desktop TOC only after scrolling past the hero image
  useEffect(() => {
    function onScroll() {
      const firstHeading = headings[0];
      if (!firstHeading) return;
      const el = document.getElementById(firstHeading.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        setShowDesktop(rect.top < window.innerHeight);
      } else {
        setShowDesktop(window.scrollY > 400);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  // Show mobile FAB when inline TOC is scrolled out of view
  useEffect(() => {
    const el = inlineTocRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMobileFab(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Track which heading is currently in view
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
    setMobileOpen(false);
    setDrawerOpen(false);
  }, []);

  if (headings.length < 2) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  const tocList = (
    <ol className="space-y-0.5 border-l-2 border-primary/15">
      {headings.map((heading) => {
        const indent = (heading.level - minLevel) * 12;
        const isActive = activeId === heading.id;
        return (
          <li key={heading.id}>
            <button
              type="button"
              onClick={() => scrollTo(heading.id)}
              style={{ paddingLeft: `${10 + indent}px` }}
              className={`block w-full text-left py-1.5 pr-2 text-[13px] font-sarabun rounded-r-md transition-colors leading-snug ${
                isActive
                  ? "text-primary font-semibold bg-primary/5 border-l-2 border-primary -ml-0.5"
                  : "text-text-muted hover:text-text-main hover:bg-black/3"
              }`}
            >
              {heading.text}
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      {/* ── Desktop: sticky left sidebar ── */}
      <nav
        aria-label="สารบัญบทความ"
        className={`hidden xl:block fixed top-20 z-30 w-56 transition-opacity duration-300 ${
          showDesktop ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ left: "max(1rem, calc((100vw - 768px) / 2 - 256px))" }}
      >
        <div className="rounded-lg border border-black/8 bg-surface/95 backdrop-blur-sm p-4 shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-2 mb-3">
            <List className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <span className="font-prompt font-semibold text-xs text-text-main">
              สารบัญ
            </span>
          </div>
          {tocList}
        </div>
      </nav>

      {/* ── Mobile/Tablet: collapsible inline block ── */}
      <nav
        ref={inlineTocRef}
        aria-label="สารบัญบทความ"
        className="xl:hidden my-8 rounded-lg border border-black/8 bg-surface p-5"
      >
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2 w-full text-left"
          aria-expanded={mobileOpen}
        >
          <List className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span className="font-prompt font-semibold text-sm text-text-main">
            สารบัญ
          </span>
          <span className="text-xs text-text-muted font-sarabun ml-1">
            ({headings.length} หัวข้อ)
          </span>
          <svg
            className={`w-4 h-4 text-text-muted ml-auto transition-transform duration-200 ${
              mobileOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {mobileOpen && <div className="mt-4 ml-1">{tocList}</div>}
      </nav>

      {/* ── Mobile FAB: floating button when inline TOC out of view ── */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="เปิดสารบัญ"
        className={`xl:hidden fixed bottom-20 left-4 z-40 w-11 h-11 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-all duration-300 ${
          showMobileFab && !drawerOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-75 pointer-events-none"
        }`}
      >
        <List className="w-5 h-5" />
      </button>

      {/* ── Mobile drawer: bottom sheet ── */}
      {drawerOpen && (
        <div
          className="xl:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="สารบัญบทความ"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl shadow-2xl animate-slide-up max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-black/8">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                <span className="font-prompt font-semibold text-sm text-text-main">
                  สารบัญ
                </span>
                <span className="text-xs text-text-muted font-sarabun ml-1">
                  ({headings.length} หัวข้อ)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
                aria-label="ปิดสารบัญ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto scrollbar-hide">
              {tocList}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
