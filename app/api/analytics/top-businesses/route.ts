import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, query, getDocs } from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitCount = parseInt(searchParams.get('limit') || '4');
    const topCategoriesCount = parseInt(searchParams.get('topCategories') || '3');

    // Get analytics data
    const analyticsRef = collection(db, "analytics");
    const analyticsSnapshot = await getDocs(analyticsRef);

    // Count views and searches per business
    const businessCounts: Record<string, number> = {};
    
    analyticsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const businessId = data.businessId;
      if (businessId) {
        businessCounts[businessId] = (businessCounts[businessId] || 0) + 1;
      }
    });

    // Get all businesses
    const businessesRef = collection(db, "businesses");
    const businessSnapshot = await getDocs(businessesRef);
    
    // Map businesses with their analytics count and group by category
    const categoryCounts: Record<string, number> = {};
    const businessesByCategory: Record<string, any[]> = {};

    businessSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const category = data.category;
      const businessId = doc.id;
      const analyticsCount = businessCounts[businessId] || 0;

      if (category) {
        // Count analytics per category
        categoryCounts[category] = (categoryCounts[category] || 0) + analyticsCount;
        
        // Store businesses by category
        if (!businessesByCategory[category]) {
          businessesByCategory[category] = [];
        }
        businessesByCategory[category].push({
          ...data,
          uid: businessId,
          analyticsCount
        });
      }
    });

    // Get top categories by analytics count
    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topCategoriesCount)
      .map(([category]) => category);

    // Get top businesses for each top category
    const result: Record<string, any> = {};
    
    topCategories.forEach(category => {
      const businesses = businessesByCategory[category] || [];
      const topBusinesses = businesses
        .sort((a, b) => b.analyticsCount - a.analyticsCount)
        .slice(0, limitCount);
      
      result[category] = {
        businesses: topBusinesses,
        totalAnalytics: categoryCounts[category]
      };
    });

    return NextResponse.json(
      { 
        topCategories,
        categoryData: result 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching top businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch top businesses" },
      { status: 500 }
    );
  }
}
