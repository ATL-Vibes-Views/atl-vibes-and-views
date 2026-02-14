import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RotatingScope } from "@/components/partner/RotatingScope";
import { PartnerSidebar } from "@/components/partner/PartnerSidebar";
import { MediaKitButton } from "@/components/partner/MediaKitModal";

export const metadata: Metadata = {
  title: "Partner With Us",
  description:
    "ATL Vibes & Views is Atlanta's independent media platform spotlighting local businesses, events, and community stories.",
};

/* ============================================================
   Brands marquee data
   ============================================================ */
const BRANDS = [
  "Atlanta BeltLine",
  "National Center for Civil & Human Rights",
  "Perkins & Will ATL",
  "Skyline Apartments",
  "Google DevFest",
  "Smorgasburg Atlanta",
  "Galore Market",
  "Playa Bowl",
  "Dips Kitchen",
  "Little Jars Bakeshop",
  "The Pool Turtle Bar & Game Cove",
  "City of Ink",
  "Ultimate Bodies by Carlos",
  "Pretty Little Taco Roswell",
  "Love Foundation",
];

/* ============================================================
   Coverage cards data
   ============================================================ */
const COVERAGE = [
  {
    title: "Editorial Features",
    desc: "Independent storytelling that highlights local businesses, founders, organizations, and initiatives shaping Atlanta\u2019s neighborhoods.",
    href: "/partner/editorial",
    bg: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600",
  },
  {
    title: "Events & Community Moments",
    desc: "From pop-ups and festivals to brand activations and city-wide moments, we cover the experiences that bring Atlanta together.",
    href: "/partner/events",
    bg: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600",
  },
  {
    title: "City, Culture & Community",
    desc: "Neighborhood stories. Development conversations. Cultural shifts. We focus on the why behind what\u2019s happening \u2014 not just the headline.",
    href: "/partner/editorial",
    bg: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1600",
  },
];

