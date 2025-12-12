"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS, BusinessData } from "@/services/firestore.service";
import BusinessCard from "@/components/business/BusinessCard";

const CATEGORIES = [
  "All",
  "Restaurant",
  "Hotel",
  "Retail",
  "Service",
  "Healthcare",
  "Education",
  "Technology",
  "Entertainment",
  "Other",
];

export default function FindBusinessPage() {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [selectedCategory, searchQuery, businesses]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const businessesRef = collection(db, COLLECTIONS.BUSINESSES);
      // Remove orderBy to avoid index requirement for now
      const querySnapshot = await getDocs(businessesRef);

      const businessList: BusinessData[] = [];
      querySnapshot.forEach((doc) => {
        businessList.push({ uid: doc.id, ...doc.data() } as BusinessData);
      });

      // Sort by createdAt on client side
      businessList.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setBusinesses(businessList);
      setFilteredBusinesses(businessList);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBusinesses = () => {
    let filtered = [...businesses];

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (business) => business.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (business) =>
          business.businessName.toLowerCase().includes(query) ||
          business.description?.toLowerCase().includes(query) ||
          business.address?.city?.toLowerCase().includes(query) ||
          business.address?.state?.toLowerCase().includes(query)
      );
    }

    setFilteredBusinesses(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find a Business
          </h1>
          <p className="text-gray-600">
            Discover and connect with local businesses in your area
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by business name, description, or location..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-[#151D26] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? (
              "Loading businesses..."
            ) : (
              <>
                Showing <span className="font-semibold">{filteredBusinesses.length}</span>{" "}
                {filteredBusinesses.length === 1 ? "business" : "businesses"}
                {selectedCategory !== "All" && (
                  <span> in <span className="font-semibold">{selectedCategory}</span></span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Business Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-[#151D26] rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading businesses...</p>
            </div>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No businesses found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter to find what you&apos;re looking for.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="px-6 py-2 bg-[#151D26] text-white rounded-lg hover:bg-[#2B3D4F] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <BusinessCard key={business.uid} business={business} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
