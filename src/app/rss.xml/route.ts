import wixClient from "@/lib/wix-client";
import { resolveAuthor } from "@/lib/author-utils";

export const revalidate = 300;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.theisaander.com";

  let posts = [] as Array<{
    slug?: string;
    title?: string;
    excerpt?: string;
    lastPublishedDate?: Date | string | null;
  }>;
  try {
    const { posts: items } = await wixClient.posts.listPosts({
      paging: { limit: 20 },
    });
    posts = (items ?? []) as typeof posts;
  } catch {
    posts = [];
  }

  const buildDate = new Date().toUTCString();

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${baseUrl}/post/${post.slug}`;
      const author = resolveAuthor(post as { memberId?: string | null });
      const pubDate = post.lastPublishedDate
        ? new Date(post.lastPublishedDate).toUTCString()
        : buildDate;

      return `
    <item>
      <title>${escapeXml(post.title ?? "")}</title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(author.email ?? author.name)}</author>
      <description>${escapeXml(post.excerpt ?? "")}</description>
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Isaander</title>
    <link>${baseUrl}</link>
    <description>สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย</description>
    <language>th</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
