import { NextRequest, NextResponse } from "next/server";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Use Firebase Auth to check if email exists
    // This method doesn't require Firestore permissions
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);

    if (signInMethods.length > 0) {
      return NextResponse.json(
        { exists: true, message: "Email is already registered" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { exists: false, message: "Email is available" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Email check error:", error);
    
    // If the error is about the method not being available, email doesn't exist
    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to check email availability" },
      { status: 500 }
    );
  }
}
