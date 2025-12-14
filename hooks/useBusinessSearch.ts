import { useState } from 'react';
import { BusinessData } from '@/services/firestore.service';
import { SearchFilters } from '@/components/search/SearchFilters';

interface SearchResponse {
  results: BusinessData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useBusinessSearch() {
  const [results, setResults] = useState<BusinessData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const search = async (filters: SearchFilters, page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
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

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
      setTotalPages(1);
      setTotalResults(0);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResults([]);
    setError(null);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalResults(0);
  };

  return {
    results,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalResults,
    search,
    reset
  };
}
