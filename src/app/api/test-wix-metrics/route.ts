import { NextRequest, NextResponse } from "next/server";
import wixClient from "@/lib/wix-client";

export async function GET(request: NextRequest) {
  try {
    const { posts } = await wixClient.posts.listPosts({ paging: { limit: 5 } });
    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: "No posts found" });
    }

    const testResults = [];
    for (const post of posts) {
      if (!post._id) continue;
      try {
        console.log(`Fetching metrics for post ID: ${post._id}`);
        const metrics = await wixClient.posts.getPostMetrics(post._id);
        testResults.push({
          id: post._id,
          title: post.title,
          metrics,
          success: true
        });
      } catch (err: any) {
        console.error(`Error fetching metrics for post ${post._id}:`, err);
        testResults.push({
          id: post._id,
          title: post.title,
          errorMessage: err?.message || String(err),
          errorStack: err?.stack,
          success: false
        });
      }
    }

    return NextResponse.json({ testResults });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) });
  }
}
