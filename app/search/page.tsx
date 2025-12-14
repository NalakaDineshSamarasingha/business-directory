"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchFilters, { SearchFilters as SearchFiltersType } from '@/components/search/SearchFilters';
import SearchResults from '@/components/search/SearchResults';
import Pagination from '@/components/search/Pagination';
import { BusinessData } from '@/services/firestore.service';
import { showError } from '@/lib/utils/toast';

interface SearchResponse {
  results: BusinessData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface FilterOptions {
  categories: string[];
  cities: string[];
  states: string[];
  services: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<BusinessData[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    cities: [],
    states: [],
    services: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<SearchFiltersType>({
    q: '',
    category: '',
    city: '',
    state: '',
    services: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Handle initial URL parameters
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    
    if (q || category) {
      const initialFilters: SearchFiltersType = {
        q,
        category,
        city: '',
        state: '',
        services: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      setCurrentFilters(initialFilters);
      performSearch(initialFilters, 1);
    }
  }, [searchParams]);

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/search/businesses', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const performSearch = async (filters: SearchFiltersType, page: number = 1) => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '12'
      });

      if (filters.q) params.append('q', filters.q);
      if (filters.category) params.append('category', filters.category);
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);
      if (filters.services) params.append('services', filters.services);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/search/businesses?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();
      
      setResults(data.results);
      setTotalPages(data.totalPages);
      setTotalResults(data.total);
      setCurrentPage(data.page);
      setCurrentFilters(filters);
      
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Search error:', error);
      showError('Failed to search businesses. Please try again.');
      setResults([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (filters: SearchFiltersType) => {
    performSearch(filters, 1);
  };

  const handlePageChange = (page: number) => {
    performSearch(currentFilters, page);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Find Businesses
          </h1>
          <p className="text-gray-600">
            Search and discover businesses near you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <SearchFilters
                onSearch={handleSearch}
                categories={filterOptions.categories}
                cities={filterOptions.cities}
                states={filterOptions.states}
                services={filterOptions.services}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            <SearchResults
              results={results}
              isLoading={isLoading}
              totalResults={totalResults}
            />

            {/* Pagination */}
            {!isLoading && results.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
