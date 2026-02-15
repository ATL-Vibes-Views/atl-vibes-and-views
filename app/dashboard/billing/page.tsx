import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import { getBusinessState } from "@/components/dashboard/TierBadge";
import { PlanBillingClient } from "@/components/dashboard/PlanBillingClient";

export async function generateMetadata() {
  return {
    title: "Plan & Billing | Dashboard | ATL Vibes & Views",
    description: "Manage your business plan on ATL Vibes & Views",
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const owner = getMockBusinessOwner();
  const businessId = owner.business_id!;
  const supabase = createServerClient();

  const { data: business } = (await supabase
    .from("business_listings")
    .select("id, business_name, slug, tier, status, is_founding_member")
    .eq("id", businessId)
    .single()) as {
    data: {
      id: string;
      business_name: string;
      slug: string;
      tier: string;
      status: string;
      is_founding_member: boolean;
    } | null;
  };

  const { data: sponsor } = (await supabase
    .from("sponsors")
    .select("*, sponsor_packages(name, slug, price_display)")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .maybeSingle()) as {
    data: {
      id: string;
      is_active: boolean;
      sponsor_packages: {
        name: string;
        slug: string;
        price_display: string;
      } | null;
    } | null;
  };

  const { data: subscription } = (await supabase
    .from("subscriptions")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle()) as {
    data: {
      id: string;
      plan: string;
      price_monthly: number | null;
      status: string;
      current_period_start: string | null;
      current_period_end: string | null;
    } | null;
  };

  const { data: tierChanges } = (await supabase
    .from("tier_changes")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(10)) as {
    data: {
      id: string;
      from_tier: string;
      to_tier: string;
      change_type: string;
      reason: string | null;
      created_at: string;
    }[] | null;
  };

  const state = getBusinessState(business, sponsor);

  return (
    <PlanBillingClient
      state={state}
      tierChanges={tierChanges}
    />
  );
}
