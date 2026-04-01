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
 */
export async function resolveAuthorAsync(
  post: PostLike
): Promise<{ name: string; avatar: string }> {
  const memberId = post.memberId;

  if (!memberId) return getDefaultAuthor();

  // Check local author match first
  const localMatch = getAuthorByWixMemberId(memberId);

  // If local match has an http avatar, return directly
  if (localMatch && localMatch.avatar.startsWith("http")) return localMatch;

  // Check cache
  if (memberAvatarCache.has(memberId)) {
    const cached = memberAvatarCache.get(memberId)!;
    return {
      name: cached.name,
      avatar: cached.avatar || localMatch?.avatar || "",
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

    const resolved = { name, avatar: photo };
    memberAvatarCache.set(memberId, resolved);
    return { name, avatar: photo || localMatch?.avatar || "" };
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
  const allPosts: { memberId?: string | null }[] = [];
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

  // Count posts per memberId
  const memberPostCount = new Map<string, number>();
  for (const post of allPosts) {
    const mid = post.memberId;
    if (mid) {
      memberPostCount.set(mid, (memberPostCount.get(mid) ?? 0) + 1);
    }
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
        localAuthor: merged,
      });
    } catch {
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
        localAuthor: local,
      });
    }
  }

  // Sort by post count descending
  writers.sort((a, b) => b.postCount - a.postCount);

  return writers;
}
