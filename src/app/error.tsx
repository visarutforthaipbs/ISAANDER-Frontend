"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <main id="main-content" className="flex-1 pb-28 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h1 className="font-prompt text-6xl font-bold text-primary mb-4">ขออภัย</h1>
        <p className="font-sarabun text-lg text-text-muted mb-2">
          เกิดข้อผิดพลาดในการโหลดหน้านี้
        </p>
        <p className="font-sarabun text-sm text-text-muted/70 mb-8">
          กรุณาลองใหม่อีกครั้ง หรือกลับไปที่หน้าแรก
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-block px-6 py-3 bg-primary text-white font-sarabun font-medium rounded-full hover:bg-primary/90 transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-surface border border-black/10 text-text-main font-sarabun font-medium rounded-full hover:shadow-md transition-shadow"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </main>
  );
}
