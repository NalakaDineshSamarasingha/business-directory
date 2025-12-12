import { supabase } from '../lib/supabase/config';

/**
 * Upload profile picture to Supabase Storage
 */
export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<string> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${timestamp}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    throw new Error(error.message || 'Failed to upload profile picture');
  }
}

/**
 * Delete profile picture from Supabase Storage
 */
export async function deleteProfilePicture(fileUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `profile-pictures/${fileName}`;

    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting profile picture:', error);
    throw new Error(error.message || 'Failed to delete profile picture');
  }
}

/**
 * Upload business icon to Supabase Storage
 */
export async function uploadBusinessIcon(
  file: File,
  businessId: string
): Promise<string> {
  try {
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${businessId}_icon_${timestamp}.${fileExt}`;
    const filePath = `business-icons/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading business icon:', error);
    throw new Error(error.message || 'Failed to upload business icon');
  }
}

/**
 * Upload business gallery image to Supabase Storage
 */
export async function uploadBusinessGalleryImage(
  file: File,
  businessId: string
): Promise<string> {
  try {
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${businessId}_gallery_${timestamp}.${fileExt}`;
    const filePath = `business-gallery/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading gallery image:', error);
    throw new Error(error.message || 'Failed to upload gallery image');
  }
}

/**
 * Delete business image from Supabase Storage
 */
export async function deleteBusinessImage(fileUrl: string): Promise<void> {
  try {
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folder = fileUrl.includes('business-icons') ? 'business-icons' : 'business-gallery';
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting business image:', error);
    throw new Error(error.message || 'Failed to delete business image');
  }
}
