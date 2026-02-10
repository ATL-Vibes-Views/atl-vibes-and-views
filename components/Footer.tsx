"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Twitter, Youtube, Instagram, Send } from "lucide-react";

const TikTokIcon = ({ size = 16, ...props }: { size?: number; [key: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z" />
  </svg>
);

const NEIGHBORHOOD_LINKS = [
  { name: "Buckhead", href: "/areas/buckhead" },
  { name: "Midtown", href: "/areas/midtown" },
  { name: "Downtown", href: "/areas/downtown" },
  { name: "Eastside", href: "/areas/eastside" },
  { name: "Westside", href: "/areas/westside" },
];

const EXPLORE_LINKS = [
  { name: "All Businesses", href: "/hub/businesses" },
  { name: "Events", href: "/hub/events" },
  { name: "Eats & Drinks", href: "/hub/eats-and-drinks" },
  { name: "Things to Do", href: "/hub/things-to-do" },
  { name: "Atlanta Guide", href: "/hub/atlanta-guide" },
];

const COMPANY_LINKS = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Partner / Advertise", href: "/partner" },
  { name: "Submit a Listing", href: "/submit" },
  { name: "Privacy Policy", href: "/privacy" },
];

const SOCIAL_LINKS = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/atlvibesandviews" },
  { icon: Twitter, label: "X", href: "https://x.com/atlvibes_views" },
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@livinginAtlanta-MellandaReese" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/atlvibesandviews" },
  { icon: TikTokIcon, label: "TikTok", href: "https://tiktok.com/@atlvibesandviews" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: Connect to newsletter service (Mailchimp, ConvertKit, etc.)
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setEmail(""); }, 3000);
  };

  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Main footer — generous vertical padding */}
      <div className="site-container py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">

          {/* Column 1 — Brand + Social + Newsletter */}
          <div className="lg:col-span-1">
            <Link href="/" className="block mb-5">
              <div className="font-logo text-xl font-bold tracking-wide text-white">ATL VIBES &amp; VIEWS</div>
              <div className="text-[10px] tracking-[0.15em] text-white/50 mt-1 uppercase">The City. The Culture. The Conversation.</div>
            </Link>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mb-8">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold-light transition-colors" aria-label={label}>
                  <Icon size={18} />
                </a>
              ))}
            </div>

            {/* CHANGE #10 — Newsletter: submit works, arrow icon is WHITE */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Stay in the Loop</h4>
              {submitted ? (
                <p className="text-gold-light text-sm py-3">Thanks for subscribing! ✓</p>
              ) : (
                <form className="flex items-stretch" onSubmit={handleSubmit}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                    className="flex-1 min-w-0 px-4 py-3 bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/30 outline-none focus:border-gold-light/50 transition-colors rounded-l-full"
                  />
                  <button
                    type="submit"
                    className="shrink-0 px-5 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-r-full"
                    aria-label="Subscribe"
                  >
                    <Send size={14} className="text-[#fee198]" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2 — Neighborhoods */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-eyebrow text-white/40 mb-6">Neighborhoods</h4>
            <ul className="space-y-3.5">
              {NEIGHBORHOOD_LINKS.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-gold-light transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Explore */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-eyebrow text-white/40 mb-6">Explore</h4>
            <ul className="space-y-3.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-gold-light transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-eyebrow text-white/40 mb-6">Company</h4>
            <ul className="space-y-3.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-gold-light transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="site-container py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} ATL Vibes &amp; Views. All rights reserved.</p>
          <a href="https://avv-media.com" target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-gold-light transition-colors">
            Site by AVV Media
          </a>
        </div>
      </div>
    </footer>
  );
}
