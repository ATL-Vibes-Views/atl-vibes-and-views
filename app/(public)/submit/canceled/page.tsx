import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Canceled | ATL Vibes & Views",
};

export default function CanceledPage() {
  return (
    <div className="bg-[#f8f5f0] min-h-[60vh]">
      <div className="site-container px-6 py-16 md:py-24">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-5xl mb-6">✕</div>
          <h1 className="font-display text-section-sm font-bold text-black mb-4">
            Payment Not Completed
          </h1>
          <p className="text-sm text-gray-dark mb-6 leading-relaxed">
            Your payment was not completed. Your submission has been saved —
            you can complete payment anytime by submitting again.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/submit"
              className="px-6 py-3 bg-[#c1121f] text-white text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black transition-colors"
            >
              Return to Submission
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
            >
              Browse the Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
