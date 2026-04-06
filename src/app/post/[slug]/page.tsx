/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { media } from "@wix/sdk";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import wixClient from "@/lib/wix-client";
import { formatDate } from "@/lib/utils";
import { resolveAuthorAsync } from "@/lib/author-utils";
import { RichContentRenderer, extractHeadings } from "@/components/rich-content";
import { MobileBottomNav } from "@/components/navigation";
import { ShareButton } from "@/components/share-button";
import { ReadingProgress } from "@/components/reading-progress";
import { TipSection } from "@/components/tip-section";
import { BackToTop } from "@/components/back-to-top";
import { TableOfContents } from "@/components/table-of-contents";

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

// --- Metadata ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getPostBySlug(decodedSlug);
  if (!post) return { title: "ไม่พบบทความ — The Isaander" };

  return {
    title: `${post.title} — The Isaander`,
    description: post.excerpt ?? "",
  };
}

// --- Page ---

export const revalidate = 300;
export const dynamic = "force-dynamic";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    image: coverUrl ? [coverUrl] : [],
    dateModified: post.lastPublishedDate ? new Date(post.lastPublishedDate).toISOString() : undefined,
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
      logo: {
        "@type": "ImageObject",
        url: "https://www.theisaander.com/logo.png",
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

      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-black/5 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
              aria-label="กลับหน้าแรก"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              href="/"
              className="font-prompt text-xl font-bold text-primary tracking-tight"
            >
              The Isaander
            </Link>
          </div>
          <ShareButton title={post.title ?? ""} />
        </div>
      </header>

      <main id="main-content" className="flex-1 pb-28">
        {/* Cover Image — full-bleed with gradient transition */}
        {coverUrl && (
          <div className="relative">
            <img
              src={coverUrl}
              alt={post.title ?? ""}
              className="w-full aspect-[16/9] object-cover"
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background to-transparent"
              aria-hidden="true"
            />
          </div>
        )}

        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Meta */}
          <div className="pt-6 pb-4">
            {categoryLabel && (
              <span className="inline-block bg-accent text-text-main text-xs font-sarabun font-semibold px-3 py-1 rounded-full mb-3">
                {categoryLabel}
              </span>
            )}
            <h1 className="font-prompt text-2xl sm:text-3xl font-bold text-text-main leading-snug">
              {post.title}
            </h1>

            {/* Author Byline */}
            <Link
              href={`/author/${author.slug}`}
              className="flex items-center gap-3 mt-4 group"
            >
              <img
                src={author.avatar}
                alt={author.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/50 transition-colors"
              />
              <div>
                <span className="font-prompt font-semibold text-sm text-text-main group-hover:text-primary transition-colors">
                  {author.name}
                </span>
                <span className="block text-xs text-text-muted font-sarabun">
                  {author.title}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4 mt-3 text-sm text-text-muted font-sarabun">
              <time dateTime={post.lastPublishedDate ? new Date(post.lastPublishedDate).toISOString() : undefined}>
                {formatDate(post.lastPublishedDate)}
              </time>
              {post.minutesToRead != null && post.minutesToRead > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.minutesToRead} นาทีอ่าน
                </span>
              )}
            </div>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="font-sarabun text-lg text-text-muted leading-relaxed mb-6 border-l-4 border-primary/30 pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Table of Contents */}
          <TableOfContents
            headings={extractHeadings(post.richContent as Parameters<typeof extractHeadings>[0])}
          />

          {/* Rich Content */}
          <div className="prose-wrapper">
            <RichContentRenderer
              content={post.richContent as Parameters<typeof RichContentRenderer>[0]["content"]}
            />
          </div>

          {/* Fallback: plain text if no rich content */}
          {!post.richContent?.nodes?.length && post.contentText && (
            <div className="font-sarabun text-base leading-relaxed text-text-main whitespace-pre-line">
              {post.contentText}
            </div>
          )}
        </article>

        {/* End-of-article share CTA */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
          <div className="border-t border-black/10 pt-8 flex flex-col items-center gap-3 text-center">
            <p className="font-prompt font-semibold text-text-main">
              อ่านจบแล้ว — แชร์บทความนี้
            </p>
            <ShareButton title={post.title ?? ""} />
          </div>
        </div>

        {/* Tipping Section */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
          <TipSection author={author} />
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-12">
            <h2 className="font-prompt text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full" aria-hidden="true" />
              บทความที่เกี่ยวข้อง
            </h2>
            <div className="flex flex-col gap-4">
              {related.map((rp) => {
                const rpImg = rp.media?.wixMedia?.image
                  ? (() => {
                      try {
                        return media.getScaledToFillImageUrl(
                          rp.media!.wixMedia!.image!,
                          300,
                          300,
                          {}
                        );
                      } catch {
                        return null;
                      }
                    })()
                  : null;

                return (
                  <Link
                    key={rp._id}
                    href={`/post/${rp.slug}`}
                    className="flex gap-4 bg-surface rounded-lg shadow-sm p-3 items-center hover:shadow-md transition-shadow"
                  >
                    <div className="w-[25%] shrink-0">
                      {rpImg ? (
                        <img
                          src={rpImg}
                          alt={rp.title ?? ""}
                          className="rounded-md aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="bg-slate-200 rounded-md aspect-square w-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {rp.categoryIds?.[0] && categoryMap.get(rp.categoryIds[0]) && (
                        <span className="inline-block bg-secondary/15 text-secondary text-xs font-sarabun font-medium px-2.5 py-0.5 rounded-full mb-1">
                          {categoryMap.get(rp.categoryIds[0])}
                        </span>
                      )}
                      <h3 className="font-sarabun text-sm font-medium text-text-main leading-relaxed line-clamp-2">
                        {rp.title}
                      </h3>
                      <time
                        dateTime={rp.lastPublishedDate ? new Date(rp.lastPublishedDate).toISOString() : undefined}
                        className="font-sarabun text-xs text-text-muted mt-1 block"
                      >
                        {formatDate(rp.lastPublishedDate)}
                      </time>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <MobileBottomNav />
    </>
  );
}
