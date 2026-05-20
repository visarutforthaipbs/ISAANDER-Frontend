"use client";

import { useEffect } from "react";

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

export function ReaderPreferencesLoader() {
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("reader-theme");
      const savedFont = localStorage.getItem("reader-font");
      const savedSize = localStorage.getItem("reader-size");
      const savedHeight = localStorage.getItem("reader-height");

      const html = document.documentElement;

      // Apply Theme
      if (savedTheme === "sepia") {
        html.classList.add("theme-sepia");
      } else if (savedTheme === "dark") {
        html.classList.add("theme-dark");
      }

      // Apply Font Family
      if (savedFont === "looped") {
        html.classList.add("font-preference-looped");
      }

      // Apply Font Size
      if (savedSize && savedSize in fontSizes) {
        html.style.setProperty(
          "--reader-font-size",
          fontSizes[savedSize as keyof typeof fontSizes]
        );
      }

      // Apply Line Height
      if (savedHeight && savedHeight in lineHeights) {
        html.style.setProperty(
          "--reader-line-height",
          lineHeights[savedHeight as keyof typeof lineHeights]
        );
      }
    } catch (e) {
      console.warn("Could not load reader preferences:", e);
    }
  }, []);

  return null;
}
