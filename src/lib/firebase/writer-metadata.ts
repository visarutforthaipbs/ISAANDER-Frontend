import { getAdminFirestore } from "@/lib/firebase/admin";
import type { FieldValue } from "firebase-admin/firestore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WriterMetadata {
  /** Document ID — matches author slug */
  slug: string;
  wixMemberId?: string;
  promptPayId?: string;
  promptPayName?: string;
  hireEmail?: string;
  buyMeCoffeeUrl?: string;
  revenueSharePercent?: number;
  socialLinks?: {
    facebook?: string;
    x?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    website?: string;
  };
  expertise?: string[];
  /** Admin-only notes */
  notes?: string;
  isActive?: boolean;
  updatedAt?: FieldValue | string;
  updatedBy?: string;
  createdAt?: FieldValue | string;
}

const COLLECTION = "authors_metadata";

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getWriterMetadata(slug: string): Promise<WriterMetadata | null> {
  const db = getAdminFirestore();
  const doc = await db.collection(COLLECTION).doc(slug).get();
  if (!doc.exists) return null;
  return { slug: doc.id, ...doc.data() } as WriterMetadata;
}

export async function getAllWriterMetadata(): Promise<WriterMetadata[]> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(COLLECTION).orderBy("slug").get();
  return snapshot.docs.map((doc) => ({ slug: doc.id, ...doc.data() }) as WriterMetadata);
}

export async function getWriterByWixMemberId(memberId: string): Promise<WriterMetadata | null> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where("wixMemberId", "==", memberId)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { slug: doc.id, ...doc.data() } as WriterMetadata;
}

// ---------------------------------------------------------------------------
// Write (admin only — caller must verify admin before calling)
// ---------------------------------------------------------------------------

export async function upsertWriterMetadata(
  slug: string,
  data: Partial<WriterMetadata>,
  adminEmail: string
): Promise<void> {
  const db = getAdminFirestore();
  const { FieldValue } = await import("firebase-admin/firestore");
  const ref = db.collection(COLLECTION).doc(slug);
  const existing = await ref.get();

  // Strip slug from data — it's the doc id
  const { slug: _ignored, ...rest } = data;
  void _ignored;

  if (existing.exists) {
    await ref.update({
      ...rest,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: adminEmail,
    });
  } else {
    await ref.set({
      ...rest,
      slug,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: adminEmail,
    });
  }
}

export async function deleteWriterMetadata(slug: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(COLLECTION).doc(slug).delete();
}
