import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import wixClient from "@/lib/wix-client";
import { getPostImageUrl, formatDate } from "@/lib/utils";
import { resolveAuthor } from "@/lib/author-utils";
import { HighlightText } from "@/components/highlight-text";
import { StickyHeader, MobileBottomNav } from "@/components/navigation";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return {
    title: q ? `ผลการค้นหา "${q}" — The Isaander` : "ค้นหา — The Isaander",
    description: "ค้นหาบทความจาก The Isaander",
    robots: q ? { index: false } : { index: true, follow: true },
  };
}

export const revalidate = 300;

async function getCategoryMap() {
  try {
    const { categories: items } = await wixClient.categories.listCategories();
    const map = new Map<string, string>();
    for (const cat of items ?? []) {
      if (cat._id && cat.label) map.set(cat._id, cat.label);
    }
    return map;
  } catch {
    return new Map<string, string>();
  }
}

let _allPostsCache: Awaited<ReturnType<typeof wixClient.posts.listPosts>>["posts"] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getAllPostsForSearch() {
  const now = Date.now();
  if (_allPostsCache && now - _cacheTime < CACHE_TTL) {
    return _allPostsCache;
  }
  try {
    const { posts: items } = await wixClient.posts.listPosts({
      paging: { limit: 100 },
    });
    _allPostsCache = items ?? [];
    _cacheTime = now;
    return _allPostsCache;
  } catch {
    return [];
  }
}

async function searchPosts(query: string) {
  if (!query.trim()) return [];
  const items = await getAllPostsForSearch();
  const q = query.toLowerCase();
  return items.filter(
    (p) =>
      p.title?.toLowerCase().includes(q) ||
      p.excerpt?.toLowerCase().includes(q)
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [results, categoryMap] = await Promise.all([
    q ? searchPosts(q) : Promise.resolve([]),
    getCategoryMap(),
  ]);

  return (
    <>
      <StickyHeader />

      <main id="main-content" className="flex-1 pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
          <h1 className="sr-only">ค้นหาบทความ</h1>
          {/* Search form */}
          <form
            action="/search"
            method="GET"
            role="search"
            aria-label="ค้นหาบทความ"
            className="mb-6"
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                aria-hidden="true"
              />
              <label htmlFor="search-input" className="sr-only">
                ค้นหาบทความ
              </label>
              <input
                id="search-input"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="ค้นหาบทความ..."
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface border border-black/10 font-sarabun text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </form>

          {/* Results count */}
          {q && (
            <p className="text-sm text-text-muted font-sarabun mb-4">
              {results.length > 0
                ? `พบ ${results.length} บทความสำหรับ "${q}"`
                : `ไม่พบบทความสำหรับ "${q}"`}
            </p>
          )}

          <div className="flex flex-col gap-4">
            {results.map((post) => {
              const imageUrl = getPostImageUrl(
                post.media?.wixMedia?.image,
                300,
                300
              );
              const tag = post.categoryIds?.[0]
                ? categoryMap.get(post.categoryIds[0]) ?? null
                : null;
              const author = resolveAuthor(post);

              return (
                <Link
                  key={post._id}
                  href={`/post/${post.slug}`}
                  className="flex gap-4 bg-surface rounded-lg shadow-sm p-3 items-center hover:shadow-md transition-shadow"
                >
                  <div className="w-[25%] shrink-0">
                    {imageUrl ? (
                      <div className="relative rounded-md aspect-square w-full overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={post.title ?? ""}
                          fill
                          sizes="(max-width: 640px) 25vw, 120px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-stone-200 rounded-md aspect-square w-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                    {tag && (
                      <span className="inline-block self-start bg-secondary/15 text-secondary text-xs font-sarabun font-medium px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    )}
                    <h3 className="font-sarabun text-sm font-medium text-text-main leading-relaxed line-clamp-2">
                      <HighlightText text={post.title ?? ""} query={q} />
                    </h3>
                    {post.excerpt && (
                      <p className="font-sarabun text-xs text-text-muted line-clamp-2">
                        <HighlightText text={post.excerpt} query={q} />
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {author.avatar ? (
                        <Image
                          src={author.avatar}
                          alt={author.name}
                          width={16}
                          height={16}
                          unoptimized
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center">
                          <span className="text-[8px] text-primary font-prompt font-bold">{author.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-sarabun text-xs text-text-muted">
                        {author.name}
                      </span>
                      <span className="text-text-muted">·</span>
                      <time
                        dateTime={
                          post.lastPublishedDate
                            ? new Date(post.lastPublishedDate).toISOString()
                            : undefined
                        }
                        className="font-sarabun text-xs text-text-muted"
                      >
                        {formatDate(post.lastPublishedDate)}
                      </time>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Empty state when no query */}
          {!q && (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-text-muted/30 mx-auto mb-4" aria-hidden="true" />
              <p className="text-text-muted font-sarabun">
                พิมพ์คำค้นหาเพื่อค้นหาบทความ
              </p>
            </div>
          )}
        </div>
      </main>

      <MobileBottomNav />
    </>
  );
}
