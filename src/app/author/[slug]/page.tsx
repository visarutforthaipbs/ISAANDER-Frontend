/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Coffee, DollarSign } from "lucide-react";
import { getAuthorBySlug } from "@/data/authors";
import { fetchWixWriters, type WixWriter } from "@/lib/author-utils";
import wixClient from "@/lib/wix-client";
import { getPostImageUrl, formatDate } from "@/lib/utils";
import { TipSection } from "@/components/tip-section";
import { MobileBottomNav } from "@/components/navigation";

// Social icons as inline SVGs to avoid extra dependencies
function FacebookIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

const socialIcons: Record<string, { icon: React.FC; label: string }> = {
  facebook: { icon: FacebookIcon, label: "Facebook" },
  x: { icon: XIcon, label: "X (Twitter)" },
  instagram: { icon: InstagramIcon, label: "Instagram" },
  youtube: { icon: YouTubeIcon, label: "YouTube" },
  tiktok: { icon: TikTokIcon, label: "TikTok" },
  website: { icon: WebsiteIcon, label: "เว็บไซต์" },
};

// --- Data Fetching ---

async function getAuthorPosts(wixMemberId: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allPosts: any[] = [];
    let offset = 0;
    const limit = 100;
    for (let i = 0; i < 3; i++) {
      const { posts: items } = await wixClient.posts.listPosts({
        paging: { limit, offset },
      });
      if (!items || items.length === 0) break;
      allPosts.push(...items);
      if (items.length < limit) break;
      offset += limit;
    }
    const authorPosts = allPosts.filter((p) => p.memberId === wixMemberId);

    // Fetch view counts for each post
    const postsWithViews = await Promise.all(
      authorPosts.map(async (post) => {
        try {
          const result = await wixClient.posts.getPostMetrics(post._id);
          return { ...post, _views: result?.metrics?.views ?? 0 };
        } catch {
          return { ...post, _views: 0 };
        }
      })
    );

    return postsWithViews;
  } catch {
    return [];
  }
}

/** Find a WixWriter by slug — tries local config first, then Wix API */
async function findWriter(slug: string): Promise<{ writer: WixWriter; posts: Awaited<ReturnType<typeof getAuthorPosts>>; totalViews: number; estimatedRevenueTHB: number; authorShareTHB: number } | null> {
  // 1. Check local config
  const localAuthor = getAuthorBySlug(slug);

  // 2. Fetch all writers from Wix
  const writers = await fetchWixWriters();

  // 3. Match by slug (local or wix profile slug)
  let writer = writers.find((w) => w.slug === slug);

  // 4. If we have a local author but no writer match, it might be the editorial account
  if (!writer && localAuthor) {
    // Find by wixMemberId from local config
    if (localAuthor.wixMemberId) {
      writer = writers.find((w) => w.wixMemberId === localAuthor.wixMemberId);
    }
    // If still not found, create a synthetic writer from the local config
    if (!writer) {
      const posts = localAuthor.wixMemberId ? await getAuthorPosts(localAuthor.wixMemberId) : [];
      const totalViews = posts.reduce((sum: number, p: { _views?: number }) => sum + (p._views ?? 0), 0);
      const sharePercent = localAuthor.revenueSharePercent ?? 60;
      const estimatedRevenueTHB = Math.round((totalViews / 1000) * 30);
      const authorShareTHB = Math.round((estimatedRevenueTHB * sharePercent) / 100);
      return {
        writer: {
          slug: localAuthor.slug,
          name: localAuthor.name,
          title: localAuthor.title,
          bio: localAuthor.bio,
          avatar: localAuthor.avatar,
          postCount: posts.length,
          wixMemberId: localAuthor.wixMemberId ?? "",
          hireEmail: localAuthor.hireEmail,
          buyMeCoffeeUrl: localAuthor.buyMeCoffeeUrl,
          promptPayId: localAuthor.promptPayId,
          promptPayName: localAuthor.promptPayName,
          revenueSharePercent: sharePercent,
          localAuthor,
        },
        posts,
        totalViews,
        estimatedRevenueTHB,
        authorShareTHB,
      };
    }
  }

  if (!writer) return null;

  const posts = writer.wixMemberId ? await getAuthorPosts(writer.wixMemberId) : [];
  const totalViews = posts.reduce((sum: number, p: { _views?: number }) => sum + (p._views ?? 0), 0);
  const sharePercent = writer.revenueSharePercent ?? 60;
  const estimatedRevenueTHB = Math.round((totalViews / 1000) * 30);
  const authorShareTHB = Math.round((estimatedRevenueTHB * sharePercent) / 100);
  return { writer, posts, totalViews, estimatedRevenueTHB, authorShareTHB };
}

// --- Metadata ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const local = getAuthorBySlug(slug);
  const name = local?.name ?? decodeURIComponent(slug);

  return {
    title: `${name} — The Isaander`,
    description: local?.bio ?? `บทความโดย ${name}`,
  };
}

// --- Page ---

