import Image from "next/image";
import Link from "next/link";
import wixClient from "@/lib/wix-client";
import { getPostImageUrl, formatDate } from "@/lib/utils";
import { resolveAuthorAsync } from "@/lib/author-utils";
import type { Author } from "@/data/authors";
import { StickyHeader, MobileBottomNav } from "@/components/navigation";
import { Clock } from "lucide-react";

export const revalidate = 300;

export const metadata = {
  title: "สำรวจ — The Isaander",
  description: "สำรวจบทความตามหมวดหมู่และค้นหาเรื่องราวอีสานที่น่าสนใจ",
};

async function getCategories() {
  const { categories: items } = await wixClient.categories.listCategories();
  return items ?? [];
}

async function getPostsByCategory(categoryId: string) {
  try {
    const { posts: items } = await wixClient.posts.listPosts({
      categoryIds: [categoryId],
      paging: { limit: 3 }, // Limit to exactly 3 posts for clean grid
    });
    return items ?? [];
  } catch {
    return [];
  }
}

// Styling tokens matching DESIGN.md
const chunkLabelStyle = {
  fontSize: "0.75rem",
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const metaStyle = {
  fontSize: "0.625rem",
  letterSpacing: "0.04em",
};

export default async function ExplorePage() {
  const categories = await getCategories();

  const categoryPosts = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      posts: cat._id ? await getPostsByCategory(cat._id) : [],
    }))
  );

  const nonEmpty = categoryPosts.filter((cp) => cp.posts.length > 0);

  const authorMap = new Map<string, Author>();
  const allPosts = nonEmpty.flatMap((cp) => cp.posts);
  await Promise.all(
    allPosts.map(async (post) => {
      if (post._id) {
        try {
          const author = await resolveAuthorAsync(post);
          authorMap.set(post._id, author);
        } catch {
          authorMap.set(post._id, { name: "The Isaander", avatar: "" } as Author);
        }
      }
    })
  );

  return (
    <>
      <StickyHeader />

      <main id="main-content" className="flex-1 pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
          {/* display-hero heading */}
          <h1
            className="font-prompt font-semibold text-text-main mb-3"
            style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
          >
            อ่านเรื่องราวอีสานที่คุณยังไม่รู้
          </h1>
          <p className="font-sarabun text-text-muted text-sm max-w-lg mb-8 leading-relaxed">
            เจาะลึกวิถีชีวิต ศิลปวัฒนธรรม และประเด็นสังคมในภาคอีสาน ผ่านมุมมองของคนในพื้นที่แบบไม่มีฟิลเตอร์
          </p>

          {/* Section Divider */}
          <div className="border-t border-black/5 pt-8 mb-6">
            <p className="text-text-muted mb-4 font-prompt font-medium" style={chunkLabelStyle}>
              สำรวจตามหมวดหมู่
            </p>

            {/* Premium Category Pills */}
            <div className="flex flex-wrap gap-2" role="navigation" aria-label="หมวดหมู่">
              {nonEmpty.map(({ category }) => (
                <a
                  key={category._id}
                  href={`#cat-${category._id}`}
                  className="px-4 py-2 bg-surface hover:bg-isaander-orange hover:text-white border border-black/5 hover:border-isaander-orange text-text-main font-sarabun text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  style={{ borderRadius: "20px" }}
                >
                  {category.label}
                </a>
              ))}
            </div>
          </div>

          {/* Category Sections (Pillars) with Spacing.Breath (64px) */}
          <div className="flex flex-col gap-16 mt-12">
            {nonEmpty.map(({ category, posts }) => (
              <section
                key={category._id}
                id={`cat-${category._id}`}
                className="scroll-mt-24 w-full border-t border-black/5 pt-8"
              >
                {/* Chunk label */}
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-text-muted mb-1" style={chunkLabelStyle}>
                      หมวดหมู่
                    </p>
                    <h2 className="font-prompt text-xl font-bold text-text-main flex items-center gap-2">
                      <span
                        className="w-1 h-5 bg-isaander-orange rounded-full shrink-0"
                        aria-hidden="true"
                        style={{ borderRadius: "4px" }}
                      />
                      {category.label}
                    </h2>
                  </div>
                  
                  <Link
                    href={`/search?category=${category._id}`}
                    className="font-sarabun text-xs font-bold text-isaander-orange hover:underline shrink-0"
                  >
                    ดูทั้งหมด →
                  </Link>
                </div>

                {/* Grid List of posts for this category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {posts.map((post) => {
                    const imageUrl = getPostImageUrl(post.media?.wixMedia?.image, 350, 220);
                    const author = post._id ? authorMap.get(post._id) : undefined;

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
                              sizes="(max-width: 768px) 100vw, 300px"
                              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stone-200">
                              <span className="text-stone-400 font-prompt text-xs">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div>
                            <h3 className="font-sarabun font-semibold text-text-main line-clamp-2 leading-relaxed" style={{ fontSize: "0.875rem" }}>
                              {post.title}
                            </h3>
                            <p className="font-sarabun text-text-muted text-xs line-clamp-2 mt-1 leading-relaxed">
                              {post.excerpt}
                            </p>
                          </div>

                          {/* Byline */}
                          <div className="flex items-center justify-between border-t border-black/5 pt-3 mt-1">
                            {author && (
                              <div className="flex items-center gap-1.5 min-w-0">
                                {author.avatar ? (
                                  <div className="relative w-4.5 h-4.5 rounded-full overflow-hidden shrink-0">
                                    <Image
                                      src={author.avatar}
                                      alt={author.name}
                                      fill
                                      unoptimized
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="bg-primary/10 flex items-center justify-center shrink-0 w-4.5 h-4.5 rounded-full">
                                    <span className="font-prompt font-bold text-primary" style={{ fontSize: "0.5rem" }}>
                                      {author.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <span className="text-text-muted font-sarabun truncate" style={metaStyle}>
                                  {author.name}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-1 text-text-muted font-sarabun" style={metaStyle}>
                              <time dateTime={post.lastPublishedDate ? new Date(post.lastPublishedDate).toISOString() : undefined}>
                                {formatDate(post.lastPublishedDate)}
                              </time>
                              {post.minutesToRead != null && post.minutesToRead > 0 && (
                                <>
                                  <span>·</span>
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5 shrink-0" />
                                    {post.minutesToRead} น.
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
              </section>
            ))}
          </div>
        </div>

        {nonEmpty.length === 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center py-16">
            <p className="text-text-muted font-sarabun">ยังไม่มีหมวดหมู่เนื้อหา</p>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </>
  );
}
