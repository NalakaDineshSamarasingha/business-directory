"use client";

import Image from "next/image";

interface BusinessHeaderProps {
  businessIcon?: string | null;
  businessName: string;
  verified?: boolean;
  category?: string | null;
  isOpen: boolean;
  closingTime?: string;
  tagline?: string | null;
}

export default function BusinessHeader({
  businessIcon,
  businessName,
  verified,
  category,
  isOpen,
  closingTime,
  tagline
}: BusinessHeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              {/* Business Logo */}
              {businessIcon && (
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-md flex-shrink-0">
                  <Image
                    src={businessIcon}
                    alt={`${businessName} logo`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {businessName}
                  </h1>
                  {verified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Claimed
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {/* Category */}
                  {category && (
                    <span className="text-gray-700">{category}</span>
                  )}

                  {/* Open/Closed Status */}
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isOpen ? 'text-[#00aa6c]' : 'text-red-600'}`}>
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                    {closingTime && (
                      <span className="text-gray-600">until {closingTime}</span>
                    )}
                  </div>
                </div>

                {tagline && (
                  <p className="mt-3 text-gray-700 italic">{tagline}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="font-semibold">Share</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-semibold">Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
