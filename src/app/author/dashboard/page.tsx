"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  DollarSign,
  FileText,
  LogOut,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface PageData {
  path: string;
  pageTitle: string;
  views: number;
}

interface DashboardData {
  totalViews: number;
  estimatedRevenue: number;
  authorShare: number;
  pages: PageData[];
  periodLabel: string;
  postCount: number;
  revenueSharePercent: number;
}

interface UserInfo {
  slug: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((d) => setUser(d.user))
      .catch(() => router.push("/author/dashboard/login"));
  }, [router]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user, fetchAnalytics]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/author/dashboard/login");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-black/5 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-prompt text-xl font-bold text-primary tracking-tight"
            >
              The Isaander
            </Link>
            <span className="text-text-muted font-sarabun text-sm hidden sm:inline">
              / Writer Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted font-sarabun hidden sm:inline">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Title + Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-prompt text-2xl font-bold text-text-main flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Dashboard
            </h1>
            <p className="font-sarabun text-sm text-text-muted mt-1">
              สวัสดี {user.name} — ข้อมูลรายได้และสถิติบทความ
            </p>
          </div>

          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 text-sm font-sarabun rounded-full border transition-colors ${
                  days === d
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-text-main border-black/10 hover:border-primary/50"
                }`}
              >
                {d} วัน
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : data ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<Eye className="w-5 h-5" />}
                label="ยอดวิว"
                value={data.totalViews.toLocaleString()}
                color="text-blue-600 bg-blue-50"
              />
              <StatCard
                icon={<FileText className="w-5 h-5" />}
                label="บทความ"
                value={data.postCount.toString()}
                color="text-secondary bg-secondary/10"
              />
              <StatCard
                icon={<DollarSign className="w-5 h-5" />}
                label="รายได้โดยประมาณ"
                value={`฿${data.estimatedRevenue.toLocaleString()}`}
                sub="รวมทั้งหมด"
                color="text-accent bg-accent/10"
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="ส่วนแบ่งของคุณ"
                value={`฿${data.authorShare.toLocaleString()}`}
                sub={`${data.revenueSharePercent}% revenue share`}
                color="text-primary bg-primary/10"
              />
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-surface rounded-xl border border-black/5 shadow-sm p-5 mb-8">
              <h2 className="font-prompt font-semibold text-text-main mb-1">
                การแบ่งรายได้
              </h2>
              <p className="font-sarabun text-sm text-text-muted mb-4">
                ช่วง {data.periodLabel} ที่ผ่านมา
              </p>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${data.revenueSharePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-sarabun text-text-muted">
                    <span>
                      คุณ: {data.revenueSharePercent}% (฿
                      {data.authorShare.toLocaleString()})
                    </span>
                    <span>
                      แพลตฟอร์ม: {100 - data.revenueSharePercent}% (฿
                      {(data.estimatedRevenue - data.authorShare).toLocaleString()})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Pages Table */}
            {data.pages.length > 0 && (
              <div className="bg-surface rounded-xl border border-black/5 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-black/5">
                  <h2 className="font-prompt font-semibold text-text-main">
                    บทความยอดนิยม
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-black/[0.02]">
                        <th className="text-left px-5 py-3 font-sarabun font-medium text-text-muted">
                          บทความ
                        </th>
                        <th className="text-right px-5 py-3 font-sarabun font-medium text-text-muted">
                          ยอดวิว
                        </th>
                        <th className="text-right px-5 py-3 font-sarabun font-medium text-text-muted hidden sm:table-cell">
                          รายได้ (ประมาณ)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {data.pages.map((page) => {
                        const pageRevenue = estimatePageRevenue(
                          page.views,
                          data.revenueSharePercent
                        );
                        return (
                          <tr key={page.path} className="hover:bg-black/[0.01]">
                            <td className="px-5 py-3">
                              <Link
                                href={page.path}
                                className="font-sarabun text-text-main hover:text-primary transition-colors line-clamp-1"
                              >
                                {page.pageTitle || page.path}
                              </Link>
                              <span className="block text-xs text-text-muted font-sarabun mt-0.5 truncate max-w-xs">
                                {page.path}
                              </span>
                            </td>
                            <td className="text-right px-5 py-3 font-sarabun text-text-main tabular-nums">
                              {page.views.toLocaleString()}
                            </td>
                            <td className="text-right px-5 py-3 font-sarabun text-text-main tabular-nums hidden sm:table-cell">
                              ฿{pageRevenue}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {data.pages.length === 0 && (
              <div className="bg-surface rounded-xl border border-black/5 shadow-sm p-10 text-center">
                <BarChart3 className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                <p className="font-sarabun text-text-muted">
                  {data.postCount > 0
                    ? "ยังไม่มีข้อมูลสถิติสำหรับช่วงเวลานี้ — ตรวจสอบว่า GA4 ถูกตั้งค่าแล้ว"
                    : "ยังไม่มีบทความที่เผยแพร่"}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-surface rounded-xl border border-black/5 shadow-sm p-10 text-center">
            <p className="font-sarabun text-text-muted">
              ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-black/5 shadow-sm p-4">
      <div
        className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <p className="font-sarabun text-xs text-text-muted">{label}</p>
      <p className="font-prompt text-xl font-bold text-text-main mt-0.5">
        {value}
      </p>
      {sub && (
        <p className="font-sarabun text-xs text-text-muted mt-1">{sub}</p>
      )}
    </div>
  );
}

function estimatePageRevenue(views: number, sharePercent: number): string {
  const rpm = 30; // THB per 1000 views
  const total = (views / 1000) * rpm;
  const authorCut = (total * sharePercent) / 100;
  return authorCut.toFixed(2);
}
