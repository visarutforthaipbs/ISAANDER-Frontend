import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAuthorBySlug } from "@/data/authors";
import { getPageViews, estimateRevenue } from "@/lib/analytics";
import wixClient from "@/lib/wix-client";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const author = getAuthorBySlug(session.slug);
  if (!author) {
    return NextResponse.json({ error: "Author not found" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  // Get author's posts from Wix
  let postSlugs: string[] = [];
  try {
    const { posts: items } = await wixClient.posts.listPosts({
      paging: { limit: 100 },
    });
    const authorPosts = (items ?? []).filter((p) => {
      if (author.wixMemberId && p.memberId === author.wixMemberId) return true;
      if (author.slug === "theisaander") return true;
      return false;
    });
    postSlugs = authorPosts
      .map((p) => p.slug)
      .filter((s): s is string => !!s);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }

  if (postSlugs.length === 0) {
    return NextResponse.json({
      totalViews: 0,
      estimatedRevenue: 0,
      authorShare: 0,
      pages: [],
      periodLabel: `${days} วัน`,
      postCount: 0,
      revenueSharePercent: author.revenueSharePercent ?? 60,
    });
  }

  // Get analytics for author's post paths
  const pathPrefixes = postSlugs.map((slug) => `/post/${slug}`);
  const analytics = await getPageViews(pathPrefixes, days);

  const revenueSharePercent = author.revenueSharePercent ?? 60;
  const totalEstimatedRevenue = estimateRevenue(analytics.totalViews);
  const authorShare = (totalEstimatedRevenue * revenueSharePercent) / 100;

  return NextResponse.json({
    totalViews: analytics.totalViews,
    estimatedRevenue: Math.round(totalEstimatedRevenue * 100) / 100,
    authorShare: Math.round(authorShare * 100) / 100,
    pages: analytics.pages,
    periodLabel: analytics.periodLabel,
    postCount: postSlugs.length,
    revenueSharePercent,
  });
}
