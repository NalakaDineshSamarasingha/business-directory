import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/services/firestore.service';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      uid,
      businessName,
      description,
      category,
      phone,
      contactEmail,
      website,
      street,
      city,
      state,
      zipCode,
      country,
      facebook,
      instagram,
      twitter,
      linkedin,
      youtube,
      googleMapUrl,
    } = body;

    // Validate required fields
    if (!uid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    // Add optional fields only if they have values
    if (businessName) updateData.businessName = businessName;
    if (description !== undefined) updateData.description = description || null;
    if (category !== undefined) updateData.category = category || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail || null;
    if (website !== undefined) updateData.website = website || null;
    if (googleMapUrl !== undefined) updateData.googleMapUrl = googleMapUrl || null;

    // Update address
    if (street !== undefined || city !== undefined || state !== undefined || 
        zipCode !== undefined || country !== undefined) {
      updateData.address = {
        street: street || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        country: country || null,
      };
    }

    // Update social links
    if (facebook !== undefined || instagram !== undefined || twitter !== undefined || 
        linkedin !== undefined || youtube !== undefined) {
      updateData.socialLinks = {
        facebook: facebook || null,
        instagram: instagram || null,
        twitter: twitter || null,
        linkedin: linkedin || null,
        youtube: youtube || null,
      };
    }

    // Update the business document in Firestore
    const businessRef = doc(db, COLLECTIONS.BUSINESSES, uid);
    await updateDoc(businessRef, updateData);

    return NextResponse.json(
      {
        success: true,
        message: 'Business profile updated successfully',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Update profile error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
