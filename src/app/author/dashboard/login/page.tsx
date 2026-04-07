"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, AlertCircle } from "lucide-react";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Read directly from DOM so browser autofill is always captured
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim() ?? "";
    const password = (formData.get("password") as string) ?? "";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      router.push("/author/dashboard");
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-prompt text-2xl font-bold text-primary"
          >
            The Isaander
          </Link>
          <p className="text-sm text-text-muted font-sarabun mt-2">
            เข้าสู่ระบบ Writer Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface rounded-xl shadow-sm border border-black/5 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm font-sarabun px-4 py-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-sarabun font-medium text-text-main mb-1.5"
              >
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-white font-sarabun text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-sarabun font-medium text-text-main mb-1.5"
              >
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-white font-sarabun text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-primary text-white font-prompt font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted font-sarabun mt-6">
          สำหรับนักเขียนที่ได้รับการอนุมัติเท่านั้น
        </p>
      </div>
    </div>
  );
}
