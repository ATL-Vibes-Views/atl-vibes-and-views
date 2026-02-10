"use client";

import Link from "next/link";

interface TypeSelectorProps {
  onSelect: (type: "business" | "event") => void;
}

export function TypeSelector({ onSelect }: TypeSelectorProps) {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="font-display text-hero font-bold text-black mb-3">
          Get Listed on ATL Vibes &amp; Views
        </h1>
        <p className="text-lg text-gray-dark max-w-xl mx-auto">
          Reach Atlanta&rsquo;s local community. Choose what you&rsquo;d like to
          submit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Business Card */}
        <button
          onClick={() => onSelect("business")}
          className="group bg-[#f8f5f0] p-8 md:p-10 text-left border-2 border-transparent hover:border-[#c1121f] transition-colors"
        >
          <div className="text-4xl mb-4">🏢</div>
          <h2 className="font-display text-card font-bold text-black mb-2">
            List a Business
          </h2>
          <p className="text-sm text-gray-dark mb-4">
            Get your business on Atlanta&rsquo;s local guide. Appear in search,
            maps, and neighborhood pages.
          </p>
          <p className="text-xs text-gray-mid mb-6">
            Free &amp; paid options available
          </p>
          <span className="inline-block px-6 py-3 bg-[#c1121f] text-white text-xs font-semibold uppercase tracking-[0.1em] group-hover:bg-black transition-colors">
            Get Started
          </span>
        </button>

        {/* Event Card */}
        <button
          onClick={() => onSelect("event")}
          className="group bg-[#f8f5f0] p-8 md:p-10 text-left border-2 border-transparent hover:border-[#c1121f] transition-colors"
        >
          <div className="text-4xl mb-4">📅</div>
          <h2 className="font-display text-card font-bold text-black mb-2">
            Submit an Event
          </h2>
          <p className="text-sm text-gray-dark mb-4">
            Promote your event to Atlanta&rsquo;s community. Get featured on our
            events hub and newsletters.
          </p>
          <p className="text-xs text-gray-mid mb-6">
            Free &amp; promoted plans
          </p>
          <span className="inline-block px-6 py-3 bg-[#c1121f] text-white text-xs font-semibold uppercase tracking-[0.1em] group-hover:bg-black transition-colors">
            Get Started
          </span>
        </button>
      </div>

      <p className="text-center text-sm text-gray-mid mt-8">
        Already have a listing?{" "}
        <Link
          href="/login"
          className="text-[#c1121f] font-semibold hover:text-black transition-colors"
        >
          Sign in
        </Link>{" "}
        to manage it.
      </p>
    </div>
  );
}
