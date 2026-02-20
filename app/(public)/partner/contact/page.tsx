import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";
import { PartnerContactForm } from "@/components/partner/PartnerContactForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with ATL Vibes & Views. Ready to tell your story, plan a partnership, or just curious about what we do? We'd love to hear from you.",
  openGraph: {
    title: "Contact",
    description: "Get in touch with ATL Vibes & Views. Ready to tell your story, plan a partnership, or just curious about what we do? We'd love to hear from you.",
  },
};

/* ============================================================
   Social links data
   ============================================================ */
const TikTokIcon = ({ size = 16, ...props }: { size?: number; [key: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z" />
  </svg>
);

const SOCIALS = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/atlvibesandviews" },
  { icon: Twitter, label: "X", href: "https://x.com/atlvibes_views" },
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@livinginAtlanta-MellandaReese" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/atlvibesandviews" },
  { icon: TikTokIcon, label: "TikTok", href: "https://tiktok.com/@atlvibesandviews" },
];

export default function PartnerContactPage() {
  return (
    <>
      {/* ========== HERO — full height to match other partner pages ========== */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-[80vh] min-h-[340px] max-h-[640px] flex items-center justify-center text-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600"
          alt="Contact ATL Vibes & Views"
          fill
          unoptimized
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-5 max-w-[700px]">
          <p className="font-body text-sm font-semibold uppercase tracking-[3px] text-[#fee198] mb-5">
            Get in Touch
          </p>
          <h1 className="font-display text-[32px] md:text-[44px] lg:text-[56px] font-normal italic text-white leading-[1.15] mb-6">
            Let&rsquo;s Connect
          </h1>
          <p className="text-base md:text-lg text-white/80 font-light leading-relaxed mb-10 max-w-[540px] mx-auto">
            Ready to tell your story, plan a partnership, or just curious about
            what we do? We&rsquo;d love to hear from you.
          </p>
          <a
            href="#contact-form"
            className="inline-block bg-[#fee198] text-[#1a1a1a] font-semibold text-base px-10 py-4 rounded-full hover:bg-white transition-all"
          >
            Send a Message
          </a>
        </div>
      </section>

      {/* ========== CONTACT SECTION — NO sidebar ========== */}
      <section id="contact-form" className="py-16 md:py-20 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 max-w-[1100px] mx-auto px-5">
          {/* --- Form Column --- */}
          <div>
            <h2 className="font-display text-section-sm md:text-[48px] font-bold text-black uppercase tracking-wide mb-4">
              Let&rsquo;s Connect.
            </h2>
            <p className="text-lg font-semibold text-black mb-5">
              Don&rsquo;t be a stranger!
            </p>
            <p className="text-base text-[#676767] leading-relaxed mb-10">
              Ready to tell your story, plan a partnership, or just curious about what we do? We&rsquo;d love to hear from you. Fill out the form below or drop us a line&mdash;we&rsquo;re here to connect and bring your ideas to life.
            </p>
            <PartnerContactForm />
          </div>

          {/* --- Info Column --- */}
          <div className="flex flex-col">
            {/* Map */}
            <div className="w-full h-[300px] mb-8">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3314.8876543210987!2d-84.3578!3d33.8485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f5051234567890%3A0xabcdef1234567890!2s3355%20Lenox%20Rd%20NE%20%23750%2C%20Atlanta%2C%20GA%2030326!5e0!3m2!1sen!2sus!4v1234567890123"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="ATL Vibes & Views office location"
              />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-black mb-4">
                  Contact
                </h3>
                <p className="text-[15px] font-semibold text-black mb-2">
                  ATL Vibes &amp; Views
                </p>
                <p className="text-[15px] text-gray-dark leading-relaxed mb-1">
                  3355 Lenox Rd, Ste 750
                  <br />
                  Atlanta, GA 30326
                </p>
                <p className="text-[15px]">
                  <Link
                    href="mailto:hello@atlvibesandviews.com"
                    className="text-gray-dark hover:text-[#c1121f] transition-colors"
                  >
                    hello@atlvibesandviews.com
                  </Link>
                </p>
              </div>

              {/* Follow Us */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-black mb-4">
                  Follow Us
                </h3>
                <p className="text-[15px] text-gray-dark leading-relaxed mb-3">
                  Stay in the loop with what we&rsquo;re up to across Atlanta.
                </p>
                <div className="flex gap-4">
                  {SOCIALS.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="text-[#676767] hover:text-[#c1121f] transition-colors"
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
