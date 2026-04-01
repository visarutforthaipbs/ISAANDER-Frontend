"use client";

import { useState } from "react";
import { Share2, X, Send, CheckCircle2 } from "lucide-react";
import { PromptPayQR } from "@/components/promptpay-qr";

export function ShareButton({ title }: { title: string }) {
  return (
    <button
      type="button"
      aria-label="แชร์บทความ"
      className="p-2 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
      onClick={() => {
        if (navigator.share) {
          navigator.share({ title, url: window.location.href });
        } else {
          navigator.clipboard.writeText(window.location.href);
        }
      }}
    >
      <Share2 className="w-5 h-5" />
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
}

export function TipButton({ writerName, promptPayId, promptPayName }: TipButtonProps) {
  const [open, setOpen] = useState(false);

  if (!promptPayId) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-secondary/10 text-secondary border border-secondary/30 font-prompt font-semibold px-5 py-2.5 rounded-full hover:bg-secondary/20 transition-all shadow-sm"
      >
        🍲 เลี้ยงลาบนักเขียน
      </button>

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="ปิด"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <h2 className="font-prompt font-bold text-xl text-text-main">
                🍲 เลี้ยงลาบนักเขียน
              </h2>
              <p className="font-sarabun text-sm text-text-muted mt-1">
                สนับสนุน{writerName} โดยตรง 100%
              </p>
            </div>

            <PromptPayQR promptPayId={promptPayId} promptPayName={promptPayName ?? writerName} />

            <p className="text-center font-sarabun text-xs text-text-muted mt-4">
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
}

export function HireButton({ writerName, hireEmail }: HireButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", org: "", message: "" });

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
        className="inline-flex items-center gap-2 bg-primary text-white font-prompt font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition-all shadow-sm"
      >
        จ้างงาน / ร่วมงาน
      </button>

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
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
                  <h2 className="font-prompt font-bold text-xl text-text-main">
                    ร่วมงานกับผู้เชี่ยวชาญในอีสาน
                  </h2>
                  <p className="font-sarabun text-sm text-text-muted mt-1">
                    กรอกข้อมูลเบื้องต้น แล้วเราจะเปิด email ให้ส่งได้ทันที
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-sarabun text-xs text-text-muted mb-1">
                        ชื่อของคุณ <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="สมชาย ใจดี"
                        className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm font-sarabun focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block font-sarabun text-xs text-text-muted mb-1">
                        อีเมล <span className="text-red-500">*</span>
                      </label>
                      <input
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
                    <label className="block font-sarabun text-xs text-text-muted mb-1">
                      องค์กร / โครงการ
                    </label>
                    <input
                      type="text"
                      value={form.org}
                      onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))}
                      placeholder="ชื่อบริษัทหรือโครงการ"
                      className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm font-sarabun focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block font-sarabun text-xs text-text-muted mb-1">
                      รายละเอียดงาน <span className="text-red-500">*</span>
                    </label>
                    <textarea
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
