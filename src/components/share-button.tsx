"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Share2, X, Send, CheckCircle2, Check } from "lucide-react";
import { useFocusTrap } from "@/components/focus-trap";

const PromptPayQR = dynamic(() => import("@/components/promptpay-qr").then((m) => m.PromptPayQR), {
  ssr: false,
});

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={copied ? "คัดลอกลิงก์แล้ว" : "แชร์บทความ"}
      className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
      onClick={() => {
        if (navigator.share) {
          navigator.share({ title, url: window.location.href });
        } else {
          navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        }
      }}
    >
      {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// TipButton — opens a PromptPay QR modal
// ---------------------------------------------------------------------------
interface TipButtonProps {
  writerName: string;
  promptPayId?: string;
  promptPayName?: string;
  variant?: "primary" | "secondary";
}

export function TipButton({ writerName, promptPayId, promptPayName, variant = "secondary" }: TipButtonProps) {
  const [open, setOpen] = useState(false);
  const trapRef = useFocusTrap(open);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "primary"
            ? "inline-flex items-center justify-center gap-2 bg-black text-white font-prompt font-semibold px-6 py-3 rounded-full hover:bg-stone-900 transition-all shadow-md text-sm shrink-0"
            : "inline-flex items-center gap-2 bg-secondary text-text-main border border-black/10 font-prompt font-semibold px-5 py-2.5 rounded-full hover:brightness-95 transition-all shadow-sm text-sm shrink-0"
        }
      >
        🍲 เลี้ยงลาบนักเขียน
      </button>

      {open && (
        <div
          ref={trapRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tip-title"
        >
          <div
            className="relative rounded-2xl shadow-2xl w-full max-w-sm p-6"
            style={{ backgroundColor: "#C5A84A" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="ปิด"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/10 text-stone-800/70 hover:text-stone-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h2 id="tip-title" className="font-prompt font-bold text-2xl text-stone-900 text-center mb-2">
              เลี้ยงลาบนักเขียน
            </h2>

            {/* Illustration */}
            <div className="flex justify-center mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/SVG/lab-donate.svg" alt="ลาบ" className="w-24 h-24 object-contain" />
            </div>

            {/* Subtitle */}
            <p className="font-sarabun text-sm text-stone-900 text-center mb-5">
              สนับสนุน{writerName} โดยตรง 100%
            </p>

            {promptPayId ? (
              <PromptPayQR promptPayId={promptPayId} promptPayName={promptPayName ?? writerName} goldenTheme />
            ) : (
              <div className="bg-white/20 border border-white/10 rounded-xl p-4 text-center">
                <p className="font-sarabun text-sm text-stone-900 leading-relaxed font-medium">
                  คุณ {writerName} ยังไม่ได้เปิดช่องทางสนับสนุนออนไลน์ในระบบ ร่วมกดแชร์ประโยคเด็ด หรือติดตามผลงานเพื่อส่งกำลังใจได้เลยนะ! 🍲❤️
                </p>
              </div>
            )}

            <p className="text-center font-sarabun text-xs text-stone-800/60 mt-3">
              ขอบคุณสนับสนุนนักเขียนจากใจ 🙏
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// HireButton — opens a Project Inquiry form modal
// ---------------------------------------------------------------------------
interface HireButtonProps {
  writerName: string;
  hireEmail?: string;
  variant?: "primary" | "secondary" | "link";
}

export function HireButton({ writerName, hireEmail, variant = "primary" }: HireButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", org: "", message: "" });
  const trapRef = useFocusTrap(open);

  const email = hireEmail ?? "contact@theisaander.com";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`ติดต่อร่วมงานกับ ${writerName}`);
    const body = encodeURIComponent(
      `ชื่อ: ${form.name}\nอีเมล: ${form.email}\nองค์กร/โครงการ: ${form.org}\n\nรายละเอียด:\n${form.message}`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
    setSubmitted(true);
  }

  function handleClose() {
    setOpen(false);
    setSubmitted(false);
    setForm({ name: "", email: "", org: "", message: "" });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "link"
            ? "inline-flex items-center gap-1 text-xs font-sarabun font-bold text-text-muted hover:text-text-main transition-colors py-2 px-3"
            : variant === "secondary"
            ? "inline-flex items-center gap-2 bg-white text-text-main border border-black/10 font-prompt font-semibold px-5 py-2.5 rounded-full hover:bg-stone-50 transition-all shadow-sm text-sm"
            : "inline-flex items-center gap-2 bg-primary text-white font-prompt font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition-all shadow-sm text-sm"
        }
      >
        จ้างงาน / ร่วมงาน
      </button>

      {open && (
        <div
          ref={trapRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="hire-title"
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="ปิด"
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <h2 className="font-prompt font-bold text-xl text-text-main">
                  เปิดอีเมลแล้ว!
                </h2>
                <p className="font-sarabun text-sm text-text-muted">
                  กรอกรายละเอียดใน email client แล้วกดส่งได้เลย
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-2 font-sarabun text-sm text-primary hover:underline"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h2 id="hire-title" className="font-prompt font-bold text-xl text-text-main">
                    ร่วมงานกับผู้เชี่ยวชาญในอีสาน
                  </h2>
                  <p className="font-sarabun text-sm text-text-muted mt-1">
                    กรอกข้อมูลเบื้องต้น แล้วเราจะเปิด email ให้ส่งได้ทันที
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="hire-name" className="block font-sarabun text-xs text-text-muted mb-1">
                        ชื่อของคุณ <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="hire-name"
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="สมชาย ใจดี"
                        className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm font-sarabun focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="hire-email" className="block font-sarabun text-xs text-text-muted mb-1">
                        อีเมล <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="hire-email"
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="example@email.com"
                        className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm font-sarabun focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="hire-org" className="block font-sarabun text-xs text-text-muted mb-1">
                      องค์กร / โครงการ
                    </label>
                    <input
                      id="hire-org"
                      type="text"
                      value={form.org}
                      onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))}
                      placeholder="ชื่อบริษัทหรือโครงการ"
                      className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm font-sarabun focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="hire-message" className="block font-sarabun text-xs text-text-muted mb-1">
                      รายละเอียดงาน <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="hire-message"
                      required
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="อธิบายโปรเจกต์หรืองานที่ต้องการความช่วยเหลือ..."
                      className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm font-sarabun focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-1 inline-flex items-center justify-center gap-2 bg-primary text-white font-prompt font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    ส่งข้อความ
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
