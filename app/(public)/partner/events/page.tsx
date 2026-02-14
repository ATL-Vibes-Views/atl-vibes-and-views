import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PartnerFAQ } from "@/components/partner/PartnerFAQ";
import { PartnerSidebar } from "@/components/partner/PartnerSidebar";

export const metadata: Metadata = {
  title: "Event Partnerships",
  description:
    "Signature partnerships and custom activations that connect brands with Atlanta's community through meaningful experiences.",
};

/* ============================================================
   Signature Partnership cards data
   ============================================================ */
const SIGNATURE_PARTNERSHIPS = [
  {
    title: "NextUp ATL",
    tagline: "Empowering Atlanta\u2019s Next Generation of Entrepreneurs",
    description:
      "Workshops, panels, and networking experiences focused on building, scaling, and sustaining businesses across the city.",
    partnerFit:
      "Ideal partners: Education brands, entrepreneurship platforms, small business and workforce development organizations",
    image:
      "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/businessmen-and-businesswomen-making-a-corporate-p-2026-01-08-23-50-03-utc.jpg",
  },
  {
    title: "Brick by Brick",
    tagline: "Building Communities Through Homeownership",
    description:
      "Educational experiences for first-time homebuyers featuring trusted local housing, finance, and real estate experts.",
    partnerFit:
      "Ideal partners: Housing, financial services, real estate, and community-focused brands",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
  },
  {
    title: "Joy the ATL Way",
    tagline: "Spreading Joy, Connection & Kindness",
    description:
      "A seasonal giving initiative supporting Atlanta families during the holidays through intentional acts of service and generosity.",
    partnerFit:
      "Ideal partners: Consumer brands, nonprofit organizations, and community impact initiatives",
    image:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800",
  },
];

/* ============================================================
   How Our Events Work cards data
   ============================================================ */
const VALUE_PROPS = [
  {
    title: "Purpose-Driven Experiences",
    description:
      "Every event begins with intention \u2014 whether the goal is education, celebration, or community engagement. No filler. Just meaningful moments with lasting relevance.",
    image:
      "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/cheerful-woman-speaking-on-a-microphone-in-a-works-2026-01-07-23-20-25-utc.jpg",
  },
  {
    title: "Seamless Brand Integration",
    description:
      "Our partners are integrated into the experience \u2014 not placed on the sidelines. Sponsorships feel natural, aligned, and authentic to the audience.",
    image:
      "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800",
  },
  {
    title: "Built-In Amplification",
    description:
      "With 600K+ monthly reach, each experience is amplified before, during, and after the event across social media, editorial coverage, and community channels \u2014 extending impact far beyond the room.",
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
  },
];

/* ============================================================
   FAQ items
   ============================================================ */
const FAQ_ITEMS = [
  {
    question: "How do event partnerships work?",
    answer:
      "We match your brand with the right initiative based on your goals and audience. From there, we collaborate on sponsorship levels, activations, and integration\u2014making sure your brand shows up authentically throughout the experience.",
  },
  {
    question:
      "Can I sponsor a single event or do I need a long-term commitment?",
    answer:
      "Both options are available. You can sponsor a single activation or sign on for a recurring partnership across multiple events. We\u2019ll build a plan that fits your budget and timeline.",
  },
  {
    question: "What\u2019s included in a sponsorship?",
    answer:
      "Depends on the level, but typically: logo placement, social media promotion, on-site presence, email features, and content creation. We customize packages based on what you\u2019re trying to achieve.",
  },
  {
    question: "How far in advance should I reach out?",
    answer:
      "Ideally 6-8 weeks before an event to allow time for planning and promotion. For larger activations or custom events, the earlier the better.",
  },
  {
    question: "Can you create a custom event for my brand?",
    answer:
      "Absolutely. If our signature initiatives aren\u2019t the right fit, we can build something from scratch\u2014launch parties, pop-ups, community activations, whatever moves the needle for your brand.",
  },
  {
    question: "How do I find out about upcoming events?",
    answer:
      "Follow us on Instagram @atlvibesandviews, subscribe to our newsletter, or reach out directly. We\u2019ll keep you in the loop on what\u2019s coming up and where your brand might fit.",
  },
];

