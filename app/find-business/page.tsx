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
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [allServices, setAllServices] = useState<string[]>([]);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    // Extract unique cities, states, and services
    const uniqueCities = [...new Set(businesses.map(b => b.address?.city).filter(Boolean))] as string[];
    const uniqueStates = [...new Set(businesses.map(b => b.address?.state).filter(Boolean))] as string[];
    const uniqueServices = [...new Set(businesses.flatMap(b => b.services?.map(s => s.name) || []))] as string[];
    
    setCities(uniqueCities.sort());
    setStates(uniqueStates.sort());
    setAllServices(uniqueServices.sort());
  }, [businesses]);

  useEffect(() => {
    filterBusinesses();
  }, [selectedCategory, searchQuery, selectedCity, selectedState, selectedService, sortBy, sortOrder, businesses]);

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

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(
        (business) => business.address?.city === selectedCity
      );
    }

    // Filter by state
    if (selectedState) {
      filtered = filtered.filter(
        (business) => business.address?.state === selectedState
      );
    }

    // Filter by service
    if (selectedService) {
      filtered = filtered.filter(
        (business) => business.services?.some(s => s.name === selectedService)
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

    // Sort results
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const comparison = a.businessName.localeCompare(b.businessName);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }
    });

    setFilteredBusinesses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-40 pb-12">
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
          <div className="flex gap-4">
            <div className="relative flex-1">
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {(selectedCity || selectedState) && (
                <span className="bg-[#151D26] text-white text-xs rounded-full px-2 py-0.5">
                  {[selectedCity, selectedState].filter(Boolean).length}
                </span>
              )}
            </button>
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

        {/* Filters */}
        {showFilters && (
          <div className="mb-8 bg-white rounded-lg border border-gray-300 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] focus:border-transparent"
              >
                <option value="">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
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
          {(selectedCategory !== "All" || selectedCity || selectedState || selectedService || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setSelectedCity("");
                setSelectedState("");
                setSelectedService("");
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
            >
              Clear all filters
            </button>
          )}
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((business) => (
                  <BusinessCard key={business.uid} business={business} />
                ))}
            </div>
            
            {/* Pagination */}
            {filteredBusinesses.length > itemsPerPage && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.ceil(filteredBusinesses.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-[#151D26] text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredBusinesses.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(filteredBusinesses.length / itemsPerPage)}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
