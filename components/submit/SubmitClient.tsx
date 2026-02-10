"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ProgressBar } from "./ProgressBar";
import { TypeSelector } from "./TypeSelector";
import { PricingCards } from "./PricingCards";
import { BusinessForm } from "./BusinessForm";
import { EventForm } from "./EventForm";
import { ReviewStep } from "./ReviewStep";
import { ConfirmationStep } from "./ConfirmationStep";
import type {
  BusinessFormData,
  EventFormData,
  Category,
  Amenity,
  IdentityOption,
  NeighborhoodGrouped,
} from "@/lib/types";

interface SubmitClientProps {
  categories: Category[];
  neighborhoods: NeighborhoodGrouped[];
  amenities: Amenity[];
  identityOptions: IdentityOption[];
}

const EMPTY_BUSINESS: BusinessFormData = {
  tier: "free",
  business_name: "",
  category_id: "",
  tagline: "",
  description: "",
  price_range: "",
  street_address: "",
  street_address_2: "",
  city: "Atlanta",
  state: "GA",
  zip_code: "",
  neighborhood_id: "",
  phone: "",
  email: "",
  website: "",
  primary_link: "",
  primary_link_label: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  x_twitter: "",
  logo_url: "",
  video_url: "",
  special_offers: "",
  is_owner: false,
  display_identity_publicly: true,
  certified_diversity_program: false,
  hours: [
    { day_of_week: "monday", open_time: "09:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "tuesday", open_time: "09:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "wednesday", open_time: "09:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "thursday", open_time: "09:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "friday", open_time: "09:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "saturday", open_time: "10:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "sunday", open_time: "", close_time: "", is_closed: true, notes: "" },
  ],
  contacts: [
    {
      contact_name: "",
      contact_title: "",
      contact_email: "",
      contact_phone: "",
      is_primary: true,
      is_public: true,
    },
  ],
  images: [],
  amenity_ids: [],
  identity_option_ids: [],
};

const EMPTY_EVENT: EventFormData = {
  tier: "free",
  title: "",
  event_type: "",
  category_id: "",
  tagline: "",
  description: "",
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  is_recurring: false,
  recurrence_rule: "",
  venue_name: "",
  venue_business_id: "",
  street_address: "",
  street_address_2: "",
  city: "Atlanta",
  state: "GA",
  zip_code: "",
  neighborhood_id: "",
  is_free: false,
  ticket_price_min: "",
  ticket_price_max: "",
  ticket_url: "",
  organizer_name: "",
  organizer_url: "",
  organizer_business_id: "",
  website: "",
  logo_url: "",
  featured_image_url: "",
  video_url: "",
  images: [],
};

