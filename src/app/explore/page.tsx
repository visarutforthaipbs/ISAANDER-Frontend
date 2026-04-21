import Image from "next/image";
import Link from "next/link";
import wixClient from "@/lib/wix-client";
import { getPostImageUrl, formatDate } from "@/lib/utils";
import { resolveAuthorAsync } from "@/lib/author-utils";
import type { Author } from "@/data/authors";
import { StickyHeader, MobileBottomNav } from "@/components/navigation";

export const revalidate = 300;

export const metadata = {
  title: "สำรวจ — The Isaander",
  description: "สำรวจบทความตามหมวดหมู่",
};

async function getCategories() {
  const { categories: items } = await wixClient.categories.listCategories();
  return items ?? [];
}

async function getPostsByCategory(categoryId: string) {
  try {
    const { posts: items } = await wixClient.posts.listPosts({
      categoryIds: [categoryId],
      paging: { limit: 6 },
    });
    return items ?? [];
  } catch {
    return [];
  }
}



export default async function ExplorePage() {
  const categories = await getCategories();

  // Fetch posts for each category in parallel
  const categoryPosts = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      posts: cat._id ? await getPostsByCategory(cat._id) : [],
    }))
  );

  // Filter out empty categories
  const nonEmpty = categoryPosts.filter((cp) => cp.posts.length > 0);

  // Pre-resolve all authors asynchronously (same pattern as homepage)
  const authorMap = new Map<string, Author>();
  const allPosts = nonEmpty.flatMap((cp) => cp.posts);
  await Promise.all(
    allPosts.map(async (post) => {
      if (post._id && post.memberId) {
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
          <h1 className="font-prompt text-2xl font-bold text-text-main mb-6">
            สำรวจหมวดหมู่
          </h1>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {nonEmpty.map(({ category }) => (
              <a
                key={category._id}
                href={`#cat-${category._id}`}
                className="px-4 py-2 rounded-full bg-secondary/15 text-secondary font-sarabun text-sm font-medium hover:bg-secondary/25 transition-colors"
              >
                {category.label}
              </a>
            ))}
          </div>
        </div>

        {/* Category sections */}
        {nonEmpty.map(({ category, posts }) => (
          <section
            key={category._id}
            id={`cat-${category._id}`}
            className="mb-10"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <h2 className="font-prompt text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full" aria-hidden="true" />
                {category.label}
              </h2>
            </div>

            {/* Horizontal scroll cards */}
            <div className="max-w-3xl mx-auto pl-4 sm:pl-6 relative">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 pr-4 sm:pr-6">
                {posts.map((post) => {
                  const imageUrl = getPostImageUrl(
                    post.media?.wixMedia?.image,
                    400,
                    250
                  );
                  const author = post._id ? authorMap.get(post._id) : undefined;

                  return (
                    <Link
                      key={post._id}
                      href={`/post/${post.slug}`}
                      className="w-64 shrink-0 snap-center bg-surface rounded-lg shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
                    >
                      {imageUrl ? (
                        <div className="relative rounded-md aspect-[16/10] w-full overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={post.title ?? ""}
                            fill
                            sizes="256px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="bg-slate-200 rounded-md aspect-[16/10] w-full" />
                      )}
                      <h3 className="font-sarabun text-sm font-medium text-text-main leading-relaxed line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        {author?.avatar ? (
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
                            <span className="text-[8px] text-primary font-prompt font-bold">
                              {(author?.name || "?").charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="font-sarabun text-xs text-text-muted truncate">
                          {author?.name || "The Isaander"}
                        </span>
                      </div>
                      <time
                        dateTime={post.lastPublishedDate ? new Date(post.lastPublishedDate).toISOString() : undefined}
                        className="font-sarabun text-xs text-text-muted"
                      >
                        {formatDate(post.lastPublishedDate)}
                      </time>
                    </Link>
                  );
                })}
              </div>
              {/* Right-edge fade indicating more cards */}
              <div
                className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </section>
        ))}

        {nonEmpty.length === 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center py-20">
            <p className="text-text-muted font-sarabun">ยังไม่มีหมวดหมู่</p>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </>
  );
}
