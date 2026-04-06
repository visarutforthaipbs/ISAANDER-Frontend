"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { LogIn, PenSquare } from "lucide-react";

export function LoginCta() {
  const { user, signInWithGoogle } = useAuth();

  if (user) {
    return (
      <Link
        href="/profile/apply"
        className="inline-flex items-center gap-2 bg-surface text-primary border border-primary/30 font-sarabun text-sm font-medium px-4 py-2 rounded-full hover:bg-primary/5 transition-colors"
      >
        <PenSquare className="w-4 h-4" />
        เขียนบทความกับเรา
      </Link>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="inline-flex items-center gap-2 bg-surface text-primary border border-primary/30 font-sarabun text-sm font-medium px-4 py-2 rounded-full hover:bg-primary/5 transition-colors"
    >
      <LogIn className="w-4 h-4" />
      เข้าสู่ระบบผู้อ่าน
    </button>
  );
}
