import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { AnalyticsClient } from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Analytics | Admin CMS | ATL Vibes & Views",
  description: "Content performance and site analytics.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = createServerClient();

  // Content counts
  const counts = (await Promise.all([
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("business_listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("media_items").select("*", { count: "exact", head: true }),
    supabase.from("newsletters").select("*", { count: "exact", head: true }).eq("status", "sent"),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
  ])) as unknown as { count: number | null }[];

  // Top posts by category
  const { data: topPosts } = (await supabase
    .from("blog_posts")
    .select("id, title, slug, status, category_id, published_at, categories(name)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10)
  ) as {
    data: {
      id: string;
      title: string;
      slug: string;
      status: string;
      category_id: string | null;
      published_at: string | null;
      categories: { name: string } | null;
    }[] | null;
  };

  // Content performance data
  const { data: performance } = (await supabase
    .from("content_performance")
    .select("post_id, page_views, unique_visitors, shares, avg_time_on_page, bounce_rate")
    .order("page_views", { ascending: false })
    .limit(20)
  ) as {
    data: {
      post_id: string;
      page_views: number | null;
      unique_visitors: number | null;
      shares: number | null;
      avg_time_on_page: number | null;
      bounce_rate: number | null;
    }[] | null;
  };

  return (
    <AnalyticsClient
      stats={{
        totalPosts: counts[0].count ?? 0,
        publishedPosts: counts[1].count ?? 0,
        activeListings: counts[2].count ?? 0,
        totalEvents: counts[3].count ?? 0,
        mediaItems: counts[4].count ?? 0,
        sentNewsletters: counts[5].count ?? 0,
        totalUsers: counts[6].count ?? 0,
        totalReviews: counts[7].count ?? 0,
      }}
      topPosts={topPosts ?? []}
      performance={performance ?? []}
    />
  );
}
