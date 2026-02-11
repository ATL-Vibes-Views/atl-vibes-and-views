import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PartnerFAQ } from "@/components/partner/PartnerFAQ";

export const metadata: Metadata = {
  title: "Marketing Services",
  description:
    "Full-service marketing for Atlanta businesses. SEO, website design, social media management, and paid advertising that actually drives results.",
};

/* ============================================================
   FAQ data
   ============================================================ */
const FAQ_ITEMS = [
  {
    question: "What types of businesses do you work with?",
    answer:
      "Local businesses, service providers, restaurants, retail, wellness, real estate\u2014basically any Atlanta business that wants to grow their online presence and get more customers. If you serve Atlanta, we can help.",
  },
  {
    question: "Do you offer one-time projects or only retainers?",
    answer:
      "Both. Need a website built? That\u2019s a project. Want ongoing SEO and social media management? That\u2019s a retainer. We\u2019ll figure out what makes sense for your situation.",
  },
  {
    question: "How long does it take to see results?",
    answer:
      "Depends on the service. Paid ads can generate leads within days. SEO typically takes 3\u20136 months to see significant movement. Social media growth is ongoing. We\u2019ll set realistic expectations upfront.",
  },
  {
    question: "What makes you different from other agencies?",
    answer:
      "We\u2019re local, we\u2019re hands-on, and we\u2019re not trying to lock you into a 12-month contract. Plus, we have built-in media reach through ATL Vibes & Views\u2014something most marketing agencies can\u2019t offer.",
  },
  {
    question: "How much does it cost?",
    answer:
      "It varies based on scope. We have options for small businesses and larger projects. Book a call and we\u2019ll give you a clear quote\u2014no surprises, no hidden fees.",
  },
  {
    question: "Can you help with just one thing, like SEO?",
    answer:
      "Absolutely. You don\u2019t have to buy a full package. If you just need SEO, or just need a website, or just need social media help\u2014we can do that. We\u2019ll recommend what makes sense, but you decide.",
  },
];

/* ============================================================
   Service card data
   ============================================================ */
const SERVICES = [
  {
    title: "Social Media",
    tagline: "Content That Connects",
    desc: "Strategy, content creation, and management that grows your following and turns followers into customers.",
    image:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800",
    alt: "Social Media Management",
  },
  {
    title: "Website Design",
    tagline: "Built to Convert",
    desc: "Clean, fast, mobile-friendly websites with booking systems, automations, and everything you need to run your business online.",
    image:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
    alt: "Website Design",
  },
  {
    title: "SEO, AEO & Local Search",
    tagline: "Get Found Everywhere",
    desc: "Rank higher on Google, show up in AI answers, and dominate local maps. Get discovered by customers however they search.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    alt: "SEO, AEO & Local Search",
  },
  {
    title: "Paid Advertising",
    tagline: "Targeted Reach",
    desc: "Google Ads, Meta Ads, and targeted campaigns that put your business in front of the right people at the right time.",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800",
    alt: "Paid Advertising",
  },
];

/* ============================================================
   Additional services data
   ============================================================ */
const ADDITIONAL = [
  {
    icon: "\uD83C\uDFA8",
    title: "Brand Strategy",
    desc: "Positioning, messaging, and visual identity that sets you apart.",
  },
  {
    icon: "\uD83D\uDCF8",
    title: "Content Creation",
    desc: "Photography, video, graphics, and copy that tells your story.",
  },
  {
    icon: "\u2699\uFE0F",
    title: "Business Automation",
    desc: "Booking systems, email sequences, and workflows that save you time.",
  },
  {
    icon: "\uD83D\uDCCA",
    title: "Analytics & Reporting",
    desc: "Clear dashboards and insights so you always know what\u2019s working.",
  },
];

