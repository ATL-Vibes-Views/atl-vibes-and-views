"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { AdPlacementClient } from "@/components/ads/AdPlacementClient";
import { NewsletterCard } from "./NewsletterCard";
import { NewsletterSidebar } from "./NewsletterSidebar";
import type { NewsletterCardData } from "./NewsletterCard";
import type { NewsletterColorConfig } from "./NewsletterColorMap";

/* ============================================================
   TYPES
   ============================================================ */

interface FilterTab {
  slug: string;
  name: string;
  count: number;
  color: NewsletterColorConfig;
}

interface NewsletterArchiveClientProps {
  newsletters: NewsletterCardData[];
  filterTabs: FilterTab[];
  sidebarTypes: { name: string; color: NewsletterColorConfig }[];
  currentFilters: {
    type?: string;
  };
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const ZONE_2_PAGE_SIZE = 9;

/* ============================================================
   COMPONENT
   ============================================================ */

export function NewsletterArchiveClient({
  newsletters,
  filterTabs,
  sidebarTypes,
  currentFilters,
}: NewsletterArchiveClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [zone2Visible, setZone2Visible] = useState(ZONE_2_PAGE_SIZE);

  const activeType = currentFilters.type ?? "";

  /* ── Switch filter type via URL ── */
  const switchType = useCallback(
    (slug: string) => {
      setZone2Visible(ZONE_2_PAGE_SIZE);
      const params = new URLSearchParams();
      if (slug) params.set("type", slug);
      startTransition(() => {
        router.push(
          `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
          { scroll: false }
        );
      });
    },
    [pathname, router]
  );

  /* ── Compute Zone 1 cards ── */
  let zone1Cards: NewsletterCardData[];

  if (!activeType) {
    /* "All" — show 1 per type (most recent of each) */
    const seenTypes = new Set<string>();
    zone1Cards = [];
    for (const nl of newsletters) {
      if (!seenTypes.has(nl.type_slug)) {
        seenTypes.add(nl.type_slug);
        zone1Cards.push(nl);
      }
      if (zone1Cards.length >= 6) break;
    }
  } else {
    /* Filtered — show 6 most recent of that type */
    zone1Cards = newsletters
      .filter((nl) => nl.type_slug === activeType)
      .slice(0, 6);
  }

  /* ── Compute Zone 2 cards ── */
  const filteredByType = activeType
    ? newsletters.filter((nl) => nl.type_slug === activeType)
    : newsletters;
  const totalForType = filteredByType.length;

  let zone2Header: string;
  let zone2Cards: NewsletterCardData[];

  if (!activeType) {
    /* "All" active — Past Editions = everything beyond the 6 one-per-type */
    const zone1Ids = new Set(zone1Cards.map((c) => c.id));
    zone2Header = "Past Editions";
    zone2Cards = newsletters.filter((nl) => !zone1Ids.has(nl.id));
  } else if (totalForType > 6) {
    /* >6 exist for this type — "Past Editions" (7+) */
    zone2Header = "Past Editions";
    zone2Cards = filteredByType.slice(6);
  } else {
    /* ≤6 exist — "You May Also Enjoy" from OTHER types */
    zone2Header = "You May Also Enjoy";
    zone2Cards = newsletters.filter((nl) => nl.type_slug !== activeType);
  }

  const zone2Visible_ = zone2Cards.slice(0, zone2Visible);
  const hasMoreZone2 = zone2Visible < zone2Cards.length;

  /* ── Filter count text ── */
  const filterCountText = !activeType
    ? `Showing ${zone1Cards.length} latest editions \u00b7 1 per type`
    : `Showing ${zone1Cards.length} edition${zone1Cards.length !== 1 ? "s" : ""} \u00b7 ${filterTabs.find((t) => t.slug === activeType)?.name ?? activeType}`;

  return (
    <>
      {/* ========== ZONE LABEL + FILTER TABS (full width) ========== */}
      <section className="site-container">
        {/* Zone 1 label */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-[0.15em]">
            Latest Editions
          </span>
          {isPending && (
            <div className="w-4 h-4 border-2 border-[#e6c46d] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            onClick={() => switchType("")}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              !activeType
                ? "bg-[#1a1a1a] text-white"
                : "bg-gray-100 text-gray-dark hover:bg-gray-200"
            }`}
          >
            All ({newsletters.length})
          </button>
          {filterTabs.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => switchType(tab.slug)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeType === tab.slug
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-gray-100 text-gray-dark hover:bg-gray-200"
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </div>

        {/* Filter count */}
        <p className="text-xs text-gray-mid mb-8">{filterCountText}</p>
      </section>

      {/* ========== ZONE 1 — LATEST EDITIONS + SIDEBAR ========== */}
      <section className="site-container pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-12">
          {/* Card grid */}
          <div className="min-w-0">
            {zone1Cards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {zone1Cards.map((card) => (
                  <NewsletterCard key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Mail size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-mid text-lg mb-4">
                  No newsletters found.
                </p>
                {activeType && (
                  <button
                    onClick={() => switchType("")}
                    className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-black hover:text-white transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <NewsletterSidebar types={sidebarTypes} />
        </div>
      </section>

      {/* ========== AD DIVIDER ========== */}
      <div className="bg-[#f3f4f6] border-t border-b border-[#e5e7eb] py-6 md:py-8">
        <div className="site-container flex justify-center">
          <AdPlacementClient placementKey="NEWSLETTER_INLINE_01" variant="inline" />
        </div>
      </div>

      {/* ========== ZONE 2 — PAST EDITIONS / CROSS-PROMO ========== */}
      {zone2Cards.length > 0 && (
        <section className="site-container py-12 md:py-16">
          {/* Zone 2 label */}
          <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-[0.15em] block mb-6">
            {zone2Header}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {zone2Visible_.map((card) => (
              <NewsletterCard key={card.id} card={card} />
            ))}
          </div>

          {/* Load More */}
          {hasMoreZone2 && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() =>
                  setZone2Visible((c) => c + ZONE_2_PAGE_SIZE)
                }
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-black hover:text-white transition-colors"
              >
                Load More
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
