"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

/* ============================================================
   PartnerHeader — Custom dark header for /partner/* microsite
   Replaces the global site header on partner routes.
   ============================================================ */

const NAV_LINKS = [
  { label: "Overview", href: "/partner" },
  { label: "Editorial", href: "/partner/editorial" },
  { label: "Events", href: "/partner/events" },
  { label: "Marketing", href: "/partner/marketing" },
  { label: "About", href: "/partner/about" },
  { label: "Contact", href: "/partner/contact" },
] as const;

export function PartnerHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/partner" ? pathname === "/partner" : pathname.startsWith(href);

  return (
    <div className="sticky top-0 z-[100]">
      {/* ── Top bar ── */}
      <div className="bg-[#111] px-4 md:px-6 py-2 flex items-center justify-between">
        <Link
          href="/"
          className="text-[#fee198] text-[11px] font-semibold uppercase tracking-[1px] hover:text-white transition-colors"
        >
          &larr; Back to ATL Vibes &amp; Views
        </Link>
        <span className="text-[#666] text-[11px] font-semibold uppercase tracking-[1px] hidden sm:block">
          Partner With Us
        </span>
      </div>

      {/* ── Main header row ── */}
      <div className="bg-[#1a1a1a] border-b-2 border-[#fee198] px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Branding */}
          <Link href="/partner" className="shrink-0">
            <span className="text-white font-bold text-sm md:text-base uppercase tracking-[3px] block leading-tight">
              ATL Vibes &amp; Views
            </span>
            <span className="text-[#fee198] text-[10px] md:text-[11px] uppercase tracking-[2px]">
              Media &amp; Partnership Hub
            </span>
          </Link>

          {/* Desktop nav (1024px+) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] xl:text-[12px] font-semibold uppercase tracking-[1.5px] py-2 border-b-2 transition-colors ${
                  isActive(link.href)
                    ? "text-[#fee198] border-[#fee198]"
                    : "text-[#ccc] border-transparent hover:text-[#fee198]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/partner/contact"
              className="bg-[#fee198] text-[#1a1a1a] text-[11px] font-bold uppercase tracking-[1.5px] px-5 py-2.5 rounded-full hover:bg-white transition-colors"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile hamburger (below 1024px) */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden flex flex-col justify-center gap-[5px] w-8 h-8"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-[2px] bg-[#fee198] transition-transform duration-200 ${
                mobileOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-[#fee198] transition-opacity duration-200 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-[#fee198] transition-transform duration-200 ${
                mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#1a1a1a] border-b-2 border-[#fee198]">
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-6 py-4 text-[12px] font-semibold uppercase tracking-[1.5px] border-b border-[#333] transition-colors ${
                  isActive(link.href)
                    ? "text-[#fee198]"
                    : "text-[#ccc] hover:text-[#fee198]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-6 py-5">
              <Link
                href="/partner/contact"
                className="block w-full text-center bg-[#fee198] text-[#1a1a1a] text-[12px] font-bold uppercase tracking-[1.5px] px-6 py-3.5 rounded-full hover:bg-white transition-colors"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
