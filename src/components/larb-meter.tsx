"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function LarbMeter() {
  const [data, setData] = useState({ count: 0, weeklyGoal: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeter() {
      try {
        const res = await fetch("/api/tips");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // Fallback silently to defaults
      } finally {
        setLoading(false);
      }
    }
    fetchMeter();
  }, []);

  const percentage = Math.min(100, Math.max(0, (data.count / data.weeklyGoal) * 100));

  return (
    <div 
      className="w-full bg-gradient-to-br from-background to-surface border border-isaander-gold/20 rounded-lg p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:shadow-md"
    >
      {/* Decorative Blur */}
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        {/* Larb Plate Display */}
        <div className="flex-shrink-0 w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center shadow-inner relative animate-bounce" style={{ animationDuration: '3s' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/SVG/lab-donate.svg" 
            alt="ลาบ" 
            className="w-14 h-14 object-contain" 
          />
          <span className="absolute -top-1 -right-1 text-xs bg-isaander-yellow text-text-main px-1.5 py-0.5 rounded-full font-bold shadow-xs">
            {data.count}
          </span>
        </div>

        {/* Content & Progress Bar */}
        <div className="flex-1 w-full text-center md:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
            <span className="inline-flex items-center gap-1 bg-accent text-text-main font-prompt font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
              <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
              Community Goal
            </span>
            <span className="font-prompt text-xs font-semibold text-text-muted">
              ร่วมขับเคลื่อนสื่ออีสานอิสระ
            </span>
          </div>

          <h3 className="font-prompt font-bold text-text-main text-lg mb-1 leading-snug">
            สัปดาห์นี้ เลี้ยงลาบคนบ้านเฮาไปแล้ว {loading ? "..." : `${data.count} จาน`}
          </h3>
          <p className="font-sarabun text-text-muted text-xs mb-4">
            เป้าหมายสัปดาห์นี้ {data.weeklyGoal} จาน · เพื่อสนับสนุนปากเสียงท้องถิ่นไปยาวๆ (เลี้ยงจานละ ฿20-฿100 ตามสะดวก)
          </p>

          {/* Progress Bar Container */}
          <div className="w-full bg-black/5 rounded-full h-3 overflow-hidden shadow-inner relative">
            <div 
              className="h-full bg-linear-to-r from-isaander-gold to-accent transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Progress Stats */}
          <div className="flex justify-between items-center mt-2 text-[10px] font-prompt font-bold text-text-muted">
            <span>{percentage.toFixed(0)}% สำเร็จ</span>
            <span>{data.count} / {data.weeklyGoal} จาน</span>
          </div>
        </div>
      </div>
    </div>
  );
}