export default function PartnerPage() {
  return (
    <>
      {/* ========== HERO — full viewport ========== */}
      <section className="relative h-[70vh] md:h-[80vh] lg:h-[85vh] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1600"
          alt="Atlanta cityscape"
          fill
          unoptimized
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
        <div className="relative z-10 max-w-[700px] px-5 md:px-16">
          <p className="text-sm font-semibold text-gray-mid uppercase tracking-[0.2em] mb-4">
            Covering Atlanta Across
          </p>
          <RotatingScope />
          <h1 className="font-display text-[32px] md:text-[44px] lg:text-[52px] font-bold text-white leading-[1.1] mb-6">
            Atlanta&rsquo;s Independent Media Platform for Culture, Business &amp; Community
          </h1>
          <p className="text-lg md:text-[22px] text-white/90 font-light leading-relaxed mb-10">
            Spotlighting the people, places, and stories shaping Atlanta &mdash; from neighborhood businesses to organizations driving real impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/partner/contact"
              className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-base px-10 py-4 rounded-full hover:bg-[#c1121f] hover:text-white transition-all text-center"
            >
              Get Featured
            </Link>
            <MediaKitButton className="inline-block border-2 border-white/50 text-white font-semibold text-base px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all text-center">
              View Media Kit
            </MediaKitButton>
          </div>
        </div>
      </section>

      {/* ========== CONTENT GRID (sidebar + main) ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <PartnerSidebar />

        <main className="min-w-0">
          {/* ── Brand marquee ── */}
          <section className="py-16 bg-[#f8f8f8]">
            <p className="text-[13px] font-semibold text-[#c1121f] uppercase tracking-[0.15em] text-center mb-10">
              Brands We&rsquo;ve Featured
            </p>
            <div className="overflow-hidden py-5">
              <div className="flex animate-[scroll_20s_linear_infinite]">
                {[0, 1].map((set) => (
                  <div key={set} className="flex gap-[70px] pr-[70px] shrink-0">
                    {BRANDS.map((b) => (
                      <span
                        key={`${set}-${b}`}
                        className="text-xl font-semibold text-gray-dark whitespace-nowrap hover:text-[#c1121f] transition-colors"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-xs text-[#aaa] mt-8">
              Brands are selected through independent editorial coverage.
            </p>
          </section>

          {/* ── How We Tell Stories ── */}
          <section>
            <div className="text-center py-16 md:py-20 bg-white px-5">
              <h2 className="font-display text-section-sm md:text-[52px] font-semibold text-black">
                How We Tell Atlanta Stories
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {COVERAGE.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group relative min-h-[350px] md:min-h-[500px] flex items-end p-8 md:p-10 overflow-hidden"
                >
                  <Image
                    src={card.bg}
                    alt={card.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:bg-[#c1121f]/85 transition-colors duration-400" />
                  <div className="relative z-10">
                    <h3 className="font-display text-3xl md:text-4xl font-semibold text-white leading-tight mb-4">
                      {card.title}
                    </h3>
                    <p className="text-white/90 text-base leading-relaxed mb-5 max-h-0 overflow-hidden opacity-0 group-hover:max-h-[200px] group-hover:opacity-100 transition-all duration-400 md:block hidden">
                      {card.desc}
                    </p>
                    <span className="text-[#fee198] text-sm font-semibold uppercase tracking-wider">
                      Explore &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Your Vibe Is Our View ── */}
          <section className="py-20 md:py-24 bg-[#f8f5f0]">
            <div className="flex flex-col lg:flex-row items-center max-w-[1100px] mx-auto px-5 md:px-10">
              <div className="relative w-full lg:w-[500px] h-[280px] lg:h-[500px] shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200"
                  alt="Atlanta community"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="bg-white p-8 md:p-12 lg:-ml-20 relative z-10 shadow-[0_15px_60px_rgba(0,0,0,0.12)] flex-1 max-w-[600px] -mt-12 lg:mt-0 mx-5 lg:mx-0">
                <p className="text-[13px] font-semibold text-[#c1121f] uppercase tracking-[0.15em] mb-4">
                  Big ideas. Bold stories. Atlanta roots.
                </p>
                <h2 className="font-display text-3xl md:text-[40px] font-semibold text-black leading-[1.1] mb-6 italic">
                  Your Vibe Is Our View.
                </h2>
                <p className="text-[#444] text-base md:text-[17px] leading-relaxed mb-4">
                  At ATL Vibes &amp; Views, we believe every brand, business, and organization has a story worth telling &mdash; and a community ready to hear it. Our work is rooted in connecting people with the ideas, places, and voices shaping Atlanta.
                </p>
                <p className="text-[#444] text-base md:text-[17px] leading-relaxed">
                  Based in Atlanta, with deep roots across the city, we document what&rsquo;s happening on the ground &mdash; from neighborhood businesses and local events to organizations driving real impact. Everything we publish is guided by trust, culture, and community.
                </p>
                <Link
                  href="/partner/about"
                  className="inline-block mt-6 text-[15px] font-semibold text-[#c1121f] hover:text-black transition-colors"
                >
                  Learn more about ATL Vibes &amp; Views &rarr;
                </Link>
              </div>
            </div>
          </section>

          {/* ── Bridge to Marketing ── */}
          <section className="py-20 md:py-24 bg-white text-center px-5">
            <div className="max-w-[850px] mx-auto">
              <h2 className="font-display text-section-sm md:text-[52px] font-semibold text-black mb-8">
                Want to Be Found Consistently?
              </h2>
              <p className="text-lg md:text-xl text-gray-dark leading-relaxed mb-5">
                Some businesses want more than editorial coverage &mdash; they want long-term visibility, stronger digital presence, and sustainable growth.
              </p>
              <p className="text-lg md:text-xl text-gray-dark leading-relaxed mb-8">
                For those ready to go further, we offer digital marketing services including content creation, SEO, websites, and ongoing visibility strategy.
              </p>
              <Link
                href="/partner/marketing"
                className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-base px-10 py-4 rounded-full hover:bg-[#c1121f] hover:text-white transition-all"
              >
                Explore Digital Marketing Services &rarr;
              </Link>
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section className="relative py-24 md:py-32 text-center overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=1600"
              alt="Atlanta skyline"
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#c1121f]/90" />
            <div className="relative z-10 px-5">
              <h2 className="font-display text-section-sm md:text-[60px] font-bold text-white mb-5">
                Ready to Be Part of the Conversation?
              </h2>
              <p className="text-lg md:text-[22px] text-white/90 font-light mb-10">
                Whether you&rsquo;re a local business, brand, or organization, ATL Vibes &amp; Views is where Atlanta stories live.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/partner/contact"
                  className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-base px-10 py-4 rounded-full hover:bg-white transition-all text-center"
                >
                  Apply for Editorial Coverage
                </Link>
                <Link
                  href="/partner/contact"
                  className="inline-block border-2 border-white/50 text-white font-semibold text-base px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all text-center"
                >
                  Talk to the Team
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
