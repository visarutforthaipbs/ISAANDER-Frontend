import Link from "next/link";
import Image from "next/image";
import wixClient from "@/lib/wix-client";
import { getPostImageUrl, getCategoryLabel, formatDate } from "@/lib/utils";
import { resolveAuthorAsync, fetchWixWriters } from "@/lib/author-utils";

type AuthorMap = Map<string, { name: string; avatar: string }>;
import { StickyHeader, MobileBottomNav } from "@/components/navigation";
import { WelcomePopupLoader } from "@/components/welcome-popup-loader";
import { LoginCta } from "@/components/login-cta";
import { StoriesFeed } from "@/components/stories-feed";
import { KOLSpotlight } from "@/components/kol-spotlight";
import { LarbMeter } from "@/components/larb-meter";

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

// --- Shared meta style helper ---
// Signal39 meta tier: 0.625rem / ls:0.04em — timestamps, sources, IDs. Ignorable until needed.
const metaStyle: React.CSSProperties = { fontSize: "0.625rem", letterSpacing: "0.04em" };

// Signal39 chunk-label style: Space Grotesk-equivalent, 0.75rem, weight 500, ls 0.08em, caps, muted.
const chunkLabelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

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

  const imageUrl = getPostImageUrl(post.media?.wixMedia?.image, 800, 500);
  const tag = getCategoryLabel(post, categoryMap);
  const author = post._id ? authorMap.get(post._id) : undefined;

  return (
    <section aria-label="บทความเด่น" className="w-full">
      <p className="text-text-muted mb-3" style={chunkLabelStyle}>
        เรื่องเด่นประจำสัปดาห์
      </p>

      <Link
        href={`/post/${post.slug}`}
        className="block bg-surface border border-black/5 hover:shadow-md transition-shadow group overflow-hidden"
        style={{ borderRadius: "12px" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] items-stretch">
          {/* Cover image on the left/top */}
          <div className="relative aspect-video md:aspect-auto w-full min-h-[280px] overflow-hidden bg-black/5">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={post.title ?? ""}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover group-hover:scale-[1.01] transition-transform duration-500"
                priority
              />
            ) : (
              <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                <span className="text-stone-400 font-prompt text-xs">No Cover Image</span>
              </div>
            )}
            
            {tag && (
              <span
                className="absolute top-4 left-4 bg-isaander-yellow text-isaander-black font-sarabun font-bold shadow-sm"
                style={{ fontSize: "0.625rem", letterSpacing: "0.04em", padding: "4px 10px", borderRadius: "4px" }}
              >
                {tag}
              </span>
            )}
          </div>

          {/* Typography on the right/bottom */}
          <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
            <div>
              {/* display-hero heading */}
              <h1
                className="font-prompt font-semibold text-text-main group-hover:text-isaander-orange transition-colors leading-tight"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  letterSpacing: "-0.01em",
                }}
              >
                {post.title}
              </h1>
              
              <p className="font-sarabun text-text-muted mt-3 text-sm leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </div>

            {/* Author byline & metadata */}
            <div className="flex items-center justify-between border-t border-black/5 pt-4">
              {author && (
                <div className="flex items-center gap-2.5">
                  {author.avatar ? (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-black/5">
                      <Image
                        src={author.avatar}
                        alt={author.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-primary/10 flex items-center justify-center shrink-0 w-6 h-6 rounded-full border border-black/5">
                      <span className="font-prompt font-bold text-primary" style={{ fontSize: "0.625rem" }}>
                        {author.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-text-main font-sarabun font-semibold" style={{ fontSize: "0.75rem", letterSpacing: "0.02em" }}>
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
                    <span>{post.minutesToRead} นาทีอ่าน</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

function VoicesCommunity() {
  return (
    <section aria-label="นักเขียนและเสียงของชุมชน" className="w-full">
      <p className="text-text-muted mb-2" style={chunkLabelStyle}>
        ผู้เขียน · ปากเสียงคนรุ่นใหม่
      </p>
      <h2 className="font-prompt font-semibold text-text-main text-xl mb-6">
        เสียงจริงจากคนท้องถิ่น
      </h2>

      {/* Creator Platform CTA - Full Width Premium Glassmorphic Card */}
      <div
        className="border border-isaander-gold/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6"
        style={{
          background: "linear-gradient(135deg, var(--color-isaander-cream) 0%, var(--color-isaander-offwhite) 60%, color-mix(in srgb, var(--color-isaander-light-blue) 20%, transparent) 100%)",
          borderRadius: "12px",
          padding: "32px",
        }}
      >
        <div className="flex-1 min-w-0">
          <span
            className="inline-block bg-isaander-orange text-white font-sarabun font-bold mb-3 shadow-xs"
            style={{ fontSize: "0.625rem", letterSpacing: "0.04em", padding: "3px 8px", borderRadius: "4px" }}
          >
            CREATOR PLATFORM
          </span>
          <h3 className="font-prompt font-bold text-text-main text-xl mb-2 leading-snug">
            อยากเล่าเรื่องจากพื้นที่ของคุณไหม?
          </h3>
          <p className="font-sarabun text-sm text-text-muted leading-relaxed max-w-2xl">
            ร่วมสนับสนุนมุมมองจากบ้านเกิดของคุณ เขียนเรื่องราว วัฒนธรรม หรือประเด็นทางสังคม และแบ่งปันให้ผู้คนได้รับรู้ พร้อมรับส่วนแบ่งรายได้อย่างเป็นธรรม
          </p>
        </div>
        
        <div className="flex flex-row md:flex-col lg:flex-row flex-wrap gap-3 items-center shrink-0 justify-start md:justify-center">
          <LoginCta />
          <Link
            href="/author"
            className="inline-flex items-center gap-1.5 text-text-muted font-sarabun text-xs font-semibold hover:text-text-main transition-colors py-2.5 px-4 bg-white border border-black/5 hover:border-black/10 rounded-full"
          >
            ทำความรู้จักนักเขียนของเรา →
          </Link>
        </div>
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

  const plainCategoryMap = Object.fromEntries(categoryMap.entries());
  const plainAuthorMap: Record<string, { name: string; avatar: string }> = {};
  for (const [key, val] of authorMap.entries()) {
    plainAuthorMap[key] = val;
  }

  // Pre-compute image URLs server-side: Wix SDK's media module behaves differently
  // in Node.js vs browser, causing hydration mismatches if called inside the client component.
  const feedPosts = latestPosts.map((post) => ({
    ...post,
    computedImageUrl: getPostImageUrl(post.media?.wixMedia?.image, 400, 250),
  }));

  // Select the featured spotlight writer
  const spotlightWriter = (writers ?? [])
    .filter((w) => w.slug !== "theisaander" && w.title !== "กองบรรณาธิการ" && w.name !== "กองบรรณาธิการ")?.[0] ?? null;

  return (
    <>
      <WelcomePopupLoader />
      <StickyHeader />
      <main id="main-content" className="flex-1 pb-28">
        {/* Error fallback */}
        {hasError && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 text-center">
            <div className="bg-surface border border-black/5 p-8 max-w-md mx-auto" style={{ borderRadius: "8px" }}>
              <h2 className="font-prompt text-xl font-semibold text-text-main mb-2">
                ไม่สามารถโหลดเนื้อหาได้
              </h2>
              <p className="font-sarabun text-sm text-text-muted mb-6">
                กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-isaander-orange text-white font-sarabun font-medium hover:bg-isaander-orange/90 transition-colors"
                style={{ padding: "12px 24px", borderRadius: "4px", fontSize: "0.875rem" }}
              >
                ลองใหม่อีกครั้ง
              </a>
            </div>
          </div>
        )}

        {/* 3-Pillar Consolidated Flow layout (No complex/noisy sidebars) */}
        {!hasError && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 flex flex-col gap-16">
            {/* Pillar 1: The Display Hero */}
            <HeroDeepDive post={heroPost} categoryMap={categoryMap} authorMap={authorMap} />

            {/* Pillar 2: Voices & Community */}
            <VoicesCommunity />

            {/* Spotlight & Larb Meter Section */}
            {spotlightWriter && (
              <section aria-label="ผู้เขียนเด่นและภารกิจชุมชน" className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 items-stretch">
                  <KOLSpotlight writer={spotlightWriter} />
                  <div className="flex items-stretch">
                    <LarbMeter />
                  </div>
                </div>
              </section>
            )}

            {/* Pillar 3: Consolidated Stories Feed */}
            <StoriesFeed
              posts={feedPosts}
              categoryMap={plainCategoryMap}
              authorMap={plainAuthorMap}
            />
          </div>
        )}
      </main>
      <MobileBottomNav />
    </>
  );
}
