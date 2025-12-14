import { NextRequest, NextResponse } from 'next/server';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { BusinessData, COLLECTIONS } from '@/services/firestore.service';

export interface SearchParams {
  q?: string;                    // Search query
  category?: string;              // Filter by category
  city?: string;                  // Filter by city
  state?: string;                 // Filter by state
  services?: string;              // Filter by service name
  sortBy?: 'name' | 'createdAt';  // Sort field
  sortOrder?: 'asc' | 'desc';     // Sort order
  page?: number;                  // Page number
  pageSize?: number;              // Results per page
}

export interface SearchResponse {
  results: BusinessData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract search parameters
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';
    const services = searchParams.get('services') || '';
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'name' | 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');

    // Build query constraints
    const constraints: QueryConstraint[] = [];
    
    // Filter by category
    if (category) {
      constraints.push(where('category', '==', category));
    }
    
    // Filter by location
    if (city) {
      constraints.push(where('address.city', '==', city));
    }
    
    if (state) {
      constraints.push(where('address.state', '==', state));
    }

    // Add sorting
    const sortField = sortBy === 'name' ? 'businessName' : 'createdAt';
    constraints.push(orderBy(sortField, sortOrder));

    // Build the query
    const businessesRef = collection(db, COLLECTIONS.BUSINESSES);
    const q1 = query(businessesRef, ...constraints);
    
    // Execute query
    const querySnapshot = await getDocs(q1);
    
    // Get all businesses
    let allBusinesses = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      uid: doc.id
    })) as BusinessData[];

    // Apply text search filter (client-side for now)
    if (q) {
      const searchLower = q.toLowerCase();
      allBusinesses = allBusinesses.filter(business => 
        business.businessName?.toLowerCase().includes(searchLower) ||
        business.description?.toLowerCase().includes(searchLower) ||
        business.category?.toLowerCase().includes(searchLower) ||
        business.tagline?.toLowerCase().includes(searchLower)
      );
    }

    // Apply services filter (client-side)
    if (services) {
      const serviceLower = services.toLowerCase();
      allBusinesses = allBusinesses.filter(business =>
        business.services?.some(service =>
          service.name.toLowerCase().includes(serviceLower) ||
          service.description.toLowerCase().includes(serviceLower)
        )
      );
    }

    // Calculate pagination
    const total = allBusinesses.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // Get paginated results
    const results = allBusinesses.slice(startIndex, endIndex);

    const response: SearchResponse = {
      results,
      total,
      page,
      pageSize,
      totalPages
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search businesses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET available filter options
export async function POST(request: NextRequest) {
  try {
    const businessesRef = collection(db, COLLECTIONS.BUSINESSES);
    const querySnapshot = await getDocs(businessesRef);
    
    const categories = new Set<string>();
    const cities = new Set<string>();
    const states = new Set<string>();
    const serviceNames = new Set<string>();

    querySnapshot.docs.forEach(doc => {
      const data = doc.data() as BusinessData;
      
      if (data.category) categories.add(data.category);
      if (data.address?.city) cities.add(data.address.city);
      if (data.address?.state) states.add(data.address.state);
      
      data.services?.forEach(service => {
        if (service.name) serviceNames.add(service.name);
      });
    });

    return NextResponse.json({
      categories: Array.from(categories).sort(),
      cities: Array.from(cities).sort(),
      states: Array.from(states).sort(),
      services: Array.from(serviceNames).sort()
    }, { status: 200 });

  } catch (error) {
    console.error('Filter options error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
