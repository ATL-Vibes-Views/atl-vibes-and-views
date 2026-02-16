import Link from "next/link";
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";

/* ============================================================
   PartnerFooter — Minimal footer for /partner/* microsite
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

export function PartnerFooter() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-10 px-5">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-5 text-center">
        <span className="text-sm font-bold uppercase tracking-[3px]">
          ATL Vibes &amp; Views
        </span>
        <div className="flex items-center gap-5">
          {SOCIALS.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-white/60 hover:text-[#fee198] transition-colors"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
        <p className="text-[#666] text-xs">
          &copy; {new Date().getFullYear()} ATL Vibes &amp; Views. All rights
          reserved.
        </p>
        <Link
          href="/"
          className="text-[#fee198] text-xs font-semibold uppercase tracking-[1px] hover:text-white transition-colors"
        >
          Return to atlvibesandviews.com &rarr;
        </Link>
      </div>
    </footer>
  );
}
