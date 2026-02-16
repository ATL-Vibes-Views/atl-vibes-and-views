import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { AreasClient } from "./AreasClient";

export const metadata: Metadata = {
  title: "Areas | Admin | ATL Vibes & Views",
  description: "Manage areas in ATL Vibes & Views.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AreasPage() {
  const supabase = createServiceRoleClient();

  const { data: areas, error: aErr } = (await supabase
    .from("areas")
    .select("id, name, slug, is_active, sort_order")
    .order("sort_order")
    .order("name")) as {
    data: {
      id: string;
      name: string;
      slug: string;
      is_active: boolean;
      sort_order: number;
    }[] | null;
    error: unknown;
  };
  if (aErr) console.error("Failed to fetch areas:", aErr);

  // Get neighborhood counts per area
  const { data: neighborhoods } = (await supabase
    .from("neighborhoods")
    .select("area_id")) as { data: { area_id: string }[] | null };

  const neighborhoodCountMap: Record<string, number> = {};
  (neighborhoods ?? []).forEach((n) => {
    neighborhoodCountMap[n.area_id] = (neighborhoodCountMap[n.area_id] ?? 0) + 1;
  });

  // Get business counts per area (through neighborhoods)
  const { data: bizData } = (await supabase
    .from("business_listings")
    .select("neighborhood_id, neighborhoods(area_id)")
  ) as { data: { neighborhood_id: string; neighborhoods: { area_id: string } | null }[] | null };

  const bizCountMap: Record<string, number> = {};
  (bizData ?? []).forEach((b) => {
    const areaId = b.neighborhoods?.area_id;
    if (areaId) bizCountMap[areaId] = (bizCountMap[areaId] ?? 0) + 1;
  });

  const enriched = (areas ?? []).map((a) => ({
    ...a,
    neighborhood_count: neighborhoodCountMap[a.id] ?? 0,
    business_count: bizCountMap[a.id] ?? 0,
  }));

  return <AreasClient areas={enriched} />;
}
