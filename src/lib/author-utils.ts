import {
  getAuthorByWixMemberId,
  getDefaultAuthor,
  getAllAuthors,
  type Author,
} from "@/data/authors";
import wixClient from "@/lib/wix-client";

interface PostLike {
  memberId?: string | null;
}

/**
 * Resolve the author for a given Wix post.
 * 1. Try to match post.memberId to a local author config entry
 * 2. Fall back to default "The Isaander" author
 */
export function resolveAuthor(post: PostLike): Author {
  if (post.memberId) {
    const matched = getAuthorByWixMemberId(post.memberId);
    if (matched) return matched;
  }
  return getDefaultAuthor();
}

/** Cache of Wix member profiles (memberId → { name, avatar }) */
const memberAvatarCache = new Map<string, { name: string; avatar: string }>();

/**
 * Async version of resolveAuthor that fetches the Wix member's
 * profile photo and name when no local author match is available.
 * Returns a full Author shape so it can be used as a drop-in replacement.
 */
export async function resolveAuthorAsync(
  post: PostLike
): Promise<Author> {
  const memberId = post.memberId;

  if (!memberId) return getDefaultAuthor();

  // Check local author match first
  const localMatch = getAuthorByWixMemberId(memberId);

  // If local match has a populated avatar, return directly
  if (localMatch && localMatch.avatar && localMatch.avatar.startsWith("http")) return localMatch;

  // Check cache
  if (memberAvatarCache.has(memberId)) {
    const cached = memberAvatarCache.get(memberId)!;
    const base = localMatch || getDefaultAuthor();
    return {
      ...base,
      name: cached.name || base.name,
      avatar: cached.avatar || base.avatar,
    };
  }

  try {
    const member = await wixClient.members.getMember(memberId, {
      fieldsets: ["FULL"],
    });
    const firstName = member?.contact?.firstName ?? "";
    const lastName = member?.contact?.lastName ?? "";
    const name = localMatch?.name
      || (firstName && lastName ? `${firstName} ${lastName}` : firstName || member?.profile?.nickname || "นักเขียน");
    const photo = member?.profile?.photo?.url ?? "";
    const slug = localMatch?.slug || member?.profile?.slug || memberId;

    const resolved = { name, avatar: photo };
    memberAvatarCache.set(memberId, resolved);

    const base = localMatch || getDefaultAuthor();
    return {
      ...base,
      slug,
      name,
      avatar: photo || localMatch?.avatar || base.avatar,
    };
  } catch {
    const fallback = localMatch || getDefaultAuthor();
    memberAvatarCache.set(memberId, { name: fallback.name, avatar: "" });
    return fallback;
  }
}

/** A writer obtained from Wix, merged with any local config */
export interface WixWriter {
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  postCount: number;
  wixMemberId: string;
  hireEmail?: string;
  buyMeCoffeeUrl?: string;
  promptPayId?: string;
  promptPayName?: string;
  revenueSharePercent?: number;
  /** Category labels derived from the writer's posts */
  categories: string[];
  /** Sum of views across all posts by this writer */
  totalViews: number;
  /** Merged local Author config, if any */
  localAuthor?: Author;
}

/**
 * Fetch all writers from Wix by:
 * 1. Getting all posts to find unique memberIds + post counts
 * 2. Looking up member profiles via @wix/members
 * 3. Merging with local author config
 */
