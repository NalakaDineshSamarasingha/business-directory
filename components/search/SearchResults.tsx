"use client";

import { BusinessData } from '@/services/firestore.service';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResultsProps {
  results: BusinessData[];
  isLoading?: boolean;
  totalResults?: number;
}

export default function SearchResults({ 
  results, 
  isLoading = false,
  totalResults = 0 
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No businesses found</h3>
        <p className="mt-2 text-gray-500">Try adjusting your search filters or search terms</p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-700">
          Found <span className="font-semibold">{totalResults}</span> {totalResults === 1 ? 'business' : 'businesses'}
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((business) => (
          <Link
            key={business.uid}
            href={`/business/${business.uid}`}
            className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Business Image */}
            <div className="relative h-48 bg-gray-200">
              {(business.coverImage || business.businessIcon) && (
                <Image
                  src={business.coverImage || business.businessIcon || ''}
                  alt={business.businessName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              {business.verified && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </div>
              )}
            </div>

            {/* Business Info */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-black">
                {business.businessName}
              </h3>
              
              {business.category && (
                <p className="text-sm text-gray-600 mb-2">{business.category}</p>
              )}

              {business.tagline && (
                <p className="text-sm text-gray-700 line-clamp-2 mb-3">{business.tagline}</p>
              )}

              {/* Location */}
              {business.address && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    {business.address.city}
                    {business.address.state && `, ${business.address.state}`}
                  </span>
                </div>
              )}

              {/* Services Count */}
              {business.services && business.services.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span>{business.services.length} {business.services.length === 1 ? 'service' : 'services'}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
