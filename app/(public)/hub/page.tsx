import { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Hub | ATL Vibes & Views",
  description: "Your guide to Atlanta businesses, eats, events, and more.",
  robots: { index: false, follow: false },
};

export default function HubPage() {
  return (
    <div className="site-container py-24 text-center">
      <p className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3">Coming Soon</p>
      <h1 className="font-display text-4xl font-bold text-black mb-4">The Hub</h1>
      <p className="text-[#6b7280] text-[15px] max-w-md mx-auto mb-8">
        Your one-stop guide to Atlanta businesses, eats &amp; drinks, events, things to do, and more. Check back soon.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-6 py-2.5 bg-[#fee198] text-[#1a1a1a] text-sm font-semibold rounded-full hover:bg-[#e6c46d] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
