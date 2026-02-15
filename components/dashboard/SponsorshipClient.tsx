"use client";

import type { BusinessState } from "./TierBadge";
import { SponsorDashboard } from "./SponsorDashboard";
import { SponsorUpsell } from "./SponsorUpsell";

interface SponsorData {
  id: string;
  campaign_name: string | null;
  campaign_start: string | null;
  campaign_end: string | null;
  campaign_value: number | null;
  status: string;
  sponsor_packages: {
    name: string;
    slug: string;
    price_display: string;
    billing_cycle: string;
    deliverables: unknown;
  } | null;
}

interface Deliverable {
  id: string;
  label: string;
  deliverable_type: string;
  quantity_owed: number;
  quantity_delivered: number;
  notes: string | null;
}

interface Fulfillment {
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
}

interface AdFlight {
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
}

interface PackageData {
  id: string;
  name: string;
  slug: string;
  price_display: string;
  billing_cycle: string;
  description: string | null;
  deliverables: unknown;
}

interface SponsorshipClientProps {
  state: BusinessState;
  sponsor: SponsorData | null;
  packages: PackageData[] | null;
  deliverables: Deliverable[] | null;
  fulfillments: Fulfillment[] | null;
  flights: AdFlight[] | null;
}

export function SponsorshipClient({
  state,
  sponsor,
  packages,
  deliverables,
  fulfillments,
  flights,
}: SponsorshipClientProps) {
  if (state === "sponsor" && sponsor) {
    return (
      <SponsorDashboard
        sponsor={sponsor}
        deliverables={deliverables}
        fulfillments={fulfillments}
        flights={flights}
      />
    );
  }

  return <SponsorUpsell state={state} packages={packages} />;
}
