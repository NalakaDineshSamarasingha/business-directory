"use client";

import { useState, useEffect } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessData, COLLECTIONS } from "@/services/firestore.service";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import BusinessCard from "@/components/business/BusinessCard";
import Link from "next/link";
import toast from "react-hot-toast";

export default function FavoritesPage() {
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteBusinesses();
  }, [favorites]);

  const fetchFavoriteBusinesses = async () => {
    if (favorites.length === 0) {
      setBusinesses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const businessPromises = favorites.map(async (businessId) => {
        const businessDoc = await getDoc(doc(db, COLLECTIONS.BUSINESSES, businessId));
        if (businessDoc.exists()) {
          return { uid: businessDoc.id, ...businessDoc.data() } as BusinessData;
        }
        return null;
      });

      const results = await Promise.all(businessPromises);
      const validBusinesses = results.filter((b): b is BusinessData => b !== null);
      setBusinesses(validBusinesses);
    } catch (error) {
      console.error('Error fetching favorite businesses:', error);
      toast.error('Failed to load some favorites');
    } finally {
      setLoading(false);
    }
  };

  if (favoritesLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-[#151D26] rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading favorites...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Favorites
          </h1>
          
        </div>

        {/* Favorites Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {favorites.length === 0 ? (
              "No favorites yet"
            ) : (
              <>
                You have <span className="font-semibold">{favorites.length}</span>{" "}
                {favorites.length === 1 ? "favorite business" : "favorite businesses"}
              </>
            )}
          </p>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No Favorites Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start exploring businesses and click the heart icon to save your favorites!
            </p>
            <Link
              href="/find-business"
              className="inline-block px-8 py-3 bg-[#151D26] text-white rounded-lg hover:bg-[#2B3D4F] transition-colors font-medium"
            >
              Explore Businesses
            </Link>
          </div>
        ) : (
          /* Business Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.uid} business={business} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
