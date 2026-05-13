"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Home, Compass, Bookmark, ArrowLeft, LogIn, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";

/**
 * Hook that tracks scroll direction.
 * Returns true when the user is scrolling UP (header should show).
 * Uses a threshold to avoid jitter from small scroll movements.
 */
function useScrollDirection() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const THRESHOLD = 10; // px of scroll before toggling

    function update() {
      const y = window.scrollY;
      // Always show header at the very top
      if (y < 56) {
        setVisible(true);
      } else if (Math.abs(y - lastY.current) > THRESHOLD) {
        setVisible(y < lastY.current); // scrolling up → show
        lastY.current = y;
      }
      ticking.current = false;
    }

    function onScroll() {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible;
}

export function StickyHeader({ showBack = false }: { showBack?: boolean }) {
  const { user, signInWithGoogle } = useAuth();
  const visible = useScrollDirection();
  
  return (
    <header
      className={`sticky top-0 z-50 bg-surface border-b border-black/5 shadow-sm transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => window.history.back()}
              className="min-w-11 min-h-11 flex items-center justify-center -ml-2 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
              aria-label="กลับหน้าก่อนหน้า"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-black.svg"
              alt="The Isaander"
              width={116}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
            aria-label="ค้นหา"
          >
            <Search className="w-5 h-5" />
          </Link>

          {user ? (
            <Link
              href="/profile"
              className="min-w-11 min-h-11 flex items-center justify-center rounded-full border border-black/10 hover:border-primary/50 transition-colors"
              aria-label="โปรไฟล์"
            >
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Profile"}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </Link>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
              aria-label="เข้าสู่ระบบ"
            >
              <LogIn className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  // Signal 39: Layer 2 Chunked Gateway — Max 3 primary navigation items
  const navItems = [
    { icon: Home, label: "หน้าแรก", href: "/" },
    { icon: Compass, label: "สำรวจ", href: "/explore" },
    { icon: Bookmark, label: "บันทึก", href: "/saved" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-surface border-t border-black/5 z-50">
      <div className="flex justify-around items-center pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
                  ? "text-isaander-orange"
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

/** Re-export the scroll direction hook for the post page's inline header */
export { useScrollDirection };
