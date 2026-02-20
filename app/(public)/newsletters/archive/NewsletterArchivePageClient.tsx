"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight, Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

/* ============================================================
   NEWSLETTER ARCHIVE PAGE CLIENT
   Mirrors MediaLibraryClient architecture:
   - Dark hero
   - Breadcrumbs
   - Search + filter tabs (URL-independent, client-side)
   - 4-col card grid → 2-col → 1-col
   - Load More
   ============================================================ */

interface NewsletterArchiveItem {
  id: string;
  slug: string;
  name: string;
  issue_date: string;
  subject_line: string;
  preview_text: string | null;
  featured_image_url: string | null;
  border_color: string;
  label_color: string;
  label: string;
  type_slug: string;
}

interface TypeTab {
  slug: string;
  label: string;
  count: number;
}

interface NewsletterArchivePageClientProps {
  items: NewsletterArchiveItem[];
  typeTabs: TypeTab[];
  totalCount: number;
}

const PAGE_SIZE = 12;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function NewsletterArchivePageClient({
  items,
  typeTabs,
  totalCount,
}: NewsletterArchivePageClientProps) {
  const [activeType, setActiveType] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const searchLower = searchValue.trim().toLowerCase();

  /* Filter */
  const filtered = items.filter((item) => {
    if (activeType !== "all" && item.type_slug !== activeType) return false;
    if (
      searchLower &&
      !item.subject_line.toLowerCase().includes(searchLower) &&
      !(item.preview_text ?? "").toLowerCase().includes(searchLower) &&
      !item.name.toLowerCase().includes(searchLower)
    )
      return false;
    return true;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleTypeChange = (slug: string) => {
    setActiveType(slug);
    setVisibleCount(PAGE_SIZE);
  };

  const clearSearch = () => {
    setSearchValue("");
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      {/* ========== DARK HERO ========== */}
      <section className="bg-[#1a1a1a] pt-10 pb-10">
        <div className="site-container text-center">
          <span className="text-[#fee198] text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 block">
            Newsletter Archive
          </span>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-[1.05] mb-2">
            Every Edition
          </h1>
          <p className="text-white/60 text-sm max-w-lg mx-auto">
            Browse every past ATL Vibes &amp; Views newsletter — briefs, dining
            guides, development updates, and more.
          </p>
        </div>
      </section>

      {/* ========== BREADCRUMBS ========== */}
      <div className="site-container pt-5 pb-2">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Newsletters", href: "/newsletters" },
            { label: "Archive" },
          ]}
        />
      </div>

      {/* ========== FILTER BAR ========== */}
      <section className="site-container py-6 md:py-8">
        <div className="space-y-4">
          {/* Filter tabs — horizontal scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide flex-nowrap">
            <button
              onClick={() => handleTypeChange("all")}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeType === "all"
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-gray-100 text-gray-dark hover:bg-gray-200"
              }`}
            >
              All ({totalCount})
            </button>
            {typeTabs.map((tab) => (
              <button
                key={tab.slug}
                onClick={() => handleTypeChange(tab.slug)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeType === tab.slug
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-gray-100 text-gray-dark hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full max-w-2xl">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-mid pointer-events-none"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Search newsletters…"
              className="w-full pl-11 pr-10 py-3 text-sm bg-white border-2 border-[#e6c46d] rounded-full outline-none focus:border-[#d4a94e] focus:shadow-[0_0_0_3px_rgba(230,196,109,0.2)] transition-all placeholder:text-gray-mid"
            />
            {searchValue && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-mid hover:text-black"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========== RESULT COUNT ========== */}
      <div className="site-container mb-6">
        <span className="text-xs text-gray-mid">
          Showing {Math.min(visible.length, filtered.length)} of {filtered.length}{" "}
          {filtered.length === 1 ? "edition" : "editions"}
        </span>
      </div>

      {/* ========== GRID ========== */}
      <section className="site-container pb-16 md:pb-20">
        {visible.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visible.map((item) => (
                <NewsletterCard key={item.id} item={item} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-black hover:text-white transition-colors"
                >
                  Load More
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Mail size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-mid text-lg">
              {searchLower
                ? `No results for "${searchValue}". Try a different search.`
                : "No newsletters found."}
            </p>
            {(searchLower || activeType !== "all") && (
              <button
                onClick={() => {
                  setSearchValue("");
                  setActiveType("all");
                  setVisibleCount(PAGE_SIZE);
                }}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-black hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </section>
    </>
  );
}

/* ============================================================
   NEWSLETTER CARD
   ============================================================ */

function NewsletterCard({ item }: { item: NewsletterArchiveItem }) {
  return (
    <Link
      href={`/newsletters/${item.slug}`}
      className="group block border border-gray-200 hover:shadow-md transition-all overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: item.border_color }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#1a1a1a]">
        {item.featured_image_url ? (
          <Image
            src={item.featured_image_url}
            alt={item.subject_line || item.name}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display italic text-2xl text-white/10">
              Newsletter
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <span
          className="text-[10px] font-semibold uppercase tracking-eyebrow block mb-1.5"
          style={{ color: item.label_color }}
        >
          {item.label}
        </span>
        <h3 className="font-display text-[16px] font-bold text-black leading-snug group-hover:text-[#c1121f] transition-colors line-clamp-2">
          {item.subject_line || item.name}
        </h3>
        {item.preview_text && (
          <p className="text-[12px] text-gray-mid line-clamp-2 mt-1">
            {item.preview_text}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-mid">
            {formatDate(item.issue_date)}
          </span>
          <ArrowRight
            size={14}
            className="text-gray-400 group-hover:text-[#c1121f] group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>
    </Link>
  );
}
