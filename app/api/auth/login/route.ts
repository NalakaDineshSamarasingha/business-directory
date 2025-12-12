import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmail } from '@/services/auth.service';
import { getUserDocument, getBusinessDocument, UserData, BusinessData } from '@/services/firestore.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sign in user with Firebase Auth
    const userCredential = await signInWithEmail(email, password);
    const user = userCredential.user;

    // Fetch user data from Firestore
    let userData: UserData | BusinessData | null = await getUserDocument(user.uid);
    
    // If not found as regular user, try business
    if (!userData) {
      userData = await getBusinessDocument(user.uid);
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          uid: user.uid,
          email: user.email,
          userData,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Login error:', error);
    
    // Handle Firebase Auth errors
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      
      switch (firebaseError.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        case 'auth/user-disabled':
          return NextResponse.json(
            { error: 'This account has been disabled' },
            { status: 403 }
          );
        case 'auth/too-many-requests':
          return NextResponse.json(
            { error: 'Too many login attempts. Please try again later' },
            { status: 429 }
          );
        default:
          return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
          );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
