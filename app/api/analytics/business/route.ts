import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    // Get business details
    const businessDoc = await getDoc(doc(db, "businesses", businessId));
    if (!businessDoc.exists()) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const businessData = businessDoc.data();
    const category = businessData.category;

    // Get all analytics data
    const analyticsRef = collection(db, "analytics");
    const analyticsSnapshot = await getDocs(analyticsRef);

    // Count analytics per business and categorize by event type
    const businessAnalytics: Record<string, { views: number; searches: number; total: number }> = {};
    const dailyData: Record<string, { date: string; views: number; searches: number }> = {};

    analyticsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const bid = data.businessId;
      const eventType = data.eventType;
      const timestamp = data.timestamp?.toDate();

      if (bid) {
        if (!businessAnalytics[bid]) {
          businessAnalytics[bid] = { views: 0, searches: 0, total: 0 };
        }

        if (eventType === 'view') {
          businessAnalytics[bid].views++;
        } else if (eventType === 'search') {
          businessAnalytics[bid].searches++;
        }
        businessAnalytics[bid].total++;

        // Track daily data for current business
        if (bid === businessId && timestamp) {
          const dateKey = timestamp.toISOString().split('T')[0];
          if (!dailyData[dateKey]) {
            dailyData[dateKey] = { date: dateKey, views: 0, searches: 0 };
          }
          if (eventType === 'view') {
            dailyData[dateKey].views++;
          } else if (eventType === 'search') {
            dailyData[dateKey].searches++;
          }
        }
      }
    });

    // Get current business stats
    const currentBusinessStats = businessAnalytics[businessId] || { views: 0, searches: 0, total: 0 };

    // Get competitors (same category)
    const businessesRef = collection(db, "businesses");
    const competitorsQuery = query(businessesRef, where("category", "==", category));
    const competitorsSnapshot = await getDocs(competitorsQuery);

    const competitors = competitorsSnapshot.docs
      .filter(doc => doc.id !== businessId)
      .map(doc => ({
        uid: doc.id,
        businessName: doc.data().businessName,
        category: doc.data().category,
        ...businessAnalytics[doc.id] || { views: 0, searches: 0, total: 0 }
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 competitors

    // Calculate category average
    const categoryBusinesses = competitorsSnapshot.docs.map(doc => doc.id);
    const categoryStats = categoryBusinesses.reduce((acc, bid) => {
      const stats = businessAnalytics[bid] || { views: 0, searches: 0, total: 0 };
      acc.views += stats.views;
      acc.searches += stats.searches;
      acc.total += stats.total;
      return acc;
    }, { views: 0, searches: 0, total: 0 });

    const categoryAverage = {
      views: Math.round(categoryStats.views / categoryBusinesses.length),
      searches: Math.round(categoryStats.searches / categoryBusinesses.length),
      total: Math.round(categoryStats.total / categoryBusinesses.length)
    };

    // Convert daily data to array and sort by date
    const dailyDataArray = Object.values(dailyData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      businessId,
      businessName: businessData.businessName,
      category,
      stats: currentBusinessStats,
      categoryAverage,
      competitors,
      dailyData: dailyDataArray,
      totalCompetitors: categoryBusinesses.length - 1
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching business analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
