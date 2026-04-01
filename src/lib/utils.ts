import { media } from "@wix/sdk";

export function getPostImageUrl(
  imageString: string | undefined,
  width: number,
  height: number
): string | null {
  if (!imageString) return null;
  try {
    return media.getScaledToFillImageUrl(imageString, width, height, {});
  } catch {
    return null;
  }
}

export function getCategoryLabel(
  post: { categoryIds?: string[] },
  categoryMap: Map<string, string>
): string | null {
  const firstId = post.categoryIds?.[0];
  if (!firstId) return null;
  return categoryMap.get(firstId) ?? null;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
