import Link from "next/link";
import Image from "next/image";

/* ============================================================
   PartnerFooter — Minimal footer for /partner/* microsite
   ============================================================ */

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com/atlvibesandviews",
    icon: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/3-Feb-02-2026-02-20-07-5320-AM.png",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@atlvibesandviews",
    icon: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/4-Feb-02-2026-02-20-07-5174-AM.png",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@livinginAtlanta-MellandaReese",
    icon: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/2-Feb-02-2026-02-20-07-5587-AM.png",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/atlvibesandviews",
    icon: "https://244168309.fs1.hubspotusercontent-na2.net/hubfs/244168309/5-Feb-02-2026-02-20-07-4558-AM.png",
  },
];

export function PartnerFooter() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-10 px-5">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-5 text-center">
        <span className="text-sm font-bold uppercase tracking-[3px]">
          ATL Vibes &amp; Views
        </span>
        <div className="flex items-center gap-5">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <Image
                src={s.icon}
                alt={s.label}
                width={20}
                height={20}
                unoptimized
              />
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
