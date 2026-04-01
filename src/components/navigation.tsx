"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Home, Compass, Bookmark, ArrowLeft, Users, LogIn } from "lucide-react";

export function StickyHeader({ showBack = false }: { showBack?: boolean }) {
  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-black/5 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link
              href="/"
              className="p-2 -ml-2 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
              aria-label="กลับหน้าแรก"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <Link href="/" className="font-prompt text-xl font-bold text-primary tracking-tight">
            The Isaander
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="p-2 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
            aria-label="ค้นหา"
          >
            <Search className="w-5 h-5" />
          </Link>
          <Link
            href="/author/dashboard"
            className="p-2 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
            aria-label="เข้าสู่ระบบ"
          >
            <LogIn className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "หน้าแรก", href: "/" },
    { icon: Compass, label: "สำรวจ", href: "/explore" },
    { icon: Users, label: "นักเขียน", href: "/author" },
    { icon: Bookmark, label: "บันทึก", href: "/saved" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-surface border-t border-black/5 z-50">
      <div className="flex justify-around items-center py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 transition-colors min-w-11 min-h-11 justify-center px-4 ${
                active
                  ? "text-primary"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-sarabun">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
