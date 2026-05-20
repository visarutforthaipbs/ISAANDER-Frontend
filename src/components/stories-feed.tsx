"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Define a type close to Wix Post type for local consumption
interface FeedPost {
  _id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  lastPublishedDate?: any;
  minutesToRead?: number;
  computedImageUrl?: string | null;
  categoryIds?: string[];
}

interface AuthorInfo {
  name: string;
  avatar: string;
}

interface StoriesFeedProps {
  posts: FeedPost[];
  categoryMap: Record<string, string>;
  authorMap: Record<string, AuthorInfo>;
}

export function StoriesFeed({ posts, categoryMap, authorMap }: StoriesFeedProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  // Determine categories to show: Limit to top 2 categories by post count + "All" to strictly satisfy Hick's Law (max 3 filters)
  const filterCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      post.categoryIds?.forEach((catId) => {
        if (categoryMap[catId]) {
          counts[catId] = (counts[catId] || 0) + 1;
        }
      });
    });

    const sortedCats = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 2); // Get top 2 categories

    return [
      { id: "all", label: "ทั้งหมด" },
      ...sortedCats.map((id) => ({ id, label: categoryMap[id] })),
    ];
  }, [posts, categoryMap]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    if (selectedCategoryId === "all") return posts;
    return posts.filter((post) =>
      post.categoryIds?.includes(selectedCategoryId)
    );
  }, [posts, selectedCategoryId]);

  return (
    <section aria-label="เรื่องเล่าจากพื้นที่" className="w-full">
      {/* Pillar Header & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/5 pb-4 mb-6">
        <div>
          <p
            className="text-text-muted mb-1 font-prompt font-medium"
            style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            สารบัญ
          </p>
          <h2 className="font-prompt font-semibold text-text-main text-xl">
            เรื่องเล่าจากพื้นที่
          </h2>
        </div>

        {/* 3-pill category filter bar */}
        <div className="flex items-center gap-2 mt-4 md:mt-0 overflow-x-auto pb-1 scrollbar-hide">
          {filterCategories.map((cat) => {
            const isActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-sarabun font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-isaander-orange text-white shadow-sm"
                    : "bg-surface text-text-muted border border-black/5 hover:border-black/20"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List of posts */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-10 bg-surface rounded-xl border border-black/5">
          <p className="font-sarabun text-text-muted">ไม่พบบทความในหมวดหมู่นี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            const imageUrl = post.computedImageUrl ?? null;
            const author = post._id ? authorMap[post._id] : undefined;
            const categoryLabel = post.categoryIds?.[0]
              ? categoryMap[post.categoryIds[0]] ?? null
              : null;

            return (
              <Link
                key={post._id}
                href={`/post/${post.slug}`}
                className="flex flex-col bg-surface hover:shadow-md transition-shadow border border-black/5 group"
                style={{ borderRadius: "8px", overflow: "hidden" }}
              >
                {/* Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/5">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={post.title ?? ""}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-200">
                      <span className="text-stone-400 font-prompt text-xs">No Image</span>
                    </div>
                  )}
                  {categoryLabel && (
                    <span
                      className="absolute top-3 left-3 bg-isaander-yellow text-isaander-black font-sarabun font-bold shadow-sm"
                      style={{ fontSize: "0.625rem", letterSpacing: "0.04em", padding: "3px 8px", borderRadius: "4px" }}
                    >
                      {categoryLabel}
                    </span>
                  )}
                </div>

                {/* Metadata & Content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-sarabun font-semibold text-text-main line-clamp-2 leading-relaxed" style={{ fontSize: "0.9375rem" }}>
                      {post.title}
                    </h3>
                    <p className="font-sarabun text-text-muted text-xs line-clamp-2 mt-1.5 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Byline */}
                  <div className="flex items-center justify-between border-t border-black/5 pt-3 mt-1">
                    {author && (
                      <div className="flex items-center gap-2">
                        {author.avatar ? (
                          <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0">
                            <Image
                              src={author.avatar}
                              alt={author.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="bg-primary/10 flex items-center justify-center shrink-0 w-5 h-5 rounded-full">
                            <span className="font-prompt font-bold text-primary" style={{ fontSize: "0.5rem" }}>
                              {author.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-text-muted font-sarabun truncate" style={{ fontSize: "0.625rem", letterSpacing: "0.04em" }}>
                          {author.name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-text-muted font-sarabun" style={{ fontSize: "0.625rem", letterSpacing: "0.04em" }}>
                      <time dateTime={post.lastPublishedDate ? new Date(post.lastPublishedDate).toISOString() : undefined}>
                        {formatDate(post.lastPublishedDate)}
                      </time>
                      {post.minutesToRead != null && post.minutesToRead > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 shrink-0" />
                            {post.minutesToRead} นาทีอ่าน
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
