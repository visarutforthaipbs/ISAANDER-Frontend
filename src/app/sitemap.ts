import { MetadataRoute } from "next";
import wixClient from "@/lib/wix-client";
import { getAllAuthors } from "@/data/authors";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.theisaander.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/author`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Fetch published posts
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const { posts: items } = await wixClient.posts.listPosts({
      paging: { limit: 100 },
    });
    postRoutes = (items ?? []).map((post) => ({
      url: `${baseUrl}/post/${post.slug}`,
      lastModified: post.lastPublishedDate
        ? new Date(post.lastPublishedDate)
        : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // Silently fail — static routes are better than no sitemap
  }

  // Local author slugs
  const localAuthors = getAllAuthors();
  const authorRoutes: MetadataRoute.Sitemap = localAuthors.map((author) => ({
    url: `${baseUrl}/author/${author.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...authorRoutes];
}
