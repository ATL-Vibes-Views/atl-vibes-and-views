import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { RevenueClient } from "./RevenueClient";

export const metadata: Metadata = {
  title: "Revenue Overview | Admin CMS | ATL Vibes & Views",
  description: "Revenue dashboard and sponsor overview.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
  const supabase = createServerClient();

  // Fetch sponsors
  const { data: sponsors } = (await supabase
    .from("sponsors")
    .select("id, sponsor_name, status, campaign_value, campaign_start, campaign_end, package_type, is_active, placements_total, placements_used")
    .order("created_at", { ascending: false })
  ) as {
    data: {
      id: string;
      sponsor_name: string;
      status: string;
      campaign_value: number | null;
      campaign_start: string | null;
      campaign_end: string | null;
      package_type: string | null;
      is_active: boolean | null;
      placements_total: number | null;
      placements_used: number | null;
    }[] | null;
  };

  // Fetch ad flights for active count
  const { data: flights } = (await supabase
    .from("ad_flights")
    .select("id, status, start_date, end_date")
  ) as {
    data: { id: string; status: string; start_date: string; end_date: string }[] | null;
  };

  // Fetch ad placements total count (for Ad Slots card)
  const { data: placements } = (await supabase
    .from("ad_placements")
    .select("id")
  ) as {
    data: { id: string }[] | null;
  };

  // Fetch newsletter stats
  const { data: newsletters } = (await supabase
    .from("newsletters")
    .select("id, status, sponsor_business_id")
  ) as {
    data: { id: string; status: string; sponsor_business_id: string | null }[] | null;
  };

  // Compute revenue stats
  const allSponsors = sponsors ?? [];
  const activeSponsors = allSponsors.filter((s) => s.status === "active");
  const totalRevenue = allSponsors.reduce((sum, s) => sum + (s.campaign_value ?? 0), 0);
  const activeRevenue = activeSponsors.reduce((sum, s) => sum + (s.campaign_value ?? 0), 0);

  const today = new Date().toISOString().split("T")[0];
  const activeFlights = (flights ?? []).filter(
    (f) => f.status === "active" && f.start_date <= today && f.end_date >= today
  ).length;

  const sponsoredNewsletters = (newsletters ?? []).filter(
    (n) => n.sponsor_business_id
  ).length;

  return (
    <RevenueClient
      sponsors={allSponsors}
      stats={{
        totalRevenue,
        activeRevenue,
        activeSponsors: activeSponsors.length,
        totalSponsors: allSponsors.length,
        activeFlights,
        totalPlacements: (placements ?? []).length,
        sponsoredNewsletters,
      }}
    />
  );
}
