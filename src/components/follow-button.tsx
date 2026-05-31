"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

interface FollowButtonProps {
  writer: {
    slug: string;
    name: string;
    avatar?: string | null;
    title?: string | null;
  };
  /** "pill" = labelled button (default), "compact" = smaller pill for tight byline rows */
  variant?: "pill" | "compact";
}

export function FollowButton({ writer, variant = "pill" }: FollowButtonProps) {
  const { user, signInWithGoogle } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Don't offer "follow" for the editorial org account — it isn't a KOL.
  const isFollowable = writer.slug && writer.slug !== "theisaander";

  useEffect(() => {
    async function checkFollowStatus() {
      if (!user || !isFollowable) {
        setIsFollowing(false);
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid, "followedWriters", writer.slug);
        const snap = await getDoc(ref);
        setIsFollowing(snap.exists());
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setLoading(false);
      }
    }

    checkFollowStatus();
  }, [user, writer.slug, isFollowable]);

  if (!isFollowable) return null;

  const toggleFollow = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    // Optimistic UI update
    const next = !isFollowing;
    setIsFollowing(next);

    try {
      const ref = doc(db, "users", user.uid, "followedWriters", writer.slug);

      if (next) {
        await setDoc(ref, {
          slug: writer.slug,
          name: writer.name,
          avatar: writer.avatar || null,
          title: writer.title || null,
          followedAt: serverTimestamp(),
        });
      } else {
        await deleteDoc(ref);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      // Revert optimistic update
      setIsFollowing(!next);
    }
  };

  const sizing =
    variant === "compact"
      ? "text-xs px-3 py-1.5 gap-1"
      : "text-xs px-4 py-2.5 gap-1.5";

  const Icon = isFollowing ? UserCheck : UserPlus;

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`inline-flex items-center font-prompt font-bold rounded-full transition-all duration-200 disabled:opacity-60 ${sizing} ${
        isFollowing
          ? "bg-black/5 text-text-muted hover:bg-black/10"
          : "bg-accent text-text-main shadow-xs hover:bg-accent/90 hover:shadow-md"
      }`}
      aria-pressed={isFollowing}
      aria-label={isFollowing ? `เลิกติดตาม ${writer.name}` : `ติดตาม ${writer.name}`}
    >
      <Icon className={variant === "compact" ? "w-3.5 h-3.5" : "w-4 h-4"} aria-hidden="true" />
      <span>{isFollowing ? "กำลังติดตาม" : "ติดตาม"}</span>
    </button>
  );
}
