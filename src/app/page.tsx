import Link from "next/link";
import Image from "next/image";
import wixClient from "@/lib/wix-client";
import { getPostImageUrl, getCategoryLabel, formatDate } from "@/lib/utils";
import { resolveAuthorAsync, fetchWixWriters } from "@/lib/author-utils";

type AuthorMap = Map<string, { name: string; avatar: string }>;
import { StickyHeader, MobileBottomNav } from "@/components/navigation";
import { WelcomePopup } from "@/components/welcome-popup";
import { LoginCta } from "@/components/login-cta";

// --- Data Fetching ---

async function getHeroPost() {
  const { posts: items } = await wixClient.posts.listPosts({
    featured: true,
    paging: { limit: 1 },
  });
  if (!items || items.length === 0) {
    const { posts: latest } = await wixClient.posts.listPosts({
      paging: { limit: 1 },
    });
    return latest?.[0] ?? null;
  }
  return items[0];
}

async function getLatestPosts() {
  const { posts: items } = await wixClient.posts.listPosts({
    paging: { limit: 10, offset: 1 },
  });
  return items ?? [];
}

async function getCategoryMap() {
  const { categories: items } = await wixClient.categories.listCategories();
  const map = new Map<string, string>();
  for (const cat of items ?? []) {
    if (cat._id && cat.label) {
      map.set(cat._id, cat.label);
    }
  }
  return map;
}

// --- Components ---

