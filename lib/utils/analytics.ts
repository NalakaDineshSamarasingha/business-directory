// Analytics tracking utility
export const trackBusinessView = async (businessId: string) => {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessId,
        eventType: "view",
      }),
    });
  } catch (error) {
    // Silently fail - analytics shouldn't block user experience
    console.error("Failed to track business view:", error);
  }
};

export const trackBusinessSearch = async (businessId: string, searchQuery: string) => {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessId,
        eventType: "search",
        searchQuery,
      }),
    });
  } catch (error) {
    // Silently fail - analytics shouldn't block user experience
    console.error("Failed to track business search:", error);
  }
};
