import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { SponsorsClient } from "./SponsorsClient";

export const metadata: Metadata = {
  title: "Sponsors | Admin CMS | ATL Vibes & Views",
  description: "Manage sponsor partnerships and campaigns.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SponsorsPage() {
  const supabase = createServerClient();

  const { data: sponsors, error } = (await supabase
    .from("sponsors")
    .select("id, sponsor_name, contact_name, contact_email, status, campaign_name, campaign_value, campaign_start, campaign_end, package_type, placements_total, placements_used, is_active, business_id, created_at")
    .order("created_at", { ascending: false })
  ) as {
    data: {
      id: string;
      sponsor_name: string;
      contact_name: string | null;
      contact_email: string | null;
      status: string;
      campaign_name: string | null;
      campaign_value: number | null;
      campaign_start: string | null;
      campaign_end: string | null;
      package_type: string | null;
      placements_total: number | null;
      placements_used: number | null;
      is_active: boolean | null;
      business_id: string | null;
      created_at: string;
    }[] | null;
    error: unknown;
  };

  if (error) console.error("Failed to fetch sponsors:", error);

  return <SponsorsClient sponsors={sponsors ?? []} />;
}