function HeroDeepDive({
  post,
  categoryMap,
  authorMap,
}: {
  post: Awaited<ReturnType<typeof getHeroPost>>;
  categoryMap: Map<string, string>;
  authorMap: AuthorMap;
}) {
  if (!post) return null;

  const imageUrl = getPostImageUrl(post.media?.wixMedia?.image, 800, 1000);
  const tag = getCategoryLabel(post, categoryMap);
  const author = post._id ? authorMap.get(post._id) : undefined;

  return (
    <section aria-label="บทความเด่น">
      <Link
        href={`/post/${post.slug}`}
        className="block relative overflow-hidden rounded-xl group"
      >
        {imageUrl ? (
          <div className="relative aspect-[4/5] sm:aspect-[16/10] w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={post.title ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 700px"
              className="object-cover motion-safe:group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
        ) : (
          <div className="bg-stone-200 aspect-[4/5] sm:aspect-[16/10] w-full" />
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          {tag && (
            <span className="inline-block bg-isaander-yellow text-isaander-black text-xs font-sarabun font-semibold px-3 py-1 rounded-full mb-3 shadow-sm border border-black/5">
              {tag}
            </span>
          )}
          <h1 className="font-prompt text-2xl sm:text-3xl font-bold text-white leading-snug">
            {post.title}
          </h1>
          {/* Author byline */}
          {author && (
            <div className="flex items-center gap-2 mt-3">
              {author.avatar ? (
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={24}
                  height={24}
                  unoptimized
                  className="w-6 h-6 rounded-full object-cover border border-white/30"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                  <span className="text-xs text-white font-prompt font-bold">{author.name.charAt(0)}</span>
                </div>
              )}
              <span className="text-sm text-white/80 font-sarabun">
                {author.name}
              </span>
            </div>
          )}
        </div>
      </Link>
    </section>
  );
}

function HistoryCarousel({
  posts,
  categoryMap,
  authorMap,
}: {
  posts: Awaited<ReturnType<typeof getLatestPosts>>;
  categoryMap: Map<string, string>;
  authorMap: AuthorMap;
}) {
  const carouselPosts = posts.slice(0, 3);
  if (carouselPosts.length === 0) return null;

  return (
    <section aria-label="เรื่องราวในอดีต">
      <h2 className="font-prompt text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-isaander-gold rounded-full" aria-hidden="true" />
        เรื่องราวในอดีต / บุคคลสำคัญ
      </h2>

      <div className="flex flex-col gap-4">
        {carouselPosts.map((post) => {
          const imageUrl = getPostImageUrl(
            post.media?.wixMedia?.image,
            400,
            250
          );
          const tag = getCategoryLabel(post, categoryMap);
          const author = post._id ? authorMap.get(post._id) : undefined;

          return (
            <Link
              key={post._id}
              href={`/post/${post.slug}`}
              className="flex gap-4 bg-surface rounded-lg shadow-sm p-3 items-center hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="w-[30%] shrink-0">
                {imageUrl ? (
                  <div className="relative rounded-md aspect-square w-full overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={post.title ?? ""}
                      fill
                      sizes="(max-width: 768px) 30vw, 120px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-stone-200 rounded-md aspect-square w-full" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                {tag && (
                  <span className="inline-block self-start bg-isaander-offwhite border border-isaander-gold/20 text-isaander-gold text-xs font-sarabun font-medium px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                )}
                <h3 className="font-sarabun text-sm font-medium text-text-main leading-relaxed line-clamp-2">
                  {post.title}
                </h3>
                {author && (
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
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function StandardFeed({
  posts,
  categoryMap,
  authorMap,
}: {
  posts: Awaited<ReturnType<typeof getLatestPosts>>;
  categoryMap: Map<string, string>;
  authorMap: AuthorMap;
}) {
  const feedPosts = posts.slice(3);
  if (feedPosts.length === 0) return null;

  return (
    <section aria-label="ข่าวล่าสุด">
      <h2 className="font-prompt text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-isaander-orange rounded-full" aria-hidden="true" />
        ข่าวล่าสุด
      </h2>

      <div className="flex flex-col gap-4">
        {feedPosts.map((post) => {
          const imageUrl = getPostImageUrl(
            post.media?.wixMedia?.image,
            300,
            300
          );
          const tag = getCategoryLabel(post, categoryMap);
          const author = post._id ? authorMap.get(post._id) : undefined;

          return (
            <Link
              key={post._id}
              href={`/post/${post.slug}`}
              className="flex gap-4 bg-surface rounded-lg shadow-sm p-3 items-center hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="w-[30%] shrink-0">
                {imageUrl ? (
                  <div className="relative rounded-md aspect-square w-full overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={post.title ?? ""}
                      fill
                      sizes="(max-width: 768px) 30vw, 120px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-stone-200 rounded-md aspect-square w-full" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                {tag && (
                  <span className="inline-block self-start bg-isaander-offwhite border border-isaander-orange/20 text-isaander-orange text-xs font-sarabun font-medium px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                )}
                <h3 className="font-sarabun text-sm font-medium text-text-main leading-relaxed line-clamp-2">
                  {post.title}
                </h3>
                {author && (
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
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// --- Page ---

export const revalidate = 300;

export default async function HomePage() {
  let heroPost: Awaited<ReturnType<typeof getHeroPost>> = null;
  let latestPosts: Awaited<ReturnType<typeof getLatestPosts>> = [];
  let categoryMap = new Map<string, string>();
  let writers: Awaited<ReturnType<typeof fetchWixWriters>> = [];

  try {
    [heroPost, latestPosts, categoryMap, writers] = await Promise.all([
      getHeroPost(),
      getLatestPosts(),
      getCategoryMap(),
      fetchWixWriters(),
    ]);
  } catch (error) {
    console.error("Failed to fetch posts from Wix:", error);
  }

  const hasError = !heroPost && latestPosts.length === 0;

  // Pre-resolve all author avatars from Wix (async)
  const authorMap: AuthorMap = new Map();
  const allPosts = [...(heroPost ? [heroPost] : []), ...latestPosts];
  await Promise.all(
    allPosts.map(async (post) => {
      if (post._id) {
        try {
          const author = await resolveAuthorAsync(post);
          authorMap.set(post._id, author);
        } catch {
          authorMap.set(post._id, { name: "The Isaander", avatar: "" });
        }
      }
    })
  );

  return (
    <>
      <WelcomePopup />
      <StickyHeader />
      <main id="main-content" className="flex-1 pb-28">
        {/* Error fallback */}
        {hasError && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 text-center">
            <div className="bg-surface rounded-2xl border border-black/5 shadow-sm p-8 max-w-md mx-auto">
              <h2 className="font-prompt text-xl font-bold text-text-main mb-2">
                ไม่สามารถโหลดเนื้อหาได้
              </h2>
              <p className="font-sarabun text-sm text-text-muted mb-6">
                กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-primary text-white font-sarabun font-medium px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        )}

        {/* Wider container with desktop 2-column layout */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 lg:items-start">
            {/* Main column: hero + carousel */}
            {/* Signal 39: Breath Rule — Generous whitespace between major insights */}
            <div className="min-w-0 flex flex-col gap-16">
              <HeroDeepDive post={heroPost} categoryMap={categoryMap} authorMap={authorMap} />

              {/* Creator Platform CTA */}
              {/* Signal 39: Layer 3 — Strip content to the single most impactful fact. */}
              <section className="bg-gradient-to-br from-isaander-cream via-isaander-offwhite to-isaander-light-blue/20 rounded-xl p-6 sm:p-8 border border-isaander-gold/20 text-center">
                <h2 className="font-prompt text-xl font-bold text-text-main mb-2">
                  บอกเล่ามุมมองของคนต่างจังหวัด
                </h2>
                <p className="font-sarabun text-sm text-text-muted mb-6 max-w-sm mx-auto">
                  แพลตฟอร์มสำหรับนักเขียนนอกกรุงเทพ ทุกยอดอ่านสร้างรายได้ 
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/author"
                    className="inline-flex items-center gap-2 bg-isaander-black text-white font-sarabun text-sm font-medium px-4 py-2 rounded-full hover:bg-isaander-black/80 transition-colors"
                  >
                    พบนักเขียนของเรา
                  </Link>
                  <LoginCta />
                </div>
              </section>

              <HistoryCarousel posts={latestPosts} categoryMap={categoryMap} authorMap={authorMap} />
            </div>

            {/* Sidebar: featured writers + latest feed */}
            <aside className="mt-8 lg:mt-0 lg:sticky lg:top-[72px] flex flex-col gap-8">
              {/* Featured Writers */}
              {writers.length > 0 && (
                <section aria-label="นักเขียนเด่น">
                  <h2 className="font-prompt text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-isaander-dark-blue rounded-full" aria-hidden="true" />
                    นักเขียนเด่น
                  </h2>
                  <div className="flex flex-col gap-3">
                    {writers
                      .filter((w) => w.slug !== "theisaander" && w.title !== "กองบรรณาธิการ" && w.name !== "กองบรรณาธิการ")
                      .slice(0, 5)
                      .map((writer) => (
                      <Link
                        key={writer.slug}
                        href={`/author/${writer.slug}`}
                        className="flex items-center gap-3 bg-surface rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {writer.avatar ? (
                          <Image
                            src={writer.avatar}
                            alt={writer.name}
                            width={40}
                            height={40}
                            unoptimized
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                            <span className="font-prompt text-sm font-bold text-primary">
                              {writer.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-sarabun text-sm font-medium text-text-main truncate">
                            {writer.name}
                          </p>
                          <p className="font-sarabun text-xs text-text-muted">
                            {writer.postCount} บทความ · {writer.totalViews.toLocaleString()} views
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {writers.length > 5 && (
                    <Link
                      href="/author"
                      className="block text-center font-sarabun text-sm text-primary font-medium mt-3 hover:underline"
                    >
                      ดูนักเขียนทั้งหมด →
                    </Link>
                  )}
                </section>
              )}

              <StandardFeed posts={latestPosts} categoryMap={categoryMap} authorMap={authorMap} />
            </aside>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </>
  );
}
