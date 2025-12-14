"use client";

import Image from "next/image";
import Link from "next/link";
import { BusinessData } from "@/services/firestore.service";
import { useFavorites } from "@/contexts/FavoritesContext";

interface BusinessCardProps {
  business: BusinessData;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const defaultIcon = "https://via.placeholder.com/150?text=Business";
  const businessImage = business.businessIcon || defaultIcon;
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isInFavorites = isFavorite(business.uid || '');

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInFavorites) {
      removeFavorite(business.uid || '');
    } else {
      addFavorite(business.uid || '');
    }
  };

  // Format business hours to show if open/closed
  const isOpenNow = () => {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = business.businessHours?.[today as keyof typeof business.businessHours];
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

  const formatAddress = () => {
    const { address } = business;
    if (!address) return 'No address provided';
    
    const parts = [
      address.city,
      address.state,
    ].filter(Boolean);
    
    return parts.join(', ') || 'No address provided';
  };

  return (
    <Link href={`/business/${business.uid}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer h-full relative">
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition-all shadow-md"
          aria-label={isInFavorites ? "Remove from favorites" : "Add to favorites"}
        >
          <svg 
            className={`w-5 h-5 transition-colors ${isInFavorites ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`}
            fill={isInFavorites ? "currentColor" : "none"}
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Business Image */}
        <div className="relative h-48 w-full bg-gray-200">
          <Image
            src={businessImage}
            alt={business.businessName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {business.verified && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </div>
          )}
          {business.locations && business.locations.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              {business.locations.length} Locations
            </div>
          )}
          {business.category && (
            <div className="absolute top-3 left-3 bg-[#151D26] text-white px-3 py-1 rounded-full text-xs font-semibold">
              {business.category}
            </div>
          )}
        </div>

        {/* Business Info */}
        <div className="p-4">
          {/* Business Name */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
            {business.businessName}
          </h3>

          {/* Tagline */}
          {business.tagline && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 italic">
              {business.tagline}
            </p>
          )}

          {/* Location */}
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{formatAddress()}</span>
          </div>

          {/* Phone */}
          {business.phone && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{business.phone}</span>
            </div>
          )}

          {/* Open/Closed Status */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isOpenNow() ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-semibold ${isOpenNow() ? 'text-green-600' : 'text-red-600'}`}>
                {isOpenNow() ? 'Open Now' : 'Closed'}
              </span>
            </div>

            {/* View Details Button */}
            <span className="text-sm text-[#151D26] font-semibold hover:underline">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
