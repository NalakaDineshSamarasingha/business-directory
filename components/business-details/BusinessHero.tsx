"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface BusinessHeroProps {
  coverImage: string;
  businessName: string;
}

export default function BusinessHero({ coverImage, businessName }: BusinessHeroProps) {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Main Hero Image */}
      <div className="relative h-[400px] md:h-[500px] bg-gray-900">
        {coverImage && (
          <Image
            src={coverImage}
            alt={businessName}
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
      </div>
    </div>
  );
}
