/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import Image from "next/image";
import { media } from "@wix/sdk";
import { Clock } from "lucide-react";
import Link from "next/link";
import wixClient from "@/lib/wix-client";
import { formatDate } from "@/lib/utils";
import { resolveAuthorAsync } from "@/lib/author-utils";
import { RichContentRenderer, extractHeadings } from "@/components/rich-content";
import { MobileBottomNav } from "@/components/navigation";
import { PostHeader } from "@/components/post-header";
import { ReadingProgress } from "@/components/reading-progress";
import { TipSection } from "@/components/tip-section";
import { BackToTop } from "@/components/back-to-top";
import { TableOfContents } from "@/components/table-of-contents";
import { AdSenseSlot } from "@/components/adsense-slot";
import { ShareButton } from "@/components/share-button";
import { ReadingEnhancements } from "@/components/reading-enhancements";
import { MagazineDrawer } from "@/components/magazine-drawer";
import { FollowButton } from "@/components/follow-button";

// --- Data Fetching ---

async function getPostBySlug(slug: string) {
  try {
    const { post } = await wixClient.posts.getPostBySlug(slug, {
      fieldsets: ["RICH_CONTENT", "CONTENT_TEXT", "URL", "SEO", "METRICS"],
    });
    return post ?? null;
  } catch {
    return null;
  }
}

async function getCategoryMap() {
  const { categories: items } = await wixClient.categories.listCategories();
  const map = new Map<string, string>();
  for (const cat of items ?? []) {
    if (cat._id && cat.label) map.set(cat._id, cat.label);
  }
  return map;
}

async function getRelatedPosts(categoryIds: string[], currentId: string) {
  try {
    const { posts: items } = await wixClient.posts.listPosts({
      categoryIds,
      paging: { limit: 4 },
    });
    return (items ?? []).filter((p) => p._id !== currentId).slice(0, 3);
  } catch {
    return [];
  }
}

// More posts from the same writer (KOL binge rail). Filters the recent feed
// by the post's Wix memberId so readers can follow a specific voice.
async function getPostsByMember(memberId: string, currentId: string) {
  try {
    const { posts: items } = await wixClient.posts.listPosts({
      paging: { limit: 100 },
    });
    return (items ?? [])
      .filter((p) => p.memberId === memberId && p._id !== currentId)
      .slice(0, 6);
  } catch {
    return [];
  }
}

