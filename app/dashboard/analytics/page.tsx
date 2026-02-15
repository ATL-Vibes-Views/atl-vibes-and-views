import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import { getBusinessState } from "@/components/dashboard/TierBadge";
import { AnalyticsClient } from "@/components/dashboard/AnalyticsClient";
// TODO: REMOVE BEFORE LAUNCH — test override import
import {
  getStateOverride,
  MOCK_ANALYTICS_DELIVERABLES,
} from "@/lib/dashboard-test-overrides";

export async function generateMetadata() {
  return {
    title: "Analytics | Dashboard | ATL Vibes & Views",
    description: "Business analytics on ATL Vibes & Views",
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
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
    .select("*, sponsor_packages(name)")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .maybeSingle()) as {
    data: {
      id: string;
      is_active: boolean;
      sponsor_packages: { name: string } | null;
    } | null;
  };

  // Deliverables for campaign impact (sponsor only)
  let deliverables: {
    deliverable_type: string;
    label: string;
    quantity_delivered: number;
  }[] | null = null;

  if (sponsor) {
    const { data } = (await supabase
      .from("sponsor_deliverables")
      .select("deliverable_type, label, quantity_delivered")
      .eq("sponsor_id", sponsor.id)) as {
      data: {
        deliverable_type: string;
        label: string;
        quantity_delivered: number;
      }[] | null;
    };
    deliverables = data;
  }

  const realState = getBusinessState(business, sponsor);
  // TODO: REMOVE BEFORE LAUNCH — apply test override
  const state = stateOverride ?? realState;

  // TODO: REMOVE BEFORE LAUNCH — inject mock deliverables for sponsor test
  const deliverableProps =
    state === "sponsor" && !deliverables
      ? MOCK_ANALYTICS_DELIVERABLES
      : deliverables;

  return <AnalyticsClient state={state} deliverables={deliverableProps} />;
}
