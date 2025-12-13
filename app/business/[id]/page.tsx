"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { BusinessData, getBusinessDocument } from "@/services/firestore.service";
import { showError } from "@/lib/utils/toast";
import BannerCarousel from "@/components/business/BannerCarousel";

export default function BusinessDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'overview' | 'hours' | 'location' | 'reviews'>('overview');

  useEffect(() => {
    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId]);

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
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Images */}
      <div className="relative">
        {/* Main Hero Image */}
        <div className="relative h-[400px] md:h-[500px] bg-gray-900">
          {allImages[0] && (
            <Image
              src={allImages[0]}
              alt={business.businessName}
              fill
              className="object-cover"
              priority
            />
          )}
          
          {/* Back Button Overlay */}
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium text-gray-900">Back</span>
            </button>
          </div>

          {/* Image Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 right-6 flex gap-2 z-10">
              {allImages.slice(1, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedImage(img!)}
                >
                  <Image src={img!} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
              {allImages.length > 4 && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-black/60 flex items-center justify-center cursor-pointer">
                  <span className="text-white font-bold">+{allImages.length - 4}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Business Header Info */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {business.businessName}
                  </h1>
                  {business.verified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Claimed
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < 4 ? 'text-green-600' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">3.9</span>
                    <span className="text-gray-600">(26 reviews)</span>
                  </div>

                  {/* Category */}
                  {business.category && (
                    <span className="text-gray-700">{business.category}</span>
                  )}

                  {/* Open/Closed Status */}
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isOpenNow() ? 'text-green-600' : 'text-red-600'}`}>
                      {isOpenNow() ? 'Open' : 'Closed'}
                    </span>
                    {business.businessHours && (
                      <span className="text-gray-600">
                        until{' '}
                        {(() => {
                          const now = new Date();
                          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                          const today = dayNames[now.getDay()];
                          const todayHours = business.businessHours[today as keyof typeof business.businessHours];
                          return todayHours?.close ? formatTime(todayHours.close) : '...';
                        })()}
                      </span>
                    )}
                  </div>
                </div>

                {business.tagline && (
                  <p className="mt-3 text-gray-700 italic">{business.tagline}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-900 rounded-full hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="font-semibold">Share</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-900 rounded-full hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-semibold">Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-8">
              {['overview', 'hours', 'location', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 font-semibold border-b-4 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* At a Glance Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">At a glance</h2>
                  <div className="space-y-4">
                    {/* Opening Hours */}
                    {business.businessHours && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-green-600">
                            {isOpenNow() ? 'Open' : 'Closed'}{' '}
                            {(() => {
                              const now = new Date();
                              const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                              const today = dayNames[now.getDay()];
                              const todayHours = business.businessHours[today as keyof typeof business.businessHours];
                              return todayHours?.close ? `until ${formatTime(todayHours.close)}` : '';
                            })()}
                          </p>
                          <button
                            onClick={() => setActiveTab('hours')}
                            className="text-sm text-gray-600 hover:underline"
                          >
                            See all hours
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {business.address && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <button
                          onClick={() => setActiveTab('location')}
                          className="text-gray-900 hover:underline text-left"
                        >
                          {formatAddress(business)}
                        </button>
                      </div>
                    )}

                    {/* Contact */}
                    <div className="flex flex-wrap gap-6">
                      {business.website && (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-900 hover:underline"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          Website
                        </a>
                      )}
                      {business.phone && (
                        <a
                          href={`tel:${business.phone}`}
                          className="flex items-center gap-2 text-gray-900 hover:underline"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {business.phone}
                        </a>
                      )}
                      {business.contactEmail && (
                        <a
                          href={`mailto:${business.contactEmail}`}
                          className="flex items-center gap-2 text-gray-900 hover:underline"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* About Section */}
                {business.description && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-700 leading-relaxed">{business.description}</p>
                  </div>
                )}

                {/* Features */}
                {(business.services && business.services.length > 0) && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Services Offered</h2>
                    </div>
                    <div className="grid gap-4">
                      {business.services.map((service) => (
                        <div key={service.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                              <div className="flex gap-3 text-sm">
                                {service.price && (
                                  <span className="text-green-700 font-medium">{service.price}</span>
                                )}
                                {service.duration && (
                                  <span className="text-gray-600">{service.duration}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Banner Carousel */}
                {business.bannerImages && business.bannerImages.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Images</h2>
                    <BannerCarousel images={business.bannerImages} />
                  </div>
                )}

                {/* Photo Gallery */}
                {business.images && business.images.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Photo Gallery</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {business.images.slice(0, 6).map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedImage(img)}
                        >
                          <Image src={img} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Hours Tab */}
            {activeTab === 'hours' && business.businessHours && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Hours</h2>
                <div className="space-y-3">
                  {Object.entries(business.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between py-3 border-b">
                      <span className="font-semibold text-gray-900 capitalize">{getDayName(day)}</span>
                      <span className="text-gray-700">
                        {hours.closed ? (
                          <span className="text-red-600">Closed</span>
                        ) : (
                          `${formatTime(hours.open || '')} - ${formatTime(hours.close || '')}`
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>
                
                {business.locations && business.locations.length > 0 ? (
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
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-6 bg-gray-50">
                      <p className="text-gray-700 mb-4">{formatAddress(business)}</p>
                    </div>
                    
                    {business.googleMapUrl && (
                      <div className="aspect-video">
                        <iframe
                          src={business.googleMapUrl}
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
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Reviews feature coming soon</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Save Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Save this business</h3>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-900 rounded-full hover:bg-gray-50 transition-colors font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Save
              </button>
            </div>

            {/* Hours Summary */}
            {business.businessHours && activeTab === 'overview' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Hours</h3>
                  <button
                    onClick={() => setActiveTab('hours')}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Suggest an edit
                  </button>
                </div>
                <p className="text-green-600 font-semibold mb-4">
                  {isOpenNow() ? 'Open' : 'Closed'}{' '}
                  {(() => {
                    const now = new Date();
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const today = dayNames[now.getDay()];
                    const todayHours = business.businessHours[today as keyof typeof business.businessHours];
                    return todayHours?.close ? `until ${formatTime(todayHours.close)}` : '';
                  })()}
                </p>
                <div className="space-y-2">
                  {Object.entries(business.businessHours).slice(0, 3).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 capitalize">{getDayName(day)}</span>
                      <span className="text-gray-700">
                        {hours.closed ? 'Closed' : `${formatTime(hours.open || '')} - ${formatTime(hours.close || '')}`}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('hours')}
                  className="mt-4 text-sm text-gray-600 hover:underline"
                >
                  See all hours
                </button>
              </div>
            )}

            {/* Social Links */}
            {(business.socialLinks?.facebook || business.socialLinks?.instagram || 
              business.socialLinks?.twitter || business.socialLinks?.linkedin || 
              business.socialLinks?.youtube) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-3">
                  {business.socialLinks?.facebook && (
                    <a
                      href={business.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {business.socialLinks?.instagram && (
                    <a
                      href={business.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {business.socialLinks?.twitter && (
                    <a
                      href={business.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                  {business.socialLinks?.linkedin && (
                    <a
                      href={business.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {business.socialLinks?.youtube && (
                    <a
                      href={business.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}