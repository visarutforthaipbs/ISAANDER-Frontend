/* eslint-disable @next/next/no-img-element */
import { media } from "@wix/sdk";
import Link from "next/link";
import { Search } from "lucide-react";
import wixClient from "@/lib/wix-client";
import { formatDate } from "@/lib/utils";
import { resolveAuthor } from "@/lib/author-utils";
import { StickyHeader, MobileBottomNav } from "@/components/navigation";

export const metadata = {
  title: "ค้นหา — The Isaander",
  description: "ค้นหาบทความ",
};

export const dynamic = "force-dynamic";

function getPostImageUrl(
  imageString: string | undefined,
  width: number,
  height: number
): string | null {
  if (!imageString) return null;
  try {
    return media.getScaledToFillImageUrl(imageString, width, height, {});
  } catch {
    return null;
  }
}

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

async function searchPosts(query: string) {
  if (!query.trim()) return [];
  try {
    const { posts: items } = await wixClient.posts.listPosts({
      paging: { limit: 50 },
    });
    const q = query.toLowerCase();
    return (items ?? []).filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q)
    );
  } catch {
    return [];
  }
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
                      <img
                        src={imageUrl}
                        alt={post.title ?? ""}
                        className="rounded-md aspect-square w-full object-cover"
                      />
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
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="font-sarabun text-xs text-text-muted line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
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
