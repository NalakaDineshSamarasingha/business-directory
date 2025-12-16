import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user from Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(userId);
    
    // Get user data from Firestore
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const businessDoc = await adminDb.collection("businesses").doc(userId).get();

    let userData = null;
    let userType = "user";

    if (userDoc.exists) {
      userData = userDoc.data();
      userType = "user";
    } else if (businessDoc.exists) {
      userData = businessDoc.data();
      userType = "business";
    }

    return NextResponse.json({
      success: true,
      userType,
      email: userRecord.email,
      ...userData,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    
    if (error.code === "auth/user-not-found") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
