import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { BeyondATLClient } from "./BeyondATLClient";

export const metadata: Metadata = {
  title: "Beyond ATL Cities | Admin | ATL Vibes & Views",
  description: "Manage Beyond ATL cities.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function BeyondATLPage() {
  const supabase = createServiceRoleClient();

  const { data: cities, error: cErr } = (await supabase
    .from("cities")
    .select("id, name, slug, state, is_active, population")
    .eq("is_primary", false)
    .order("name")) as {
    data: {
      id: string;
      name: string;
      slug: string;
      state: string;
      is_active: boolean;
      population: number | null;
    }[] | null;
    error: unknown;
  };
  if (cErr) console.error("Failed to fetch cities:", cErr);

  // Get business counts per city
  const { data: bizData } = (await supabase
    .from("business_listings")
    .select("city_id")) as { data: { city_id: string }[] | null };

  const bizCountMap: Record<string, number> = {};
  (bizData ?? []).forEach((b) => {
    bizCountMap[b.city_id] = (bizCountMap[b.city_id] ?? 0) + 1;
  });

  // Get story counts per city (via areas → neighborhoods → post_neighborhoods)
  // Simplified: just count areas per city and use that as a proxy, or do blog post count
  const { data: areaData } = (await supabase
    .from("areas")
    .select("id, city_id")) as { data: { id: string; city_id: string }[] | null };

  const areaCityMap: Record<string, string> = {};
  (areaData ?? []).forEach((a) => { areaCityMap[a.id] = a.city_id; });

  const { data: neighborhoodData } = (await supabase
    .from("neighborhoods")
    .select("id, area_id")) as { data: { id: string; area_id: string }[] | null };

  const neighborhoodCityMap: Record<string, string> = {};
  (neighborhoodData ?? []).forEach((n) => {
    const cityId = areaCityMap[n.area_id];
    if (cityId) neighborhoodCityMap[n.id] = cityId;
  });

  const { data: postNeighborhoods } = (await supabase
    .from("post_neighborhoods")
    .select("neighborhood_id")) as { data: { neighborhood_id: string }[] | null };

  const storyCountMap: Record<string, number> = {};
  (postNeighborhoods ?? []).forEach((pn) => {
    const cityId = neighborhoodCityMap[pn.neighborhood_id];
    if (cityId) storyCountMap[cityId] = (storyCountMap[cityId] ?? 0) + 1;
  });

  const enriched = (cities ?? []).map((c) => ({
    ...c,
    business_count: bizCountMap[c.id] ?? 0,
    story_count: storyCountMap[c.id] ?? 0,
  }));

  return <BeyondATLClient cities={enriched} />;
}
