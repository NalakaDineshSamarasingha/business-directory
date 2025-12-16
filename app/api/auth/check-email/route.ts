import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    if (!adminAuth) {
      return NextResponse.json(
        { error: "Auth service not initialized" },
        { status: 500 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email is already registered
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json({
        exists: true,
        message: "Email is already registered",
      });
    } catch (error: unknown) {
      // If error code is 'auth/user-not-found', it means email is not registered
      const firebaseError = error as { code?: string };
      if (firebaseError.code === "auth/user-not-found") {
        return NextResponse.json({
          exists: false,
          message: "Email is available",
        });
      }
      // Other errors
      throw error;
    }
  } catch (error) {
    console.error("Error checking email availability:", error);
    return NextResponse.json(
      { error: "Failed to check email availability" },
      { status: 500 }
    );
  }
}