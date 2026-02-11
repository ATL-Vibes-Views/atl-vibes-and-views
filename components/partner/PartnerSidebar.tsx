import Link from "next/link";

/* ============================================================
   PartnerSidebar — Redesigned sidebar for /partner/* microsite
   Desktop: sticky 280px left column
   Mobile: full-width, stacks above content
   ============================================================ */

const SIDEBAR_NAV = [
  { label: "Editorial Features", href: "/partner/editorial" },
  { label: "Event Partnerships", href: "/partner/events" },
  { label: "Marketing Services", href: "/partner/marketing" },
  { label: "About AVV Media", href: "/partner/about" },
] as const;

const STATS = [
  { value: "608K+", label: "Monthly Reach" },
  { value: "56K", label: "Followers" },
  { value: "100+", label: "Businesses Covered" },
] as const;

export function PartnerSidebar() {
  return (
    <aside className="w-full lg:w-[280px] shrink-0 bg-[#fafafa] border-b lg:border-b-0 lg:border-r border-[#e5e5e5] lg:sticky lg:top-[110px] lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto">
      <div className="p-6 lg:p-7 space-y-8">
        {/* ── Section 1: Navigation ── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#999] mb-5">
            Explore Partnerships
          </p>
          <ul className="space-y-0">
            {SIDEBAR_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 text-[14px] text-[#1a1a1a] py-3 border-b border-[#eee] hover:text-[#c1121f] transition-colors"
                >
                  <span className="text-[#c1121f] text-xs">&#10022;</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Section 2: Stats Widget ── */}
        <div className="bg-white border border-[#e5e5e5] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#999] mb-5">
            By the Numbers
          </p>
          <div className="space-y-0">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex items-center justify-between py-3 ${
                  i < STATS.length - 1 ? "border-b border-[#f0f0f0]" : ""
                }`}
              >
                <span className="font-display text-2xl font-bold text-[#1a1a1a]">
                  {stat.value}
                </span>
                <span className="text-[11px] uppercase tracking-[1px] text-[#999]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: Dark CTA Block ── */}
        <div className="bg-[#1a1a1a] p-6">
          <p className="font-display text-lg italic text-white mb-2">
            Ready to partner?
          </p>
          <p className="text-[13px] text-[#aaa] mb-5">
            Let&rsquo;s tell your Atlanta story together.
          </p>
          <Link
            href="/partner/contact"
            className="block w-full text-center bg-[#fee198] text-[#1a1a1a] text-[12px] font-bold uppercase tracking-[1px] px-5 py-3 rounded-full hover:bg-white transition-colors"
          >
            Talk to the Team
          </Link>
        </div>
      </div>
    </aside>
  );
}
