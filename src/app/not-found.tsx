import Link from "next/link";
import { StickyHeader, MobileBottomNav } from "@/components/navigation";

export default function NotFound() {
  return (
    <>
      <StickyHeader />
      <main id="main-content" className="flex-1 pb-28 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="font-prompt text-6xl font-bold text-primary mb-4">404</h1>
          <p className="font-sarabun text-lg text-text-muted mb-2">
            ไม่พบหน้าที่คุณกำลังค้นหา
          </p>
          <p className="font-sarabun text-sm text-text-muted/70 mb-8">
            หน้านี้อาจถูกย้ายหรือลบออกไปแล้ว ลองค้นหาบทความที่คุณสนใจ
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary text-white font-sarabun font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              กลับหน้าแรก
            </Link>
            <Link
              href="/search"
              className="inline-block px-6 py-3 bg-surface border border-black/10 text-text-main font-sarabun font-medium rounded-full hover:shadow-md transition-shadow"
            >
              ค้นหาบทความ
            </Link>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </>
  );
}
