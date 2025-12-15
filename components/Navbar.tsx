"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { trackBusinessSearch } from "@/lib/utils/analytics";

interface SearchResult {
  uid: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
}

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, userData, loading, logout } = useAuth();
  const { favorites } = useFavorites();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('Navbar - Auth state:', { 
      hasUser: !!user, 
      userEmail: user?.email,
      hasUserData: !!userData, 
      userType: userData?.userType,
      loading 
    });
  }, [user, userData, loading]);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search/businesses?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await response.json();
        
        if (response.ok && data.results) {
          setSearchResults(data.results.slice(0, 5));
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (isMenuOpen || showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen, showDropdown]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="fixed top-5 left-5 right-5 bg-white/95 backdrop-blur-sm shadow-sm z-50 rounded">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl text-black tracking-tight" style={{ fontFamily: 'Lobster, cursive' }}>BizRate</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-12">
            <Link href="/" className="text-gray-800 hover:text-black transition-colors text-lg">
              Home
            </Link>
            <Link href="/find-business" className="text-gray-800 hover:text-black transition-colors text-lg">
              Find a Business
            </Link>
            
            <Link href="/business-register" className="text-gray-800 hover:text-black transition-colors text-lg">
              Have a Business
            </Link>
            <Link href="/about" className="text-gray-800 hover:text-black transition-colors text-lg">
              About
            </Link>
            <Link href="/contact" className="text-gray-800 hover:text-black transition-colors text-lg">
              Contact
            </Link>
            {userData?.userType === 'business' && (
              <Link href="/business-dashboard" className="text-gray-800 hover:text-black transition-colors text-lg">
                Dashboard
              </Link>
            )}
          </div>

          {/* Search Icon & User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-800 hover:text-black transition-colors"
              aria-label="Toggle search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Favorites Heart Icon */}
            <Link 
              href="/favorites"
              className="relative p-2 text-gray-800 hover:text-red-500 transition-colors"
              aria-label="Favorites"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </Link>
            
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user && userData ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-label="User menu"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-gray-400 transition-colors">
                    {userData.userType === 'user' && userData.profilePicUrl ? (
                      <Image 
                        src={userData.profilePicUrl} 
                        alt={userData.firstName} 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                        {userData.userType === 'user' 
                          ? userData.firstName.charAt(0).toUpperCase()
                          : userData.businessName.charAt(0).toUpperCase()
                        }
                      </div>
                    )}
                  </div>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      {userData.userType === 'user' ? (
                        <p className="text-sm font-semibold text-gray-800">{userData.firstName} {userData.lastName}</p>
                      ) : (
                        <p className="text-sm font-semibold text-gray-800">{userData.businessName}</p>
                      )}
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link 
                      href={userData.userType === 'business' ? '/business/profile' : '/profile'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {userData.userType === 'business' ? 'Business Profile' : 'Profile'}
                    </Link>
                    <Link 
                      href="/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login"
                className="bg-[#151D26] text-white px-8 py-3 rounded hover:bg-[#2B3D4F] transition-colors font-medium text-lg"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-800 hover:text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        <div 
          className={`transition-all duration-300 ease-in-out ${
            isSearchOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{ overflow: isSearchOpen ? 'visible' : 'hidden' }}
        >
          <form onSubmit={handleSearch} className="pb-4 px-4">
            <div className="relative w-full" ref={searchDropdownRef}>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && searchResults.length > 0 && setShowDropdown(true)}
                placeholder="Search businesses..." 
                className="w-full px-4 py-3 pl-12 pr-12 text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                autoFocus={isSearchOpen}
              />
              <svg 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {isSearching ? (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                    setShowDropdown(false);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                  aria-label="Close search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              )}

              {/* Dropdown Results */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                  {searchResults.map((result) => (
                    <button
                      key={result.uid}
                      onClick={() => {
                        // Track search click (anonymous)
                        trackBusinessSearch(result.uid, searchQuery.trim());
                        router.push(`/business/${result.uid}`);
                        setShowDropdown(false);
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{result.businessName}</p>
                          <p className="text-xs text-gray-500">
                            {result.category} • {result.city}, {result.state}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setShowDropdown(false);
                      setIsSearchOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-center text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                  >
                    View all results for &quot;{searchQuery}&quot;
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
}
