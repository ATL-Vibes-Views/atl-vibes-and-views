import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import BillingClient from "./BillingClient";

export const metadata: Metadata = {
  title: "Plan & Billing | Dashboard | ATL Vibes & Views",
  description: "Manage your subscription plan and view billing history.",
  robots: { index: false, follow: false },
};

export default async function BillingPage() {
  const owner = getMockBusinessOwner();
  const businessId = owner.business_id!;
  const supabase = createServerClient();

  const { data: business } = (await supabase
    .from("business_listings")
    .select("tier, tier_start_date")
    .eq("id", businessId)
    .single()) as { data: { tier: string; tier_start_date: string | null } | null };

  const { data: subscription } = (await supabase
    .from("subscriptions")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()) as {
    data: {
      id: string;
      plan: string;
      price_monthly: number | null;
      status: string;
      current_period_start: string | null;
      current_period_end: string | null;
      created_at: string;
    } | null;
  };

  return (
    <BillingClient
      tier={business?.tier ?? "free"}
      tierStartDate={business?.tier_start_date ?? null}
      subscription={subscription}
    />
  );
}
