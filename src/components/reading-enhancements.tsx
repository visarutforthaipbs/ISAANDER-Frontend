"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles, BookOpen, Download, AlertCircle, Share2 } from "lucide-react";

interface ReadingEnhancementsProps {
  postTitle: string;
  authorName: string;
  authorAvatar: string;
}

const PRESETS = [
  {
    name: "กระดาษถนอมสายตา",
    class: "bg-[#FAF6EE] text-[#2B251F] border border-amber-900/10 shadow-md",
    canvasBg: "#FAF6EE",
    canvasText: "#2B251F",
  },
  {
    name: "รัตติกาล",
    class: "bg-[#090A0F] text-[#FAF6EE] border border-white/5 shadow-md",
    canvasBg: "#090A0F",
    canvasText: "#FAF6EE",
  },
  {
    name: "ส้มแสด",
    class: "bg-linear-to-br from-[#E65C00] to-[#F9D423] text-white border border-orange-500/10 shadow-md",
    canvasBg: ["#E65C00", "#F9D423"],
    canvasText: "#FFFFFF",
  },
  {
    name: "ไพรพนา",
    class: "bg-linear-to-br from-[#11998e] to-[#38ef7d] text-white border border-teal-500/10 shadow-md",
    canvasBg: ["#11998e", "#38ef7d"],
    canvasText: "#FFFFFF",
  },
  {
    name: "มหาสมุทร",
    class: "bg-linear-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white border border-cyan-900/20 shadow-md",
    canvasBg: ["#0f2027", "#203a43", "#2c5364"],
    canvasText: "#FFFFFF",
  },
];