export const revalidate = 300;
export const dynamic = "force-dynamic";

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await findWriter(slug);
  if (!result) notFound();

  const { writer, posts: authorPosts, totalViews, estimatedRevenueTHB, authorShareTHB } = result;
  const author = writer.localAuthor;

  const hasSocials = author
    ? Object.entries(author.socialLinks).some(([, url]) => !!url)
    : false;

  return (
    <>
      {/* Back Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-black/5 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
              aria-label="กลับหน้าแรก"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </Link>
            <Link
              href="/"
              className="font-prompt text-xl font-bold text-primary tracking-tight"
            >
              The Isaander
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 pb-28">
        {/* Hero Section */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 sm:h-64 w-full bg-gradient-to-br from-primary/20 to-secondary/20">
            {author?.coverImage && (
              <img
                src={author.coverImage}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Avatar + Name overlay */}
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 -mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {writer.avatar ? (
                <img
                  src={writer.avatar}
                  alt={writer.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-background shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-primary/10 border-4 border-background shadow-lg flex items-center justify-center text-primary font-prompt text-4xl font-bold">
                  {writer.name.charAt(0)}
                </div>
              )}
              <div className="pb-2">
                <h1 className="font-prompt text-2xl sm:text-3xl font-bold text-text-main">
                  {writer.name}
                </h1>
                <p className="font-sarabun text-base text-text-muted mt-1">
                  {writer.title}
                </p>
                {/* Expertise badges */}
                {author?.expertise && author.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {author.expertise.map((tag) => (
                      <span
                        key={tag}
                        className="bg-secondary/10 text-secondary text-xs font-sarabun font-medium px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio + Actions */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-6">
          {writer.bio && (
            <p className="font-sarabun text-base text-text-main leading-relaxed">
              {writer.bio}
            </p>
          )}

          {/* Social Links + Hire Me + Buy Me a Coffee */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            {hasSocials && author &&
              Object.entries(author.socialLinks).map(([key, url]) => {
                if (!url) return null;
                const social = socialIcons[key];
                if (!social) return null;
                const Icon = social.icon;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon />
                  </a>
                );
              })}

            <a
              href={writer.hireEmail ? `mailto:${writer.hireEmail}` : `mailto:contact@theisaander.com?subject=Hire ${writer.name}`}
              className="inline-flex items-center gap-2 bg-primary text-white font-prompt font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition-all shadow-sm"
            >
              <Mail className="w-4 h-4" />
              Hire Me
            </a>

            <a
              href={writer.buyMeCoffeeUrl ?? "https://buymeacoffee.com/theisaander"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-text-main font-prompt font-semibold px-5 py-2.5 rounded-full hover:brightness-95 transition-all shadow-sm"
            >
              <Coffee className="w-4 h-4" />
              Buy Me a Coffee
            </a>
          </div>
        </section>

        {/* Revenue Share Card */}
        {writer.revenueSharePercent && writer.postCount > 0 && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-6">
            <div className="bg-surface rounded-xl border border-black/5 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-prompt font-semibold text-text-main text-sm">
                    Revenue Share
                  </h3>
                  <p className="font-sarabun text-xs text-text-muted">
                    ส่วนแบ่งรายได้จากโฆษณา
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-black/[0.02] rounded-lg p-3 text-center">
                  <p className="font-prompt text-lg font-bold text-text-main">
                    {totalViews.toLocaleString()}
                  </p>
                  <p className="font-sarabun text-xs text-text-muted">ยอดวิวรวม</p>
                </div>
                <div className="bg-black/[0.02] rounded-lg p-3 text-center">
                  <p className="font-prompt text-lg font-bold text-text-main">
                    ฿{estimatedRevenueTHB.toLocaleString()}
                  </p>
                  <p className="font-sarabun text-xs text-text-muted">รายได้รวม</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <p className="font-prompt text-lg font-bold text-primary">
                    ฿{authorShareTHB.toLocaleString()}
                  </p>
                  <p className="font-sarabun text-xs text-text-muted">ส่วนแบ่งของคุณ</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${writer.revenueSharePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-sarabun text-text-muted">
                    <span>นักเขียน {writer.revenueSharePercent}% — ฿{authorShareTHB.toLocaleString()}</span>
                    <span>แพลตฟอร์ม {100 - writer.revenueSharePercent}% — ฿{(estimatedRevenueTHB - authorShareTHB).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p className="font-sarabun text-xs text-text-muted mt-3">
                * ประมาณการจาก RPM ฿30/1,000 วิว · {writer.postCount} บทความ
              </p>
            </div>
          </section>
        )}

        {/* Tipping */}
        {author && (author.promptPayId || author.buyMeCoffeeUrl) && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-8">
            <TipSection author={author} />
          </section>
        )}

        {/* Author's Posts */}
        {authorPosts.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
            <h2 className="font-prompt text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
              <span
                className="w-1 h-6 bg-primary rounded-full"
                aria-hidden="true"
              />
              บทความโดย {writer.name}
            </h2>

            <div className="flex flex-col gap-4">
              {authorPosts.map((post) => {
                const imageUrl = getPostImageUrl(
                  post.media?.wixMedia?.image,
                  300,
                  300
                );
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-sarabun text-sm font-medium text-text-main leading-relaxed line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="font-sarabun text-xs text-text-muted line-clamp-2 mt-1">
                        {post.excerpt}
                      </p>
                      <time
                        dateTime={
                          post.lastPublishedDate
                            ? new Date(
                                post.lastPublishedDate
                              ).toISOString()
                            : undefined
                        }
                        className="font-sarabun text-xs text-text-muted mt-1 block"
                      >
                        {formatDate(post.lastPublishedDate)}
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
