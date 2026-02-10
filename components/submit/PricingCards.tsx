"use client";

import { useState } from "react";

interface PricingCardsProps {
  submissionType: "business" | "event";
  onSelect: (tier: string, billingCycle: "monthly" | "annual") => void;
  onBack: () => void;
}

const CHECK = (
  <span className="text-[#c1121f] mr-2 text-sm">✓</span>
);

const BUSINESS_TIERS = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    annual: 0,
    recommended: false,
    features: [
      "Basic listing (name, address, category)",
      "Description & tagline",
      "Phone, email & website",
      "Social media links",
      "Logo & photos (up to 15)",
      "Gray map pin",
      "Requires admin review",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    monthly: 29,
    annual: 290,
    recommended: false,
    features: [
      "Everything in Free",
      "Auto-publish — no review wait",
      "Special offers display",
      "Custom CTA button",
      "Branded map pin",
      "Basic analytics dashboard",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    monthly: 99,
    annual: 990,
    recommended: true,
    features: [
      "Everything in Standard",
      "Auto-publish — no review wait",
      "Featured on neighborhood pages",
      "Featured on hub pages & homepage map",
      "Video embed on listing",
      "Newsletter & blog mentions",
      "Full analytics dashboard",
      "Premium gold map pin",
    ],
  },
];

const EVENT_TIERS = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    recommended: false,
    features: [
      "Basic listing (title, date, venue)",
      "Description & details",
      "Ticket link",
      "Logo & photos (up to 15)",
      "Standard map pin",
      "Requires admin review",
    ],
  },
  {
    id: "premium",
    name: "Promoted",
    monthly: 99,
    recommended: true,
    features: [
      "Auto-publish — no review wait",
      "Featured on events hub",
      "Featured on neighborhood page & homepage",
      "Premium gold map pin",
      "Newsletter inclusion",
      "Runs until you cancel",
    ],
  },
];

export function PricingCards({
  submissionType,
  onSelect,
  onBack,
}: PricingCardsProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

  const isBusinessType = submissionType === "business";
  const tiers = isBusinessType ? BUSINESS_TIERS : EVENT_TIERS;

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-gray-mid hover:text-black transition-colors mb-6 inline-flex items-center gap-1"
      >
        ← Change submission type
      </button>

      <div className="text-center mb-8">
        <h2 className="font-display text-section-sm font-bold text-black mb-2">
          Choose Your Plan
        </h2>
        <p className="text-sm text-gray-dark">
          {isBusinessType
            ? "Select the tier that's right for your business."
            : "Get your event listed free or boost visibility with a promoted listing."}
        </p>
      </div>

      {/* Monthly/Annual toggle — business only */}
      {isBusinessType && (
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
              billingCycle === "monthly"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-dark hover:bg-gray-200"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
              billingCycle === "annual"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-dark hover:bg-gray-200"
            }`}
          >
            Annual
          </button>
        </div>
      )}

      <div
        className={`grid gap-6 max-w-4xl mx-auto ${
          isBusinessType
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2 md:max-w-2xl"
        }`}
      >
        {tiers.map((tier) => {
          const price =
            isBusinessType && billingCycle === "annual" && "annual" in tier
              ? Math.round((tier as (typeof BUSINESS_TIERS)[0]).annual / 12)
              : tier.monthly;
          const totalAnnual =
            isBusinessType && "annual" in tier
              ? (tier as (typeof BUSINESS_TIERS)[0]).annual
              : 0;
          const savings =
            isBusinessType && billingCycle === "annual" && tier.monthly > 0
              ? tier.monthly * 12 - totalAnnual
              : 0;

          return (
            <div
              key={tier.id}
              className={`relative bg-white border-2 p-6 flex flex-col ${
                tier.recommended
                  ? "border-[#c1121f] border-t-4"
                  : "border-gray-200"
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c1121f] text-white text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1">
                  Recommended
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-display text-card font-bold text-black mb-1">
                  {tier.name}
                </h3>
                {tier.monthly === 0 ? (
                  <div className="font-display text-section-sm font-bold text-black">
                    $0
                  </div>
                ) : (
                  <div>
                    <span className="font-display text-section-sm font-bold text-black">
                      ${price}
                    </span>
                    <span className="text-sm text-gray-mid">/mo</span>
                    {isBusinessType &&
                      billingCycle === "annual" &&
                      tier.monthly > 0 && (
                        <div className="text-xs text-gray-mid mt-1">
                          ${totalAnnual}/yr billed annually
                        </div>
                      )}
                    {savings > 0 && (
                      <span className="inline-block mt-1 text-xs font-semibold text-[#c1121f] bg-red-50 px-2 py-0.5">
                        Save ${savings}/yr
                      </span>
                    )}
                    {!isBusinessType && tier.monthly > 0 && (
                      <div className="text-xs text-gray-mid mt-1">
                        Cancel anytime after your event
                      </div>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start text-sm text-gray-dark">
                    {CHECK}
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {tier.monthly > 0 && (
                <p className="text-xs text-green-700 font-medium mb-3">
                  No review needed — publish instantly
                </p>
              )}

              <button
                onClick={() => onSelect(tier.id, billingCycle)}
                className={`w-full py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                  tier.recommended
                    ? "bg-[#c1121f] text-white hover:bg-black"
                    : "bg-black text-white hover:bg-[#c1121f]"
                }`}
              >
                Select {tier.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
