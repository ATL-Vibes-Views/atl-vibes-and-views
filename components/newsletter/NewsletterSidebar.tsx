import Link from "next/link";
import type { NewsletterColorConfig } from "./NewsletterColorMap";
import ServerAdPlacement from "@/components/ads/AdPlacement";

/* ============================================================
   NEWSLETTER SIDEBAR — Desktop only
   1. Color Legend (type dot + name + frequency)
   2. 300×600 Vertical Ad Placeholder
   3. "Get Featured" Partner CTA
   ============================================================ */

interface NewsletterSidebarProps {
  types: {
    name: string;
    color: NewsletterColorConfig;
  }[];
}

export function NewsletterSidebar({ types }: NewsletterSidebarProps) {
  return (
    <aside className="hidden lg:block w-full lg:w-[320px] space-y-8">
      {/* ── Color Legend ── */}
      <div className="border border-gray-100 p-5">
        <h4 className="font-display text-card-sm font-semibold mb-4">
          Newsletter Types
        </h4>
        <ul className="space-y-3">
          {types.map((t) => (
            <li key={t.name} className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: t.color.borderColor }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-dark font-medium block truncate">
                  {t.color.label}
                </span>
                <span className="text-[10px] text-gray-mid uppercase tracking-eyebrow">
                  {t.color.frequency}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── 300×600 Vertical Ad ── */}
      <ServerAdPlacement placementKey="NEWSLETTER_SIDEBAR_01" variant="sidebar" />

      {/* ── Get Featured CTA ── */}
      <div className="bg-[#1a1a1a] p-6">
        <h4 className="font-display text-lg font-semibold text-white mb-2">
          Get Featured
        </h4>
        <p className="text-sm text-white/70 mb-4 leading-relaxed">
          Interested in being featured in our newsletters? Reach Atlanta&rsquo;s
          most engaged local audience.
        </p>
        <Link
          href="/partner"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#f5d87a] transition-colors"
        >
          Learn More
        </Link>
      </div>
    </aside>
  );
}
