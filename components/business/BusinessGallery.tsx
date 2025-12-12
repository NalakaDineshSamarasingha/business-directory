"use client";

import Image from "next/image";
import { BusinessData } from "@/services/firestore.service";
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/services/firestore.service';
import { showSuccess, showError } from "@/lib/utils/toast";
import { useState } from "react";

interface BusinessGalleryProps {
  businessData: BusinessData;
  userId: string;
  isEditing: boolean;
  onDataUpdate: () => void;
}

export default function BusinessGallery({
  businessData,
  userId,
  isEditing,
  onDataUpdate,
}: BusinessGalleryProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uid', userId);
        formData.append('type', 'gallery');

        const response = await fetch('/api/business/upload-image', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data.imageUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Get current images
      const currentImages = businessData.images || [];

      // Update Firestore with new images
      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, {
        images: [...currentImages, ...imageUrls],
        updatedAt: serverTimestamp(),
      });

      showSuccess(`${imageUrls.length} image(s) uploaded successfully!`);
      onDataUpdate(); // Trigger data refresh
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload gallery images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string, index: number) => {
    try {
      const currentImages = businessData.images || [];
      const updatedImages = currentImages.filter((_, i) => i !== index);

      // Update Firestore
      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, {
        images: updatedImages,
        updatedAt: serverTimestamp(),
      });

      showSuccess('Image deleted successfully!');
      onDataUpdate(); // Trigger data refresh
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete image');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Gallery</h3>
        
        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {businessData.images && businessData.images.length > 0 ? (
            businessData.images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200">
                <Image 
                  src={image} 
                  alt={`Gallery ${index + 1}`} 
                  fill
                  className="object-cover"
                />
                {isEditing && (
                  <button 
                    onClick={() => handleDeleteImage(image, index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No images uploaded yet
            </div>
          )}
        </div>

        {/* Upload Button */}
        {isEditing && (
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#151D26] file:text-white hover:file:bg-[#2B3D4F] disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              {isUploading ? 'Uploading images...' : 'You can upload multiple images at once'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
