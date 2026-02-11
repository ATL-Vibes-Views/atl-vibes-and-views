import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PartnerFAQ } from "@/components/partner/PartnerFAQ";

export const metadata: Metadata = {
  title: "Editorial Partnerships",
  description:
    "Connect your brand with Atlanta's most engaged audiences through editorial storytelling, social media, and authentic local content.",
};

/* ============================================================
   FAQ data
   ============================================================ */
const FAQ_ITEMS = [
  {
    question: "How do I get my business featured?",
    answer:
      "Easy. Fill out our contact form or book a call. We\u2019ll learn about your business, your goals, and put together a plan that makes sense for your budget and timeline.",
  },
  {
    question: "What kind of businesses do you work with?",
    answer:
      "Restaurants, retail, wellness, events, real estate, local services\u2014if you serve Atlanta, we can help you reach Atlanta. We\u2019ve worked with everyone from new pop-ups to established institutions.",
  },
  {
    question: "Why does your audience trust you?",
    answer:
      "Because we\u2019re not a faceless media company. We live here, we\u2019re invested in the city, and we only feature things we\u2019d actually recommend. Our audience knows that\u2014and that\u2019s why they engage.",
  },
  {
    question: "What does a partnership look like?",
    answer:
      "It depends on your goals. Could be a social feature, newsletter spotlight, event coverage, or a full campaign across multiple channels. We\u2019ll build something custom based on what you need.",
  },
  {
    question: "Can you help grow my social following?",
    answer:
      "Yes. Giveaways, collaborations, and strategic features can convert our audience into your followers. We\u2019ve helped brands add thousands of engaged followers through smart campaigns.",
  },
  {
    question: "How much does it cost?",
    answer:
      "We have options for different budgets. Book a call and we\u2019ll walk you through packages\u2014no pressure, just information so you can decide what\u2019s right for your business.",
  },
];

/* ============================================================
   Value-prop cards data
   ============================================================ */
const VALUE_CARDS = [
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/Drivng%20through%20Atlantna%20at%20night.jpg",
    alt: "Driving through Atlanta at night",
    title: "We Know These Streets",
    desc: "We live here. We eat here. We know which neighborhoods are bubbling and which spots deserve shine. That local insight shapes every piece of content we create.",
  },
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/multiethnic-people-looking-funny-videos-on-smartph-2026-01-08-02-15-41-utc.jpg",
    alt: "Friends sharing content on phone",
    title: "Stories That Sound Like Friends",
    desc: "Nobody wants to read an ad. Our content feels like a recommendation from someone who actually went there\u2014because we did. That\u2019s why people trust what we share.",
  },
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/multiethnic-friends-enjoying-drinks-and-dancing-at-2026-01-08-22-34-14-utc.jpg",
    alt: "Friends enjoying drinks and dancing",
    title: "Beyond the Algorithm",
    desc: "Likes are nice, but foot traffic is better. We connect online buzz to real-world action through events, activations, and content that gets people off the couch.",
  },
];

/* ============================================================
   Channel cards data
   ============================================================ */
const CHANNELS = [
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/person-browsing-social-media-on-smartphone-indoors-2026-01-09-00-02-39-utc.jpg",
    alt: "Social Media",
    title: "Social Media",
    desc: "Instagram. TikTok. Reels that get saved and stories that get shared. We meet Atlantans where they\u2019re already scrolling.",
  },
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/friends-using-tablet-sharing-social-media-content-2026-01-09-11-35-45-utc.jpg",
    alt: "Newsletter",
    title: "Newsletter",
    desc: "Our weekly email hits inboxes with the best of what\u2019s happening. Prime real estate for brands that want direct access.",
  },
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/hands-of-an-african-man-working-with-his-laptop-2026-01-08-06-39-49-utc.jpg",
    alt: "Website",
    title: "Website",
    desc: "Guides, features, and neighborhood spotlights that Atlantans actually bookmark. Content that keeps working.",
  },
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/friends-sharing-a-mpobile-phone-2026-01-06-09-30-43-utc.jpg",
    alt: "SMS",
    title: "SMS",
    desc: "Straight to their phone. No algorithm, no inbox clutter. A direct line to locals who want to hear from us.",
  },
];

/* ============================================================
   Client logos data
   ============================================================ */
const LOGOS_ROW_1 = [
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/8-1.png",
    alt: "Google DevFest",
  },
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/Smorgasburg%20logo.png",
    alt: "Smorgasburg Atlanta",
  },
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/1-Feb-02-2026-03-39-46-4758-PM.png",
    alt: "NAMC",
  },
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/3-Feb-02-2026-03-39-46-4759-PM.png",
    alt: "Perkins and Will",
  },
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/6-Feb-02-2026-03-39-46-5284-PM.png",
    alt: "Playa Bowl",
  },
];

