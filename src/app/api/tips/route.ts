import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const globalRef = db.collection("global_metrics").doc("larb_meter");
    const globalSnap = await globalRef.get();
    
    if (!globalSnap.exists) {
      return NextResponse.json({ count: 0, weeklyGoal: 100 });
    }

    const data = globalSnap.data();
    return NextResponse.json({
      count: data?.count ?? 0,
      weeklyGoal: data?.weeklyGoal ?? 100
    });
  } catch (error: any) {
    console.error("Error fetching global larb meter:", error);
    return NextResponse.json({ count: 0, weeklyGoal: 100 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Writer slug is required" }, { status: 400 });
    }

    const db = getAdminFirestore();
    const authorRef = db.collection("authors_metadata").doc(slug);
    const globalRef = db.collection("global_metrics").doc("larb_meter");

    // Perform an atomic batch to increment both counters
    const batch = db.batch();
    
    // Increment writer's total tips
    batch.set(authorRef, { 
      totalTips: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    // Increment global larb meter count
    batch.set(globalRef, {
      count: FieldValue.increment(1),
      weeklyGoal: 100 // Ensure weeklyGoal is set
    }, { merge: true });

    await batch.commit();

    // Fetch the updated count to return
    const globalSnap = await globalRef.get();
    const globalData = globalSnap.data();

    return NextResponse.json({ 
      success: true, 
      count: globalData?.count ?? 1,
      weeklyGoal: globalData?.weeklyGoal ?? 100
    });
  } catch (error: any) {
    console.error("Error incrementing tip count:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
