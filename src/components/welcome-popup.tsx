"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { X } from "lucide-react";

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

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  if (!shouldShow || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={dismiss}
    >
      <div
        className="relative bg-surface rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
          aria-label="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <p className="font-prompt text-sm font-semibold text-primary mb-1">
            The Isaander
          </p>
          <h2 className="font-prompt text-xl font-bold text-text-main leading-snug">
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
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-secondary/15 text-secondary font-prompt text-sm font-bold flex items-center justify-center">
              3
            </span>
            <p className="font-sarabun text-sm text-text-main leading-relaxed">
              เราจะมอบเครื่องหมายรับรองสถานะ &lsquo;ผู้เชี่ยวชาญด้านอีสาน&rsquo; (Isaan Expert) ให้กับคุณบนแพลตฟอร์มของเรา
            </p>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-secondary/15 text-secondary font-prompt text-sm font-bold flex items-center justify-center">
              4
            </span>
            <p className="font-sarabun text-sm text-text-main leading-relaxed">
              เมื่อมีแบรนด์หรือองค์กร (NGOs) ติดต่อเข้ามาเพื่อค้นหาที่ปรึกษาในสายงานที่คุณเชี่ยวชาญ เราจะเป็นตัวกลางช่วยประสานงานและเจรจาธุรกิจให้กับคุณ
            </p>
          </li>
        </ol>

        {/* CTA */}
        <button
          onClick={dismiss}
          className="w-full bg-primary text-white font-sarabun text-sm font-medium py-3 rounded-full hover:bg-primary/90 transition-colors"
        >
          เข้าใจแล้ว เริ่มอ่านเลย
        </button>
      </div>
    </div>
  );
}