export default function MarketingPage() {
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative min-h-[80vh] flex items-center justify-center text-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600"
          alt="Team collaboration"
          fill
          unoptimized
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-[900px] px-5">
          <p className="font-body text-sm font-semibold tracking-[3px] uppercase text-[#fee198] mb-5">
            Storytelling Meets Strategy
          </p>
          <h1 className="font-display text-[42px] md:text-hero-xl font-bold text-white leading-[1.1] mb-6">
            Marketing With an <em>Editorial</em> Edge
          </h1>
          <p className="text-lg md:text-xl text-white leading-relaxed mb-10 max-w-[700px] mx-auto">
            We&rsquo;re not just a media company&mdash;we&rsquo;re a marketing
            agency that knows how to build brands. The same editorial lens we
            use to grow ATL Vibes &amp; Views? We bring it to your business.
            From social media to SEO, we help Atlanta brands connect with their
            community and actually get noticed.
          </p>
          <Link
            href="/partner/contact"
            className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-[15px] tracking-[0.5px] px-9 py-4 hover:bg-[#c1121f] hover:text-white transition-all"
          >
            Let&rsquo;s Talk
          </Link>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="bg-[#f8f8f8] py-16 px-5">
        <div className="site-container">
          <p className="font-display text-[22px] md:text-[28px] font-normal text-gray-dark leading-relaxed text-center max-w-[900px] mx-auto">
            From{" "}
            <strong className="text-[#c1121f] font-bold">
              social media and content creation
            </strong>{" "}
            to{" "}
            <strong className="text-[#c1121f] font-bold">
              website builds, SEO, and paid ads
            </strong>
            &mdash;we handle the marketing so you can focus on running your
            business.
          </p>
        </div>
      </section>

      {/* ========== VALUE PROPS ========== */}
      <section className="py-20 md:py-24 bg-white px-5">
        <div className="site-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-[50px] max-w-[1100px] mx-auto">
            {/* Data-Driven */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center text-5xl">
                {"\uD83D\uDCCA"}
              </div>
              <h3 className="font-display text-[28px] font-semibold text-black mb-4">
                Data-Driven Decisions
              </h3>
              <p className="text-base text-[#676767] leading-relaxed">
                We don&rsquo;t guess. Every strategy is backed by research,
                analytics, and a clear understanding of what moves the needle
                for your business.
              </p>
            </div>
            {/* Local Expertise */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center text-5xl">
                {"\uD83C\uDFAF"}
              </div>
              <h3 className="font-display text-[28px] font-semibold text-black mb-4">
                Local Market Expertise
              </h3>
              <p className="text-base text-[#676767] leading-relaxed">
                We know Atlanta. The neighborhoods, the trends, the competition.
                That local knowledge shapes everything we do for your brand.
              </p>
            </div>
            {/* Full-Service */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center text-5xl">
                {"\uD83D\uDD27"}
              </div>
              <h3 className="font-display text-[28px] font-semibold text-black mb-4">
                Full-Service Execution
              </h3>
              <p className="text-base text-[#676767] leading-relaxed">
                Strategy is great, but execution wins. We don&rsquo;t just hand
                you a plan&mdash;we build it, run it, and optimize it alongside
                you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SERVICES SECTION ========== */}
      <section className="bg-white">
        {/* Header */}
        <div className="text-center py-16 md:py-20 px-5">
          <p className="font-body text-sm font-semibold tracking-[3px] uppercase text-[#c1121f] mb-4">
            What We Do
          </p>
          <h2 className="font-display text-section-sm md:text-[42px] font-semibold text-black leading-[1.2] mb-5">
            Marketing Services That Drive Results
          </h2>
          <p className="text-lg text-[#676767] leading-relaxed max-w-[700px] mx-auto">
            Whether you need to get found online, build a better website, or
            grow your social presence&mdash;we&rsquo;ve got you covered.
          </p>
        </div>

        {/* Service cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {SERVICES.map((svc) => (
            <div
              key={svc.title}
              className="group relative h-[50vh] md:h-[75vh] min-h-[350px] md:min-h-[500px] overflow-hidden cursor-pointer"
            >
              <Image
                src={svc.image}
                alt={svc.alt}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Default dark overlay, red on hover */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-[#c1121f]/85 transition-colors duration-300" />
              {/* Card content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
                <h3 className="font-display text-[28px] md:text-[32px] font-bold text-white leading-[1.2] mb-2">
                  {svc.title}
                </h3>
                <span className="text-sm text-[#fee198] font-semibold tracking-[1px] mb-4">
                  {svc.tagline}
                </span>
                <p className="text-[15px] text-white leading-relaxed max-w-[280px] opacity-0 translate-y-5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 md:block">
                  {svc.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Services CTA */}
        <div className="text-center py-16 px-5">
          <Link
            href="/partner/contact"
            className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-lg tracking-[0.5px] px-12 py-5 hover:bg-[#c1121f] hover:text-white transition-all"
          >
            Get a Free Consultation
          </Link>
        </div>
      </section>

      {/* ========== WE ALSO HANDLE ========== */}
      <section className="py-20 bg-[#f8f8f8] px-5">
        <div className="site-container">
          <div className="text-center mb-12">
            <h2 className="font-display text-section-sm md:text-section font-semibold text-black">
              We Also Handle
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-[1100px] mx-auto">
            {ADDITIONAL.map((item) => (
              <div key={item.title} className="text-center py-8 px-5">
                <div className="text-5xl text-[#c1121f] mb-5">{item.icon}</div>
                <h4 className="font-display text-card font-semibold text-black mb-3">
                  {item.title}
                </h4>
                <p className="text-[15px] text-[#676767] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PARTNER SPLIT SECTION ========== */}
      <section className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[550px]">
          {/* Image */}
          <div className="relative h-[350px] md:h-auto">
            <Image
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200"
              alt="Marketing team collaboration"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          {/* Text */}
          <div className="flex flex-col justify-center px-5 py-12 md:px-16 md:py-20">
            <h2 className="font-display text-section-sm md:text-[38px] font-semibold text-black leading-[1.2] mb-6">
              Your Marketing Team&mdash;
              <em className="text-[#c1121f]">Without</em> the Overhead
            </h2>
            <p className="text-[17px] text-gray-dark leading-relaxed mb-6">
              Hiring in-house is expensive. Agencies that don&rsquo;t understand
              your market are frustrating. We&rsquo;re the middle
              ground&mdash;experienced marketers who know Atlanta, work as an
              extension of your team, and actually care about your results.
            </p>
            <p className="text-[17px] text-gray-dark leading-relaxed mb-8">
              Whether you need a one-time project or ongoing support,
              we&rsquo;ll build a plan that fits your goals and your budget.
            </p>
            <div className="text-center md:text-left">
              <Link
                href="/partner/contact"
                className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-[15px] tracking-[0.5px] px-9 py-4 hover:bg-[#c1121f] hover:text-white transition-all"
              >
                Book a Call
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CASE STUDY ========== */}
      <section className="relative h-[500px] flex items-center justify-center text-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=1600"
          alt="Tattoo studio"
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative z-10 max-w-[800px] px-5">
          <p className="font-body text-sm font-semibold tracking-[3px] uppercase text-[#fee198] mb-5">
            Inked by J
          </p>
          <h2 className="font-display text-section-sm md:text-[42px] font-semibold text-white leading-[1.2] mb-8">
            From Chaos to Fully Booked
          </h2>
          <p className="text-white text-lg mb-8 max-w-[600px] mx-auto">
            How we helped a tattoo artist streamline operations, automate
            booking, and grow to 4,000+ followers.
          </p>
          <Link
            href="/partner/case-studies/inked-by-j"
            className="text-[#fee198] font-semibold text-base tracking-[1px] border-b-2 border-[#fee198] pb-1 hover:text-white hover:border-white transition-all"
          >
            Read the Case Study
          </Link>
        </div>
      </section>

      {/* ========== TESTIMONIAL ========== */}
      <section className="py-20 md:py-24 bg-white text-center px-5">
        <div className="site-container">
          <div className="text-5xl text-[#c1121f] mb-8">&#10077;</div>
          <p className="font-display text-[22px] md:text-[28px] font-normal italic text-gray-dark leading-relaxed max-w-[800px] mx-auto mb-8">
            &ldquo;Before working with them, my business was chaos.
            Appointments coming from everywhere, clients frustrated, me
            stressed. Now? Everything runs smooth. Clients book online, get
            reminders automatically, and I can actually focus on my craft. Game
            changer.&rdquo;
          </p>
          <p className="font-body text-sm font-semibold tracking-[2px] uppercase text-[#676767]">
            Inked by J
          </p>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <PartnerFAQ title="Common Questions" items={FAQ_ITEMS} />

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-24 md:py-32 text-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600"
          alt="Team working together"
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#c1121f]/90" />
        <div className="relative z-10 site-container">
          <h2 className="font-display text-section-sm md:text-[52px] font-bold text-white mb-8">
            Ready to Grow Your Business?
          </h2>
          <Link
            href="/partner/contact"
            className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-[15px] tracking-[0.5px] px-9 py-4 hover:bg-white transition-all"
          >
            Get Started
          </Link>
        </div>
      </section>
    </>
  );
}
