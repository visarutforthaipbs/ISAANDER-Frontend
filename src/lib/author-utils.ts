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

/** Cache of Wix member avatars (memberId → photo URL) */
const memberAvatarCache = new Map<string, string>();

/**
 * Async version of resolveAuthor that fetches the Wix member's
 * profile photo when no local author image is available.
 */
export async function resolveAuthorAsync(
  post: PostLike
): Promise<{ name: string; avatar: string }> {
  const base = resolveAuthor(post);
  const memberId = post.memberId;

  // If the local avatar file actually exists as a URL (not a local path),
  // or there's no memberId, return as-is
  if (!memberId) return base;

  // Check if avatar is a real URL (from Wix) — if so, it's fine
  if (base.avatar.startsWith("http")) return base;

  // Try fetching the Wix member's photo
  if (memberAvatarCache.has(memberId)) {
    const cached = memberAvatarCache.get(memberId)!;
    return { name: base.name, avatar: cached || base.avatar };
  }

  try {
    const member = await wixClient.members.getMember(memberId, {
      fieldsets: ["FULL"],
    });
    const photo = member?.profile?.photo?.url ?? "";
    memberAvatarCache.set(memberId, photo);
    return { name: member?.contact?.firstName && member?.contact?.lastName
      ? `${member.contact.firstName} ${member.contact.lastName}`
      : base.name, avatar: photo || base.avatar };
  } catch {
    memberAvatarCache.set(memberId, "");
    return base;
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
    // Check if we have a local author config
    const local = localAuthors.find((a) => a.wixMemberId === memberId);

    try {
      const member = await wixClient.members.getMember(memberId, {
        fieldsets: ["FULL"],
      });

      const name =
        local?.name ??
        member?.contact?.firstName ??
        member?.profile?.nickname ??
        "นักเขียน";
      const lastName = member?.contact?.lastName ?? "";
      const displayName = local?.name ?? (lastName ? `${name} ${lastName}` : name);
      const slug =
        local?.slug ??
        member?.profile?.slug ??
        memberId.slice(0, 8);
      const avatar =
        local?.avatar ??
        member?.profile?.photo?.url ??
        "";
      const title = local?.title ?? member?.profile?.title ?? "นักเขียน";
      const bio = local?.bio ?? "";

      writers.push({
        slug,
        name: displayName,
        title,
        bio,
        avatar,
        postCount,
        wixMemberId: memberId,
        hireEmail: local?.hireEmail,
        buyMeCoffeeUrl: local?.buyMeCoffeeUrl,
        promptPayId: local?.promptPayId,
        promptPayName: local?.promptPayName,
        revenueSharePercent: local?.revenueSharePercent ?? 60,
        localAuthor: local,
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
