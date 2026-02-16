import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NewsletterBlock } from "@/components/ui/NewsletterBlock";

export const metadata: Metadata = {
  title: "About | ATL Vibes & Views",
  description:
    "ATL Vibes & Views is Atlanta's independent media platform covering neighborhoods, businesses, events, dining, and culture — reaching 608K+ Atlantans monthly.",
  openGraph: {
    title: "About | ATL Vibes & Views",
    description:
      "ATL Vibes & Views is Atlanta's independent media platform covering neighborhoods, businesses, events, dining, and culture.",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/about",
  },
};

/* ============================================================
   STATS
   ============================================================ */
const STATS = [
  { value: "608K+", label: "Atlantans Reached Monthly" },
  { value: "56K+", label: "Community Followers" },
  { value: "100+", label: "Local Businesses Covered" },
];

export default function AboutPage() {
  /* --- JSON-LD: Organization --- */
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ATL Vibes & Views",
    url: "https://atlvibesandviews.com",
    description:
      "Atlanta's independent media platform for neighborhoods, businesses, events, and culture.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "3355 Lenox Rd, Ste 750",
      addressLocality: "Atlanta",
      addressRegion: "GA",
      postalCode: "30326",
      addressCountry: "US",
    },
    sameAs: [
      "https://instagram.com/atlvibesandviews",
      "https://tiktok.com/@atlvibesandviews",
      "https://www.youtube.com/@livinginAtlanta-MellandaReese",
      "https://facebook.com/atlvibesandviews",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* ========== HERO ========== */}
      <section className="relative w-full h-[45vh] sm:h-[55vh] md:h-[65vh] min-h-[340px] max-h-[560px] overflow-hidden bg-[#1a1a1a]" style={{ backgroundImage: "url(/images/default-hero.png)", backgroundSize: "cover", backgroundPosition: "center" }}>
        <Image
          src="https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=1600"
          alt="Atlanta skyline"
          fill
          unoptimized
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow mb-4">
            Our Story
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-hero font-semibold text-white max-w-4xl leading-tight italic">
            Atlanta&rsquo;s Independent Media Platform
          </h1>
          <p className="text-white/70 text-sm sm:text-base mt-4 max-w-2xl leading-relaxed">
            Covering the neighborhoods, businesses, events, and culture that make this city home.
          </p>
        </div>
      </section>

      {/* ========== BREADCRUMBS ========== */}
      <div className="site-container pt-6 pb-2">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "About" },
          ]}
        />
      </div>

      {/* ========== MISSION ========== */}
      <section className="site-container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
            Why We&rsquo;re Here
          </span>
          <h2 className="font-display text-3xl md:text-section font-semibold text-black mt-2 mb-8">
            Connecting Atlantans to the City They Love
          </h2>
          <p className="text-gray-dark text-base md:text-lg leading-relaxed mb-5">
            ATL Vibes &amp; Views started with a simple idea: Atlanta deserves a trusted source for what&rsquo;s happening across the city &mdash; the new openings, the neighborhood stories, the events worth your time, and the people making it all happen.
          </p>
          <p className="text-gray-dark text-base md:text-lg leading-relaxed mb-5">
            We cover everything from local restaurants and small businesses to community events and city development. Whether you&rsquo;re discovering a new neighborhood, looking for weekend plans, or keeping up with what&rsquo;s changing around the corner, we&rsquo;re here to keep you connected.
          </p>
          <p className="text-gray-dark text-base md:text-lg leading-relaxed">
            Everything we publish is rooted in trust, culture, and community. We&rsquo;re not a faceless media company &mdash; we live here, we&rsquo;re invested in this city, and we only cover things we&rsquo;d genuinely recommend to a friend.
          </p>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="w-full bg-[#1a1a1a] py-16 md:py-20">
        <div className="site-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 text-center">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`${
                  i > 0 ? "md:border-l md:border-white/10" : ""
                } px-6`}
              >
                <span className="font-display text-5xl md:text-[64px] font-bold text-[#fee198] leading-none">
                  {stat.value}
                </span>
                <p className="text-white/70 text-sm uppercase tracking-wide mt-3">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WHAT WE COVER ========== */}
      <section className="site-container py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
            What We Cover
          </span>
          <h2 className="font-display text-3xl md:text-section font-semibold text-black mt-2">
            Your Guide to Atlanta
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Neighborhoods & Culture",
              desc: "Deep dives into Atlanta\u2019s neighborhoods \u2014 what\u2019s opening, what\u2019s changing, and what makes each pocket of the city unique.",
              href: "/areas",
            },
            {
              title: "Events & Experiences",
              desc: "From pop-ups and festivals to openings and community gatherings \u2014 a curated look at what\u2019s happening around the city.",
              href: "/hub/events",
            },
            {
              title: "Eats, Drinks & Local Business",
              desc: "Restaurant spotlights, new openings, hidden gems, and the local businesses that make Atlanta feel like home.",
              href: "/hub/eats-and-drinks",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group block border border-gray-200 p-8 hover:border-[#c1121f] transition-colors"
            >
              <h3 className="font-display text-xl md:text-card font-semibold text-black group-hover:text-[#c1121f] transition-colors mb-3">
                {item.title}
              </h3>
              <p className="text-gray-mid text-sm leading-relaxed">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== FOUNDER ========== */}
      <section className="w-full bg-[#f8f8f8]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative min-h-[400px] lg:min-h-[600px] bg-black overflow-hidden">
            <Image
              src="https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/DSC03942.jpg"
              alt="Mellanda Reese, Founder of ATL Vibes & Views"
              fill
              unoptimized
              className="object-contain object-center"
            />
          </div>
          {/* Text */}
          <div className="flex flex-col justify-center px-8 md:px-16 py-16 lg:py-20">
            <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow mb-3">
              Meet the Founder
            </span>
            <h2 className="font-display text-3xl md:text-[38px] font-semibold text-black leading-tight mb-6">
              Built by Someone Who Loves This City
            </h2>
            <p className="text-gray-dark text-base md:text-[17px] leading-relaxed mb-5">
              After 25 years working in real estate and marketing across Atlanta, Mellanda Reese kept seeing the same thing: incredible local businesses doing amazing work but staying invisible. At the same time, Atlantans wanted a trusted source &mdash; somewhere to find out what&rsquo;s worth their time.
            </p>
            <p className="text-gray-dark text-base md:text-[17px] leading-relaxed mb-8">
              ATL Vibes &amp; Views was created to bridge that gap. It&rsquo;s a platform where the community can discover what&rsquo;s happening across the city &mdash; the developments, the openings, the events, the culture &mdash; all told through authentic storytelling rooted in trust and local insight.
            </p>
            <div>
              <p className="font-display text-2xl font-semibold text-black">
                Mellanda Reese
              </p>
              <p className="text-gray-mid text-sm uppercase tracking-wide mt-1">
                Founder &amp; CEO
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== NEWSLETTER CTA ========== */}
      <NewsletterBlock
        heading="Never Miss a Vibe"
        description="Get the latest on Atlanta's neighborhoods, events, dining, and culture delivered to your inbox. No spam. Unsubscribe anytime."
      />

      {/* ========== BREADCRUMB JSON-LD ========== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://atlvibesandviews.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "About",
              },
            ],
          }),
        }}
      />
    </>
  );
}
