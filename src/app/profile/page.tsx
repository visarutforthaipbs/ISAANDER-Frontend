"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { StickyHeader, MobileBottomNav } from "@/components/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { CheckCircle2, ChevronRight, LogOut, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");

  // Guard: if not loading and no user, Redirect to home
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Load existing data
  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setBio(user.bio || "");
      setFacebook(user.socialLinks?.facebook || "");
      setTwitter(user.socialLinks?.twitter || "");
      setInstagram(user.socialLinks?.instagram || "");
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        phone,
        bio,
        socialLinks: {
          facebook,
          twitter,
          instagram,
        },
        profileComplete: true, // once they hit save, it's complete
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    router.push("/");
  };

  return (
    <>
      <StickyHeader showBack />

      <main id="main-content" className="flex-1 pb-28">
        <div className="max-w-xl mx-auto px-4 sm:px-6 pt-8">
          
          <div className="flex justify-between items-start mb-8">
            <div className="flex gap-4 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Profile"}
                  className="w-16 h-16 rounded-full object-cover border border-black/10"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                  {user.displayName?.[0] || user.email?.[0] || "?"}
                </div>
              )}
              
              <div>
                <h1 className="font-prompt text-2xl font-bold text-text-main line-clamp-1">
                  {user.displayName}
                </h1>
                <p className="font-sarabun text-text-muted text-sm line-clamp-1">{user.email}</p>
                {user.role === "writer" ? (
                   <span className="inline-block bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1">
                     The Isaander Writer
                   </span>
                ) : (
                   <span className="inline-block bg-secondary/15 text-secondary text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1">
                     ผู้อ่าน
                   </span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-text-muted hover:text-primary p-2 transition-colors flex flex-col items-center gap-1 group"
              aria-label="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-sarabun group-hover:underline">ออกจากระบบ</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-sm border border-black/5 p-6 mb-8">
            <h2 className="font-prompt text-lg font-semibold text-text-main mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full" aria-hidden="true" />
              ข้อมูลโปรไฟล์ (KYC)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-sarabun font-bold text-text-main mb-1">
                  ชื่อ-นามสกุล / นามปากกา
                </label>
                <input
                  type="text"
                  value={user.displayName || ""}
                  disabled
                  className="w-full bg-black/5 border border-black/10 rounded-lg px-4 py-2 font-sarabun text-text-muted text-sm cursor-not-allowed"
                />
                <p className="text-[10px] text-text-muted mt-1">อิงตามบัญชี Google ของคุณ</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-sarabun font-bold text-text-main mb-1">
                  เบอร์โทรศัพท์ (ไม่บังคับ)
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="08X-XXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface border border-black/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg px-4 py-2 font-sarabun text-text-main text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-sarabun font-bold text-text-main mb-1">
                  ข้อมูลเบื้องต้นเกี่ยวกับคุณ (ไม่บังคับ)
                </label>
                <textarea
                  id="bio"
                  placeholder="เขียนประวัติสั้นๆ เช่น ความสนใจ, อาชีพ, จังหวัดที่อยู่"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-surface border border-black/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg px-4 py-2 font-sarabun text-text-main text-sm outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-4 border-t border-black/5">
                <h3 className="font-sarabun text-sm font-bold text-text-main mb-3">โซเชียลมีเดีย (ไม่บังคับ)</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-xs font-sarabun text-text-muted shrink-0 text-right">Facebook:</span>
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full bg-surface border border-black/10 focus:border-primary/50 rounded-lg px-3 py-1.5 font-sarabun text-text-main text-sm outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-xs font-sarabun text-text-muted shrink-0 text-right">X (Twitter):</span>
                    <input
                      type="url"
                      placeholder="https://x.com/..."
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full bg-surface border border-black/10 focus:border-primary/50 rounded-lg px-3 py-1.5 font-sarabun text-text-main text-sm outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-xs font-sarabun text-text-muted shrink-0 text-right">Instagram:</span>
                    <input
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-surface border border-black/10 focus:border-primary/50 rounded-lg px-3 py-1.5 font-sarabun text-text-main text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white font-sarabun font-bold px-6 py-2 rounded-full shadow-sm transition-colors flex items-center gap-2"
              >
                {saving ? (
                  "กำลังบันทึก..."
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> บันทึกสำเร็จ
                  </>
                ) : (
                  "บันทึกข้อมูล"
                )}
              </button>
            </div>
          </form>

          {/* Writer Call To Action box */}
          {user.role !== "writer" && (
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 sm:p-6 mb-8">
              <h3 className="font-prompt text-lg font-bold text-text-main mb-2">อยากเล่าเรื่องจากพื้นที่ของคุณไหม?</h3>
              <p className="font-sarabun text-text-muted text-sm leading-relaxed mb-4">
                The Isaander เปิดรับนักเขียนและนักเล่าเรื่องมาร่วมบอกเล่าความจริงจากมุมมองของคุณ 
                หากคุณมีเรื่องที่อยากเล่า และต้องการสื่อสารให้สังคมได้รับรู้ สมัครส่งผลงานของคุณได้ที่นี่
              </p>
              <Link 
                href="/profile/apply" 
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white border border-accent/50 hover:bg-accent hover:text-text-main hover:border-transparent text-text-main font-sarabun font-bold px-6 py-2.5 rounded-full transition-colors text-sm"
              >
                สมัครเป็นนักเขียน
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

        </div>
      </main>

      <MobileBottomNav />
    </>
  );
}