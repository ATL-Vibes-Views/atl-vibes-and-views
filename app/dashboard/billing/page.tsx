import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import { getBusinessState } from "@/components/dashboard/TierBadge";
import { PlanBillingClient } from "@/components/dashboard/PlanBillingClient";
// TODO: REMOVE BEFORE LAUNCH — test override import
import {
  getStateOverride,
  MOCK_SPONSOR_BILLING_TIER_CHANGES,
} from "@/lib/dashboard-test-overrides";

export async function generateMetadata() {
  return {
    title: "Plan & Billing | Dashboard | ATL Vibes & Views",
    description: "Manage your business plan on ATL Vibes & Views",
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const owner = getMockBusinessOwner();
  const businessId = owner.business_id!;
  const supabase = createServerClient();

  // TODO: REMOVE BEFORE LAUNCH — testing state override
  const resolvedParams = await searchParams;
  const stateOverride = getStateOverride(resolvedParams);

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

  const realState = getBusinessState(business, sponsor);
  // TODO: REMOVE BEFORE LAUNCH — apply test override
  const state = stateOverride ?? realState;

  // TODO: REMOVE BEFORE LAUNCH — inject mock tier changes for sponsor/standard test
  const tierChangeProps =
    (state === "sponsor" || state === "standard") && (!tierChanges || tierChanges.length === 0)
      ? MOCK_SPONSOR_BILLING_TIER_CHANGES
      : tierChanges;

  return (
    <PlanBillingClient
      state={state}
      tierChanges={tierChangeProps}
    />
  );
}