export async function fetchWixWriters(): Promise<WixWriter[]> {
  // Fetch all posts (paginated — get up to 200)
  const allPosts: { _id?: string; memberId?: string | null; categoryIds?: string[] }[] = [];
  let offset = 0;
  const limit = 100;
  for (let i = 0; i < 3; i++) {
    try {
      const { posts: items } = await wixClient.posts.listPosts({
        paging: { limit, offset },
      });
      if (!items || items.length === 0) break;
      allPosts.push(...items);
      if (items.length < limit) break;
      offset += limit;
    } catch {
      break;
    }
  }

  // Build category ID → label map
  const categoryMap = new Map<string, string>();
  try {
    const { categories: cats } = await wixClient.categories.listCategories();
    if (cats) {
      for (const cat of cats) {
        if (cat._id && cat.label) categoryMap.set(cat._id, cat.label);
      }
    }
  } catch {
    // continue without category labels
  }

  // Count posts per memberId, collect category IDs & post IDs per member
  const memberPostCount = new Map<string, number>();
  const memberCategoryIds = new Map<string, Set<string>>();
  const memberPostIds = new Map<string, string[]>();
  for (const post of allPosts) {
    const mid = post.memberId;
    if (mid) {
      memberPostCount.set(mid, (memberPostCount.get(mid) ?? 0) + 1);
      if (post._id) {
        const ids = memberPostIds.get(mid) ?? [];
        ids.push(post._id);
        memberPostIds.set(mid, ids);
      }
      if (post.categoryIds) {
        const existing = memberCategoryIds.get(mid) ?? new Set<string>();
        for (const cid of post.categoryIds) existing.add(cid);
        memberCategoryIds.set(mid, existing);
      }
    }
  }

  // Fetch view counts for all posts and sum per member
  const memberViewCount = new Map<string, number>();
  const allPostIds = allPosts.map((p) => p._id).filter((id): id is string => !!id);
  const viewResults = await Promise.all(
    allPostIds.map(async (postId) => {
      try {
        const result = await wixClient.posts.getPostMetrics(postId);
        return { postId, views: result?.metrics?.views ?? 0 };
      } catch {
        return { postId, views: 0 };
      }
    })
  );
  // Map postId → memberId for aggregation
  const postToMember = new Map<string, string>();
  for (const post of allPosts) {
    if (post._id && post.memberId) postToMember.set(post._id, post.memberId);
  }
  for (const { postId, views } of viewResults) {
    const mid = postToMember.get(postId);
    if (mid) memberViewCount.set(mid, (memberViewCount.get(mid) ?? 0) + views);
  }

  // Fetch member profiles
  const writers: WixWriter[] = [];
  const localAuthors = getAllAuthors();

  for (const [memberId, postCount] of memberPostCount) {
    // Check if we have a local author config (by wixMemberId)
    const local = localAuthors.find((a) => a.wixMemberId === memberId);

    try {
      const member = await wixClient.members.getMember(memberId, {
        fieldsets: ["FULL"],
      });

      // Also try matching local config by the Wix profile slug
      const profileSlug = member?.profile?.slug;
      const localBySlug = !local && profileSlug
        ? localAuthors.find((a) => a.wixMemberId === profileSlug)
        : undefined;
      const merged = local ?? localBySlug;

      const name =
        merged?.name ??
        member?.contact?.firstName ??
        member?.profile?.nickname ??
        "นักเขียน";
      const lastName = member?.contact?.lastName ?? "";
      const displayName = merged?.name ?? (lastName ? `${name} ${lastName}` : name);
      const slug =
        merged?.slug ??
        member?.profile?.slug ??
        memberId.slice(0, 8);
      const avatar =
        (merged?.avatar || member?.profile?.photo?.url) ??
        "";
      const title = merged?.title ?? member?.profile?.title ?? "นักเขียน";
      const bio = merged?.bio ?? "";

      // Resolve category labels for this writer
      const catIds = memberCategoryIds.get(memberId);
      const categories = catIds
        ? [...catIds].map((id) => categoryMap.get(id)).filter((l): l is string => !!l)
        : [];

      writers.push({
        slug,
        name: displayName,
        title,
        bio,
        avatar,
        postCount,
        wixMemberId: memberId,
        hireEmail: merged?.hireEmail,
        buyMeCoffeeUrl: merged?.buyMeCoffeeUrl,
        promptPayId: merged?.promptPayId,
        promptPayName: merged?.promptPayName,
        revenueSharePercent: merged?.revenueSharePercent ?? 60,
        categories,
        totalViews: memberViewCount.get(memberId) ?? 0,
        localAuthor: merged,
      });
    } catch {
      const catIds = memberCategoryIds.get(memberId);
      const categories = catIds
        ? [...catIds].map((id) => categoryMap.get(id)).filter((l): l is string => !!l)
        : [];

      // Member lookup failed — use local config or minimal fallback
      writers.push({
        slug: local?.slug ?? memberId.slice(0, 8),
        name: local?.name ?? "นักเขียน",
        title: local?.title ?? "นักเขียน",
        bio: local?.bio ?? "",
        avatar: local?.avatar ?? "",
        postCount,
        wixMemberId: memberId,
        hireEmail: local?.hireEmail,
        buyMeCoffeeUrl: local?.buyMeCoffeeUrl,
        promptPayId: local?.promptPayId,
        promptPayName: local?.promptPayName,
        revenueSharePercent: local?.revenueSharePercent ?? 60,
        categories,
        totalViews: memberViewCount.get(memberId) ?? 0,
        localAuthor: local,
      });
    }
  }

  // Sort by total views descending (fall back to post count)
  writers.sort((a, b) => b.totalViews - a.totalViews || b.postCount - a.postCount);

  return writers;
}
