import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  BUSINESSES: 'businesses',
} as const;

/**
 * User data interface
 */
export interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicUrl?: string | null;
  userType: 'user';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Business data interface
 */
export interface BusinessData {
  uid: string;
  email: string;
  businessName: string;
  userType: 'business';
  verified: boolean;
  
  // Business Profile
  businessIcon?: string | null;
  description?: string | null;
  category?: string | null;
  
  // Gallery
  images?: string[];
  
  // Contact Details
  phone?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  
  // Social Links
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  
  // Location
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  googleMapLocation?: {
    lat: number;
    lng: number;
  };
  googleMapUrl?: string;
  
  // Business Hours
  businessHours?: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Create a new user document in Firestore
 */
export async function createUserDocument(
  uid: string,
  data: Omit<UserData, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const timestamp = Timestamp.now();
    
    await setDoc(userRef, {
      ...data,
      uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  } catch (error: any) {
    console.error('Error creating user document:', error);
    throw new Error(error.message || 'Failed to create user document');
  }
}

/**
 * Create a new business document in Firestore
 */
export async function createBusinessDocument(
  uid: string,
  data: Omit<BusinessData, 'uid' | 'createdAt' | 'updatedAt' | 'verified'>
): Promise<void> {
  try {
    const businessRef = doc(db, COLLECTIONS.BUSINESSES, uid);
    const timestamp = Timestamp.now();
    
    await setDoc(businessRef, {
      ...data,
      uid,
      verified: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  } catch (error: any) {
    console.error('Error creating business document:', error);
    throw new Error(error.message || 'Failed to create business document');
  }
}

/**
 * Get user document by UID
 */
export async function getUserDocument(uid: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting user document:', error);
    throw new Error(error.message || 'Failed to get user document');
  }
}

/**
 * Get business document by UID
 */
export async function getBusinessDocument(uid: string): Promise<BusinessData | null> {
  try {
    const businessRef = doc(db, COLLECTIONS.BUSINESSES, uid);
    const businessSnap = await getDoc(businessRef);
    
    if (businessSnap.exists()) {
      return businessSnap.data() as BusinessData;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting business document:', error);
    throw new Error(error.message || 'Failed to get business document');
  }
}

/**
 * Update user document
 */
export async function updateUserDocument(
  uid: string,
  data: Partial<Omit<UserData, 'uid' | 'createdAt'>>
): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('Error updating user document:', error);
    throw new Error(error.message || 'Failed to update user document');
  }
}
