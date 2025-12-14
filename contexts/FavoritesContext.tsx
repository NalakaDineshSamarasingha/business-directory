"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (businessId: string) => Promise<void>;
  removeFavorite: (businessId: string) => Promise<void>;
  isFavorite: (businessId: string) => boolean;
  syncFavorites: () => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_KEY = 'azbow_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load favorites on mount
  useEffect(() => {
    if (user) {
      // User logged in - fetch from database
      fetchFavoritesFromDB();
    } else {
      // Not logged in - load from localStorage
      loadFromLocalStorage();
    }
  }, [user]);

  // Sync localStorage favorites to DB when user logs in
  useEffect(() => {
    if (user && favorites.length > 0) {
      const localFavorites = getLocalStorage();
      if (localFavorites.length > 0) {
        syncLocalToDatabase(localFavorites);
      }
    }
  }, [user]);

  const loadFromLocalStorage = () => {
    try {
      const stored = getLocalStorage();
      setFavorites(stored);
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalStorage = (): string[] => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const saveToLocalStorage = (favs: string[]) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  };

  const fetchFavoritesFromDB = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/favorites?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.success) {
        const businessIds = data.favorites.map((fav: any) => fav.businessId);
        setFavorites(businessIds);
        // Also save to localStorage as backup
        saveToLocalStorage(businessIds);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncLocalToDatabase = async (localFavorites: string[]) => {
    if (!user || localFavorites.length === 0) return;

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          favorites: localFavorites
        })
      });
      
      if (response.ok) {
        toast.success(`${localFavorites.length} favorites synced to your account!`);
      }
      
      // Clear localStorage after successful sync
      localStorage.removeItem(FAVORITES_KEY);
      
      // Refresh favorites from DB
      await fetchFavoritesFromDB();
    } catch (error) {
      console.error('Error syncing favorites:', error);
      toast.error('Failed to sync favorites');
    }
  };

  const addFavorite = async (businessId: string) => {
    if (favorites.includes(businessId)) return;

    const newFavorites = [...favorites, businessId];
    setFavorites(newFavorites);

    if (user) {
      // Logged in - save to database
      try {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            businessId
          })
        });
        toast.success('Added to favorites!');
      } catch (error) {
        console.error('Error adding favorite:', error);
        toast.error('Failed to add to favorites');
        // Revert on error
        setFavorites(favorites);
      }
    } else {
      // Not logged in - save to localStorage
      saveToLocalStorage(newFavorites);
      toast.success('Added to favorites!');
    }
  };

  const removeFavorite = async (businessId: string) => {
    const newFavorites = favorites.filter(id => id !== businessId);
    setFavorites(newFavorites);

    if (user) {
      // Logged in - remove from database
      try {
        await fetch(`/api/favorites?userId=${user.uid}&businessId=${businessId}`, {
          method: 'DELETE'
        });
        toast.success('Removed from favorites');
      } catch (error) {
        console.error('Error removing favorite:', error);
        toast.error('Failed to remove from favorites');
        // Revert on error
        setFavorites(favorites);
      }
    } else {
      // Not logged in - update localStorage
      saveToLocalStorage(newFavorites);
      toast.success('Removed from favorites');
    }
  };

  const isFavorite = (businessId: string): boolean => {
    return favorites.includes(businessId);
  };

  const syncFavorites = async () => {
    if (user) {
      await fetchFavoritesFromDB();
    } else {
      loadFromLocalStorage();
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        syncFavorites,
        loading
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
