import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* ============================================================
   PartnerSidebar — Shared sidebar for /partner/* pages
   Contains: partner nav links, stats widget, CTA button
   ============================================================ */

const PARTNER_NAV = [
  { label: "Partner Home", href: "/partner" },
  { label: "Editorial", href: "/partner/editorial" },
  { label: "Events", href: "/partner/events" },
  { label: "Marketing", href: "/partner/marketing" },
  { label: "About", href: "/partner/about" },
  { label: "Contact", href: "/partner/contact" },
] as const;

const STATS = [
  { value: "120K+", label: "Monthly Reach" },
  { value: "50+", label: "Brand Partners" },
  { value: "200+", label: "Events Covered" },
] as const;

interface PartnerSidebarProps {
  activePath?: string;
}

export function PartnerSidebar({ activePath }: PartnerSidebarProps) {
  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="border border-gray-100 p-5">
        <h4 className="font-display text-card-sm font-semibold mb-4 text-[#c1121f]">
          Partner With Us
        </h4>
        <ul className="space-y-1.5">
          {PARTNER_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center justify-between text-sm py-1.5 transition-colors ${
                  activePath === item.href
                    ? "text-black font-semibold"
                    : "text-gray-dark hover:text-black"
                }`}
              >
                <span>{item.label}</span>
                <ArrowRight size={12} className="text-gray-mid" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Stats */}
      <div className="border border-gray-100 p-5">
        <h4 className="font-display text-card-sm font-semibold mb-4">
          By the Numbers
        </h4>
        <div className="space-y-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <span className="font-display text-2xl font-bold text-[#c1121f]">
                {stat.value}
              </span>
              <p className="text-xs text-gray-mid uppercase tracking-eyebrow mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#1a1a1a] p-5 text-white">
        <h4 className="font-display text-card-sm font-semibold text-white mb-2">
          Ready to Partner?
        </h4>
        <p className="text-sm text-white/70 mb-4">
          Let&rsquo;s create something impactful together.
        </p>
        <Link
          href="/partner/contact"
          className="block w-full text-center bg-[#fee198] text-[#1a1a1a] font-semibold text-sm uppercase tracking-wide px-6 py-3 hover:bg-[#f5d87a] transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
