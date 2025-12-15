"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import BusinessCard from "@/components/business/BusinessCard";
import { BusinessData } from "@/services/firestore.service";

interface CategorySection {
  title: string;
  category: string;
  totalAnalytics: number;
}

export default function FeaturedBusinesses() {
  const [categorySections, setCategorySections] = useState<CategorySection[]>([]);
  const [businessesByCategory, setBusinessesByCategory] = useState<Record<string, BusinessData[]>>({});
  const [loading, setLoading] = useState(true);
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchTopBusinesses();
  }, []);

  const getCategoryTitle = (category: string): string => {
    const titles: Record<string, string> = {
      'Hotels': 'Explore Hotels & Stays',
      'Restaurant': 'Top Restaurants & Dining',
      'Electronics': 'Electronics & Gadgets',
      'Mobile': 'Mobile & Accessories',
      'Spa': 'Wellness & Spa Services',
      'Fitness': 'Fitness & Health Centers',
      'Education': 'Education & Learning',
      'Healthcare': 'Healthcare Services',
      'Automotive': 'Automotive Services',
      'Beauty': 'Beauty & Salons'
    };
    return titles[category] || `Top ${category} Businesses`;
  };

  const fetchTopBusinesses = async () => {
    try {
      setLoading(true);
      
      // Fetch top categories and their businesses
      const response = await fetch('/api/analytics/top-businesses?topCategories=3&limit=8');
      const data = await response.json();
      
      if (response.ok && data.topCategories && data.categoryData) {
        // Build category sections from top categories
        const sections: CategorySection[] = data.topCategories.map((category: string) => ({
          title: getCategoryTitle(category),
          category: category,
          totalAnalytics: data.categoryData[category].totalAnalytics
        }));
        
        setCategorySections(sections);
        
        // Extract businesses by category
        const businesses: Record<string, BusinessData[]> = {};
        data.topCategories.forEach((category: string) => {
          businesses[category] = data.categoryData[category].businesses;
        });
        
        setBusinessesByCategory(businesses);
      }
    } catch (error) {
      console.error('Error fetching top businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (category: string, direction: 'left' | 'right') => {
    const container = scrollRefs.current[category];
    if (container) {
      const scrollAmount = 350;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-96 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categorySections.map((section) => {
          const businesses = businessesByCategory[section.category] || [];
          
          if (businesses.length === 0) return null;

          return (
            <div key={section.category} className="mb-16">
              {/* Section Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-600 text-lg">
                  Most popular in {section.category}
                </p>
              </div>

              {/* Scrollable Cards Container */}
              <div className="relative group">
                {/* Left Arrow */}
                {businesses.length > 4 && (
                  <button
                    onClick={() => scroll(section.category, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 transform -translate-x-4"
                    aria-label="Scroll left"
                  >
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Cards */}
                <div
                  ref={(el) => { scrollRefs.current[section.category] = el; }}
                  className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {businesses.map((business) => (
                    <div key={business.uid} className="flex-shrink-0 w-80">
                      <BusinessCard business={business} />
                    </div>
                  ))}
                </div>

                {/* Right Arrow */}
                {businesses.length > 4 && (
                  <button
                    onClick={() => scroll(section.category, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 transform translate-x-4"
                    aria-label="Scroll right"
                  >
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* View All Link */}
              <div className="mt-6 text-center">
                <Link
                  href={`/find-business?category=${encodeURIComponent(section.category)}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-lg"
                >
                  View all {section.category.toLowerCase()}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
