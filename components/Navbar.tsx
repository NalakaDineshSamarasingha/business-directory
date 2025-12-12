"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
            <Link href="/design" className="text-gray-800 hover:text-black transition-colors text-lg">
              Home
            </Link>
            <Link href="/marketing" className="text-gray-800 hover:text-black transition-colors text-lg">
              Find a Business
            </Link>
            <Link href="/marketing" className="text-gray-800 hover:text-black transition-colors text-lg">
              Have a Business
            </Link>
            <Link href="/technology" className="text-gray-800 hover:text-black transition-colors text-lg">
              About
            </Link>
            <Link href="/expertise" className="text-gray-800 hover:text-black transition-colors text-lg">
              Contact
            </Link>
          </div>

          {/* Search Icon & Login Button */}
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
            
            <Link 
              href="/login"
              className="bg-[#151D26] text-white px-8 py-3 rounded hover:bg-[#2B3D4F] transition-colors font-medium text-lg"
            >
              Sign in
            </Link>
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
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isSearchOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pb-4 px-4">
            <div className="relative w-full">
              <input 
                type="text" 
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
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                aria-label="Close search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
