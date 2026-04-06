"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

interface SaveButtonProps {
  post: {
    _id: string;
    slug: string;
    title: string;
    excerpt?: string;
    coverUrl?: string | null;
    categoryLabel?: string | null;
    publishedDate?: string | null;
  };
}

export function SaveButton({ post }: SaveButtonProps) {
  const { user, signInWithGoogle } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSavedStatus() {
      if (!user || !post._id) {
        setIsSaved(false);
        setLoading(false);
        return;
      }

      try {
        const saveRef = doc(db, "users", user.uid, "savedPosts", post._id);
        const saveSnap = await getDoc(saveRef);
        setIsSaved(saveSnap.exists());
      } catch (error) {
        console.error("Error checking saved status:", error);
      } finally {
        setLoading(false);
      }
    }

    checkSavedStatus();
  }, [user, post._id]);

  const toggleSave = async () => {
    if (!user) {
      // If not logged in, prompt login
      await signInWithGoogle();
      return;
    }

    if (!post._id) return;

    // Optimistic UI update
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      const saveRef = doc(db, "users", user.uid, "savedPosts", post._id);
      
      if (newSavedState) {
        await setDoc(saveRef, {
          postId: post._id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt || null,
          coverUrl: post.coverUrl || null,
          categoryLabel: post.categoryLabel || null,
          publishedDate: post.publishedDate || null,
          savedAt: serverTimestamp(),
        });
      } else {
        await deleteDoc(saveRef);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      // Revert optimistic update
      setIsSaved(!newSavedState);
      alert("เกิดข้อผิดพลาดในการบันทึกบทความ");
    }
  };

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className={`p-2 rounded-full transition-colors flex items-center justify-center ${
        isSaved 
          ? "text-primary hover:bg-primary/10" 
          : "text-text-muted hover:text-text-main hover:bg-black/5"
      }`}
      aria-label={isSaved ? "ยกเลิกการบันทึก" : "บันทึกบทความ"}
      title={isSaved ? "ยกเลิกการบันทึก" : "บันทึกบทความ"}
    >
      <Bookmark 
        className="w-5 h-5" 
        fill={isSaved ? "currentColor" : "none"} 
      />
    </button>
  );
}