import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PartnerSidebar } from "@/components/partner/PartnerSidebar";

export const metadata: Metadata = {
  title: "About",
  description:
    "ATL Vibes & Views is Atlanta's media and marketing company helping businesses get visible and communities stay connected.",
  openGraph: {
    title: "About",
    description: "ATL Vibes & Views is Atlanta's media and marketing company helping businesses get visible and communities stay connected.",
  },
};

/* ============================================================
   Gallery images (duplicated for seamless infinite scroll)
   ============================================================ */
const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=800", alt: "Atlanta skyline" },
  { src: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800", alt: "Atlanta event" },
  { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800", alt: "Community gathering" },
  { src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800", alt: "Team collaboration" },
  { src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800", alt: "Atlanta culture" },
  { src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800", alt: "Business event" },
];

/* ============================================================
   Services data
   ============================================================ */
const SERVICES = [
  {
    title: "Communities",
    description:
      "We connect businesses with Atlanta's most engaged audiences through editorial storytelling and social media. Our content reaches 608K+ Atlantans monthly\u2014people actively looking for their next favorite spot, service, or experience.",
    href: "/partner/editorial",
  },
  {
    title: "Events",
    description:
      "Our signature partnerships and custom activations bring brands and communities together through meaningful experiences. From entrepreneur workshops to holiday giving initiatives, we create events that matter.",
    href: "/partner/events",
  },
  {
    title: "Marketing",
    description:
      "We\u2019re not just a media company\u2014we\u2019re a marketing agency that knows how to build brands. From social media and SEO to website design and paid ads, we help Atlanta businesses get found and get booked.",
    href: "/partner/marketing",
  },
];

/* ============================================================
   Stats data
   ============================================================ */
const STATS = [
  { number: "608K+", label: "Monthly Reach" },
  { number: "56K", label: "Followers" },
  { number: "100+", label: "Brands Featured" },
];

export default function PartnerAboutPage() {
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-[80vh] min-h-[340px] max-h-[640px] flex items-center justify-center text-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=1600"
          alt="Atlanta skyline"
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-5 max-w-[700px] mx-auto">
          <p className="font-body text-sm font-semibold uppercase tracking-[3px] text-[#fee198] mb-5">
            Who We Are
          </p>
          <h1 className="font-display text-[32px] md:text-[44px] lg:text-[56px] font-normal italic leading-[1.15] text-white mb-6">
            Atlanta&rsquo;s Story, Told Right
          </h1>
          <p className="text-base md:text-lg leading-[1.7] text-white/80 max-w-[600px] mx-auto mb-10">
            ATL Vibes &amp; Views is an independent media platform rooted in the
            culture, business, and community of Atlanta.
          </p>
          <Link
            href="#founder"
            className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-[15px] px-9 py-4 tracking-[0.5px] rounded-full hover:bg-white transition-all"
          >
            Meet the Team
          </Link>
        </div>
      </section>

      {/* ========== SIDEBAR + CONTENT GRID ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <PartnerSidebar />
        <main className="min-w-0">
          {/* ========== SCROLLING GALLERY ========== */}
          <section className="overflow-hidden py-10 bg-[#f8f8f8]">
            <div className="flex gap-5 animate-[scroll_30s_linear_infinite] w-max hover:[animation-play-state:paused]">
              {/* First set */}
              {GALLERY_IMAGES.map((img, i) => (
                <div
                  key={`a-${i}`}
                  className="relative w-[350px] h-[250px] md:w-[350px] md:h-[250px] shrink-0"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {GALLERY_IMAGES.map((img, i) => (
                <div
                  key={`b-${i}`}
                  className="relative w-[350px] h-[250px] md:w-[350px] md:h-[250px] shrink-0"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ========== MISSION ========== */}
          <section className="py-20 md:py-24 px-5 bg-white">
            <div className="max-w-[900px] mx-auto text-center">
              <h2 className="font-display text-section-sm md:text-[42px] font-semibold text-[#1a1a1a] leading-[1.2] mb-8">
                Helping Atlanta Businesses Get the Visibility They Deserve
              </h2>
              <p className="text-lg text-gray-dark leading-[1.8] mb-5">
                Too many businesses work incredibly hard and still stay invisible.
                They&rsquo;re so busy running day-to-day operations that marketing
                gets pushed to the bottom of the list&mdash;even though it&rsquo;s
                the one thing that can drive revenue and create breathing room.
              </p>
              <p className="text-lg text-gray-dark leading-[1.8]">
                We built ATL Vibes &amp; Views to break that cycle. By combining
                authentic storytelling with smart marketing strategy, we help
                businesses connect with the community and finally get noticed. At
                the same time, we give Atlantans a trusted source for what&rsquo;s
                happening in the city&mdash;the developments, the openings, the
                events, the culture.
              </p>
            </div>
          </section>

          {/* ========== STATS ========== */}
          <section className="py-20 px-5 bg-[#1a1a1a]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 max-w-[900px] mx-auto text-center">
              {STATS.map((stat) => (
                <div key={stat.label} className="p-5">
                  <p className="font-display text-[48px] md:text-[64px] font-bold text-[#fee198] leading-none mb-2">
                    {stat.number}
                  </p>
                  <p className="text-base text-white uppercase tracking-[2px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ========== SERVICES SHOWCASE (Sticky Scroll) ========== */}
          <section className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
              {/* Left — sticky panel */}
              <div className="relative md:sticky md:top-20 md:h-[calc(100vh-80px)] flex flex-col justify-center px-5 py-16 md:px-16">
                <p className="font-body text-sm font-semibold uppercase tracking-[3px] text-[#c1121f] mb-5">
                  Discover What We Can Do For You
                </p>
                <h2 className="font-display text-[28px] md:text-[36px] font-semibold text-[#1a1a1a] leading-[1.3]">
                  From editorial content to live events to full-service
                  marketing&mdash;we help businesses{" "}
                  <em className="text-[#c1121f]">grow</em>.
                </h2>
                <div className="relative w-full h-[250px] md:h-[300px] mt-10 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800"
                    alt="Our services"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Right — scrolling service items */}
              <div className="bg-[#f8f8f8] px-5 pb-16 md:px-16 md:py-24">
                {SERVICES.map((service, i) => (
                  <div
                    key={service.title}
                    className={`py-12 md:py-16 border-t border-[#dddddd] ${
                      i === SERVICES.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <h3 className="font-display text-[28px] md:text-[36px] font-semibold text-[#1a1a1a] mb-4">
                      {service.title}
                    </h3>
                    <p className="text-base text-[#676767] leading-[1.7]">
                      {service.description}
                    </p>
                    <Link
                      href={service.href}
                      className="inline-block mt-5 text-[#c1121f] font-semibold text-[15px] tracking-[0.5px] hover:text-[#1a1a1a] transition-colors"
                    >
                      See how we can help &rarr;
                    </Link>
                  </div>
                ))}

                {/* Services CTA */}
                <div className="pt-12">
                  <Link
                    href="/partner/contact"
                    className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-[15px] px-10 py-[18px] tracking-[0.5px] rounded-full hover:bg-[#c1121f] hover:text-white transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ========== FOUNDER ========== */}
          <section id="founder" className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px] md:max-h-[700px]">
              {/* Image */}
              <div className="relative h-[400px] md:h-auto bg-[#1a1a1a] overflow-hidden">
                <Image
                  src="https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/DSC03942.jpg"
                  alt="Mellanda Reese, Founder of ATL Vibes & Views"
                  fill
                  unoptimized
                  className="object-contain object-top"
                />
              </div>

              {/* Text */}
              <div className="flex flex-col justify-center px-5 py-12 md:px-16 md:py-20">
                <p className="font-body text-sm font-semibold uppercase tracking-[3px] text-[#c1121f] mb-4">
                  Meet the Founder
                </p>
                <h2 className="font-display text-section-sm md:text-[38px] font-semibold text-[#1a1a1a] leading-[1.2] mb-6">
                  25 Years of Watching Businesses Stay Invisible
                </h2>
                <p className="text-[17px] text-gray-dark leading-[1.8] mb-5">
                  After a 25-year career in real estate and marketing, I saw the
                  same story over and over: hardworking business owners who were
                  doing everything right&mdash;except getting noticed. They were
                  stuck on a hamster wheel, too busy with operations to prioritize
                  the one thing that could actually increase revenue and free up
                  their time: marketing.
                </p>
                <p className="text-[17px] text-gray-dark leading-[1.8] mb-5">
                  I also saw a gap in Atlanta. People wanted a trusted
                  source&mdash;somewhere to find out what&rsquo;s happening,
                  what&rsquo;s opening, what&rsquo;s worth their time. So I built
                  ATL Vibes &amp; Views to solve both problems: help businesses get
                  visible, and give the community a place to stay connected to the
                  city they love.
                </p>
                <p className="font-display text-card font-semibold text-[#1a1a1a] mt-5">
                  Mellanda Reese
                </p>
                <p className="text-sm text-[#676767] uppercase tracking-[2px]">
                  Founder &amp; CEO
                </p>
              </div>
            </div>
          </section>

          {/* ========== TESTIMONIAL ========== */}
          <section className="py-20 md:py-24 px-5 bg-[#f8f8f8] text-center">
            <div className="site-container">
              <p className="text-5xl text-[#c1121f] mb-8">&ldquo;</p>
              <p className="font-display text-[22px] md:text-[28px] font-normal italic text-gray-dark leading-[1.6] max-w-[800px] mx-auto mb-8">
                &ldquo;Working with ATL Vibes &amp; Views completely changed our
                visibility in the Atlanta market. Their post generated incredible
                buzz, and we saw an immediate spike in traffic and inquiries. They
                truly understand how to connect businesses with this
                community.&rdquo;
              </p>
              <p className="font-body text-sm font-semibold uppercase tracking-[2px] text-[#676767]">
                Jaylen Murray
              </p>
            </div>
          </section>

          {/* ========== FINAL CTA ========== */}
          <section className="relative py-24 md:py-32 px-5 text-center overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=1600"
              alt="Atlanta skyline"
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#c1121f]/90" />
            <div className="relative z-10 site-container">
              <h2 className="font-display text-[36px] md:text-[52px] font-bold text-white mb-8">
                Ready to Get Visible in Atlanta?
              </h2>
              <Link
                href="/partner/contact"
                className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-[15px] px-9 py-4 tracking-[0.5px] rounded-full hover:bg-white transition-all"
              >
                Let&rsquo;s Talk
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
