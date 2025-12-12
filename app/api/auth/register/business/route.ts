import { NextRequest, NextResponse } from "next/server";
import { registerUserWithEmail } from "@/services/auth.service";
import { createBusinessDocument } from "@/services/firestore.service";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { businessName, email, password } = body;

    // Validate required fields
    if (!businessName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate business name (minimum 2 characters)
    if (businessName.trim().length < 2) {
      return NextResponse.json(
        { error: "Business name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Validate business name (max 100 characters)
    if (businessName.trim().length > 100) {
      return NextResponse.json(
        { error: "Business name must not exceed 100 characters" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Validate password strength (at least one number and one letter)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLetter || !hasNumber) {
      return NextResponse.json(
        { error: "Password must contain at least one letter and one number" },
        { status: 400 }
      );
    }

    // Register business owner with Firebase Auth
    const userCredential = await registerUserWithEmail(email, password);
    const uid = userCredential.user.uid;

    // Create business document in Firestore
    await createBusinessDocument(uid, {
      email,
      businessName: businessName.trim(),
      userType: "business",
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Business account registered successfully",
        business: {
          uid,
          businessName: businessName.trim(),
          email,
          verified: false,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Business registration error:", error);
    
    // Handle Firebase specific errors
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
    
    if (error.code === 'auth/weak-password') {
      return NextResponse.json(
        { error: "Password is too weak" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