export default function PartnerEventsPage() {
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative h-[70vh] md:h-[80vh] lg:h-[85vh] flex items-center justify-center overflow-hidden text-center">
        <Image
          src="https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/happy-black-woman-dancing-with-her-friends-at-open-2026-01-09-11-30-41-utc.jpg"
          alt="Happy woman dancing with friends at an outdoor Atlanta event"
          fill
          unoptimized
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-[900px] px-5">
          <p className="font-body text-sm font-semibold uppercase tracking-[3px] text-white mb-5">
            More Than Moments
          </p>
          <h1 className="font-display text-[32px] md:text-[44px] lg:text-[52px] font-bold text-white leading-[1.1] mb-6">
            Experiences That <em>Move</em> Atlanta
          </h1>
          <p className="text-lg md:text-[22px] text-white leading-relaxed max-w-[750px] mx-auto mb-10">
            ATL Vibes &amp; Views creates culturally relevant experiences that
            connect brands and communities across Atlanta.
          </p>
          <Link
            href="/partner/contact"
            className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-[17px] px-10 py-[18px] rounded-full hover:bg-[#c1121f] hover:text-white transition-all"
          >
            Become a Partner
          </Link>
        </div>
      </section>

      {/* ========== SIDEBAR + CONTENT GRID ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <PartnerSidebar />
        <main className="min-w-0">
          {/* ========== HOW OUR EVENTS SHOW UP ========== */}
          <section className="bg-[#f8f8f8] py-14 md:py-16 px-5">
            <div className="max-w-[900px] mx-auto">
              <p className="font-body text-[13px] font-semibold uppercase tracking-[2px] text-[#c1121f] mb-6">
                How Our Events Show Up in the City
              </p>
              <div className="border-l-4 border-[#c1121f] pl-8">
                <p className="font-display text-[22px] md:text-[28px] font-medium text-black leading-[1.5]">
                  We host community-led events rooted in culture, education, and
                  impact, and collaborate with brands through sponsorships and custom
                  experiences that feel natural to the city.
                </p>
              </div>
            </div>
          </section>

          {/* ========== HOW OUR EVENTS WORK ========== */}
          <section className="py-20 md:py-24 bg-white px-5">
            <div className="site-container">
              <div className="text-center mb-12 md:mb-14">
                <h2 className="font-display text-section-sm md:text-section font-semibold text-black">
                  How Our Events Work
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
                {VALUE_PROPS.map((card) => (
                  <div
                    key={card.title}
                    className="group relative h-[350px] md:h-[450px] overflow-hidden flex items-end"
                  >
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-400 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                    <div className="relative z-10 p-8 md:p-10 text-white">
                      <h3 className="font-display text-[28px] md:text-[32px] font-semibold leading-tight mb-4">
                        {card.title}
                      </h3>
                      <p className="text-base text-white/90 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========== SIGNATURE PARTNERSHIPS ========== */}
          <section className="bg-[#f8f8f8]">
            <div className="text-center pt-20 pb-14 md:pt-24 md:pb-16 px-5">
              <p className="font-body text-[13px] font-semibold uppercase tracking-[2px] text-[#c1121f] mb-4">
                ATL Vibes &amp; Views&ndash;Hosted Experiences
              </p>
              <h2 className="font-display text-section-sm md:text-section font-semibold text-black leading-tight mb-3">
                Signature Partnerships
              </h2>
              <p className="text-lg md:text-[19px] text-[#555] max-w-[700px] mx-auto leading-relaxed">
                Our signature partnerships are ATL Vibes &amp; Views&ndash;led
                events designed for ongoing collaboration with brands committed to
                Atlanta&rsquo;s growth, culture, and communities.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3">
              {SIGNATURE_PARTNERSHIPS.map((card) => (
                <div
                  key={card.title}
                  className="group relative h-[50vh] md:h-[75vh] min-h-[350px] md:min-h-[500px] overflow-hidden cursor-pointer"
                >
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-[#c1121f]/85 transition-colors duration-300" />
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 md:px-8 text-center">
                    <h3 className="font-display text-[28px] md:text-[32px] font-bold text-white leading-tight mb-3">
                      {card.title}
                    </h3>
                    <span className="text-[15px] text-[#fce198] font-semibold tracking-wide mb-4">
                      {card.tagline}
                    </span>
                    <p className="text-base text-white leading-relaxed max-w-[280px] mb-4 opacity-100 md:opacity-0 md:translate-y-5 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300">
                      {card.description}
                    </p>
                    <span className="text-[13px] text-[#fce198] font-semibold opacity-100 md:opacity-0 md:translate-y-5 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 delay-100">
                      {card.partnerFit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center py-14 md:py-16">
              <Link
                href="/partner/contact"
                className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-lg px-12 py-5 rounded-full hover:bg-[#c1121f] hover:text-white transition-all"
              >
                Become a Partner
              </Link>
            </div>
          </section>

          {/* ========== BRAND-LED ACTIVATIONS ========== */}
          <section className="bg-white">
            <div className="text-center pt-20 pb-12 md:pt-24 md:pb-14 px-5">
              <p className="font-body text-[13px] font-semibold uppercase tracking-[2px] text-[#c1121f] mb-4">
                Brand-Led Activations
              </p>
              <h2 className="font-display text-[32px] md:text-section font-semibold text-black mb-5">
                Your Brand, <em className="text-[#c1121f]">Their</em> Experience
              </h2>
              <p className="text-lg md:text-[19px] text-[#555] max-w-[700px] mx-auto leading-relaxed">
                We collaborate with brands to create story-driven experiences that
                make them part of how Atlanta gathers, learns, and celebrates.
              </p>
            </div>
            <div className="w-full">
              <div className="group relative h-[50vh] md:h-[60vh] min-h-[400px] md:min-h-[450px] overflow-hidden cursor-pointer">
                <Image
                  src="https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/group-of-diverse-people-with-store-grand-opening-b-2026-01-07-23-31-16-utc.jpg"
                  alt="Custom Activations"
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-[#c1121f]/85 transition-colors duration-300" />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 md:px-8 text-center">
                  <h3 className="font-display text-[28px] md:text-[32px] font-bold text-white leading-tight mb-3">
                    Custom Activations
                  </h3>
                  <span className="text-[15px] text-[#fce198] font-semibold tracking-wide mb-4">
                    Your Vision. Our Execution.
                  </span>
                  <p className="text-base text-white leading-relaxed max-w-[280px] mb-4 opacity-100 md:opacity-0 md:translate-y-5 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300">
                    Product launches, pop-ups, and one-off experiences built around
                    your goals &mdash; designed and executed in collaboration with
                    ATL Vibes &amp; Views.
                  </p>
                  <span className="text-[13px] text-[#fce198] font-semibold opacity-100 md:opacity-0 md:translate-y-5 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 delay-100">
                    Ideal partners: Brands ready to make a meaningful and memorable
                    impact in Atlanta
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center py-14 md:py-16">
              <Link
                href="/partner/contact"
                className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-lg px-12 py-5 rounded-full hover:bg-[#c1121f] hover:text-white transition-all"
              >
                Let&rsquo;s Talk
              </Link>
            </div>
          </section>

          {/* ========== FAQ ========== */}
          <PartnerFAQ title="Partnership Questions" items={FAQ_ITEMS} />

          {/* ========== FINAL CTA ========== */}
          <section className="relative py-24 md:py-32 text-center overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600"
              alt="Atlanta event celebration"
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#c1121f]/90" />
            <div className="relative z-10 site-container">
              <h2 className="font-display text-section-sm md:text-[60px] font-bold text-white mb-4">
                Ready to Show Up for Atlanta?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-9">
                Let&rsquo;s build something people remember.
              </p>
              <Link
                href="/partner/contact"
                className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-[17px] px-10 py-[18px] rounded-full hover:bg-white hover:text-[#1a1a1a] transition-all"
              >
                Become a Partner
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
