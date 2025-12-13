"use client";

import Image from "next/image";
import { BusinessData } from "@/services/firestore.service";
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/services/firestore.service';
import { showSuccess, showError } from "@/lib/utils/toast";
import { useState } from "react";

interface BusinessHeaderProps {
  businessData: BusinessData;
  userId: string;
  isEditing: boolean;
  isSaving: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onDataUpdate: () => void;
}

export default function BusinessHeader({
  businessData,
  userId,
  isEditing,
  isSaving,
  onEditToggle,
  onSave,
  onDataUpdate,
}: BusinessHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uid', userId);
      formData.append('type', 'icon');

      const response = await fetch('/api/business/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Failed to upload image');
        return;
      }

      // Update Firestore with the new icon URL
      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, {
        businessIcon: data.imageUrl,
        updatedAt: serverTimestamp(),
      });

      showSuccess('Business icon uploaded successfully!');
      onDataUpdate(); // Trigger data refresh
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload business icon');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uid', userId);
      formData.append('type', 'cover');

      const response = await fetch('/api/business/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Failed to upload image');
        return;
      }

      // Update Firestore with the new cover URL
      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, {
        coverImage: data.imageUrl,
        updatedAt: serverTimestamp(),
      });

      showSuccess('Cover image uploaded successfully!');
      onDataUpdate(); // Trigger data refresh
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      {/* Cover Image Section */}
      <div className="relative w-full h-48 bg-gradient-to-r from-[#151D26] to-[#2B3D4F]">
        {businessData.coverImage ? (
          <Image 
            src={businessData.coverImage} 
            alt={`${businessData.businessName} cover`} 
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white opacity-50">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No cover image</p>
            </div>
          </div>
        )}
        
        {/* Upload Cover Button */}
        {isEditing && (
          <label className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={isUploadingCover}
              className="hidden"
            />
            {isUploadingCover ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-medium">Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">
                  {businessData.coverImage ? 'Change Cover' : 'Add Cover'}
                </span>
              </>
            )}
          </label>
        )}
      </div>

      {/* Business Info Section */}
      <div className="p-6">
    <div className="flex items-start justify-between">"
        <div className="flex items-center gap-6">
          {/* Business Icon */}
          <div className="relative">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
              {businessData.businessIcon ? (
                <Image 
                  src={businessData.businessIcon} 
                  alt={businessData.businessName} 
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-gray-500">
                  {businessData.businessName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Upload Icon Button */}
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-[#151D26] text-white p-2 rounded-full cursor-pointer hover:bg-[#2B3D4F] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                {isUploading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </label>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{businessData.businessName}</h1>
            <p className="text-gray-600 mt-1">{businessData.category || 'No category specified'}</p>
            <div className="flex items-center gap-2 mt-2">
              {businessData.verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={isEditing ? onSave : onEditToggle}
          disabled={isSaving}
          className="bg-[#151D26] text-white px-6 py-2 rounded-lg hover:bg-[#2B3D4F] transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>
      </div>
    </div>
  );
}
