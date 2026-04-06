import Link from "next/link";
import { StickyHeader, MobileBottomNav } from "@/components/navigation";

export default function NotFound() {
  return (
    <>
      <StickyHeader />
      <main id="main-content" className="flex-1 pb-28 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-prompt text-6xl font-bold text-primary mb-4">404</h1>
          <p className="font-sarabun text-lg text-text-muted mb-6">
            ไม่พบหน้าที่คุณกำลังค้นหา
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white font-sarabun font-medium rounded-full hover:bg-primary/90 transition-colors"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </main>
      <MobileBottomNav />
    </>
  );
}
