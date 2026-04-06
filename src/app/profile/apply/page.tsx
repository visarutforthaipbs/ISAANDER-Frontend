"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { StickyHeader, MobileBottomNav } from "@/components/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ApplyWriterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [topics, setTopics] = useState("");
  const [background, setBackground] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Already a writer
  if (user.role === "writer") {
    return (
      <>
        <StickyHeader showBack />
        <main id="main-content" className="flex-1 pb-28 pt-10 text-center px-4">
          <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-4" />
          <h1 className="font-prompt text-2xl font-bold text-text-main mb-2">
            คุณเป็นนักเขียนอยู่แล้ว
          </h1>
          <p className="font-sarabun text-text-muted mb-6">
            ไปที่ Writer Dashboard เพื่อเริ่มต้นเขียนบทความ
          </p>
          <Link
            href="/author/dashboard/login"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-sarabun font-bold px-6 py-2.5 rounded-full transition-colors"
          >
            ไปที่ Writer Dashboard
          </Link>
        </main>
        <MobileBottomNav />
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topics.trim() || !background.trim()) return;

    setSubmitting(true);

    try {
      const applicationRef = doc(db, "writer_applications", user.uid);
      await setDoc(applicationRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        topics: topics.split(",").map(t => t.trim()),
        background,
        portfolioUrl: portfolioUrl || null,
        status: "pending",
        submittedAt: serverTimestamp(),
      });

      // Show success screen
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <>
        <StickyHeader showBack />
        <main id="main-content" className="flex-1 pb-28 pt-10 text-center px-4 max-w-lg mx-auto">
          <div className="bg-surface rounded-2xl shadow-sm border border-black/5 p-8">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="font-prompt text-2xl font-bold text-text-main mb-3">
              ส่งใบสมัครสำเร็จ!
            </h1>
            <p className="font-sarabun text-text-muted leading-relaxed mb-6">
              ขอบคุณที่สนใจเป็นส่วนหนึ่งของ The Isaander ทีมงานบรรณาธิการจะพิจารณาประวัติและติดต่อกลับไปทางอีเมล
              <br/><br/>
              <b>{user.email}</b>
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 font-sarabun font-bold text-primary hover:text-primary/80 transition-colors"
            >
               กลับไปที่โปรไฟล์
            </Link>
          </div>
        </main>
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      <StickyHeader showBack />

      <main id="main-content" className="flex-1 pb-28">
        <div className="max-w-xl mx-auto px-4 sm:px-6 pt-6">
          <Link href="/profile" className="inline-flex items-center gap-2 text-text-muted hover:text-text-main text-sm font-sarabun mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </Link>

          <h1 className="font-prompt text-2xl sm:text-3xl font-bold text-text-main mb-3">
            ร่วมงานกับ The Isaander
          </h1>
          <p className="font-sarabun text-text-muted leading-relaxed mb-8">
            เรากำลังตามหาคนที่มีเรื่องเล่า ไม่ว่าคุณจะเป็นนักข่าวท้องถิ่น นักวิจัย คนทำงาน ศิลปิน 
            หรือใครก็ตามที่อยากสื่อสารเรื่องราวของ "อีสาน" และสังคม
          </p>

          <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-sm border border-black/5 p-6 sm:p-8 space-y-6">
            
            <div>
              <label htmlFor="topics" className="block text-sm font-sarabun font-bold text-text-main mb-2">
                ประเด็นที่คุณสนใจ หรืออยากเล่าให้สังคมฟัง <span className="text-primary">*</span>
              </label>
              <textarea
                id="topics"
                placeholder="เช่น การเมืองท้องถิ่น, เกษตรกรรม, ศิลปะหมอลำ, ปัญหาที่ดิน (คั่นด้วยลูกน้ำ)"
                rows={3}
                required
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                className="w-full bg-surface border border-black/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg px-4 py-3 font-sarabun text-text-main text-sm outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label htmlFor="background" className="block text-sm font-sarabun font-bold text-text-main mb-2">
                แนะนำตัวคุณสั้นๆ (ทำไมถึงอยากเขียน) <span className="text-primary">*</span>
              </label>
              <textarea
                id="background"
                placeholder="เล่าประสบการณ์ หรือเหตุผลที่คุณเหมาะที่จะเล่าเรื่องนี้..."
                rows={4}
                required
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full bg-surface border border-black/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg px-4 py-3 font-sarabun text-text-main text-sm outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label htmlFor="portfolio" className="block text-sm font-sarabun font-bold text-text-main mb-2">
                ลิงก์ผลงานที่ผ่านมา (ไม่บังคับ)
              </label>
              <input
                id="portfolio"
                type="url"
                placeholder="https://..."
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full bg-surface border border-black/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg px-4 py-2 font-sarabun text-text-main text-sm outline-none transition-colors"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-sarabun font-bold px-8 py-3 rounded-full shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? "กำลังส่งข้อมูล..." : "ส่งใบสมัครนักเขียน"}
              </button>
              <p className="text-xs text-text-muted mt-4 font-sarabun text-center sm:text-left">
                ใบสมัครจะอ้างอิงอีเมล <b>{user.email}</b> สำหรับการติดต่อกลับ
              </p>
            </div>
          </form>
        </div>
      </main>

      <MobileBottomNav />
    </>
  );
}