export function SubmitClient({
  categories,
  neighborhoods,
  amenities,
  identityOptions,
}: SubmitClientProps) {
  const searchParams = useSearchParams();
  /* Determine initial step from URL params */
  const initialType = searchParams.get("type") as "business" | "event" | null;

  const [step, setStep] = useState(initialType ? 1 : 0);
  const [submissionType, setSubmissionType] = useState<"business" | "event">(
    initialType ?? "business"
  );
  const [tier, setTier] = useState("free");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [businessData, setBusinessData] =
    useState<BusinessFormData>(EMPTY_BUSINESS);
  const [eventData, setEventData] = useState<EventFormData>(EMPTY_EVENT);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* Filter categories for the active type */
  const filteredCategories = categories.filter((c) =>
    c.applies_to?.includes(
      submissionType === "business" ? "businesses" : "events"
    )
  );

  /* Step 0 → select type */
  const handleTypeSelect = useCallback(
    (type: "business" | "event") => {
      setSubmissionType(type);
      setStep(1);
    },
    []
  );

  /* Step 1 → select tier */
  const handleTierSelect = useCallback(
    (selectedTier: string, cycle: "monthly" | "annual") => {
      setTier(selectedTier);
      setBillingCycle(cycle);
      if (submissionType === "business") {
        setBusinessData((d) => ({ ...d, tier: selectedTier }));
      } else {
        setEventData((d) => ({ ...d, tier: selectedTier }));
      }
      setStep(2);
    },
    [submissionType]
  );

  /* Validate required fields */
  const validateForm = (): string | null => {
    if (!submitterName.trim()) return "Your name is required.";
    if (!submitterEmail.trim() || !submitterEmail.includes("@"))
      return "A valid email is required.";

    if (submissionType === "business") {
      if (!businessData.business_name.trim())
        return "Business name is required.";
      if (!businessData.category_id) return "Category is required.";
      if (!businessData.street_address.trim())
        return "Street address is required.";
      if (!businessData.city.trim()) return "City is required.";
      if (!businessData.state.trim()) return "State is required.";
      if (!businessData.zip_code.trim() || businessData.zip_code.length < 5)
        return "A valid ZIP code is required.";
      if (!businessData.neighborhood_id) return "Neighborhood is required.";
    } else {
      if (!eventData.title.trim()) return "Event title is required.";
      if (!eventData.start_date) return "Start date is required.";
    }
    return null;
  };

  /* Step 2 → go to review */
  const handleGoToReview = () => {
    const err = validateForm();
    if (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError("");
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Step 3 → submit */
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const formData =
        submissionType === "business" ? businessData : eventData;
      const isFree = tier === "free";

      if (isFree) {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submission_type: submissionType,
            submitter_name: submitterName,
            submitter_email: submitterEmail,
            data: formData,
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(
            (errBody as { error?: string }).error || "Submission failed"
          );
        }
        setStep(4);
      } else {
        /* Paid tier — create submission then redirect to Stripe */
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submission_type: submissionType,
            submitter_name: submitterName,
            submitter_email: submitterEmail,
            data: formData,
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(
            (errBody as { error?: string }).error || "Submission failed"
          );
        }
        const submission = await res.json();

        const checkoutRes = await fetch("/api/submit/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submission_type: submissionType,
            tier,
            billing_cycle: billingCycle,
            submitter_email: submitterEmail,
            submitter_name: submitterName,
            form_data: formData,
            submission_id: (submission as { id?: string }).id,
          }),
        });
        if (!checkoutRes.ok) {
          throw new Error("Failed to create checkout session");
        }
        const { url } = (await checkoutRes.json()) as { url: string };
        if (url) {
          window.location.href = url;
          return;
        }
        /* If no URL (stub), go to confirmation */
        setStep(4);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Edit handler from review step */
  const handleEdit = (_section: string) => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#f8f5f0] min-h-[60vh]">
      <div className="site-container px-6 py-12 md:py-16">
        {step > 0 && step < 4 && <ProgressBar currentStep={step} />}

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 0: Type Selection */}
        {step === 0 && <TypeSelector onSelect={handleTypeSelect} />}

        {/* Step 1: Pricing */}
        {step === 1 && (
          <PricingCards
            submissionType={submissionType}
            onSelect={handleTierSelect}
            onBack={() => setStep(0)}
          />
        )}

        {/* Step 2: Form */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-mid hover:text-black transition-colors mb-6 inline-flex items-center gap-1"
            >
              ← Change plan
            </button>

            <div className="bg-white p-6 md:p-8 shadow-sm">
              {/* Submitter info — shared */}
              <h3 className="font-display text-card-sm font-bold text-black mb-4">
                Contact Info (who&rsquo;s submitting)
              </h3>
              <p className="text-xs text-gray-mid mb-4">
                This is your contact info — not displayed publicly.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="submitter_name"
                    className="block text-xs font-semibold text-gray-dark uppercase tracking-wide mb-1.5"
                  >
                    Your Name<span className="text-[#c1121f] ml-0.5">*</span>
                  </label>
                  <input
                    id="submitter_name"
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="submitter_email"
                    className="block text-xs font-semibold text-gray-dark uppercase tracking-wide mb-1.5"
                  >
                    Your Email<span className="text-[#c1121f] ml-0.5">*</span>
                  </label>
                  <input
                    id="submitter_email"
                    type="email"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Type-specific form */}
              {submissionType === "business" ? (
                <BusinessForm
                  data={businessData}
                  onChange={setBusinessData}
                  categories={filteredCategories}
                  neighborhoods={neighborhoods}
                  amenities={amenities}
                  identityOptions={identityOptions}
                  tier={tier}
                />
              ) : (
                <EventForm
                  data={eventData}
                  onChange={setEventData}
                  categories={filteredCategories}
                  neighborhoods={neighborhoods}
                />
              )}

              {/* Next button */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-mid hover:text-black transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleGoToReview}
                  className="px-8 py-3 bg-[#c1121f] text-white text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black transition-colors"
                >
                  Review &amp; Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep(2)}
              className="text-sm text-gray-mid hover:text-black transition-colors mb-6 inline-flex items-center gap-1"
            >
              ← Back to form
            </button>
            <ReviewStep
              submissionType={submissionType}
              tier={tier}
              billingCycle={billingCycle}
              submitterName={submitterName}
              submitterEmail={submitterEmail}
              businessData={
                submissionType === "business" ? businessData : undefined
              }
              eventData={submissionType === "event" ? eventData : undefined}
              categories={categories}
              neighborhoods={neighborhoods}
              amenities={amenities}
              identityOptions={identityOptions}
              agreed={agreed}
              onAgreeChange={setAgreed}
              onEdit={handleEdit}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <ConfirmationStep
            submissionType={submissionType}
            tier={tier}
            email={submitterEmail}
          />
        )}
      </div>
    </div>
  );
}
