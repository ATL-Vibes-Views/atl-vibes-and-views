"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="bg-white min-h-[60vh]">
      <div className="site-container px-6 py-16 md:py-24">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-5xl mb-6">✓</div>
          <h1 className="font-display text-section-sm font-bold text-black mb-4">
            You&rsquo;re Live!
          </h1>
          <p className="text-sm text-gray-dark mb-6 leading-relaxed">
            Your listing is now live on ATL Vibes &amp; Views. Payment has been
            confirmed.
          </p>

          {sessionId && (
            <p className="text-xs text-gray-mid mb-6">
              Session: {sessionId}
            </p>
          )}

          <div className="bg-white border border-gray-100 p-6 text-center mb-8 shadow-sm">
            <p className="text-sm text-gray-dark mb-3">
              Want to manage your listing later? Create an account to access
              your dashboard, edit your listing, and view analytics.
            </p>
            <Link
              href="/signup"
              className="inline-block px-6 py-2 bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-[#1a1a1a] hover:text-[#fee198] transition-colors"
            >
              Create Account
            </Link>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-[#1a1a1a] hover:text-[#fee198] transition-colors"
            >
              Browse the Site
            </Link>
            <Link
              href="/submit"
              className="px-6 py-3 border border-gray-300 text-gray-dark text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:border-black transition-colors"
            >
              Submit Another
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-[60vh] flex items-center justify-center">
          Loading…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
