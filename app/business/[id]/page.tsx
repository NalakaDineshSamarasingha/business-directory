"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { BusinessData, getBusinessDocument } from "@/services/firestore.service";
import { showError } from "@/lib/utils/toast";

export default function BusinessDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

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
    business.businessIcon,
    ...(business.images || []),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Cover Image */}
        {business.coverImage && (
          <div className="relative w-full h-64 md:h-80 bg-gray-200 mb-6">
            <Image
              src={business.coverImage}
              alt={`${business.businessName} cover`}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <div className="px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Header with Logo */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Business Logo */}
                {business.businessIcon && (
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                      <Image
                        src={business.businessIcon}
                        alt={`${business.businessName} logo`}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>
                )}
                
                {/* Business Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {business.businessName}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2">
                        {business.category && (
                          <span className="inline-block bg-[#151D26] text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {business.category}
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${isOpenNow() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-sm font-semibold ${isOpenNow() ? 'text-green-600' : 'text-red-600'}`}>
                            {isOpenNow() ? 'Open Now' : 'Closed'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {business.verified && (
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm font-semibold flex-shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}
                  </div>

                  {business.tagline && (
                    <p className="text-lg text-gray-600 italic mt-3">{business.tagline}</p>
                  )}
                  
                  {business.description && (
                    <p className="text-gray-700 leading-relaxed mt-4">{business.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {(business.phone || business.contactEmail || business.website) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {business.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#151D26] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                        <a href={`tel:${business.phone}`} className="text-[#151D26] hover:underline font-semibold">
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {business.contactEmail && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#151D26] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <a href={`mailto:${business.contactEmail}`} className="text-[#151D26] hover:underline font-semibold truncate block">
                          {business.contactEmail}
                        </a>
                      </div>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#151D26] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-500 font-medium">Website</p>
                        <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-[#151D26] hover:underline font-semibold truncate block">
                          {business.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Hours */}
            {business.businessHours && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h2>
                <div className="space-y-2">
                  {Object.entries(business.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold text-gray-900 capitalize">{getDayName(day)}</span>
                      <span className="text-gray-600 font-medium">
                        {hours.closed ? (
                          <span className="text-red-600 font-semibold">Closed</span>
                        ) : (
                          <span>
                            {formatTime(hours.open || "")} - {formatTime(hours.close || "")}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location(s) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {business.locations && business.locations.length > 1 ? 'Locations' : 'Location'}
              </h2>
              
              {business.locations && business.locations.length > 0 ? (
                <div className="space-y-6">
                  {business.locations
                    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
                    .map((location) => (
                      <div key={location.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{location.name}</h3>
                            {location.isPrimary && (
                              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                Primary Location
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-gray-700 font-medium">
                            {location.address.street && `${location.address.street}, `}
                            {location.address.city}{location.address.state && `, ${location.address.state}`}
                            {location.address.zipCode && ` ${location.address.zipCode}`}
                            {location.address.country && `, ${location.address.country}`}
                          </p>
                          {location.phone && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <a href={`tel:${location.phone}`} className="text-[#151D26] hover:underline">
                                {location.phone}
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {location.googleMapUrl && (
                          <div className="aspect-video rounded-lg overflow-hidden shadow-sm">
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
                <>
                  <p className="text-gray-700 mb-4 font-medium">{formatAddress(business)}</p>
                  
                  {business.googleMapUrl && (
                    <div className="aspect-video rounded-lg overflow-hidden shadow-sm">
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
                </>
              )}
            </div>

            {/* Photo Gallery */}
            {allImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity shadow-sm" onClick={() => setSelectedImage(image!)}>
                    <Image
                      src={image!}
                      alt={`${business.businessName} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Social Links */}
            {(business.socialLinks?.facebook || business.socialLinks?.instagram || business.socialLinks?.twitter || business.socialLinks?.linkedin || business.socialLinks?.youtube) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-3">
                  {business.socialLinks?.facebook && (
                    <a href={business.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {business.socialLinks?.instagram && (
                    <a href={business.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors">
                      <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {business.socialLinks?.twitter && (
                    <a href={business.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                  {business.socialLinks?.linkedin && (
                    <a href={business.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <svg className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {business.socialLinks?.youtube && (
                    <a href={business.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="block w-full px-4 py-3 bg-[#151D26] text-white text-center rounded-lg hover:bg-[#2B3D4F] transition-colors font-medium"
                  >
                    Call Now
                  </a>
                )}
                {business.googleMapUrl && (
                  <a
                    href={business.googleMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-3 border-2 border-[#151D26] text-[#151D26] text-center rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Get Directions
                  </a>
                )}
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-3 border-2 border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
