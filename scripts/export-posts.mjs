/**
 * Export all Wix blog posts to CSV.
 *
 * Usage:
 *   node scripts/export-posts.mjs
 *
 * Requires WIX_CLIENT_ID in .env or as env var.
 */

import { createClient, OAuthStrategy } from "@wix/sdk";
import { posts, categories } from "@wix/blog";
import { members } from "@wix/members";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// -- load .env manually (no dotenv dependency) --
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([\w]+)\s*=\s*(.+)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
// also try .env
const envPath2 = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath2)) {
  for (const line of fs.readFileSync(envPath2, "utf-8").split("\n")) {
    const m = line.match(/^\s*([\w]+)\s*=\s*(.+)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const clientId = process.env.WIX_CLIENT_ID;
if (!clientId) {
  console.error("ERROR: WIX_CLIENT_ID not set. Add it to .env.local or pass as env var.");
  process.exit(1);
}

const wixClient = createClient({
  modules: { posts, categories, members },
  auth: OAuthStrategy({ clientId }),
});

// ── helpers ──────────────────────────────────────────────

function escapeCsv(value) {
  if (value == null) return "";
  const str = String(value).replace(/\r?\n/g, " "); // flatten newlines
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ── main ─────────────────────────────────────────────────

async function main() {
  // 1. Fetch all categories for label lookup
  console.log("Fetching categories…");
  const { categories: cats } = await wixClient.categories.listCategories();
  const catMap = Object.fromEntries((cats ?? []).map((c) => [c._id, c.label]));
  console.log(`  → ${Object.keys(catMap).length} categories`);

  // 2. Fetch all posts (paginated, 100 per page)
  console.log("Fetching posts…");
  const allPosts = [];
  const PAGE = 20;
  let offset = 0;

  while (true) {
    const { posts: batch } = await wixClient.posts.listPosts({
      paging: { limit: PAGE, offset },
      fieldsets: ["CONTENT_TEXT", "URL", "SEO", "METRICS"],
    });
    if (!batch || batch.length === 0) break;
    allPosts.push(...batch);
    console.log(`  → fetched ${allPosts.length} posts so far…`);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }

  console.log(`Total posts: ${allPosts.length}`);
  if (allPosts.length === 0) {
    console.log("No posts to export.");
    return;
  }

  // 3. Fetch member info for author names
  console.log("Resolving author names…");
  const memberIds = [...new Set(allPosts.map((p) => p.memberId).filter(Boolean))];
  const memberMap = {};
  for (const mid of memberIds) {
    try {
      const { member } = await wixClient.members.getMember(mid, {
        fieldsets: ["FULL"],
      });
      if (member?.contact) {
        const name = [member.contact.firstName, member.contact.lastName]
          .filter(Boolean)
          .join(" ");
        memberMap[mid] = name || member.profile?.nickname || mid;
      }
    } catch {
      memberMap[mid] = mid; // fallback to ID
    }
  }

  // 4. Build CSV
  const columns = [
    "id",
    "slug",
    "title",
    "excerpt",
    "contentText",
    "authorMemberId",
    "authorName",
    "categories",
    "featured",
    "lastPublishedDate",
    "minutesToRead",
    "coverImage",
    "url",
    "seoTitle",
    "seoDescription",
  ];

  const rows = allPosts.map((p) => {
    const catLabels = (p.categoryIds ?? [])
      .map((id) => catMap[id] || id)
      .join("; ");

    const coverImage = p.media?.wixMedia?.image ?? "";

    // SEO data may be nested
    const seoTitle = p.seoData?.tags?.find((t) => t.type === "title")?.children ?? "";
    const seoDesc =
      p.seoData?.tags?.find(
        (t) => t.type === "meta" && t.props?.name === "description"
      )?.props?.content ?? "";

    return [
      p._id,
      p.slug,
      p.title,
      p.excerpt,
      p.contentText,
      p.memberId,
      memberMap[p.memberId] ?? "",
      catLabels,
      p.featured ? "true" : "false",
      p.lastPublishedDate ?? "",
      p.minutesToRead ?? "",
      coverImage,
      p.url?.base ? `${p.url.base}${p.url.path}` : "",
      seoTitle,
      seoDesc,
    ];
  });

  const csv =
    columns.map(escapeCsv).join(",") +
    "\n" +
    rows.map((r) => r.map(escapeCsv).join(",")).join("\n") +
    "\n";

  const outFile = path.resolve(__dirname, "../posts-export.csv");
  fs.writeFileSync(outFile, "\uFEFF" + csv, "utf-8"); // BOM for Excel Thai compat
  console.log(`\n✅ Exported ${allPosts.length} posts → ${outFile}`);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
