import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import ReviewsClient from "./ReviewsClient";

export const metadata: Metadata = {
  title: "Reviews | Dashboard | ATL Vibes & Views",
  description: "View and respond to customer reviews for your business.",
  robots: { index: false, follow: false },
};

export default async function ReviewsPage() {
  const owner = getMockBusinessOwner();
  const businessId = owner.business_id!;
  const supabase = createServerClient();

  // Fetch reviews
  const { data: reviews } = (await supabase
    .from("reviews")
    .select("id, rating, title, body, visit_date, created_at, user_id")
    .eq("business_id", businessId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      rating: number;
      title: string | null;
      body: string | null;
      visit_date: string | null;
      created_at: string;
      user_id: string;
    }[] | null;
  };

  // Fetch reviewer names
  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))];
  const usersMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: users } = (await supabase
      .from("users")
      .select("id, display_name")
      .in("id", userIds)) as { data: { id: string; display_name: string | null }[] | null };
    if (users) {
      for (const u of users) {
        usersMap[u.id] = u.display_name ?? "Anonymous";
      }
    }
  }

  const reviewsWithNames = (reviews ?? []).map((r) => ({
    ...r,
    reviewer_name: usersMap[r.user_id] ?? "Anonymous",
  }));

  return <ReviewsClient reviews={reviewsWithNames} />;
}