// --- Metadata ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getPostBySlug(decodedSlug);
  if (!post) return { title: "ไม่พบบทความ — The Isaander", robots: { index: false } };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.theisaander.com";
  const coverUrl = post.media?.wixMedia?.image
    ? (() => { try { return media.getScaledToFillImageUrl(post.media!.wixMedia!.image!, 1200, 675, {}); } catch { return null; } })()
    : null;

  return {
    title: `${post.title} — The Isaander`,
    description: post.excerpt ?? "",
    alternates: { canonical: `${baseUrl}/post/${decodedSlug}` },
    openGraph: {
      title: `${post.title} — The Isaander`,
      description: post.excerpt ?? "",
      url: `${baseUrl}/post/${decodedSlug}`,
      type: "article",
      images: coverUrl ? [{ url: coverUrl, width: 1200, height: 675 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — The Isaander`,
      description: post.excerpt ?? "",
      images: coverUrl ? [coverUrl] : undefined,
    },
  };
}

// --- Page ---

export const revalidate = 300;

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const [post, categoryMap] = await Promise.all([
    getPostBySlug(decodedSlug),
    getCategoryMap(),
  ]);

  if (!post) notFound();

  const categoryLabel = post.categoryIds?.[0]
    ? categoryMap.get(post.categoryIds[0]) ?? null
    : null;

  const coverUrl = post.media?.wixMedia?.image
    ? (() => {
        try {
          return media.getScaledToFillImageUrl(
            post.media!.wixMedia!.image!,
            1200,
            675,
            {}
          );
        } catch {
          return null;
        }
      })()
    : null;

  const author = await resolveAuthorAsync(post);

  const related =
    post.categoryIds && post.categoryIds.length > 0
      ? await getRelatedPosts(post.categoryIds, post._id ?? "")
      : [];

  // KOL rail: other work by this specific writer (skip the editorial org).
  const authorPosts =
    post.memberId && author.slug !== "theisaander"
      ? await getPostsByMember(post.memberId, post._id ?? "")
      : [];

  const relatedCategoryLabel = related[0]?.categoryIds?.[0]
    ? categoryMap.get(related[0].categoryIds[0]) ?? null
    : null;

  const inArticleAdSlot = process.env.NEXT_PUBLIC_ADSENSE_IN_ARTICLE_SLOT;
  const belowArticleAdSlot = process.env.NEXT_PUBLIC_ADSENSE_BELOW_ARTICLE_SLOT;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.theisaander.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    image: coverUrl ? [coverUrl] : [],
    datePublished: post.firstPublishedDate ? new Date(post.firstPublishedDate).toISOString() : (post.lastPublishedDate ? new Date(post.lastPublishedDate).toISOString() : undefined),
    dateModified: post.lastPublishedDate ? new Date(post.lastPublishedDate).toISOString() : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/post/${decodedSlug}`,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#article-headline"],
    },
    author: author.slug === "theisaander"
      ? {
          "@type": "Organization" as const,
          name: "The Isaander",
          url: "https://www.theisaander.com",
        }
      : {
          "@type": "Person" as const,
          name: author.name,
          url: `https://www.theisaander.com/author/${author.slug}`,
        },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "The Isaander",
      url: "https://www.theisaander.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.theisaander.com/logo-black.svg",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <BackToTop />

      {/* Header — auto-hides on scroll down for immersive mobile reading */}
      <PostHeader
        post={{
          _id: post._id ?? "",
          slug: post.slug ?? "",
          title: post.title ?? "",
          excerpt: post.excerpt ?? "",
          coverUrl: coverUrl,
          categoryLabel: categoryLabel,
          publishedDate: post.lastPublishedDate ? new Date(post.lastPublishedDate).toISOString() : null,
        }}
      />

      <main id="main-content" className="flex-1 pb-28">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Meta */}
          <div className="pt-6 pb-4">
            {categoryLabel && (
              <span className="inline-block bg-accent text-text-main text-xs font-sarabun font-semibold px-3 py-1 rounded-full mb-3">
                {categoryLabel}
              </span>
            )}
            <h1 id="article-headline" className="font-prompt text-2xl sm:text-3xl font-bold text-text-main leading-snug">
              {post.title}
            </h1>

            {/* Author Byline */}
            <div className="flex items-center justify-between gap-3 mt-4">
              <Link
                href={`/author/${author.slug}`}
                className="flex items-center gap-3 group min-w-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={author.avatar}
                  alt={author.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/50 transition-colors"
                />
                <div className="min-w-0">
                  <span className="font-prompt font-semibold text-sm text-text-main group-hover:text-primary transition-colors">
                    {author.name}
                  </span>
                  <span className="block text-xs text-text-muted font-sarabun truncate">
                    {author.title}
                  </span>
                </div>
              </Link>

              <FollowButton
                writer={{
                  slug: author.slug,
                  name: author.name,
                  avatar: author.avatar,
                  title: author.title,
                }}
                variant="compact"
              />
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-text-muted font-sarabun">
              <time dateTime={post.lastPublishedDate ? new Date(post.lastPublishedDate).toISOString() : undefined}>
                {formatDate(post.lastPublishedDate)}
              </time>
              {post.minutesToRead != null && post.minutesToRead > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  {post.minutesToRead} นาทีอ่าน
                </span>
              )}
            </div>
          </div>



          {/* Table of Contents */}
          <div className="toc-wrapper">
            <TableOfContents
              headings={extractHeadings(post.richContent as Parameters<typeof extractHeadings>[0])}
            />
          </div>

          {/* Rich Content */}
          <div className="prose-wrapper">
            <RichContentRenderer
              content={post.richContent as Parameters<typeof RichContentRenderer>[0]["content"]}
              relatedPost={related[0]}
              relatedCategoryLabel={relatedCategoryLabel}
              adSlot={
                inArticleAdSlot ? (
                  <div className="adsense-slot-wrapper">
                    <AdSenseSlot
                      slot={inArticleAdSlot}
                      className="my-8 rounded-lg border border-black/10 bg-surface p-3"
                    />
                  </div>
                ) : undefined
              }
            />
          </div>

          {/* Fallback: plain text if no rich content */}
          {!post.richContent?.nodes?.length && post.contentText && (
            <div className="font-sarabun text-base leading-relaxed text-text-main whitespace-pre-line prose-wrapper">
              {post.contentText}
            </div>
          )}
        </article>

        {/* More from this writer — KOL binge rail */}
        {authorPosts.length > 0 && (
          <section
            aria-label={`เรื่องอื่นจาก ${author.name}`}
            className="max-w-3xl mx-auto px-4 sm:px-6 mt-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-prompt font-bold text-text-main text-base flex items-center gap-2">
                <img
                  src={author.avatar}
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover border border-black/10"
                />
                <span>เรื่องอื่นจาก {author.name}</span>
              </h2>
              <Link
                href={`/author/${author.slug}`}
                className="text-xs font-prompt font-semibold text-[#E65C00] hover:underline shrink-0"
              >
                ดูทั้งหมด
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {authorPosts.map((ap, i) => {
                const apImg = ap.media?.wixMedia?.image
                  ? (() => {
                      try {
                        return media.getScaledToFillImageUrl(
                          ap.media!.wixMedia!.image!,
                          400,
                          260,
                          {}
                        );
                      } catch {
                        return null;
                      }
                    })()
                  : null;

                return (
                  <Link
                    key={ap._id || i}
                    href={`/post/${ap.slug}`}
                    className="group shrink-0 w-60 sm:w-65 snap-start bg-white border border-black/5 hover:border-black/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative aspect-video bg-black/5 overflow-hidden">
                      {apImg ? (
                        <Image
                          src={apImg}
                          alt={ap.title ?? ""}
                          fill
                          sizes="(max-width: 640px) 240px, 260px"
                          className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-100" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-prompt font-bold text-text-main text-sm leading-snug line-clamp-2 group-hover:text-[#E65C00] transition-colors duration-200">
                        {ap.title}
                      </h3>
                      <time
                        dateTime={ap.lastPublishedDate ? new Date(ap.lastPublishedDate).toISOString() : undefined}
                        className="block text-[10px] text-text-muted font-sarabun mt-2"
                      >
                        {formatDate(ap.lastPublishedDate)}
                      </time>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {belowArticleAdSlot && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-10 adsense-slot-wrapper">
            <AdSenseSlot
              slot={belowArticleAdSlot}
              className="rounded-lg border border-black/10 bg-surface p-3"
            />
          </div>
        )}

        {/* Premium Discovery Lounge Drawer */}
        <MagazineDrawer
          postTitle={post.title ?? ""}
          author={{
            name: author.name,
            avatar: author.avatar,
            title: author.title,
            bio: author.bio,
            slug: author.slug,
            hireEmail: author.hireEmail,
            promptPayId: author.promptPayId,
            promptPayName: author.promptPayName,
            buyMeCoffeeUrl: author.buyMeCoffeeUrl,
          }}
          relatedPosts={related}
          categoryMap={categoryMap}
          categoryLabel={categoryLabel}
        />
      </main>

      <ReadingEnhancements
        postTitle={post.title ?? ""}
        authorName={author.name}
        authorAvatar={author.avatar}
      />
      <MobileBottomNav />
    </>
  );
}
