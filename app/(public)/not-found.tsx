import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Explore Atlanta neighborhoods, events, and businesses on ATL Vibes & Views.",
  openGraph: {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist. Explore Atlanta neighborhoods, events, and businesses on ATL Vibes & Views.",
  },
};

export default function NotFound() {
  return (
    <div className="bg-[#f8f5f0] min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-display text-8xl md:text-9xl font-bold text-[#c1121f] leading-none">
          404
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-black mt-4">
          Page Not Found
        </h1>
        <p className="text-gray-mid text-sm md:text-base mt-3 max-w-md mx-auto">
          Looks like this page took a detour. Let&rsquo;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-[#c1121f] text-white text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/neighborhoods"
            className="inline-flex items-center px-6 py-3 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
          >
            Explore Neighborhoods
          </Link>
          <Link
            href="/hub/events"
            className="inline-flex items-center px-6 py-3 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
          >
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}