export function ReadingEnhancements({
  postTitle,
  authorName,
  authorAvatar,
}: ReadingEnhancementsProps) {
  // Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Selection & Tooltip State
  const [selectionText, setSelectionText] = useState("");
  const [tooltipCoords, setTooltipCoords] = useState<{ x: number; y: number } | null>(null);

  // Quote Card Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [fontSizeScale, setFontSizeScale] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep tooltip within screen boundaries on mobile
  const getClampedTooltipStyle = () => {
    if (!tooltipCoords) return {};
    if (typeof window === "undefined") {
      return {
        position: "absolute" as const,
        left: `${tooltipCoords.x}px`,
        top: `${tooltipCoords.y}px`,
        transform: "translateX(-50%)",
      };
    }
    
    const tooltipWidth = 165; // Estimated width for "แชร์ประโยคนี้ ❤️"
    const screenPadding = 12;
    const minLeft = tooltipWidth / 2 + screenPadding;
    const maxLeft = window.innerWidth - tooltipWidth / 2 - screenPadding;
    
    const viewportX = tooltipCoords.x - window.scrollX;
    const clampedViewportX = Math.max(minLeft, Math.min(maxLeft, viewportX));
    const finalX = clampedViewportX + window.scrollX;
    
    return {
      position: "absolute" as const,
      left: `${finalX}px`,
      top: `${tooltipCoords.y}px`,
      transform: "translateX(-50%)",
    };
  };

  // Toggle Focus Mode
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isFocusMode) {
      htmlElement.classList.add("is-focus-mode");
    } else {
      htmlElement.classList.remove("is-focus-mode");
    }
    return () => {
      htmlElement.classList.remove("is-focus-mode");
    };
  }, [isFocusMode]);

  // Monitor text selections inside the article body
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        // Delay clearing selection to allow button clicks
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length < 5) {
        setSelectionText("");
        setTooltipCoords(null);
        return;
      }

      // Ensure selection is inside the rich content prose wrapper
      let node: Node | null = selection.anchorNode;
      let isInsideArticle = false;
      while (node) {
        if (node instanceof HTMLElement && node.classList.contains("prose-wrapper")) {
          isInsideArticle = true;
          break;
        }
        node = node.parentNode;
      }

      if (!isInsideArticle) {
        setSelectionText("");
        setTooltipCoords(null);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        if (rects.length > 0) {
          const rect = rects[0];
          setSelectionText(text);
          // Center the floating tooltip: above on desktop, below on mobile/touch to avoid clashing with native context bubble
          const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
          const tooltipY = isTouch
            ? rect.bottom + 12 + window.scrollY
            : rect.top - 48 + window.scrollY;
            
          setTooltipCoords({
            x: rect.left + rect.width / 2 + window.scrollX,
            y: tooltipY,
          });
        }
      } catch {
        // Fail silently
      }
    };

    // Close tooltip when clicking outside
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".quote-tooltip-trigger") || target.closest(".quote-modal")) {
        return;
      }
      setSelectionText("");
      setTooltipCoords(null);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("touchstart", handleMouseDown);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("touchstart", handleMouseDown);
    };
  }, []);

  const openQuoteModal = () => {
    setIsModalOpen(true);
    setFontSizeScale(1);
    setTooltipCoords(null);
  };

  // Dynamically resolve custom Next.js Google font families from document classes
  const getGoogleFont = (fontVar: string, fallback: string): string => {
    if (typeof window === "undefined") return fallback;
    const bodyStyles = getComputedStyle(document.documentElement);
    const resolved = bodyStyles.getPropertyValue(fontVar).trim();
    if (!resolved) return fallback;

    // Clean up var(...) expressions which canvas API cannot parse
    const cleanFont = resolved
      .split(",")
      .map(part => part.trim())
      .filter(part => !part.startsWith("var("))
      .join(", ");

    return cleanFont ? `${cleanFont}, ${fallback}` : fallback;
  };

  // Safe wrapper for Thai/English words on canvas
  const getLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    // Matches English/Latin words or individual characters (Thai, symbols, etc.)
    const regex = /[a-zA-Z0-9']+|./gu;
    const tokens = text.match(regex) || [];
    const lines: string[] = [];
    let currentLine = "";

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      // Add space if the token is an English word and the previous character was English
      const needsSpace = 
        currentLine && 
        /[a-zA-Z0-9']$/.test(currentLine) && 
        /^[a-zA-Z0-9']/.test(token);

      const testLine = currentLine + (needsSpace ? " " : "") + token;
      const width = ctx.measureText(testLine).width;

      if (width > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = token;
        } else {
          lines.push(testLine);
          currentLine = "";
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };

  // Download Quote Card via canvas
  const handleDownload = async () => {
    setIsExporting(true);
    setExportError("");

    const canvas = canvasRef.current;
    if (!canvas) {
      setExportError("ระบบแคนวาสไม่พร้อมใช้งาน");
      setIsExporting(false);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setExportError("ไม่สามารถเรียกใช้ระบบวาดภาพได้");
      setIsExporting(false);
      return;
    }

    // Wait for Next.js fonts to be ready in the document
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn("Fonts ready promise failed, continuing drawing:", e);
    }

    const promptFont = getGoogleFont("--font-prompt-google", "Prompt, sans-serif");
    const sarabunFont = getGoogleFont("--font-sarabun-google", "Sarabun, sans-serif");

    const preset = PRESETS[selectedPresetIdx];

    // 1. Draw Background
    if (Array.isArray(preset.canvasBg)) {
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      preset.canvasBg.forEach((color, idx) => {
        grad.addColorStop(idx / (preset.canvasBg.length - 1), color);
      });
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = preset.canvasBg;
    }
    ctx.fillRect(0, 0, 1080, 1080);

    const isLightTheme = preset.canvasText === "#2B251F";

    // 2. Draw quotation marks
    ctx.save();
    ctx.font = "italic 220px Georgia, serif";
    ctx.fillStyle = preset.canvasText;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = isLightTheme ? 0.05 : 0.08;
    ctx.fillText("“", 80, 260);
    ctx.restore();

    // 3. Draw quote text
    // Adjust size based on string length, then apply user scale
    let fontSize = 44;
    if (selectionText.length > 250) fontSize = 28;
    else if (selectionText.length > 150) fontSize = 34;
    else if (selectionText.length > 80) fontSize = 38;
    fontSize = Math.round(fontSize * fontSizeScale);

    ctx.font = `italic 500 ${fontSize}px ` + sarabunFont;
    ctx.fillStyle = preset.canvasText;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const maxTextWidth = 840;
    const lines = getLines(ctx, selectionText, maxTextWidth);
    const lineHeight = fontSize * 1.55; // Slightly taller line height for legibility
    const totalTextHeight = lines.length * lineHeight;
    
    // Position text block in center of card (shifted up slightly to make room for author footer)
    const startY = 500 - totalTextHeight / 2 + lineHeight / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, 540, startY + index * lineHeight);
    });

    // 4. Draw Divider line
    ctx.beginPath();
    ctx.moveTo(180, 850);
    ctx.lineTo(900, 850);
    ctx.strokeStyle = preset.canvasText;
    ctx.lineWidth = 2;
    ctx.save();
    ctx.globalAlpha = isLightTheme ? 0.08 : 0.15;
    ctx.stroke();
    ctx.restore();

    // Helper to load image
    const loadImage = (src: string, crossOrigin?: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        if (crossOrigin) img.crossOrigin = crossOrigin;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = src;
      });
    };

    // Helper to draw tinted SVG logo
    const drawTintedImage = (
      img: HTMLImageElement,
      x: number,
      y: number,
      w: number,
      h: number,
      color: string
    ) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = w;
      offscreen.height = h;
      const oCtx = offscreen.getContext("2d");
      if (!oCtx) return;

      oCtx.drawImage(img, 0, 0, w, h);
      oCtx.globalCompositeOperation = "source-in";
      oCtx.fillStyle = color;
      oCtx.fillRect(0, 0, w, h);

      ctx.drawImage(offscreen, x, y);
    };

    // Load resources concurrently
    const [avatarImg, logoImg] = await Promise.all([
      loadImage(authorAvatar || "/logo-black.svg", "anonymous"),
      loadImage("/logo-black.svg")
    ]);

    // 5. Draw Author profile
    ctx.save();
    ctx.beginPath();
    ctx.arc(220, 930, 42, 0, Math.PI * 2);
    ctx.clip();

    if (avatarImg && avatarImg.width > 0 && authorAvatar) {
      ctx.drawImage(avatarImg, 178, 888, 84, 84);
    } else {
      // Background circle fallback
      ctx.fillStyle = "#E65C00";
      ctx.beginPath();
      ctx.arc(220, 930, 42, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold 36px ` + promptFont;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(authorName.charAt(0), 220, 930);
    }
    ctx.restore();

    // Draw Author details
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = preset.canvasText;
    
    // Author Name
    ctx.font = `bold 30px ` + promptFont;
    ctx.fillText(authorName, 280, 915);
    
    // Article Title — wraps up to 2 lines
    ctx.save();
    ctx.font = `20px ` + sarabunFont;
    ctx.fillStyle = preset.canvasText;
    ctx.globalAlpha = isLightTheme ? 0.5 : 0.7;

    const titleLines = getLines(ctx, `จากบทความ: ${postTitle}`, 400).slice(0, 2);
    const titleLineHeight = 28;
    titleLines.forEach((line, i) => {
      ctx.fillText(line, 280, 952 + i * titleLineHeight);
    });
    ctx.restore();

    // 6. Draw Branding Logo
    if (logoImg && logoImg.width > 0) {
      const logoW = 200;
      const logoH = (logoW * logoImg.height) / logoImg.width;
      const logoX = 900 - logoW;
      const logoY = 892; // Centered beautifully and leaves a clean gap for the URL below
      drawTintedImage(logoImg, logoX, logoY, logoW, logoH, preset.canvasText);

      // Website URL under logo
      ctx.save();
      ctx.textAlign = "right";
      ctx.font = `20px ` + sarabunFont;
      ctx.fillStyle = preset.canvasText;
      ctx.globalAlpha = isLightTheme ? 0.4 : 0.65;
      ctx.fillText("theisaander.com", 900, 966);
      ctx.restore();
    } else {
      // Fallback text branding
      ctx.save();
      ctx.textAlign = "right";
      
      // Site Name
      ctx.font = `900 30px ` + promptFont;
      ctx.fillStyle = "#E65C00";
      ctx.fillText("THE ISAANDER", 900, 915);

      // Website URL
      ctx.font = `20px ` + sarabunFont;
      ctx.fillStyle = preset.canvasText;
      ctx.globalAlpha = isLightTheme ? 0.4 : 0.6;
      ctx.fillText("theisaander.com", 900, 950);
      ctx.restore();
    }

    // Trigger actual file download
    try {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `isaander-quote-${Date.now()}.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error("Canvas export failed:", err);
      setExportError("เบราว์เซอร์บล็อกการส่งออกรูปภาพเนื่องจาก CORS กรุณาลองแคปหน้าจอแทน");
    }
    setIsExporting(false);
  };

  return (
    <>
      {/* Floating Focus Mode Action Trigger */}
      <div className="fixed bottom-6 right-6 z-[45] flex flex-col gap-2">
        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full text-sm font-prompt font-semibold shadow-xl border backdrop-blur-md transition-all duration-300 ${
            isFocusMode
              ? "bg-[#E65C00] text-white border-transparent scale-105"
              : "bg-surface/90 text-text-main border-black/10 hover:border-black/20"
          }`}
          aria-label={isFocusMode ? "ออกจากโหมดอ่านสบาย" : "เปิดโหมดอ่านสบาย"}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>{isFocusMode ? "ออกจากโหมดอ่านสบาย" : "โหมดอ่านสบาย"}</span>
        </button>
      </div>

      {/* Floating Selection Tooltip Trigger */}
      {tooltipCoords && selectionText && (
        <button
          onClick={openQuoteModal}
          style={getClampedTooltipStyle()}
          className="quote-tooltip-trigger z-[50] flex items-center gap-1.5 bg-[#181A1B] text-white px-3 py-2 rounded-lg text-xs font-prompt font-semibold shadow-xl animate-fade-in hover:bg-black transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F9D423]" />
          <span>แชร์ประโยคนี้ ❤️</span>
        </button>
      )}

      {/* Quote Generator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs quote-modal">
          <div className="relative bg-surface w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 shrink-0">
              <h3 className="font-prompt font-bold text-text-main flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E65C00]" />
                <span>แชร์ประโยคนี้ ❤️</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main p-1.5 rounded-full hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center gap-4 sm:gap-6">
              
              {/* Presets Selection */}
              <div className="w-full flex flex-col gap-2 shrink-0">
                <label className="font-prompt text-xs font-medium text-text-muted">
                  เลือกรูปแบบพื้นหลัง
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedPresetIdx(idx)}
                      className={`px-3 py-1.5 rounded-full text-xs font-prompt font-medium transition-all ${
                        selectedPresetIdx === idx
                          ? "bg-primary text-white scale-105"
                          : "bg-surface border border-black/10 text-text-main hover:bg-black/5"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Adjustment */}
              <div className="w-full flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between">
                  <label className="font-prompt text-xs font-medium text-text-muted">ขนาดตัวอักษร</label>
                  <span className="font-prompt text-xs text-text-muted">{Math.round(fontSizeScale * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs opacity-50 select-none">A</span>
                  <input
                    type="range"
                    min={0.6}
                    max={1.6}
                    step={0.05}
                    value={fontSizeScale}
                    onChange={(e) => setFontSizeScale(parseFloat(e.target.value))}
                    className="flex-1 accent-[#E65C00] h-1.5 cursor-pointer"
                  />
                  <span className="text-base opacity-50 select-none">A</span>
                </div>
              </div>

              {/* Card Live Preview (Aspect 1:1) */}
              <div className="w-full max-w-[280px] sm:max-w-[340px] aspect-square rounded-xl overflow-hidden shadow-lg border border-black/5 relative shrink-0">
                <div
                  className={`w-full h-full flex flex-col justify-between p-6 ${PRESETS[selectedPresetIdx].class}`}
                >
                  {/* Left Quote Mark */}
                  <span className="text-5xl font-serif leading-none select-none opacity-20 -mb-2 block">
                    “
                  </span>
                  
                  {/* Highlight Text */}
                  <p
                    style={{
                      fontFamily: "var(--font-sarabun-google), sans-serif",
                      fontSize: `${0.875 * fontSizeScale}rem`,
                    }}
                    className="italic font-medium leading-relaxed text-center flex-1 flex items-center justify-center px-4 overflow-hidden line-clamp-6"
                  >
                    {selectionText}
                  </p>

                  {/* Divider */}
                  <div className="h-[1px] w-full bg-current opacity-15 my-3 shrink-0" />

                  {/* Card Footer */}
                  <div className="flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={authorAvatar || "/logo-black.svg"}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-current/10 shrink-0"
                      />
                      <div className="text-left max-w-[140px]">
                        <p 
                          style={{ fontFamily: "var(--font-prompt-google), sans-serif" }}
                          className="font-bold text-[10px] leading-tight"
                        >
                          {authorName}
                        </p>
                        <p
                          style={{ fontFamily: "var(--font-sarabun-google), sans-serif" }}
                          className="text-[7.5px] opacity-75 line-clamp-2 whitespace-normal wrap-break-word"
                          title={`จากบทความ: ${postTitle}`}
                        >
                          จากบทความ: {postTitle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/logo-black.svg"
                        alt="The Isaander"
                        className="h-6 w-auto mb-1 shrink-0"
                        style={{
                          filter: PRESETS[selectedPresetIdx].canvasText !== "#2B251F"
                            ? "brightness(0) invert(1)"
                            : "none"
                        }}
                      />
                      <p 
                        style={{ fontFamily: "var(--font-sarabun-google), sans-serif" }}
                        className="text-[7px] opacity-60 leading-none"
                      >
                        theisaander.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error messages */}
              {exportError && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-xs font-sarabun w-full shrink-0">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{exportError}</span>
                </div>
              )}
            </div>

            {/* Hidden Canvas for High-Res Exporter */}
            <canvas
              ref={canvasRef}
              width={1080}
              height={1080}
              className="hidden"
            />

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-black/5 flex justify-end shrink-0">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E65C00] hover:bg-[#CC5200] disabled:bg-slate-400 text-white font-prompt font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? "กำลังส่งออก..." : "ดาวน์โหลดรูปภาพ"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
