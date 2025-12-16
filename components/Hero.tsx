"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { trackBusinessSearch } from "@/lib/utils/analytics";

interface SearchResult {
  uid: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
}

export default function Hero() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const tabs = [
    { id: "all", label: "Search All", category: "" },
    { id: "hotels", label: "Hotels", category: "Hotels" },
    { id: "electronic", label: "Gadget", category: "Electronics" },
    { id: "restaurants", label: "Restaurants", category: "Restaurant" },
    { id: "cruises", label: "Mobile", category: "Mobile" },
  ];

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams({ q: searchQuery.trim() });
        const activeCategory = tabs.find(t => t.id === activeTab)?.category;
        if (activeCategory) {
          params.append('category', activeCategory);
        }

        const response = await fetch(`/api/search/businesses?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok && data.results) {
          setSearchResults(data.results.slice(0, 5)); // Show top 5 results
          setShowDropdown(true);
        } else {
          setSearchResults([]);
          setShowDropdown(true); // Still show dropdown with "no results" message
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, activeTab]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build search URL with query and category
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.append('q', searchQuery.trim());
    }
    
    const activeCategory = tabs.find(t => t.id === activeTab)?.category;
    if (activeCategory) {
      params.append('category', activeCategory);
    }
    
    // Redirect to find-business with filters
    router.push(`/find-business?${params.toString()}`);
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <section className="pt-30 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-10">
        <div className="text-center space-y-6">
          {/* Heading */}
          <h1 className="text-3xl lg:text-4xl font-black text-[#1E3A2B] leading-tight">
            What do you need?
          </h1>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-8 border-b-2 border-gray-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-2 text-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-black border-b-4 border-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden">
              <div className="pl-6 pr-4">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && searchResults.length > 0 && setShowDropdown(true)}
                placeholder="Find the best local business..."
                className="flex-1 py-5 text-lg text-gray-800 placeholder-gray-500 focus:outline-none"
              />
              {isSearching && (
                <div className="pr-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                </div>
              )}
              <button 
                type="submit"
                className="bg-[#00D084] text-white px-12 py-5 font-bold text-lg hover:bg-[#00B56F] transition-colors"
              >
                Search
              </button>
            </form>

            {/* Dropdown Results */}
            {showDropdown && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((result) => (
                      <button
                        key={result.uid}
                        onClick={() => {
                          // Track search click (anonymous)
                          trackBusinessSearch(result.uid, searchQuery.trim());
                          router.push(`/business/${result.uid}`);
                          setShowDropdown(false);
                          setSearchQuery("");
                        }}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{result.businessName}</p>
                            <p className="text-sm text-gray-500">
                              {result.category} • {result.city}, {result.state}
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (searchQuery.trim()) {
                          params.append('q', searchQuery.trim());
                        }
                        const activeCategory = tabs.find(t => t.id === activeTab)?.category;
                        if (activeCategory) {
                          params.append('category', activeCategory);
                        }
                        router.push(`/find-business?${params.toString()}`);
                        setShowDropdown(false);
                      }}
                      className="w-full px-6 py-3 text-sm text-center text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                    >
                      View all results for &quot;{searchQuery}&quot;
                    </button>
                  </>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-1">No results found</p>
                    <p className="text-sm text-gray-500">
                      Try searching with different keywords
                      {tabs.find(t => t.id === activeTab)?.category && (
                        <> or change category</>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
