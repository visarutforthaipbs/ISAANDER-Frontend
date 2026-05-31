"use client";

import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { SaveButton } from "@/components/save-button";
import { ShareButton } from "@/components/share-button";
import { useScrollDirection } from "@/components/navigation";

interface PostHeaderProps {
  post: {
    _id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverUrl: string | null;
    categoryLabel: string | null;
    publishedDate: string | null;
  };
}

export function PostHeader({ post }: PostHeaderProps) {
  const visible = useScrollDirection();

  return (
    <header
      className={`sticky top-0 z-50 bg-surface border-b border-black/5 shadow-sm transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <BackButton />
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
          <SaveButton post={post} />
          <ShareButton title={post.title} />
        </div>
      </div>
    </header>
  );
}
