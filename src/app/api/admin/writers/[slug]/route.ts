import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  getWriterMetadata,
  upsertWriterMetadata,
  deleteWriterMetadata,
} from "@/lib/firebase/writer-metadata";

// GET /api/admin/writers/[slug]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { slug } = await params;
  const writer = await getWriterMetadata(slug);
  if (!writer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ writer });
}

// PUT /api/admin/writers/[slug]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { slug } = await params;
  const data = await request.json();

  // Validate promptPayId format if provided
  if (data.promptPayId && !/^\d{10,13}$/.test(data.promptPayId)) {
    return NextResponse.json(
      { error: "promptPayId must be 10-13 digits" },
      { status: 400 }
    );
  }

  // Validate revenueSharePercent
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

  await upsertWriterMetadata(slug, data, session.email);
  return NextResponse.json({ success: true });
}

// DELETE /api/admin/writers/[slug]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { slug } = await params;
  await deleteWriterMetadata(slug);
  return NextResponse.json({ success: true });
}
