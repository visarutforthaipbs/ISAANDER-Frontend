import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  getAllWriterMetadata,
  upsertWriterMetadata,
} from "@/lib/firebase/writer-metadata";

// GET /api/admin/writers — list all writer metadata
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const writers = await getAllWriterMetadata();
  return NextResponse.json({ writers });
}

// POST /api/admin/writers — create or update a writer
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { slug, ...data } = body;

  if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
    return NextResponse.json(
      { error: "slug is required" },
      { status: 400 }
    );
  }

  // Sanitize slug: lowercase, no spaces
  const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

  // Validate promptPayId format if provided
  if (data.promptPayId && !/^\d{10,13}$/.test(data.promptPayId)) {
    return NextResponse.json(
      { error: "promptPayId must be 10-13 digits (phone or national ID)" },
      { status: 400 }
    );
  }

  // Validate revenueSharePercent if provided
  if (
    data.revenueSharePercent !== undefined &&
    (typeof data.revenueSharePercent !== "number" ||
      data.revenueSharePercent < 0 ||
      data.revenueSharePercent > 100)
  ) {
    return NextResponse.json(
      { error: "revenueSharePercent must be 0-100" },
      { status: 400 }
    );
  }

  // Guard against using Wix dashboard dataCapsuleId in place of memberId
  if (typeof data.wixMemberId === "string" && /^\d{8,}$/.test(data.wixMemberId.trim())) {
    return NextResponse.json(
      { error: "wixMemberId appears invalid (numeric-only). Do not use dataCapsuleId from Wix URL." },
      { status: 400 }
    );
  }

  await upsertWriterMetadata(cleanSlug, data, session.email);

  return NextResponse.json({ success: true, slug: cleanSlug });
}
