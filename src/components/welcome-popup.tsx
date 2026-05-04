"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/components/focus-trap";

const STORAGE_KEY = "isaander_welcome_seen";

function getSnapshot() {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function WelcomePopup() {
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const trapRef = useFocusTrap(shouldShow && !dismissed);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  if (!shouldShow || dismissed) return null;

  // Lock body scroll while popup is open
  if (typeof document !== "undefined") {
    document.body.style.overflow = "hidden";
  }

  const handleDismiss = () => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    dismiss();
  };

  return (
    <div
      ref={trapRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div
        className="relative bg-surface rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
          aria-label="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 flex flex-col items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-black.svg"
            alt="The Isaander"
            width={87}
            height={24}
            className="h-6 w-auto mb-2"
          />
          <h2 id="welcome-title" className="font-prompt text-xl font-bold text-text-main leading-snug">
            ทำไมต้องเขียนกับเรา?
          </h2>
        </div>

        {/* Comparison intro */}
        <p className="font-sarabun text-sm text-text-muted leading-relaxed mb-4">
          หากคุณเขียนงานให้กับสำนักข่าวหรือสื่อทั่วไป
          คุณอาจได้รับค่าตอบแทน 2,000 บาทเพียงครั้งเดียว
          และพวกเขาจะกลายเป็นเจ้าของผลงานของคุณตลอดไป
        </p>

        <p className="font-sarabun text-sm font-medium text-text-main mb-3">
          แต่หากคุณเขียนบทความให้กับ The Isaander:
        </p>

        {/* Benefits */}
        <ol className="list-none flex flex-col gap-3 mb-6">
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-primary/15 text-primary font-prompt text-sm font-bold flex items-center justify-center">
              1
            </span>
            <p className="font-sarabun text-sm text-text-main leading-relaxed">
              คุณจะได้รับส่วนแบ่ง <strong className="text-primary">60%</strong> จากรายได้ค่าโฆษณาที่เกิดขึ้นบนหน้าบทความของคุณ ต่อเนื่องยาวนานถึง 5 ปี
            </p>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-primary/15 text-primary font-prompt text-sm font-bold flex items-center justify-center">
              2
            </span>
            <p className="font-sarabun text-sm text-text-main leading-relaxed">
              คุณจะได้รับเงินสนับสนุน (ทิป) จากผู้อ่านผ่านระบบพร้อมเพย์ (PromptPay) ไปเลยเต็มจำนวน <strong className="text-primary">100%</strong>
            </p>
          </li>
          {/* Signal 39: Layer 2 - Rule of Three. Combined points 3 & 4. Fixed contrast. */}
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-isaander-orange/15 text-isaander-orange font-prompt text-sm font-bold flex items-center justify-center">
              3
            </span>
            <p className="font-sarabun text-sm text-text-main leading-relaxed">
              รับตราประทับ &lsquo;ผู้เชี่ยวชาญด้านอีสาน&rsquo; และรับโอกาสเชื่อมต่อกับแบรนด์หรือองค์กร (NGOs) ที่ต้องการที่ปรึกษาในสายงานของคุณ
            </p>
          </li>
        </ol>

        {/* CTA */}
        <button
          onClick={handleDismiss}
          className="w-full bg-primary text-white font-sarabun text-sm font-medium py-3 rounded-full hover:bg-primary/90 transition-colors"
        >
          เข้าใจแล้ว เริ่มอ่านเลย
        </button>
      </div>
    </div>
  );
}
