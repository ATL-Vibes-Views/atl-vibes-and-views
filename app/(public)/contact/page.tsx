import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { GeneralContactForm } from "@/components/GeneralContactForm";

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z" />
  </svg>
);

export const metadata: Metadata = {
  title: "Contact Us | ATL Vibes & Views",
  description:
    "Get in touch with ATL Vibes & Views — story tips, business listing help, press inquiries, and general questions.",
  openGraph: {
    title: "Contact Us | ATL Vibes & Views",
    description:
      "Get in touch with ATL Vibes & Views — story tips, business listing help, press inquiries, and general questions.",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/contact",
  },
};

/* ============================================================
   Social links
   ============================================================ */
const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com/atlvibesandviews", icon: Facebook },
  { label: "X", href: "https://x.com/atlvibes_views", icon: Twitter },
  { label: "YouTube", href: "https://www.youtube.com/@livinginAtlanta-MellandaReese", icon: Youtube },
  { label: "Instagram", href: "https://instagram.com/atlvibesandviews", icon: Instagram },
  { label: "TikTok", href: "https://tiktok.com/@atlvibesandviews", icon: TikTokIcon },
];

export default function ContactPage() {
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative w-full h-[30vh] sm:h-[35vh] min-h-[240px] max-h-[400px] overflow-hidden bg-[#1a1a1a]" style={{ backgroundImage: "url(/images/default-hero.png)", backgroundSize: "cover", backgroundPosition: "center" }}>
        <Image
          src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600"
          alt="Get in touch"
          fill
          unoptimized
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow mb-4">
            Get in Touch
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-hero font-semibold text-white italic">
            We&rsquo;d Love to Hear From You
          </h1>
          <p className="text-white/70 text-sm mt-3 max-w-lg">
            Story tips, questions, business listings, press inquiries &mdash; we&rsquo;re here.
          </p>
        </div>
      </section>

      {/* ========== BREADCRUMBS ========== */}
      <div className="site-container pt-6 pb-2">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Contact" },
          ]}
        />
      </div>

      {/* ========== FORM + INFO ========== */}
      <section className="site-container py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 lg:gap-20">
          {/* --- Form Column --- */}
          <div>
            <h2 className="font-display text-3xl md:text-section-sm font-semibold text-black mb-3">
              Send Us a Message
            </h2>
            <p className="text-gray-mid text-sm leading-relaxed mb-8">
              Have a story tip, question, or just want to say hello? Fill out the form below and we&rsquo;ll get back to you.
            </p>
            <GeneralContactForm />
          </div>

          {/* --- Info Column --- */}
          <div className="space-y-10">
            {/* Contact Info */}
            <div>
              <h3 className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow mb-4">
                Contact Info
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-dark leading-relaxed">
                  <span className="font-semibold text-black block mb-1">
                    ATL Vibes &amp; Views
                  </span>
                  3355 Lenox Rd, Ste 750
                  <br />
                  Atlanta, GA 30326
                </p>
                <p className="text-sm">
                  <Link
                    href="mailto:hello@atlvibesandviews.com"
                    className="text-gray-dark hover:text-[#c1121f] transition-colors"
                  >
                    hello@atlvibesandviews.com
                  </Link>
                </p>
              </div>
            </div>

            {/* Reach Out About */}
            <div>
              <h3 className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow mb-4">
                Reach Out About
              </h3>
              <ul className="space-y-2 text-sm text-gray-dark">
                <li>&bull; Story tips &amp; news tips</li>
                <li>&bull; Business listing support</li>
                <li>&bull; Press &amp; media inquiries</li>
                <li>&bull; Partnership opportunities</li>
                <li>&bull; General questions</li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow mb-4">
                Follow Us
              </h3>
              <div className="flex gap-4">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="text-gray-dark hover:text-[#c1121f] transition-colors"
                  >
                    <s.icon size={22} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MAP ========== */}
      <section className="site-container pb-16 md:pb-24">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3314.8876543210987!2d-84.3578!3d33.8485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f5051234567890%3A0xabcdef1234567890!2s3355%20Lenox%20Rd%20NE%20%23750%2C%20Atlanta%2C%20GA%2030326!5e0!3m2!1sen!2sus!4v1234567890123"
          className="w-full h-[350px] md:h-[400px] border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="ATL Vibes & Views office — 3355 Lenox Rd, Atlanta"
        />
      </section>

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
                name: "Contact",
              },
            ],
          }),
        }}
      />
    </>
  );
}
