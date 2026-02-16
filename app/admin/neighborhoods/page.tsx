import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { NeighborhoodsClient } from "./NeighborhoodsClient";

export const metadata: Metadata = {
  title: "Neighborhoods | Admin | ATL Vibes & Views",
  description: "Manage neighborhoods in ATL Vibes & Views.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NeighborhoodsPage() {
  const supabase = createServiceRoleClient();

  // Fetch neighborhoods with area name and counts
  const { data: neighborhoods, error: nErr } = (await supabase
    .from("neighborhoods")
    .select("id, name, slug, is_active, areas(name)")
    .order("name")) as {
    data: {
      id: string;
      name: string;
      slug: string;
      is_active: boolean;
      areas: { name: string } | null;
    }[] | null;
    error: unknown;
  };
  if (nErr) console.error("Failed to fetch neighborhoods:", nErr);

  // Get business counts per neighborhood
  const { data: bizCounts } = (await supabase
    .from("business_listings")
    .select("neighborhood_id")) as {
    data: { neighborhood_id: string }[] | null;
  };

  // Get story counts per neighborhood (via post_neighborhoods)
  const { data: storyCounts } = (await supabase
    .from("post_neighborhoods")
    .select("neighborhood_id")) as {
    data: { neighborhood_id: string }[] | null;
  };

  // Build count maps
  const bizCountMap: Record<string, number> = {};
  (bizCounts ?? []).forEach((b) => {
    bizCountMap[b.neighborhood_id] = (bizCountMap[b.neighborhood_id] ?? 0) + 1;
  });

  const storyCountMap: Record<string, number> = {};
  (storyCounts ?? []).forEach((s) => {
    storyCountMap[s.neighborhood_id] = (storyCountMap[s.neighborhood_id] ?? 0) + 1;
  });

  const enriched = (neighborhoods ?? []).map((n) => ({
    ...n,
    business_count: bizCountMap[n.id] ?? 0,
    story_count: storyCountMap[n.id] ?? 0,
  }));

  // Fetch areas for filter
  const { data: areas } = (await supabase
    .from("areas")
    .select("id, name")
    .order("name")) as { data: { id: string; name: string }[] | null };

  return (
    <NeighborhoodsClient
      neighborhoods={enriched}
      areas={areas ?? []}
    />
  );
}
