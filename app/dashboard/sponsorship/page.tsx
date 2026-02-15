import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import { getBusinessState } from "@/components/dashboard/TierBadge";
import { SponsorshipClient } from "@/components/dashboard/SponsorshipClient";
// TODO: REMOVE BEFORE LAUNCH — test override import
import {
  getStateOverride,
  MOCK_SPONSOR_FULL,
  MOCK_DELIVERABLES_FULL,
  MOCK_FULFILLMENTS,
  MOCK_FLIGHTS,
} from "@/lib/dashboard-test-overrides";

export async function generateMetadata() {
  return {
    title: "My Sponsorship | Dashboard | ATL Vibes & Views",
    description: "Manage your sponsorship on ATL Vibes & Views",
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function SponsorshipPage({
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

  // Sponsor with package details (package_id FK to sponsor_packages)
  const { data: sponsor } = (await supabase
    .from("sponsors")
    .select(
      "*, sponsor_packages(name, slug, price_display, billing_cycle, deliverables)"
    )
    .eq("business_id", businessId)
    .eq("is_active", true)
    .maybeSingle()) as {
    data: {
      id: string;
      campaign_name: string | null;
      campaign_start: string | null;
      campaign_end: string | null;
      campaign_value: number | null;
      status: string;
      is_active: boolean;
      sponsor_packages: {
        name: string;
        slug: string;
        price_display: string;
        billing_cycle: string;
        deliverables: unknown;
      } | null;
    } | null;
  };

  // All active packages (for upsell)
  const { data: packages } = (await supabase
    .from("sponsor_packages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")) as {
    data: {
      id: string;
      name: string;
      slug: string;
      price_display: string;
      billing_cycle: string;
      description: string | null;
      deliverables: unknown;
    }[] | null;
  };

  // Only fetch if sponsor exists
  let deliverables: {
    id: string;
    label: string;
    deliverable_type: string;
    quantity_owed: number;
    quantity_delivered: number;
    notes: string | null;
  }[] | null = null;

  let fulfillments: {
    id: string;
    deliverable_type: string;
    title: string;
    content_url: string | null;
    delivered_at: string;
    blog_posts: {
      title: string;
      slug: string;
      featured_image_url: string | null;
    } | null;
  }[] | null = null;

  let flights: {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
    ad_placements: {
      name: string;
      dimensions: string | null;
      description: string | null;
    } | null;
    ad_campaigns: {
      name: string;
      sponsor_id: string;
    } | null;
  }[] | null = null;

  if (sponsor) {
    const { data: d } = (await supabase
      .from("sponsor_deliverables")
      .select("*")
      .eq("sponsor_id", sponsor.id)
      .order("created_at")) as {
      data: {
        id: string;
        label: string;
        deliverable_type: string;
        quantity_owed: number;
        quantity_delivered: number;
        notes: string | null;
      }[] | null;
    };
    deliverables = d;

    const { data: f } = (await supabase
      .from("sponsor_fulfillment_log")
      .select("*, blog_posts(title, slug, featured_image_url)")
      .eq("sponsor_id", sponsor.id)
      .order("delivered_at", { ascending: false })) as {
      data: {
        id: string;
        deliverable_type: string;
        title: string;
        content_url: string | null;
        delivered_at: string;
        blog_posts: {
          title: string;
          slug: string;
          featured_image_url: string | null;
        } | null;
      }[] | null;
    };
    fulfillments = f;

    const { data: fl } = (await supabase
      .from("ad_flights")
      .select(
        "*, ad_placements(name, dimensions, description), ad_campaigns(name, sponsor_id)"
      )
      .in("status", ["active", "scheduled"])) as {
      data: {
        id: string;
        start_date: string;
        end_date: string;
        status: string;
        ad_placements: {
          name: string;
          dimensions: string | null;
          description: string | null;
        } | null;
        ad_campaigns: {
          name: string;
          sponsor_id: string;
        } | null;
      }[] | null;
    };
    // Filter flights by sponsor after fetch
    flights =
      fl?.filter((flight) => flight.ad_campaigns?.sponsor_id === sponsor.id) ??
      [];
  }

  const realState = getBusinessState(business, sponsor);
  // TODO: REMOVE BEFORE LAUNCH — apply test override
  const state = stateOverride ?? realState;

  // TODO: REMOVE BEFORE LAUNCH — inject mock sponsor data when testing sponsor state
  const sponsorProps = state === "sponsor" && !sponsor ? MOCK_SPONSOR_FULL : sponsor;
  const deliverableProps = state === "sponsor" && !deliverables ? MOCK_DELIVERABLES_FULL : deliverables;
  const fulfillmentProps = state === "sponsor" && !fulfillments ? MOCK_FULFILLMENTS : fulfillments;
  const flightProps = state === "sponsor" && !flights ? MOCK_FLIGHTS : flights;

  return (
    <SponsorshipClient
      state={state}
      sponsor={sponsorProps}
      packages={packages}
      deliverables={deliverableProps}
      fulfillments={fulfillmentProps}
      flights={flightProps}
    />
  );
}
