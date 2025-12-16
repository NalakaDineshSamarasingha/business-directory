"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { BusinessData, getBusinessDocument } from "@/services/firestore.service";
import { showError } from "@/lib/utils/toast";
import { trackBusinessView } from "@/lib/utils/analytics";

// Import components
import BusinessHero from "@/components/business-details/BusinessHero";
import BusinessHeader from "@/components/business-details/BusinessHeader";
import BusinessTabs from "@/components/business-details/BusinessTabs";
import AtAGlanceSection from "@/components/business-details/AtAGlanceSection";
import AboutSection from "@/components/business-details/AboutSection";
import ServicesSection from "@/components/business-details/ServicesSection";
import PhotoGallerySection from "@/components/business-details/PhotoGallerySection";
import HoursTab from "@/components/business-details/HoursTab";
import LocationTab from "@/components/business-details/LocationTab";
import ServiceAccessTab from "@/components/business-details/ServiceAccessTab";
import BusinessSidebar from "@/components/business-details/BusinessSidebar";

// Lazy load BannerCarouselSection
const BannerCarouselSection = dynamic(
  () => import("@/components/business-details/BannerCarouselSection"),
  { 
    loading: () => (
      <div className="w-full h-96 bg-gray-200 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading carousel...</p>
      </div>
    )
  }
);

export default function BusinessDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'overview' | 'hours' | 'location' | 'service access'>('overview');
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId]);

  // Separate effect for tracking view - only runs once per businessId
  useEffect(() => {
    if (businessId && business && !hasTrackedView.current) {
      trackBusinessView(businessId);
      hasTrackedView.current = true;
    }
    
    // Reset tracking flag when businessId changes
    return () => {
      if (params.id !== businessId) {
        hasTrackedView.current = false;
      }
    };
  }, [businessId, business]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const data = await getBusinessDocument(businessId);
      if (data) {
        setBusiness(data);
        setSelectedImage(data.businessIcon || data.images?.[0] || "");
      } else {
        showError("Business not found");
        router.push("/find-business");
      }
    } catch (error) {
      console.error("Error fetching business:", error);
      showError("Failed to load business details");
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (business: BusinessData) => {
    const { address } = business;
    if (!address) return "No address provided";
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ].filter(Boolean);
    
    return parts.join(", ") || "No address provided";
  };

  const getDayName = (dayKey: string) => {
    const days: { [key: string]: string } = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    };
    return days[dayKey] || dayKey;
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isOpenNow = () => {
    if (!business?.businessHours) return false;
    
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = business.businessHours[today as keyof typeof business.businessHours];
    if (!todayHours || todayHours.closed) return false;

    if (todayHours.open && todayHours.close) {
      const [openHour, openMin] = todayHours.open.split(':').map(Number);
      const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;

      return currentTime >= openTime && currentTime <= closeTime;
    }

    return false;
  };

  const getClosingTime = () => {
    if (!business?.businessHours) return undefined;
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[now.getDay()];
    const todayHours = business.businessHours[today as keyof typeof business.businessHours];
    return todayHours?.close ? `until ${formatTime(todayHours.close)}` : undefined;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-[#151D26] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return null;
  }

  const allImages = [
    business.coverImage,
    business.businessIcon,
    ...(business.bannerImages || []),
    ...(business.images || []),
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <BusinessHero coverImage={allImages[0] || ''} businessName={business.businessName} />

      {/* Business Header */}
      <BusinessHeader
        businessId={businessId}
        businessIcon={business.businessIcon ?? undefined}
        businessName={business.businessName}
        verified={business.verified}
        category={business.category ?? undefined}
        isOpen={isOpenNow()}
        closingTime={getClosingTime()}
        tagline={business.tagline ?? undefined}
      />

      {/* Navigation Tabs */}
      <BusinessTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
      />

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  <AtAGlanceSection
                    isOpen={isOpenNow()}
                    closingTime={getClosingTime()}
                    address={formatAddress(business)}
                    website={business.website ?? undefined}
                    phone={business.phone ?? undefined}
                    email={business.contactEmail ?? undefined}
                    onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
                  />

                  <AboutSection
                    description={business.description ?? undefined}
                    amenities={undefined}
                    specialties={undefined}
                    paymentMethods={undefined}
                    languages={undefined}
                  />
                </>
              )}

              {/* Hours Tab */}
              {activeTab === 'hours' && (
                <HoursTab
                  businessHours={business.businessHours}
                  formatTime={formatTime}
                  getDayName={getDayName}
                />
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                business.locations && business.locations.length > 0 ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>
                    <div className="space-y-8">
                      {business.locations
                        .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
                        .map((location) => (
                          <div key={location.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-6 bg-gray-50">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">{location.name}</h3>
                                  {location.isPrimary && (
                                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                      Primary Location
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2 mb-4">
                                <p className="text-gray-700">
                                  {location.address.street && `${location.address.street}, `}
                                  {location.address.city}{location.address.state && `, ${location.address.state}`}
                                  {location.address.zipCode && ` ${location.address.zipCode}`}
                                  {location.address.country && `, ${location.address.country}`}
                                </p>
                                {location.phone && (
                                  <p className="text-gray-700">{location.phone}</p>
                                )}
                              </div>
                            </div>
                            
                            {location.googleMapUrl && (
                              <div className="aspect-video">
                                <iframe
                                  src={location.googleMapUrl}
                                  width="100%"
                                  height="100%"
                                  style={{ border: 0 }}
                                  allowFullScreen
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <LocationTab
                    address={formatAddress(business)}
                    latitude={undefined}
                    longitude={undefined}
                  />
                )
              )}

              {/* Service Access Tab */}
              {activeTab === 'service access' && (
                <ServiceAccessTab services={business.services} />
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <BusinessSidebar
                businessId={businessId}
                isOpen={isOpenNow()}
                closingTime={getClosingTime()}
                businessHours={activeTab === 'overview' ? business.businessHours : undefined}
                socialLinks={business.socialLinks}
                onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
                formatTime={formatTime}
                getDayName={getDayName}
              />
            </div>
          </div>
        </div>

        {/* Banner Carousel - Full Width */}
        {activeTab === 'overview' && business.bannerImages && business.bannerImages.length > 0 && (
          <BannerCarouselSection images={business.bannerImages} />
        )}

        {/* Services Section */}
        {activeTab === 'overview' && business.services && business.services.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <ServicesSection services={business.services} />
          </div>
        )}

        {/* Photo Gallery - Full Width */}
        {activeTab === 'overview' && business.images && business.images.length > 0 && (
          <div className="w-full mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">Photo Gallery</h2>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <PhotoGallerySection
                images={business.images}
                onImageClick={(img) => setSelectedImage(img)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}