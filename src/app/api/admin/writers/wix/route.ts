import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { fetchWixWriters } from "@/lib/author-utils";

// GET /api/admin/writers/wix — list all writers discovered from Wix posts
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const wixWriters = await fetchWixWriters();

    // Return a lightweight subset for the selector
    const writers = wixWriters.map((w) => ({
      slug: w.slug,
      name: w.name,
      title: w.title,
      avatar: w.avatar,
      wixMemberId: w.wixMemberId,
      postCount: w.postCount,
    }));

    return NextResponse.json({ writers });
  } catch (err) {
    console.error("Failed to fetch Wix writers:", err);
    return NextResponse.json(
      { error: "Failed to fetch Wix writers" },
      { status: 500 }
    );
  }
}
