import { Bookmark } from "lucide-react";
import { StickyHeader, MobileBottomNav } from "@/components/navigation";

export const metadata = {
  title: "บันทึก — The Isaander",
  description: "บทความที่บันทึกไว้",
};

export default function SavedPage() {
  return (
    <>
      <StickyHeader />

      <main id="main-content" className="flex-1 pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
          <h1 className="font-prompt text-2xl font-bold text-text-main mb-6">
            บทความที่บันทึก
          </h1>

          <div className="text-center py-20">
            <Bookmark className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
            <p className="text-text-muted font-sarabun">
              ยังไม่มีบทความที่บันทึกไว้
            </p>
            <p className="text-sm text-text-muted/70 font-sarabun mt-2">
              กดปุ่มบันทึกเพื่อเก็บบทความที่น่าสนใจไว้อ่านทีหลัง
            </p>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </>
  );
}
