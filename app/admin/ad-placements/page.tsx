import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { AdPlacementsClient } from "./AdPlacementsClient";

export const metadata: Metadata = {
  title: "Ad Placements | Admin CMS | ATL Vibes & Views",
  description: "Manage ad placement slots and flights.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdPlacementsPage() {
  const supabase = createServerClient();

  // Fetch placements
  const { data: placements, error: placementsErr } = (await supabase
    .from("ad_placements")
    .select("id, name, channel, placement_key, page_type, dimensions, description, is_active, created_at")
    .order("created_at", { ascending: false })
  ) as {
    data: {
      id: string;
      name: string;
      channel: string;
      placement_key: string;
      page_type: string | null;
      dimensions: string | null;
      description: string | null;
      is_active: boolean;
      created_at: string;
    }[] | null;
    error: unknown;
  };
  if (placementsErr) console.error("Failed to fetch ad placements:", placementsErr);

  // Fetch flights with counts per placement
  const { data: flights } = (await supabase
    .from("ad_flights")
    .select("id, placement_id, status, start_date, end_date")
  ) as {
    data: { id: string; placement_id: string; status: string; start_date: string; end_date: string }[] | null;
  };

  return (
    <AdPlacementsClient
      placements={placements ?? []}
      flights={flights ?? []}
    />
  );
}
