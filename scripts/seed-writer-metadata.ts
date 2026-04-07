/**
 * Seed script: migrate hardcoded author metadata → Firestore `authors_metadata` collection.
 *
 * Usage:
 *   npx tsx scripts/seed-writer-metadata.ts
 *
 * Prerequisites:
 *   - GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY env vars set (already in .env.local)
 *   OR
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON file
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ---------- Firebase Admin init ----------
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!getApps().length) {
  if (email && key) {
    initializeApp({
      credential: cert({
        projectId: "the-isaander-reader-db",
        clientEmail: email,
        privateKey: key,
      }),
    });
  } else {
    initializeApp({ projectId: "the-isaander-reader-db" });
  }
}

const db = getFirestore();
const COLLECTION = "authors_metadata";

// ---------- Hardcoded seed data (from src/data/authors.ts) ----------
const seedData = [
  {
    slug: "theisaander",
    wixMemberId: undefined,
    socialLinks: {
      facebook: "https://www.facebook.com/theisaander",
      x: "https://x.com/theisaander",
    },
    expertise: ["ข่าวสืบสวน", "วัฒนธรรมอีสาน"],
    revenueSharePercent: 60,
    isActive: true,
  },
  {
    slug: "thammaruja",
    wixMemberId: "503edaab-00c8-44b9-a757-e0239a78fb1774128",
    promptPayId: "0627283058",
    promptPayName: "ธรรมรุจา ธรรมสโรช",
    revenueSharePercent: 60,
    isActive: true,
  },
];

async function main() {
  console.log(`Seeding ${seedData.length} writers into Firestore '${COLLECTION}'...\n`);

  for (const writer of seedData) {
    const { slug, ...data } = writer;
    const ref = db.collection(COLLECTION).doc(slug);
    const existing = await ref.get();

    if (existing.exists) {
      console.log(`  ⏭  ${slug} — already exists, skipping (use --force to overwrite)`);
      continue;
    }

    await ref.set({
      ...data,
      slug,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: "seed-script",
    });

    console.log(`  ✅ ${slug} — created`);
  }

  console.log("\nDone! You can now manage writers at /author/dashboard/writers");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
