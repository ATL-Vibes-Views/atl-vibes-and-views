"use client";

import { Edit, Gift, Mail } from "lucide-react";
import type { BusinessState } from "./TierBadge";

interface PackageData {
  id: string;
  name: string;
  slug: string;
  price_display: string;
  billing_cycle: string;
  description: string | null;
  deliverables: unknown;
}

interface SponsorUpsellProps {
  state: BusinessState;
  packages: PackageData[] | null;
}

const PARTNER_BENEFITS = [
  {
    icon: Edit,
    title: "DEDICATED CONTENT",
    description:
      "Blog features, video reels, and social media coverage highlighting your brand and story.",
  },
  {
    icon: Gift,
    title: "AD PLACEMENTS",
    description:
      "Your business featured across our most-visited neighborhood and guide pages.",
  },
  {
    icon: Mail,
    title: "NEWSLETTER FEATURES",
    description:
      "Reach our email subscribers with dedicated mentions and sponsored sections.",
  },
];

interface DeliverableItem {
  type?: string;
  label?: string;
  quantity_per_month?: number;
  channel?: string;
}

function formatDeliverable(item: DeliverableItem): string {
  const label = item.label ?? item.type ?? "";
  if (item.quantity_per_month && item.quantity_per_month > 1) {
    return `${item.quantity_per_month} ${label}`;
  }
  return label;
}

function isFeaturePackage(slug: string): boolean {
  return slug === "the-feature";
}

export function SponsorUpsell({ state, packages }: SponsorUpsellProps) {
  const isFounding = state === "founding";

  return (
    <div>
      {/* Founding Member Banner */}
      {isFounding && (
        <div className="bg-[#ede9fe] p-5 mb-6">
          <div className="text-[14px] font-bold text-[#7c3aed]">
            As a Founding Member, you already stand out.
          </div>
          <div className="text-[13px] text-[#7c3aed]/80 mt-1">
            Your Premium listing gives you priority placement and the Featured
            badge. Sponsorship takes it further with dedicated content created
            specifically for your brand.
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-[#fee198] text-center px-8 py-12">
        <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#c1121f]">
          PARTNERSHIP OPPORTUNITIES
        </div>
        <h2 className="font-display text-[28px] font-bold text-[#1a1a1a] mt-3">
          Grow Your Business with ATL Vibes &amp; Views
        </h2>
        <p className="text-[14px] text-[#6b7280] mt-3 max-w-[520px] mx-auto">
          Get dedicated content, ad placements, and newsletter features that put
          your business in front of 56,000+ engaged Atlantans.
        </p>
        <button
          type="button"
          onClick={() => {
            // TODO: Link to HubSpot partnership form
            console.log("Explore packages clicked");
          }}
          className="inline-flex items-center justify-center rounded-full bg-[#fee198] border-2 border-[#1a1a1a] px-6 py-2.5 text-[13px] font-semibold text-[#1a1a1a] hover:opacity-90 transition-opacity mt-6"
        >
          Explore Partnership Packages &rarr;
        </button>
      </div>

      {/* What Partners Get */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        {PARTNER_BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="bg-white border border-[#e5e5e5] p-6 text-center"
            >
              <div className="w-9 h-9 rounded-full bg-[#fee198] flex items-center justify-center mx-auto">
                <Icon size={16} className="text-[#1a1a1a]" />
              </div>
              <div className="text-[13px] font-bold uppercase text-[#1a1a1a] mt-4">
                {benefit.title}
              </div>
              <div className="text-[12px] text-[#6b7280] mt-2">
                {benefit.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Package Cards */}
      {packages && packages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
          {packages.map((pkg) => {
            const isFeatured = isFeaturePackage(pkg.slug);
            const deliverablesList = Array.isArray(pkg.deliverables)
              ? (pkg.deliverables as DeliverableItem[])
              : [];

            return (
              <div
                key={pkg.id}
                className={`bg-white p-6 ${
                  isFeatured
                    ? "border-2 border-[#fdd870]"
                    : "border border-[#e5e5e5]"
                }`}
              >
                <div className="text-[14px] font-bold text-[#1a1a1a]">
                  {pkg.name}
                </div>
                <div className="font-display text-[24px] font-bold text-[#1a1a1a] mt-2">
                  {pkg.price_display}
                </div>
                <div className="text-[11px] text-[#6b7280]">
                  {pkg.billing_cycle}
                </div>

                {deliverablesList.length > 0 && (
                  <ul className="mt-4 space-y-1">
                    {deliverablesList.map((item, i) => (
                      <li
                        key={i}
                        className="text-[12px] text-[#6b7280] before:content-['•'] before:mr-1.5"
                      >
                        {formatDeliverable(item)}
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={() => {
                    // TODO: Link to HubSpot partnership form
                    console.log(`Package ${pkg.name} clicked`);
                  }}
                  className={`inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[13px] font-semibold mt-6 w-full transition-opacity hover:opacity-90 ${
                    isFeatured
                      ? "bg-[#fee198] text-[#1a1a1a]"
                      : "border border-[#e5e5e5] bg-transparent text-[#1a1a1a]"
                  }`}
                >
                  {isFeatured ? "Most Popular \u2192" : "Learn More \u2192"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="bg-[#f5f5f5] text-center px-8 py-12 mt-8">
        <h3 className="font-display text-[22px] text-[#1a1a1a]">
          Ready to partner?
        </h3>
        <p className="text-[13px] text-[#6b7280] mt-2">
          Let&rsquo;s build a custom package that fits your business goals.
        </p>
        <button
          type="button"
          onClick={() => {
            // TODO: Link to HubSpot partnership form
            console.log("Contact team clicked");
          }}
          className="inline-flex items-center justify-center rounded-full bg-[#fee198] px-6 py-2.5 text-[13px] font-semibold text-[#1a1a1a] hover:opacity-90 transition-opacity mt-4"
        >
          Contact Our Team &rarr;
        </button>
        <div className="text-[12px] text-[#9ca3af] mt-3">
          Or email partnerships@atlvibesandviews.com
        </div>
      </div>
    </div>
  );
}
