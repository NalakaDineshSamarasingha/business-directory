"use client";

import Image from "next/image";
import { BusinessData } from "@/services/firestore.service";
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/services/firestore.service';
import { showSuccess, showError } from "@/lib/utils/toast";
import { useState } from "react";

interface BannerImagesTabProps {
  businessData: BusinessData;
  userId: string;
  isEditing: boolean;
  onDataUpdate: () => void;
}

export default function BannerImagesTab({
  businessData,
  userId,
  isEditing,
  onDataUpdate,
}: BannerImagesTabProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uid', userId);
        formData.append('type', 'banner');

        const response = await fetch('/api/business/upload-image', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload image');
        }

        return data.imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Update Firestore with new banner images
      const currentBanners = businessData.bannerImages || [];
      const updatedBanners = [...currentBanners, ...uploadedUrls];

      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, {
        bannerImages: updatedBanners,
        updatedAt: serverTimestamp(),
      });

      showSuccess(`${uploadedUrls.length} banner image(s) uploaded successfully!`);
      onDataUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload banner images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBanner = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this banner image?')) {
      return;
    }

    try {
      const currentBanners = businessData.bannerImages || [];
      const updatedBanners = currentBanners.filter(url => url !== imageUrl);

      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, {
        bannerImages: updatedBanners,
        updatedAt: serverTimestamp(),
      });

      showSuccess('Banner image deleted successfully!');
      onDataUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete banner image');
    }
  };

  const bannerImages = businessData.bannerImages || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Banner Images</h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload banner images to display in a carousel on your business page
          </p>
        </div>
        {isEditing && (
          <label className="bg-[#151D26] text-white px-4 py-2 rounded-lg hover:bg-[#2B3D4F] transition-colors cursor-pointer flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleBannerUpload}
              disabled={isUploading}
              className="hidden"
            />
            {isUploading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Banner Images</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* Banner Images Grid */}
      {bannerImages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No banner images yet</h3>
          <p className="text-gray-500">
            {isEditing
              ? "Click 'Add Banner Images' to upload banner images for your carousel"
              : "Enable editing to add banner images"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bannerImages.map((imageUrl, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 group"
            >
              <Image
                src={imageUrl}
                alt={`Banner ${index + 1}`}
                fill
                className="object-cover"
              />
              {isEditing && (
                <button
                  onClick={() => handleDeleteBanner(imageUrl)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Delete banner image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                Banner {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Tips for Banner Images:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Use high-quality images with a 16:9 aspect ratio (e.g., 1920x1080)</li>
              <li>Banner images will automatically rotate in a carousel on your business page</li>
              <li>Upload 3-5 images for the best carousel experience</li>
              <li>Use images that showcase your business, products, or services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
