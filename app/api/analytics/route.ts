import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const { businessId, eventType, searchQuery } = await request.json();

    if (!businessId || !eventType) {
      return NextResponse.json(
        { error: "Business ID and event type are required" },
        { status: 400 }
      );
    }

    // Validate event type
    const validEventTypes = ["view", "search"];
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: "Invalid event type. Must be 'view' or 'search'" },
        { status: 400 }
      );
    }

    // Create analytics record
    const analyticsData: any = {
      businessId,
      eventType,
      timestamp: serverTimestamp(),
      userAgent: request.headers.get("user-agent") || "unknown",
    };

    // Add search query if this is a search event
    if (eventType === "search" && searchQuery) {
      analyticsData.searchQuery = searchQuery;
    }

    const analyticsRef = collection(db, "analytics");
    await addDoc(analyticsRef, analyticsData);

    return NextResponse.json(
      { success: true, message: "Analytics tracked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error tracking analytics:", error);
    return NextResponse.json(
      { error: "Failed to track analytics" },
      { status: 500 }
    );
  }
}