const LOGOS_ROW_2 = [
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/4-Feb-02-2026-03-39-46-5627-PM.png",
    alt: "Little Jars Bakeshop",
  },
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/5-Feb-02-2026-03-39-46-5248-PM.png",
    alt: "Dips Kitchen",
  },
  {
    src: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/2-Feb-02-2026-03-39-46-4751-PM.png",
    alt: "Pool Turtle Bar and Game Cove",
  },
];

/* ============================================================
   Page Component
   ============================================================ */
export default function EditorialPage() {
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative min-h-[80vh] flex items-center justify-center text-center overflow-hidden">
        <Image
          src="https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/people-on-the-go-keeping-in-contact-using-mobile-p-2026-01-09-09-27-14-utc.jpg"
          alt="People on the go keeping in contact"
          fill
          unoptimized
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-[900px] px-5">
          <p className="font-body text-sm font-semibold tracking-[3px] uppercase text-white mb-5">
            Where Atlanta Finds What&rsquo;s Next
          </p>
          <h1 className="font-display text-[42px] md:text-hero-xl font-bold leading-[1.1] text-white mb-6">
            Your Brand, <em>Their</em> Feed
          </h1>
          <p className="text-lg md:text-[22px] text-white leading-relaxed max-w-[700px] mx-auto mb-10">
            Atlanta moves fast. We help people keep up. Through independent
            editorial coverage and social storytelling, ATL Vibes &amp; Views
            puts businesses in front of the people already looking for their
            next favorite place, event, or experience.
          </p>
          <Link
            href="/partner/contact"
            className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-[17px] px-10 py-[18px] hover:bg-[#c1121f] hover:text-white transition-all"
          >
            Get Featured
          </Link>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="bg-[#f8f8f8] py-14 md:py-16 px-5 text-center">
        <div className="site-container">
          <p className="font-display text-[22px] md:text-[28px] font-normal text-gray-dark leading-relaxed">
            Every month,{" "}
            <strong className="text-[#c1121f] font-bold">
              608,000+ Atlantans
            </strong>{" "}
            scroll, click, and engage with our content.{" "}
            <strong className="text-[#c1121f] font-bold">
              56,000 followers
            </strong>{" "}
            trust us to show them what&rsquo;s worth their time. Your brand
            could be next.
          </p>
        </div>
      </section>

      {/* ========== WHY BRANDS CHOOSE US ========== */}
      <section className="py-20 md:py-24 px-5 bg-white">
        <div className="site-container">
          <div className="text-center mb-14">
            <h2 className="font-display text-section-sm md:text-[48px] font-semibold text-black">
              Why Brands Choose Us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1100px] mx-auto">
            {VALUE_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-white overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-300"
              >
                <div className="relative w-full h-[200px] md:h-[250px]">
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="px-7 py-8 text-center">
                  <h3 className="font-display text-card md:text-[28px] font-semibold text-black leading-[1.1] mb-4">
                    {card.title}
                  </h3>
                  <p className="text-[17px] text-[#555] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WE DON'T JUST POST -- WE POSITION ========== */}
      <section className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[550px]">
          {/* Image side */}
          <div className="relative h-[350px] md:h-auto">
            <Image
              src="https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/female-photographers-doing-food-photography-2026-01-08-07-54-53-utc.jpg"
              alt="Female photographers doing food photography"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          {/* Text side */}
          <div className="flex flex-col justify-center px-5 py-12 md:px-14 md:py-20">
            <h2 className="font-display text-section-sm md:text-[42px] font-semibold text-black leading-[1.2] mb-6">
              We Don&rsquo;t Just Post&mdash;We{" "}
              <em className="text-[#c1121f]">Position</em>
            </h2>
            <p className="text-lg text-gray-dark leading-[1.8] mb-6">
              When you partner with us, you&rsquo;re not buying an ad slot.
              You&rsquo;re becoming part of how Atlanta discovers what&rsquo;s
              new, what&rsquo;s good, and what&rsquo;s worth talking about.
            </p>
            <p className="text-lg text-gray-dark leading-[1.8] mb-8">
              We craft content that fits naturally into our audience&rsquo;s
              feed&mdash;the same way a friend would share a hot take on a new
              restaurant or a heads-up about a can&rsquo;t-miss event. Whether
              you&rsquo;re a local staple looking to reach new faces or a new
              business ready to make noise, we make sure the right people are
              paying attention.
            </p>
            <div className="text-center md:text-left">
              <Link
                href="/partner/contact"
                className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-[17px] px-10 py-[18px] hover:bg-[#c1121f] hover:text-white transition-all"
              >
                Let&rsquo;s Talk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CLIENT LOGOS ========== */}
      <section className="py-10 bg-[#f8f8f8] px-5">
        <div className="site-container">
          <p className="text-[13px] font-semibold text-[#c1121f] uppercase tracking-[2px] text-center mb-8">
            Brands We&rsquo;ve Featured
          </p>
          <div className="flex flex-col items-center gap-3">
            {/* Row 1 */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10">
              {LOGOS_ROW_1.map((logo) => (
                <Image
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  width={140}
                  height={140}
                  unoptimized
                  className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] object-contain opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-300"
                />
              ))}
            </div>
            {/* Row 2 */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10">
              {LOGOS_ROW_2.map((logo) => (
                <Image
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  width={140}
                  height={140}
                  unoptimized
                  className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] object-contain opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-300"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== CASE STUDY ========== */}
      <section className="relative h-[500px] flex items-center justify-center text-center overflow-hidden">
        <Image
          src="https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/SMORGASBURG.webp"
          alt="Smorgasburg Atlanta"
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-[800px] px-5">
          <p className="font-body text-sm font-semibold tracking-[3px] uppercase text-[#fee198] mb-5">
            The Smorgasburg Effect
          </p>
          <h2 className="font-display text-section-sm md:text-[46px] font-semibold text-white leading-[1.2] mb-8">
            We broke the news before they did&mdash;and their CEO&rsquo;s inbox
            paid the price
          </h2>
          <Link
            href="/partner/case-studies/smorgasburg"
            className="text-[#fee198] font-semibold text-[17px] tracking-[1px] border-b-2 border-[#fee198] pb-1 hover:text-white hover:border-white transition-all"
          >
            See What Happened
          </Link>
        </div>
      </section>

      {/* ========== CHANNELS ========== */}
      <section className="bg-white">
        {/* Channels header */}
        <div className="text-center pt-20 pb-14 px-5">
          <p className="font-body text-sm font-semibold tracking-[3px] uppercase text-[#c1121f] mb-4">
            How We Reach Atlanta
          </p>
          <h2 className="font-display text-section-sm md:text-[48px] font-semibold text-black leading-[1.2]">
            Multiple Channels. One Engaged Audience.
          </h2>
        </div>

        {/* Channel cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((channel) => (
            <div
              key={channel.title}
              className="group relative h-[50vh] md:h-[75vh] min-h-[300px] md:min-h-[500px] overflow-hidden cursor-pointer"
            >
              <Image
                src={channel.src}
                alt={channel.alt}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-[#c1121f]/85 transition-colors duration-300" />
              {/* Content */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-7 py-10 text-center">
                <h3 className="font-display text-[28px] md:text-[36px] font-bold text-white uppercase tracking-[2px] mb-4">
                  {channel.title}
                </h3>
                <p className="text-[17px] text-white leading-relaxed max-w-[280px] opacity-0 translate-y-5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 md:opacity-0 md:group-hover:opacity-100">
                  {channel.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Channels CTA */}
        <div className="text-center py-14 md:py-16">
          <Link
            href="/partner/contact"
            className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-lg px-12 py-5 hover:bg-[#c1121f] hover:text-white transition-all"
          >
            Get Featured
          </Link>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <PartnerFAQ
        title="Questions? We&rsquo;ve Got Answers."
        items={FAQ_ITEMS}
      />

      {/* ========== TESTIMONIAL ========== */}
      <section className="py-20 md:py-24 bg-white text-center px-5">
        <div className="site-container">
          <div className="text-[48px] text-[#c1121f] mb-8">&ldquo;</div>
          <p className="font-display text-card md:text-[30px] font-normal italic text-gray-dark leading-relaxed max-w-[800px] mx-auto mb-8">
            &ldquo;They posted about us before we even announced&mdash;and my
            inbox exploded. Vendor requests, partnership inquiries, all of it.
            The CEO called asking what happened. It was all ATL Vibes &amp;
            Views.&rdquo;
          </p>
          <p className="font-body text-[15px] font-semibold tracking-[2px] uppercase text-[#676767]">
            Paris, Smorgasburg Atlanta
          </p>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-24 md:py-32 text-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1600"
          alt="Atlanta event"
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#c1121f]/90" />
        <div className="relative z-10 site-container">
          <h2 className="font-display text-section-sm md:text-[60px] font-bold text-white mb-8">
            Ready to Get in Front of Atlanta?
          </h2>
          <Link
            href="/partner/contact"
            className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-[17px] px-10 py-[18px] hover:bg-white transition-all"
          >
            Let&rsquo;s Make It Happen
          </Link>
        </div>
      </section>
    </>
  );
}
