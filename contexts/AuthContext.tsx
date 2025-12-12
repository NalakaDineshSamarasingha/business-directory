"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserDocument, getBusinessDocument, UserData, BusinessData } from '@/services/firestore.service';
import { showSuccess, showError } from '@/lib/utils/toast';

interface AuthContextType {
  user: User | null;
  userData: (UserData | BusinessData) | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<(UserData | BusinessData) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email || 'No user');
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user data from Firestore
        try {
          // Try to get regular user data first
          let data: UserData | BusinessData | null = await getUserDocument(firebaseUser.uid);
          
          // If not found, try business data
          if (!data) {
            data = await getBusinessDocument(firebaseUser.uid);
          }
          
          console.log('User data fetched:', data);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setUserData(null);
      showSuccess('Signed out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      showError('Failed to sign out');
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
