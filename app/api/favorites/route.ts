import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/services/firestore.service';

const FAVORITES_COLLECTION = 'favorites';

// GET - Get all favorites for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const favoritesRef = adminDb.collection(FAVORITES_COLLECTION);
    const querySnapshot = await favoritesRef.where('userId', '==', userId).get();

    const favorites = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ 
      success: true,
      favorites 
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST - Add favorite or sync multiple favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, businessId, favorites } = body;

    // Sync multiple favorites (from localStorage on login)
    if (favorites && Array.isArray(favorites)) {
      const results = [];
      
      for (const favBusinessId of favorites) {
        // Check if already exists
        const favoritesRef = adminDb.collection(FAVORITES_COLLECTION);
        const existing = await favoritesRef
          .where('userId', '==', userId)
          .where('businessId', '==', favBusinessId)
          .get();

        if (existing.empty) {
          const docRef = await favoritesRef.add({
            userId,
            businessId: favBusinessId,
            createdAt: new Date()
          });
          results.push({ businessId: favBusinessId, id: docRef.id });
        }
      }

      return NextResponse.json({ 
        success: true,
        message: `${results.length} favorites synced`,
        synced: results
      });
    }

    // Add single favorite
    if (!userId || !businessId) {
      return NextResponse.json(
        { error: 'User ID and Business ID are required' },
        { status: 400 }
      );
    }

    // Check if already exists
    const favoritesRef = adminDb.collection(FAVORITES_COLLECTION);
    const querySnapshot = await favoritesRef
      .where('userId', '==', userId)
      .where('businessId', '==', businessId)
      .get();

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Business already in favorites' },
        { status: 400 }
      );
    }

    // Add new favorite
    const docRef = await favoritesRef.add({
      userId,
      businessId,
      createdAt: new Date()
    });

    return NextResponse.json({ 
      success: true,
      favoriteId: docRef.id,
      message: 'Added to favorites'
    });

  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE - Remove favorite
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const businessId = searchParams.get('businessId');

    if (!userId || !businessId) {
      return NextResponse.json(
        { error: 'User ID and Business ID are required' },
        { status: 400 }
      );
    }

    // Find and delete the favorite
    const favoritesRef = adminDb.collection(FAVORITES_COLLECTION);
    const querySnapshot = await favoritesRef
      .where('userId', '==', userId)
      .where('businessId', '==', businessId)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    // Delete the document
    await querySnapshot.docs[0].ref.delete();

    return NextResponse.json({ 
      success: true,
      message: 'Removed from favorites'
    });

  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
