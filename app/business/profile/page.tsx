"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { BusinessData, getBusinessDocument } from "@/services/firestore.service";
import { showSuccess, showError } from "@/lib/utils/toast";
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/services/firestore.service';
import BusinessHeader from "@/components/business/BusinessHeader";
import BusinessGallery from "@/components/business/BusinessGallery";
import ProfileTabs from "@/components/business/ProfileTabs";
import OverviewTab from "@/components/business/OverviewTab";
import ContactTab from "@/components/business/ContactTab";
import BusinessHoursTab from "@/components/business/BusinessHoursTab";
import LocationsTab from "@/components/business/LocationsTab";

export default function BusinessProfilePage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'contact' | 'hours' | 'locations'>('overview');
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    tagline: '',
    description: '',
    category: '',
    phone: '',
    contactEmail: '',
    website: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    googleMapUrl: '',
    // Business hours
    mondayOpen: '',
    mondayClose: '',
    mondayClosed: false,
    tuesdayOpen: '',
    tuesdayClose: '',
    tuesdayClosed: false,
    wednesdayOpen: '',
    wednesdayClose: '',
    wednesdayClosed: false,
    thursdayOpen: '',
    thursdayClose: '',
    thursdayClosed: false,
    fridayOpen: '',
    fridayClose: '',
    fridayClosed: false,
    saturdayOpen: '',
    saturdayClose: '',
    saturdayClosed: false,
    sundayOpen: '',
    sundayClose: '',
    sundayClosed: false,
  });

  // Redirect if not a business user
  useEffect(() => {
    if (!loading && (!user || userData?.userType !== 'business')) {
      router.push('/');
    }
  }, [user, userData, loading, router]);

  // Load business data
  useEffect(() => {
    if (userData && userData.userType === 'business') {
      setBusinessData(userData as BusinessData);
      loadFormData(userData as BusinessData);
    }
  }, [userData]);

  // Function to reload business data without full page refresh
  const refreshBusinessData = async () => {
    if (user?.uid) {
      try {
        const data = await getBusinessDocument(user.uid);
        if (data) {
          setBusinessData(data);
          loadFormData(data);
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }
  };

  const loadFormData = (data: BusinessData) => {
    setFormData({
      businessName: data.businessName || '',
      tagline: data.tagline || '',
      description: data.description || '',
      category: data.category || '',
      phone: data.phone || '',
      contactEmail: data.contactEmail || '',
      website: data.website || '',
      street: data.address?.street || '',
      city: data.address?.city || '',
      state: data.address?.state || '',
      zipCode: data.address?.zipCode || '',
      country: data.address?.country || '',
      facebook: data.socialLinks?.facebook || '',
      instagram: data.socialLinks?.instagram || '',
      twitter: data.socialLinks?.twitter || '',
      linkedin: data.socialLinks?.linkedin || '',
      youtube: data.socialLinks?.youtube || '',
      googleMapUrl: data.googleMapUrl || '',
      // Business hours
      mondayOpen: data.businessHours?.monday?.open || '',
      mondayClose: data.businessHours?.monday?.close || '',
      mondayClosed: data.businessHours?.monday?.closed || false,
      tuesdayOpen: data.businessHours?.tuesday?.open || '',
      tuesdayClose: data.businessHours?.tuesday?.close || '',
      tuesdayClosed: data.businessHours?.tuesday?.closed || false,
      wednesdayOpen: data.businessHours?.wednesday?.open || '',
      wednesdayClose: data.businessHours?.wednesday?.close || '',
      wednesdayClosed: data.businessHours?.wednesday?.closed || false,
      thursdayOpen: data.businessHours?.thursday?.open || '',
      thursdayClose: data.businessHours?.thursday?.close || '',
      thursdayClosed: data.businessHours?.thursday?.closed || false,
      fridayOpen: data.businessHours?.friday?.open || '',
      fridayClose: data.businessHours?.friday?.close || '',
      fridayClosed: data.businessHours?.friday?.closed || false,
      saturdayOpen: data.businessHours?.saturday?.open || '',
      saturdayClose: data.businessHours?.saturday?.close || '',
      saturdayClosed: data.businessHours?.saturday?.closed || false,
      sundayOpen: data.businessHours?.sunday?.open || '',
      sundayClose: data.businessHours?.sunday?.close || '',
      sundayClosed: data.businessHours?.sunday?.closed || false,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!user?.uid) {
        showError('User not authenticated');
        return;
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Add optional fields
      if (formData.businessName) updateData.businessName = formData.businessName;
      if (formData.tagline !== undefined) updateData.tagline = formData.tagline || null;
      if (formData.description !== undefined) updateData.description = formData.description || null;
      if (formData.category !== undefined) updateData.category = formData.category || null;
      if (formData.phone !== undefined) updateData.phone = formData.phone || null;
      if (formData.contactEmail !== undefined) updateData.contactEmail = formData.contactEmail || null;
      if (formData.website !== undefined) updateData.website = formData.website || null;
      if (formData.googleMapUrl !== undefined) updateData.googleMapUrl = formData.googleMapUrl || null;

      // Update address
      updateData.address = {
        street: formData.street || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        country: formData.country || null,
      };

      // Update social links
      updateData.socialLinks = {
        facebook: formData.facebook || null,
        instagram: formData.instagram || null,
        twitter: formData.twitter || null,
        linkedin: formData.linkedin || null,
        youtube: formData.youtube || null,
      };

      // Update business hours
      updateData.businessHours = {
        monday: {
          open: formData.mondayOpen || null,
          close: formData.mondayClose || null,
          closed: formData.mondayClosed,
        },
        tuesday: {
          open: formData.tuesdayOpen || null,
          close: formData.tuesdayClose || null,
          closed: formData.tuesdayClosed,
        },
        wednesday: {
          open: formData.wednesdayOpen || null,
          close: formData.wednesdayClose || null,
          closed: formData.wednesdayClosed,
        },
        thursday: {
          open: formData.thursdayOpen || null,
          close: formData.thursdayClose || null,
          closed: formData.thursdayClosed,
        },
        friday: {
          open: formData.fridayOpen || null,
          close: formData.fridayClose || null,
          closed: formData.fridayClosed,
        },
        saturday: {
          open: formData.saturdayOpen || null,
          close: formData.saturdayClose || null,
          closed: formData.saturdayClosed,
        },
        sunday: {
          open: formData.sundayOpen || null,
          close: formData.sundayClose || null,
          closed: formData.sundayClosed,
        },
      };

      // Update Firestore directly from client (user is authenticated)
      const businessRef = doc(db, COLLECTIONS.BUSINESSES, user.uid);
      await updateDoc(businessRef, updateData);

      showSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh data without full page reload
      await refreshBusinessData();
    } catch (error: any) {
      console.error('Update error:', error);
      showError(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-[#151D26] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !businessData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Component */}
        <BusinessHeader
          businessData={businessData}
          userId={user.uid}
          isEditing={isEditing}
          isSaving={isSaving}
          onEditToggle={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          onDataUpdate={refreshBusinessData}
        />

        {/* Tabs */}
        <ProfileTabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'contact', label: 'Contact & Social' },
            { id: 'hours', label: 'Business Hours' },
            { id: 'locations', label: 'Locations' },
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as any)}
        />

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <OverviewTab
              businessData={businessData}
              formData={{
                businessName: formData.businessName,
                tagline: formData.tagline,
                description: formData.description,
                category: formData.category,
              }}
              isEditing={isEditing}
              onInputChange={handleInputChange}
            />
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <BusinessGallery
              businessData={businessData}
              userId={user.uid}
              isEditing={isEditing}
              onDataUpdate={refreshBusinessData}
            />
          )}

          {/* Contact & Social Tab */}
          {activeTab === 'contact' && (
            <ContactTab
              formData={{
                phone: formData.phone,
                contactEmail: formData.contactEmail,
                website: formData.website,
                street: formData.street,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country,
                facebook: formData.facebook,
                instagram: formData.instagram,
                twitter: formData.twitter,
                linkedin: formData.linkedin,
                youtube: formData.youtube,
                googleMapUrl: formData.googleMapUrl,
              }}
              isEditing={isEditing}
              onInputChange={handleInputChange}
            />
          )}

          {/* Business Hours Tab */}
          {activeTab === 'hours' && (
            <BusinessHoursTab
              formData={{
                mondayOpen: formData.mondayOpen,
                mondayClose: formData.mondayClose,
                mondayClosed: formData.mondayClosed,
                tuesdayOpen: formData.tuesdayOpen,
                tuesdayClose: formData.tuesdayClose,
                tuesdayClosed: formData.tuesdayClosed,
                wednesdayOpen: formData.wednesdayOpen,
                wednesdayClose: formData.wednesdayClose,
                wednesdayClosed: formData.wednesdayClosed,
                thursdayOpen: formData.thursdayOpen,
                thursdayClose: formData.thursdayClose,
                thursdayClosed: formData.thursdayClosed,
                fridayOpen: formData.fridayOpen,
                fridayClose: formData.fridayClose,
                fridayClosed: formData.fridayClosed,
                saturdayOpen: formData.saturdayOpen,
                saturdayClose: formData.saturdayClose,
                saturdayClosed: formData.saturdayClosed,
                sundayOpen: formData.sundayOpen,
                sundayClose: formData.sundayClose,
                sundayClosed: formData.sundayClosed,
              }}
              isEditing={isEditing}
              onInputChange={handleInputChange}
            />
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <LocationsTab
              businessData={businessData}
              userId={user.uid}
              isEditing={isEditing}
              onDataUpdate={refreshBusinessData}
            />
          )}
        </div>

        {/* Cancel Button */}
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                // Reset form data to original values
                if (businessData) {
                  loadFormData(businessData);
                }
              }}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
