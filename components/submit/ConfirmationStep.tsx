"use client";

import Link from "next/link";

interface ConfirmationStepProps {
  submissionType: "business" | "event";
  tier: string;
  email: string;
}

export function ConfirmationStep({
  submissionType,
  tier,
  email,
}: ConfirmationStepProps) {
  const isFree = tier === "free";
  const typeLabel = submissionType === "business" ? "business" : "event";

  return (
    <div className="max-w-lg mx-auto text-center py-8">
      <div className="text-5xl mb-6">✓</div>

      {isFree ? (
        <>
          <h2 className="font-display text-section-sm font-bold text-black mb-4">
            Submission Received!
          </h2>
          <p className="text-sm text-gray-dark mb-6 leading-relaxed">
            We&rsquo;ve received your {typeLabel} submission. Our team will
            review it within 48 hours and you&rsquo;ll receive an email at{" "}
            <strong>{email}</strong> with the result.
          </p>

          <div className="bg-[#f8f5f0] p-6 text-left mb-8">
            <p className="text-xs font-semibold text-gray-dark uppercase tracking-wide mb-3">
              What happens next
            </p>
            <ol className="space-y-2 text-sm text-gray-dark list-decimal list-inside">
              <li>Our team reviews your submission</li>
              <li>
                You&rsquo;ll receive an email when it&rsquo;s approved or if we
                need more info
              </li>
              <li>
                Once approved, your listing goes live on ATL Vibes &amp; Views
              </li>
            </ol>
          </div>
        </>
      ) : (
        <>
          <h2 className="font-display text-section-sm font-bold text-black mb-4">
            You&rsquo;re Live!
          </h2>
          <p className="text-sm text-gray-dark mb-6 leading-relaxed">
            Your {typeLabel} is now live on ATL Vibes &amp; Views.
          </p>

          <div className="bg-[#f8f5f0] p-6 text-center mb-8">
            <p className="text-sm text-gray-dark mb-3">
              Want to manage your listing later? Create an account to access your
              dashboard, edit your listing, and view analytics.
            </p>
            <Link
              href="/signup"
              className="inline-block px-6 py-2 bg-black text-white text-xs font-semibold uppercase tracking-[0.1em] hover:bg-[#c1121f] transition-colors"
            >
              Create Account
            </Link>
          </div>
        </>
      )}

      <div className="flex items-center justify-center gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-[#c1121f] text-white text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black transition-colors"
        >
          Browse the Site
        </Link>
        <Link
          href="/submit"
          className="px-6 py-3 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
        >
          Submit Another
        </Link>
      </div>
    </div>
  );
}
