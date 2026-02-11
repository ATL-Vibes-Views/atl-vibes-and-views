"use client";

import type {
  BusinessFormData,
  EventFormData,
  Category,
  City,
  Amenity,
  IdentityOption,
  NeighborhoodGrouped,
} from "@/lib/types";
import Link from "next/link";

interface ReviewStepProps {
  submissionType: "business" | "event";
  tier: string;
  billingCycle: "monthly" | "annual";
  submitterName: string;
  submitterEmail: string;
  businessData?: BusinessFormData;
  eventData?: EventFormData;
  categories: Category[];
  neighborhoods: NeighborhoodGrouped[];
  amenities: Amenity[];
  identityOptions: IdentityOption[];
  cities: City[];
  agreed: boolean;
  onAgreeChange: (v: boolean) => void;
  onEdit: (section: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

function SectionBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 p-4 sm:p-6 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-dark uppercase tracking-wide">
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-[#c1121f] font-semibold hover:text-black transition-colors"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) {
  if (!value) return null;
  return (
    <div className="mb-2">
      <span className="text-xs text-gray-mid">{label}:</span>{" "}
      <span className="text-sm text-gray-dark">{value}</span>
    </div>
  );
}

function resolveName(
  id: string,
  items: { id: string; name: string }[]
): string {
  return items.find((i) => i.id === id)?.name ?? "";
}

function resolveNeighborhood(
  id: string,
  groups: NeighborhoodGrouped[]
): string {
  for (const g of groups) {
    const n = g.neighborhoods.find((n) => n.id === id);
    if (n) return `${n.name} (${g.area_name})`;
  }
  return "";
}

function tierLabel(
  type: "business" | "event",
  tier: string,
  billingCycle: "monthly" | "annual"
): string {
  if (tier === "free") return "Free";
  if (type === "event") return "Promoted — $99/mo";
  const prices: Record<string, Record<string, string>> = {
    standard: { monthly: "$29/mo", annual: "$290/yr" },
    premium: { monthly: "$99/mo", annual: "$990/yr" },
  };
  return `${tier.charAt(0).toUpperCase() + tier.slice(1)} — ${
    prices[tier]?.[billingCycle] ?? ""
  }`;
}

export function ReviewStep({
  submissionType,
  tier,
  billingCycle,
  submitterName,
  submitterEmail,
  businessData,
  eventData,
  categories,
  neighborhoods,
  amenities,
  identityOptions,
  cities,
  agreed,
  onAgreeChange,
  onEdit,
  onSubmit,
  submitting,
}: ReviewStepProps) {
  const isFree = tier === "free";
  const allCats = categories;

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-display text-section-sm font-bold text-black mb-2">
          Review Your Submission
        </h2>
        <p className="text-sm text-gray-dark">
          Please review your details before submitting.
        </p>
      </div>

      {/* Type & Tier badge */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] bg-[#f8f5f0] px-3 py-1">
          {submissionType === "business" ? "Business" : "Event"}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.1em] bg-[#f8f5f0] px-3 py-1">
          {tierLabel(submissionType, tier, billingCycle)}
        </span>
      </div>

      {/* Contact Info */}
      <SectionBlock title="Contact Info" onEdit={() => onEdit("contact")}>
        <Field label="Name" value={submitterName} />
        <Field label="Email" value={submitterEmail} />
        {submissionType === "business" && businessData?.is_owner && (
          <p className="text-xs text-gray-mid mt-1">Business owner</p>
        )}
      </SectionBlock>

      {submissionType === "business" && businessData && (
        <>
          <SectionBlock title="Business Basics" onEdit={() => onEdit("basics")}>
            <Field label="Business Name" value={businessData.business_name} />
            <Field
              label="Category"
              value={resolveName(businessData.category_id, allCats)}
            />
            <Field label="Tagline" value={businessData.tagline} />
            <Field label="Description" value={businessData.description} />
            <Field label="Price Range" value={businessData.price_range} />
          </SectionBlock>

          <SectionBlock title="Location" onEdit={() => onEdit("location")}>
            <Field label="Address" value={businessData.street_address} />
            {businessData.street_address_2 && (
              <Field label="Suite/Unit" value={businessData.street_address_2} />
            )}
            <Field
              label="City/State/ZIP"
              value={`${resolveName(businessData.city_id, cities)}, ${businessData.state} ${businessData.zip_code}`}
            />
            <Field
              label="Neighborhood"
              value={resolveNeighborhood(
                businessData.neighborhood_id,
                neighborhoods
              )}
            />
          </SectionBlock>

          <SectionBlock title="Business Hours" onEdit={() => onEdit("hours")}>
            {businessData.hours.map((h) => (
              <div key={h.day_of_week} className="text-sm text-gray-dark mb-1">
                <span className="font-medium capitalize w-24 inline-block">
                  {h.day_of_week}
                </span>
                {h.is_closed ? (
                  <span className="text-gray-mid">Closed</span>
                ) : h.open_time && h.close_time ? (
                  <span>
                    {h.open_time} – {h.close_time}
                  </span>
                ) : (
                  <span className="text-gray-mid">Not set</span>
                )}
              </div>
            ))}
          </SectionBlock>

          {businessData.contacts.length > 0 &&
            businessData.contacts[0].contact_name && (
              <SectionBlock
                title="Contact People"
                onEdit={() => onEdit("contacts")}
              >
                {businessData.contacts
                  .filter((c) => c.contact_name)
                  .map((c, i) => (
                    <div key={i} className="mb-2">
                      <span className="text-sm font-medium text-gray-dark">
                        {c.contact_name}
                      </span>
                      {c.contact_title && (
                        <span className="text-sm text-gray-mid">
                          {" "}
                          — {c.contact_title}
                        </span>
                      )}
                      {c.is_primary && (
                        <span className="text-xs text-[#c1121f] ml-2">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
              </SectionBlock>
            )}

          <SectionBlock
            title="Contact & Links"
            onEdit={() => onEdit("links")}
          >
            <Field label="Phone" value={businessData.phone} />
            <Field label="Email" value={businessData.email} />
            <Field label="Website" value={businessData.website} />
            {businessData.primary_link && (
              <Field
                label="CTA"
                value={`${businessData.primary_link_label || "Link"}: ${businessData.primary_link}`}
              />
            )}
          </SectionBlock>

          {(businessData.instagram ||
            businessData.facebook ||
            businessData.tiktok ||
            businessData.x_twitter) && (
            <SectionBlock
              title="Social Media"
              onEdit={() => onEdit("social")}
            >
              <Field label="Instagram" value={businessData.instagram ? `@${businessData.instagram}` : ""} />
              <Field label="TikTok" value={businessData.tiktok ? `@${businessData.tiktok}` : ""} />
              <Field label="X/Twitter" value={businessData.x_twitter ? `@${businessData.x_twitter}` : ""} />
              <Field label="Facebook" value={businessData.facebook} />
            </SectionBlock>
          )}

          <SectionBlock title="Media" onEdit={() => onEdit("media")}>
            <Field label="Logo" value={businessData.logo_url} />
            <Field label="Video" value={businessData.video_url} />
          </SectionBlock>

          {businessData.amenity_ids.length > 0 && (
            <SectionBlock
              title="Amenities"
              onEdit={() => onEdit("amenities")}
            >
              <div className="flex flex-wrap gap-2">
                {businessData.amenity_ids.map((id) => {
                  const name =
                    amenities.find((a) => a.id === id)?.name ?? id;
                  return (
                    <span
                      key={id}
                      className="text-xs bg-[#f8f5f0] px-2 py-1 text-gray-dark"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </SectionBlock>
          )}

          {businessData.identity_option_ids.length > 0 && (
            <SectionBlock
              title="Business Identity"
              onEdit={() => onEdit("identity")}
            >
              <div className="flex flex-wrap gap-2">
                {businessData.identity_option_ids.map((id) => {
                  const name =
                    identityOptions.find((o) => o.id === id)?.name ?? id;
                  return (
                    <span
                      key={id}
                      className="text-xs bg-[#f8f5f0] px-2 py-1 text-gray-dark"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </SectionBlock>
          )}

          {businessData.special_offers && (
            <SectionBlock
              title="Special Offers"
              onEdit={() => onEdit("offers")}
            >
              <p className="text-sm text-gray-dark">
                {businessData.special_offers}
              </p>
            </SectionBlock>
          )}
        </>
      )}

      {submissionType === "event" && eventData && (
        <>
          <SectionBlock title="Event Basics" onEdit={() => onEdit("basics")}>
            <Field label="Title" value={eventData.title} />
            <Field label="Event Type" value={eventData.event_type} />
            <Field
              label="Category"
              value={resolveName(eventData.category_id, allCats)}
            />
            <Field label="Tagline" value={eventData.tagline} />
            <Field label="Description" value={eventData.description} />
          </SectionBlock>

          <SectionBlock
            title="Date & Time"
            onEdit={() => onEdit("datetime")}
          >
            <Field label="Start Date" value={eventData.start_date} />
            <Field label="End Date" value={eventData.end_date} />
            <Field label="Start Time" value={eventData.start_time} />
            <Field label="End Time" value={eventData.end_time} />
            {eventData.is_recurring && (
              <Field label="Recurring" value={eventData.recurrence_rule} />
            )}
          </SectionBlock>

          <SectionBlock title="Location" onEdit={() => onEdit("location")}>
            <Field label="Venue" value={eventData.venue_name} />
            <Field label="Address" value={eventData.street_address} />
            {eventData.city_id && (
              <Field
                label="City/State/ZIP"
                value={`${resolveName(eventData.city_id, cities)}, ${eventData.state} ${eventData.zip_code}`}
              />
            )}
            <Field
              label="Neighborhood"
              value={resolveNeighborhood(
                eventData.neighborhood_id,
                neighborhoods
              )}
            />
          </SectionBlock>

          <SectionBlock title="Tickets" onEdit={() => onEdit("tickets")}>
            {eventData.is_free ? (
              <p className="text-sm text-gray-dark">Free event</p>
            ) : (
              <>
                <Field
                  label="Price"
                  value={
                    eventData.ticket_price_min
                      ? eventData.ticket_price_max
                        ? `$${eventData.ticket_price_min} – $${eventData.ticket_price_max}`
                        : `$${eventData.ticket_price_min}`
                      : undefined
                  }
                />
                <Field label="Ticket URL" value={eventData.ticket_url} />
              </>
            )}
          </SectionBlock>

          <SectionBlock title="Organizer" onEdit={() => onEdit("organizer")}>
            <Field label="Name" value={eventData.organizer_name} />
            <Field label="Website" value={eventData.organizer_url} />
          </SectionBlock>

          <SectionBlock title="Media" onEdit={() => onEdit("media")}>
            <Field label="Logo" value={eventData.logo_url} />
            <Field label="Featured Image" value={eventData.featured_image_url} />
            <Field label="Video" value={eventData.video_url} />
          </SectionBlock>

          {eventData.website && (
            <SectionBlock title="Links" onEdit={() => onEdit("links")}>
              <Field label="Website" value={eventData.website} />
            </SectionBlock>
          )}
        </>
      )}

      {/* Terms agreement */}
      <div className="mt-6 border border-gray-200 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => onAgreeChange(e.target.checked)}
            className="w-4 h-4 accent-[#c1121f] mt-0.5"
          />
          <span className="text-sm text-gray-dark">
            I confirm this information is accurate and agree to the{" "}
            <Link
              href="/terms"
              className="text-[#c1121f] underline hover:text-black"
              target="_blank"
            >
              Terms of Service
            </Link>
            .
          </span>
        </label>
      </div>

      {/* Submit */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!agreed || submitting}
          className="px-8 py-3 bg-[#c1121f] text-white text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black transition-colors disabled:opacity-50"
        >
          {submitting
            ? "Submitting…"
            : isFree
            ? "Submit for Review"
            : "Continue to Payment"}
        </button>
        <p className="text-xs text-gray-mid mt-3">
          {isFree
            ? "Your submission will be reviewed within 48 hours."
            : `You'll be redirected to Stripe to complete payment. Your listing will go live immediately after payment.`}
        </p>
        {!isFree && (
          <p className="text-xs text-gray-dark font-medium mt-1">
            {tierLabel(submissionType, tier, billingCycle)}
          </p>
        )}
      </div>
    </div>
  );
}
