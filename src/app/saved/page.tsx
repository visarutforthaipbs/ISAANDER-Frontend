"use client";

import { useEffect, useState } from "react";
import { Bookmark, Loader2, BookmarkMinus, Check, X, AlertCircle } from "lucide-react";
import { StickyHeader, MobileBottomNav } from "@/components/navigation";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, query, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

interface SavedPost {
  postId: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  categoryLabel: string | null;
  publishedDate: string | null;
}

export default function SavedPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleRemoveSave = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    if (!user) return;

    if (confirmingId !== postId) {
      // First click — ask for confirmation
      setConfirmingId(postId);
      return;
    }

    // Second click — confirmed, delete
    setConfirmingId(null);
    setSavedPosts((current) => current.filter((p) => p.postId !== postId));

    try {
      const saveRef = doc(db, "users", user.uid, "savedPosts", postId);
      await deleteDoc(saveRef);
    } catch (error) {
      console.error("Error removing saved post:", error);
      // Revert if delete failed — re-fetch would be complex, just show a note
    }
  };

  const cancelConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    setConfirmingId(null);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setSavedPosts([]);
      setLoading(false);
      return;
    }

    const fetchSavedPosts = async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "savedPosts"),
          orderBy("savedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const posts: SavedPost[] = [];
        querySnapshot.forEach((docSnap) => {
          posts.push(docSnap.data() as SavedPost);
        });
        setSavedPosts(posts);
        setFetchError(false);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user, authLoading]);

  return (
    <>
      <StickyHeader />

      <main id="main-content" className="flex-1 pb-28 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
          <h1 className="font-prompt text-2xl font-bold text-text-main mb-6">
            บทความที่บันทึก
          </h1>

          {authLoading || loading ? (
            <div className="flex justify-center py-20" aria-label="กำลังโหลด" role="status">
              <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
              <span className="sr-only">กำลังโหลด...</span>
            </div>
          ) : !user ? (
            <div className="text-center py-16 bg-surface rounded-2xl border border-black/5 shadow-sm">
              <Bookmark className="w-12 h-12 text-text-muted/30 mx-auto mb-4" aria-hidden="true" />
              <p className="text-text-main font-sarabun font-bold mb-6">
                กรุณาเข้าสู่ระบบเพื่อดูและจัดการบทความที่คุณบันทึกไว้
              </p>
              <button
                onClick={signInWithGoogle}
                className="inline-flex flex-nowrap items-center justify-center px-6 py-2.5 bg-primary text-white font-sarabun font-medium rounded-full hover:bg-primary/90 transition-colors shadow-sm"
              >
                เข้าสู่ระบบผู้อ่านผ่าน Google
              </button>
            </div>
          ) : fetchError ? (
            <div className="text-center py-16 bg-surface rounded-2xl border border-black/5 shadow-sm">
              <AlertCircle className="w-12 h-12 text-text-muted/30 mx-auto mb-4" aria-hidden="true" />
              <p className="text-text-main font-sarabun font-bold mb-2">
                ไม่สามารถโหลดบทความที่บันทึกได้
              </p>
              <p className="text-sm text-text-muted font-sarabun mb-6">
                กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง
              </p>
              <button
                onClick={() => {
                  setLoading(true);
                  setFetchError(false);
                  // Re-trigger fetch by toggling — simplest approach
                  const refetch = async () => {
                    try {
                      const q = query(
                        collection(db, "users", user.uid, "savedPosts"),
                        orderBy("savedAt", "desc")
                      );
                      const snap = await getDocs(q);
                      const posts: SavedPost[] = [];
                      snap.forEach((d) => posts.push(d.data() as SavedPost));
                      setSavedPosts(posts);
                    } catch {
                      setFetchError(true);
                    } finally {
                      setLoading(false);
                    }
                  };
                  refetch();
                }}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white font-sarabun font-medium rounded-full hover:bg-primary/90 transition-colors shadow-sm"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-2xl border border-black/5 shadow-sm">
              <Bookmark className="w-12 h-12 text-text-muted/30 mx-auto mb-4" aria-hidden="true" />
              <p className="text-text-muted font-sarabun font-bold">
                ยังไม่มีบทความที่บันทึกไว้
              </p>
              <p className="text-sm text-text-muted/70 font-sarabun mt-2">
                กดปุ่มบันทึกในหน้าบทความเพื่อเก็บไว้อ่านทีหลัง
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savedPosts.map((post) => (
                <Link
                  key={post.postId}
                  href={`/post/${post.slug}`}
                  className="flex flex-row gap-4 bg-surface rounded-lg shadow-sm p-3 sm:p-4 items-center hover:shadow-md transition-shadow relative border border-black/5"
                >
                  <div className="w-[30%] sm:w-40 aspect-[4/3] shrink-0 relative rounded-md overflow-hidden bg-background-alt">
                    {post.coverUrl ? (
                      <Image
                        src={post.coverUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-background-alt" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-10 sm:pr-12">
                    {post.categoryLabel && (
                      <span className="bg-secondary/15 text-secondary text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block mb-1.5 sm:mb-2">
                        {post.categoryLabel}
                      </span>
                    )}
                    <h2 className="font-sarabun font-semibold text-sm sm:text-base text-text-main leading-snug line-clamp-2 sm:line-clamp-3 mb-1 sm:mb-2">
                      {post.title}
                    </h2>
                    {post.publishedDate && (
                      <time
                        dateTime={new Date(post.publishedDate).toISOString()}
                        className="font-sarabun text-[10px] sm:text-xs text-text-muted"
                      >
                        {new Date(post.publishedDate).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    )}
                  </div>

                  {confirmingId === post.postId ? (
                    /* Inline confirmation — replaces the delete button */
                    <div
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"
                      onClick={(e) => e.preventDefault()}
                    >
                      <span className="font-sarabun text-xs text-text-muted mr-0.5 hidden sm:inline">
                        ลบออก?
                      </span>
                      <button
                        onClick={(e) => handleRemoveSave(e, post.postId)}
                        className="p-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                        aria-label="ยืนยันการลบ"
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={cancelConfirm}
                        className="p-1.5 rounded-full bg-black/10 text-text-main hover:bg-black/20 transition-colors"
                        aria-label="ยกเลิก"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleRemoveSave(e, post.postId)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors flex shrink-0 items-center justify-center bg-white sm:bg-transparent shadow-sm border border-black/5 sm:border-none sm:shadow-none"
                      aria-label="ลบออกจากที่บันทึก"
                      title="ลบออกจากที่บันทึก"
                    >
                      <BookmarkMinus className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                    </button>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <MobileBottomNav />
    </>
  );
}
