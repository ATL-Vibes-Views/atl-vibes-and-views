"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { BusinessState } from "./TierBadge";
import { ComparisonTable } from "./ComparisonTable";

interface PlanBillingClientProps {
  state: BusinessState;
}

export function PlanBillingClient({
  state,
}: PlanBillingClientProps) {
  const isFounding = state === "founding";
  const isSponsor = state === "sponsor";
  const isPremium = state === ("premium" as BusinessState);
  const showButtons = state === "free" || state === "standard";
  const showHistory = state === "standard" || isPremium || isSponsor;
  const showDowngradeCancel = state === "standard" || isPremium;

  return (
    <div>
      {/* Founding Member Banner */}
      {isFounding && (
        <div className="bg-[#ede9fe] p-5 mb-6 flex items-start gap-3">
          <Star size={20} className="text-[#7c3aed] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-[14px] font-bold text-[#7c3aed]">
              Founding Member &mdash; Premium Features Included
            </div>
            <div className="text-[13px] text-[#7c3aed]/80 mt-1">
              Thank you for being a founding member. You have lifetime access to
              Premium listing features at no cost.
            </div>
          </div>
        </div>
      )}

      {/* Sponsor Banner */}
      {isSponsor && (
        <div className="bg-[#dcfce7] p-5 mb-6 flex items-start gap-3">
          <Star size={20} className="text-[#16a34a] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-[14px] font-bold text-[#16a34a]">
              Premium Features &mdash; Included with Your Sponsorship
            </div>
            <div className="text-[13px] text-[#16a34a]/80 mt-1">
              As an active sponsor, you automatically receive Premium listing
              features.
            </div>
            <Link
              href="/dashboard/sponsorship"
              className="inline-block mt-2 text-[13px] font-bold text-[#16a34a] hover:underline"
            >
              View Sponsorship Details &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <ComparisonTable state={state} />

      {/* Upgrade Buttons */}
      {showButtons && (
        <div className="flex justify-end gap-3 mt-6 mb-6">
          {state === "free" && (
            <button
              type="button"
              onClick={() => {
                // TODO: Wire to Stripe Checkout
                console.log("Upgrade to Standard clicked");
              }}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-[13px] font-semibold border border-[#e5e5e5] bg-transparent text-[#1a1a1a] hover:border-[#d1d5db] transition-colors"
            >
              Upgrade to Standard &mdash; $49/mo
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              // TODO: Wire to Stripe Checkout
              console.log("Upgrade to Premium clicked");
            }}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-[13px] font-semibold bg-[#fee198] text-[#1a1a1a] hover:opacity-90 transition-opacity"
          >
            Upgrade to Premium &mdash; $99/mo
          </button>
        </div>
      )}

      {/* Billing History */}
      {showHistory && (
        <div className="mt-8">
          <h3 className="font-display text-[18px] font-bold text-[#1a1a1a] mb-4">
            Billing History
          </h3>
          <div className="bg-white border border-[#e5e5e5]">
            <div className="px-5 py-8 text-center text-[13px] text-[#6b7280]">
              No billing history yet. Payment history will appear here once
              billing is connected.
            </div>
          </div>

          {/* Downgrade / Cancel links — Standard and Premium only */}
          {showDowngradeCancel && (
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={() => {
                  // TODO: Wire to Stripe portal
                  console.log("Downgrade plan clicked");
                }}
                className="text-[13px] font-semibold text-[#c1121f] hover:underline"
              >
                Downgrade Plan
              </button>
              <button
                type="button"
                onClick={() => {
                  // TODO: Wire to Stripe portal
                  console.log("Cancel plan clicked");
                }}
                className="text-[13px] font-semibold text-[#c1121f] hover:underline"
              >
                Cancel Plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Founding Member Partnership CTA */}
      {isFounding && (
        <div className="bg-[#f5f5f5] text-center px-8 py-10 mt-8">
          <h3 className="font-display text-[20px] font-bold text-[#1a1a1a]">
            Want even more visibility?
          </h3>
          <p className="text-[13px] text-[#6b7280] mt-2 max-w-[440px] mx-auto">
            Take your brand further with dedicated content, ad placements, and
            newsletter features through a partnership with ATL Vibes &amp; Views.
          </p>
          <Link
            href="/partner"
            className="inline-flex items-center justify-center rounded-full bg-[#fee198] px-6 py-2.5 text-[13px] font-semibold text-[#1a1a1a] hover:opacity-90 transition-opacity mt-5"
          >
            Explore Partnerships &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
