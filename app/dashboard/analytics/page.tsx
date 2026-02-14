import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import AnalyticsClient from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Analytics | Dashboard | ATL Vibes & Views",
  description: "View traffic and engagement analytics for your business listing.",
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  const owner = getMockBusinessOwner();
  const businessId = owner.business_id!;
  const supabase = createServerClient();

  const { data: business } = (await supabase
    .from("business_listings")
    .select("tier")
    .eq("id", businessId)
    .single()) as { data: { tier: string } | null };

  return <AnalyticsClient tier={business?.tier ?? "free"} />;
}
