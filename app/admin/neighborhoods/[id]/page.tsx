import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { NeighborhoodDetailClient } from "./NeighborhoodDetailClient";

export const metadata: Metadata = {
  title: "Neighborhood Detail | Admin | ATL Vibes & Views",
  description: "Edit neighborhood details.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NeighborhoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: neighborhood, error } = (await supabase
    .from("neighborhoods")
    .select("*, areas(name)")
    .eq("id", id)
    .single()) as { data: Record<string, unknown> & { areas: { name: string } | null } | null; error: unknown };
  if (error) console.error("Failed to fetch neighborhood:", error);

  // Related businesses
  const { data: businesses } = (await supabase
    .from("business_listings")
    .select("id, business_name, status, tier")
    .eq("neighborhood_id", id)
    .order("business_name")
    .limit(20)) as { data: { id: string; business_name: string; status: string; tier: string }[] | null };

  // Related stories via post_neighborhoods
  const { data: postNeighborhoods } = (await supabase
    .from("post_neighborhoods")
    .select("blog_posts(id, title, status, published_at)")
    .eq("neighborhood_id", id)
    .limit(20)) as { data: { blog_posts: { id: string; title: string; status: string; published_at: string | null } | null }[] | null };
  const stories = (postNeighborhoods ?? []).filter((p) => p.blog_posts !== null).map((p) => p.blog_posts!);

  // Related events
  const { data: events } = (await supabase
    .from("events")
    .select("id, title, start_date, status")
    .eq("neighborhood_id", id)
    .order("start_date", { ascending: false })
    .limit(20)) as { data: { id: string; title: string; start_date: string; status: string }[] | null };

  // Lookup
  const { data: areas } = (await supabase
    .from("areas")
    .select("id, name")
    .order("name")) as { data: { id: string; name: string }[] | null };

  return (
    <NeighborhoodDetailClient
      neighborhood={neighborhood}
      businesses={businesses ?? []}
      stories={stories}
      events={events ?? []}
      areas={areas ?? []}
    />
  );
}
