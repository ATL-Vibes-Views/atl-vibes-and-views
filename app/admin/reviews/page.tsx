import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { ReviewsClient } from "./ReviewsClient";

export const metadata: Metadata = {
  title: "Reviews | Admin CMS | ATL Vibes & Views",
  description: "Moderate user reviews.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const supabase = createServerClient();

  const { data: reviews, error } = (await supabase
    .from("reviews")
    .select("id, business_id, user_id, rating, title, body, status, is_verified_visit, helpful_count, reported_count, auto_flagged, created_at")
    .order("created_at", { ascending: false })
  ) as {
    data: {
      id: string;
      business_id: string;
      user_id: string;
      rating: number;
      title: string | null;
      body: string | null;
      status: string;
      is_verified_visit: boolean;
      helpful_count: number;
      reported_count: number;
      auto_flagged: boolean;
      created_at: string;
    }[] | null;
    error: unknown;
  };
  if (error) console.error("Failed to fetch reviews:", error);

  // Fetch business names for display
  const bizIds = [...new Set((reviews ?? []).map((r) => r.business_id))];
  let businesses: { id: string; business_name: string }[] = [];
  if (bizIds.length > 0) {
    const { data } = (await supabase
      .from("business_listings")
      .select("id, business_name")
      .in("id", bizIds)
    ) as { data: { id: string; business_name: string }[] | null };
    businesses = data ?? [];
  }

  // Fetch user emails for display
  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))];
  let users: { id: string; email: string; display_name: string | null }[] = [];
  if (userIds.length > 0) {
    const { data } = (await supabase
      .from("users")
      .select("id, email, display_name")
      .in("id", userIds)
    ) as { data: { id: string; email: string; display_name: string | null }[] | null };
    users = data ?? [];
  }

  return (
    <ReviewsClient
      reviews={reviews ?? []}
      businesses={businesses}
      users={users}
    />
  );
}
