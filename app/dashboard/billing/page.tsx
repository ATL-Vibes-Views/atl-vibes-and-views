import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import { getBusinessState } from "@/components/dashboard/TierBadge";
import { PlanBillingClient } from "@/components/dashboard/PlanBillingClient";
// TODO: REMOVE BEFORE LAUNCH — test override import
import { getStateOverride } from "@/lib/dashboard-test-overrides";

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

  const realState = getBusinessState(business, sponsor);
  // TODO: REMOVE BEFORE LAUNCH — apply test override
  const state = stateOverride ?? realState;

  return (
    <PlanBillingClient
      state={state}
    />
  );
}
