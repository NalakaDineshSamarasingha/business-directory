import { NextRequest, NextResponse } from "next/server";
import { registerUserWithEmail } from "@/services/auth.service";
import { createUserDocument } from "@/services/firestore.service";
import { uploadProfilePicture } from "@/services/storage.service";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const profilePic = formData.get("profilePic") as File | null;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate first name and last name (minimum 2 characters, letters only)
    if (firstName.trim().length < 2 || !/^[a-zA-Z\s]+$/.test(firstName)) {
      return NextResponse.json(
        { error: "First name must be at least 2 characters and contain only letters" },
        { status: 400 }
      );
    }

    if (lastName.trim().length < 2 || !/^[a-zA-Z\s]+$/.test(lastName)) {
      return NextResponse.json(
        { error: "Last name must be at least 2 characters and contain only letters" },
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

    // Validate profile picture if provided
    if (profilePic) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(profilePic.type)) {
        return NextResponse.json(
          { error: "Profile picture must be a valid image (JPEG, PNG, or WebP)" },
          { status: 400 }
        );
      }
      // Check file size (max 5MB)
      if (profilePic.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Profile picture must be less than 5MB" },
          { status: 400 }
        );
      }
    }

    // Register user with Firebase Auth
    const userCredential = await registerUserWithEmail(email, password);
    const uid = userCredential.user.uid;

    // Upload profile picture if provided
    let profilePicUrl: string | null = null;
    if (profilePic) {
      profilePicUrl = await uploadProfilePicture(uid, profilePic);
    }

    // Create user document in Firestore
    await createUserDocument(uid, {
      email,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      profilePicUrl,
      userType: "user",
    });

    // Return success response
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          uid,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email,
          profilePicUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("User registration error:", error);
    
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
