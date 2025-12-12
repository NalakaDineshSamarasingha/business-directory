import { NextRequest, NextResponse } from 'next/server';
import { uploadBusinessIcon, uploadBusinessGalleryImage } from '@/services/storage.service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uid = formData.get('uid') as string;
    const type = formData.get('type') as 'icon' | 'gallery';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!uid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    let imageUrl: string;

    if (type === 'icon') {
      imageUrl = await uploadBusinessIcon(file, uid);
    } else {
      imageUrl = await uploadBusinessGalleryImage(file, uid);
    }

    return NextResponse.json(
      {
        success: true,
        imageUrl,
        message: 'Image uploaded successfully',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
