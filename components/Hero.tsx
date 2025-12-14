"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
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
    
    // Navigate to search page with parameters
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="min-h-screen pt-32 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-12">
          {/* Heading */}
          <h1 className="text-4xl lg:text-5xl font-black text-[#1E3A2B] leading-tight">
            What do you need?
          </h1>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-8 border-b-2 border-gray-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-2 text-lg font-medium transition-colors ${
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
          <div className="max-w-4xl mx-auto relative" ref={searchRef}>
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
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      router.push(`/business/${result.id}`);
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
                    router.push(`/search?${params.toString()}`);
                    setShowDropdown(false);
                  }}
                  className="w-full px-6 py-3 text-sm text-center text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  View all results for &quot;{searchQuery}&quot;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
