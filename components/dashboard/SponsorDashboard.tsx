"use client";

import { DeliverableTracker } from "./DeliverableTracker";
import { ContentGallery } from "./ContentGallery";
import { CampaignTimeline } from "./CampaignTimeline";

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

interface SponsorDashboardProps {
  sponsor: SponsorData;
  deliverables: Deliverable[] | null;
  fulfillments: Fulfillment[] | null;
  flights: AdFlight[] | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SponsorDashboard({
  sponsor,
  deliverables,
  fulfillments,
  flights,
}: SponsorDashboardProps) {
  return (
    <div>
      {/* Campaign Summary Card */}
      <div className="bg-white border border-[#e5e5e5] p-6 mb-8">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#c1121f]">
              YOUR SPONSORSHIP
            </div>
            <h2 className="font-display text-[22px] font-bold text-[#1a1a1a] mt-1">
              {sponsor.campaign_name ?? "Active Campaign"}
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[11px] font-semibold text-[#16a34a]">
            Active
          </span>
        </div>

        {/* 4-column info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          <div>
            <div className="text-[11px] text-[#6b7280] uppercase">Package</div>
            <div className="text-[14px] font-semibold text-[#1a1a1a] mt-0.5">
              {sponsor.sponsor_packages?.name ?? "Sponsorship Package"}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#6b7280] uppercase">Period</div>
            <div className="text-[14px] font-semibold text-[#1a1a1a] mt-0.5">
              {sponsor.campaign_start && sponsor.campaign_end
                ? `${formatDate(sponsor.campaign_start)} \u2013 ${formatDate(sponsor.campaign_end)}`
                : "Ongoing"}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#6b7280] uppercase">
              Monthly Value
            </div>
            <div className="text-[14px] font-semibold text-[#1a1a1a] mt-0.5">
              {sponsor.sponsor_packages?.price_display ?? "\u2014"}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#6b7280] uppercase">Status</div>
            <div className="text-[14px] font-semibold text-[#16a34a] mt-0.5">
              On Track
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#e5e5e5] pt-4 text-[12px] text-[#6b7280]">
          Questions? Contact your account manager at
          partnerships@atlvibesandviews.com
        </div>
      </div>

      {/* Deliverable Tracker */}
      <DeliverableTracker deliverables={deliverables} />

      {/* Content Gallery */}
      <ContentGallery fulfillments={fulfillments} />

      {/* Ad Placements */}
      {flights && flights.length > 0 && (
        <div className="mb-8">
          <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#c1121f]">
            AD PLACEMENTS
          </div>
          <h3 className="font-display text-[18px] font-bold text-[#1a1a1a] mt-1 mb-4">
            Your Ad Placements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white border border-[#e5e5e5] p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-semibold text-[#1a1a1a]">
                    {flight.ad_placements?.name ?? "Ad Placement"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      flight.status === "active"
                        ? "bg-[#dcfce7] text-[#16a34a]"
                        : "bg-[#fee198] text-[#1a1a1a]"
                    }`}
                  >
                    {flight.status === "active" ? "Active" : "Scheduled"}
                  </span>
                </div>
                {flight.ad_placements?.dimensions && (
                  <div className="text-[11px] text-[#6b7280]">
                    {flight.ad_placements.dimensions}
                  </div>
                )}
                <div className="text-[12px] text-[#6b7280] mt-1">
                  {formatDate(flight.start_date)} &ndash;{" "}
                  {formatDate(flight.end_date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaign Timeline */}
      <CampaignTimeline
        items={
          fulfillments?.map((f) => ({
            id: f.id,
            title: f.title,
            deliverable_type: f.deliverable_type,
            delivered_at: f.delivered_at,
          })) ?? null
        }
      />
    </div>
  );
}
