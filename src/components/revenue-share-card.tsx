"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";

interface RevenuePeriod {
  revenue: number;
  views: number;
  isReal: boolean;
  label: string;
}

interface Writer {
  name: string;
  revenueSharePercent?: number;
  postCount: number;
}

interface RevenueShareCardProps {
  overall: RevenuePeriod;
  monthly: RevenuePeriod;
  writer: Writer;
  authorShareOverall: number;
  authorShareMonthly: number;
}

type TabKey = "overall" | "monthly";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overall", label: "ย้อนหลัง 1 ปี" },
  { key: "monthly", label: "30 วันล่าสุด" },
];

export function RevenueShareCard({
  overall,
  monthly,
  writer,
  authorShareOverall,
  authorShareMonthly,
}: RevenueShareCardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overall");
  const sharePercent = writer.revenueSharePercent ?? 60;

  const data = activeTab === "overall" ? overall : monthly;
  const authorShare = activeTab === "overall" ? authorShareOverall : authorShareMonthly;
  const isLarge = activeTab === "overall";

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-6">
      <div className="bg-surface rounded-xl border border-black/5 shadow-sm p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-prompt font-semibold text-text-main text-sm">
              Revenue Share
            </h3>
            <p className="font-sarabun text-xs text-text-muted">
              ส่วนแบ่งรายได้จากโฆษณา
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/[0.03] rounded-lg p-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-xs font-sarabun font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-primary shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
              aria-pressed={activeTab === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-black/[0.02] rounded-lg p-3 text-center">
            <p
              className={`font-prompt font-bold text-text-main ${
                isLarge ? "text-lg" : "text-base"
              }`}
            >
              {data.views.toLocaleString()}
            </p>
            <p className={`font-sarabun text-text-muted ${isLarge ? "text-xs" : "text-[10px]"}`}>
              ยอดวิว
            </p>
          </div>
          <div className="bg-black/[0.02] rounded-lg p-3 text-center">
            <p
              className={`font-prompt font-bold text-text-main ${
                isLarge ? "text-lg" : "text-base"
              }`}
            >
              ฿{Math.round(data.revenue).toLocaleString()}
            </p>
            <p className={`font-sarabun text-text-muted ${isLarge ? "text-xs" : "text-[10px]"}`}>
              รายได้รวม
            </p>
          </div>
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <p
              className={`font-prompt font-bold text-primary ${
                isLarge ? "text-lg" : "text-base"
              }`}
            >
              ฿{authorShare.toLocaleString()}
            </p>
            <p className={`font-sarabun text-text-muted ${isLarge ? "text-xs" : "text-[10px]"}`}>
              ส่วนแบ่งของคุณ
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 rounded-full bg-black/5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${sharePercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs font-sarabun text-text-muted">
              <span>
                นักเขียน {sharePercent}% — ฿
                {authorShareOverall.toLocaleString()}
              </span>
              <span>
                แพลตฟอร์ม {100 - sharePercent}% — ฿
                {Math.round(overall.revenue - authorShareOverall).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="font-sarabun text-xs text-text-muted mt-3 italic">
          {overall.isReal
            ? `* คำนวณจากรายได้ AdSense จริง · ${writer.postCount} บทความ`
            : `* ประมาณการเบื้องต้น (RPM ฿30) · ${writer.postCount} บทความ`}
        </p>
      </div>
    </section>
  );
}
