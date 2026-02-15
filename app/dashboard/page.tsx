import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import { getBusinessState } from "@/components/dashboard/TierBadge";
import { OverviewClient } from "@/components/dashboard/OverviewClient";
// TODO: REMOVE BEFORE LAUNCH — test override import
import {
  getStateOverride,
  MOCK_SPONSOR_OVERVIEW,
  MOCK_DELIVERABLES_OVERVIEW,
} from "@/lib/dashboard-test-overrides";

export async function generateMetadata() {
  return {
    title: "Overview | Dashboard | ATL Vibes & Views",
    description: "Manage your business on ATL Vibes & Views",
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function OverviewPage({
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

  // Business listing
  const { data: business } = (await supabase
    .from("business_listings")
    .select(
      "id, business_name, slug, tier, status, claim_status, is_founding_member"
    )
    .eq("id", businessId)
    .single()) as {
    data: {
      id: string;
      business_name: string;
      slug: string;
      tier: string;
      status: string;
      claim_status: string;
      is_founding_member: boolean;
    } | null;
  };

  // Active sponsor — sponsors.package_id FK to sponsor_packages
  const { data: sponsor } = (await supabase
    .from("sponsors")
    .select("*, sponsor_packages(name, slug, price_display)")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .maybeSingle()) as {
    data: {
      id: string;
      is_active: boolean;
      campaign_name: string | null;
      sponsor_packages: { name: string; slug: string; price_display: string } | null;
    } | null;
  };

  // Sponsor deliverables (only if sponsor exists)
  let deliverables: { quantity_owed: number; quantity_delivered: number }[] | null =
    null;
  if (sponsor) {
    const { data } = (await supabase
      .from("sponsor_deliverables")
      .select("quantity_owed, quantity_delivered")
      .eq("sponsor_id", sponsor.id)) as {
      data: { quantity_owed: number; quantity_delivered: number }[] | null;
    };
    deliverables = data;
  }

  // Reviews — status uses 'approved' not 'published' (see CHECK constraint)
  const { data: reviews } = (await supabase
    .from("reviews")
    .select("rating")
    .eq("business_id", businessId)
    .eq("status", "approved")) as { data: { rating: number }[] | null };

  const reviewCount = reviews?.length ?? 0;
  const avgRating =
    reviewCount > 0
      ? (
          reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        ).toFixed(1)
      : "0.0";

  // Story count (post_businesses uses post_id)
  const { count: storyCount } = (await supabase
    .from("post_businesses")
    .select("*", { count: "exact", head: true })
    .eq("business_id", businessId)) as { count: number | null };

  // Upcoming events (venue_business_id and organizer_business_id)
  const { count: eventCount } = (await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .or(
      `organizer_business_id.eq.${businessId},venue_business_id.eq.${businessId}`
    )
    .gte("start_date", new Date().toISOString())) as {
    count: number | null;
  };

  const realState = getBusinessState(business, sponsor);
  // TODO: REMOVE BEFORE LAUNCH — apply test override
  const state = stateOverride ?? realState;

  // TODO: REMOVE BEFORE LAUNCH — inject mock sponsor data when testing sponsor state
  const sponsorProps =
    state === "sponsor" && !sponsor
      ? MOCK_SPONSOR_OVERVIEW
      : sponsor
        ? { campaign_name: sponsor.campaign_name, sponsor_packages: sponsor.sponsor_packages }
        : null;

  const deliverableProps =
    state === "sponsor" && !deliverables
      ? MOCK_DELIVERABLES_OVERVIEW
      : deliverables;

  return (
    <OverviewClient
      state={state}
      businessStatus={business?.status ?? "active"}
      avgRating={avgRating}
      reviewCount={reviewCount}
      storyCount={storyCount ?? 0}
      eventCount={eventCount ?? 0}
      sponsor={sponsorProps}
      deliverables={deliverableProps}
    />
  );
}
