"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Fragment, useCallback, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  ChevronDown,
  ArrowRight,
  Map as MapIcon,
  ChevronUp,
} from "lucide-react";
import { BusinessCard } from "@/components/ui/BusinessCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NewsletterBlock } from "@/components/ui/NewsletterBlock";
import { AdPlacementClient } from "@/components/ads/AdPlacementClient";
import { NewsletterWidget, SubmitCTA } from "@/components/Sidebar";

/* ============================================================
   TYPES
   ============================================================ */
interface FilterOption {
  id: string;
  name: string;
  slug: string;
}

interface FilterArea extends FilterOption {}
interface FilterNeighborhood extends FilterOption {
  area_id: string;
}

interface BusinessData {
  id: string;
  business_name: string;
  slug: string;
  tagline?: string;
  street_address?: string;
  city?: string;
  price_range?: string;
  tier?: string;
  logo?: string;
  latitude?: number;
  longitude?: number;
  neighborhood_id?: string;
  category_id?: string;
  created_at?: string;
  primary_image_url?: string;
  neighborhoods?: { name: string; slug: string } | null;
  categories?: { name: string; slug: string } | null;
}

interface MapBusiness {
  id: string;
  business_name: string;
  slug: string;
  latitude: number;
  longitude: number;
  tier?: string;
}

/* ============================================================
   HUB CONFIG — all text/labels that vary between hub pages
   ============================================================ */
export interface HubArchiveConfig {
  /** Detail page base route, e.g. "/places" or "/things-to-do" */
  detailBasePath: string;
  /** Search input placeholder, e.g. "Search businesses by name, address, or description…" */
  searchPlaceholder: string;
  /** Featured section title, e.g. "Premium Partners" */
  featuredTitle: string;
  /** Noun for featured count, e.g. ["business", "businesses"] */
  featuredCountNoun: [string, string];
  /** CTA heading, e.g. "Get Your Business Featured" */
  ctaTitle: string;
  /** CTA description */
  ctaDescription: string;
  /** Map toggle label noun, e.g. "Business Map" */
  mapToggleLabel: string;
  /** Map placeholder image src */
  mapImage: string;
  /** Map alt text */
  mapAlt: string;
  /** Grid section eyebrow, e.g. "Businesses" */
  gridEyebrow: string;
  /** Noun for grid count, e.g. ["business", "businesses"] */
  gridCountNoun: [string, string];
  /** Load more button label, e.g. "Load More Businesses" */
  loadMoreLabel: string;
  /** Empty state: "No {noun} match your current filters." */
  emptyNoun: string;
  /** Empty state submit prompt: "Know a great Atlanta {noun}?" */
  submitNoun: string;
  /** Newsletter description */
  newsletterDescription: string;
}

export interface HubArchiveClientProps {
  config: HubArchiveConfig;
  areas: FilterArea[];
  neighborhoods: FilterNeighborhood[];
  categories: FilterOption[];
  tags: FilterOption[];
  amenities: FilterOption[];
  identityOptions: FilterOption[];
  featuredBusinesses: BusinessData[];
  mapBusinesses: MapBusiness[];
  gridBusinesses: BusinessData[];
  totalGridCount: number;
  currentFilters: {
    q?: string;
    area?: string;
    neighborhood?: string;
    category?: string;
    tier?: string;
    tag?: string;
    amenity?: string;
    identity?: string;
  };
  children: ReactNode; // sidebar
}

/* ============================================================
   HUB ARCHIVE CLIENT COMPONENT
   ============================================================ */
export function HubArchiveClient({
  config,
  areas,
  neighborhoods,
  categories,
  tags,
  amenities,
  identityOptions,
  featuredBusinesses,
  mapBusinesses,
  gridBusinesses,
  totalGridCount,
  currentFilters,
  children,
}: HubArchiveClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /* --- Filter state --- */
  const [searchValue, setSearchValue] = useState(currentFilters.q ?? "");
  const [showMap, setShowMap] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  /* Cascading neighborhoods: filter by selected area */
  const filteredNeighborhoods = currentFilters.area
    ? neighborhoods.filter((n) => {
        const area = areas.find((a) => a.slug === currentFilters.area);
        return area ? n.area_id === area.id : true;
      })
    : neighborhoods;

  /* ---------- Push filters to URL ---------- */
  const pushFilters = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(overrides).forEach(([key, val]) => {
        if (val) {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams, startTransition]
  );

  /* ---------- Search submit ---------- */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    pushFilters({ q: searchValue || undefined });
  };

  /* ---------- Clear all filters ---------- */
  const clearAll = () => {
    setSearchValue("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasFilters = !!(
    currentFilters.q ||
    currentFilters.area ||
    currentFilters.neighborhood ||
    currentFilters.category ||
    currentFilters.tier ||
    currentFilters.tag ||
    currentFilters.amenity ||
    currentFilters.identity
  );

  return (
    <>
      {/* ========== 3. SEARCH + FILTERS ========== */}
      <section className="site-container pt-8 pb-10">
        {/* Search row */}
        <form onSubmit={handleSearch} className="relative max-w-[640px] mb-4 flex">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-mid"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={config.searchPlaceholder}
              className="w-full py-3 pl-11 pr-10 text-sm border-2 border-[#e6c46d] border-r-0 rounded-l-full outline-none bg-white placeholder:text-gray-mid"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");
                  pushFilters({ q: undefined });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid hover:text-black"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="shrink-0 px-5 bg-[#fee198] text-[#1a1a1a] hover:bg-[#f5d87a] transition-colors rounded-r-full"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </form>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Area */}
          <select
            value={currentFilters.area ?? ""}
            onChange={(e) =>
              pushFilters({
                area: e.target.value || undefined,
                neighborhood: undefined, // reset dependent
              })
            }
            className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-[13px] text-gray-dark cursor-pointer"
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Neighborhood */}
          <select
            value={currentFilters.neighborhood ?? ""}
            onChange={(e) =>
              pushFilters({ neighborhood: e.target.value || undefined })
            }
            className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-[13px] text-gray-dark cursor-pointer"
          >
            <option value="">All Neighborhoods</option>
            {filteredNeighborhoods.map((n) => (
              <option key={n.id} value={n.slug}>
                {n.name}
              </option>
            ))}
          </select>

          {/* Category */}
          {categories.length > 0 && (
            <select
              value={currentFilters.category ?? ""}
              onChange={(e) =>
                pushFilters({ category: e.target.value || undefined })
              }
              className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-[13px] text-gray-dark cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Tier */}
          <select
            value={currentFilters.tier ?? ""}
            onChange={(e) =>
              pushFilters({ tier: e.target.value || undefined })
            }
            className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-[13px] text-gray-dark cursor-pointer"
          >
            <option value="">All Listings</option>
            <option value="Premium">Premium</option>
            <option value="Standard">Standard</option>
            <option value="Free">Free</option>
          </select>

          {/* Amenities */}
          {amenities.length > 0 && (
            <select
              value={currentFilters.amenity ?? ""}
              onChange={(e) =>
                pushFilters({ amenity: e.target.value || undefined })
              }
              className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-[13px] text-gray-dark cursor-pointer"
            >
              <option value="">Amenities</option>
              {amenities.map((a) => (
                <option key={a.id} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>
          )}

          {/* Identity */}
          {identityOptions.length > 0 && (
            <select
              value={currentFilters.identity ?? ""}
              onChange={(e) =>
                pushFilters({ identity: e.target.value || undefined })
              }
              className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-[13px] text-gray-dark cursor-pointer"
            >
              <option value="">Identity</option>
              {identityOptions.map((i) => (
                <option key={i.id} value={i.slug}>
                  {i.name}
                </option>
              ))}
            </select>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <select
              value={currentFilters.tag ?? ""}
              onChange={(e) =>
                pushFilters({ tag: e.target.value || undefined })
              }
              className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-[13px] text-gray-dark cursor-pointer"
            >
              <option value="">All Tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-semibold text-red-brand hover:text-black transition-colors"
            >
              <X size={12} />
              Clear Filters
            </button>
          )}
        </div>

      </section>

      {/* ========== 4. FEATURED (Premium only) ========== */}
      {featuredBusinesses.length > 0 && (
        <section className="site-container pb-12">
          <SectionHeader
            eyebrow="Featured"
            title={config.featuredTitle}
            count={featuredBusinesses.length}
            countNoun={config.featuredCountNoun}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredBusinesses.map((biz) => (
              <BusinessCard
                key={biz.id}
                name={biz.business_name}
                slug={biz.slug}
                detailRoute={config.detailBasePath}
                imageUrl={biz.primary_image_url || biz.logo || undefined}
                category={biz.categories?.name}
                neighborhood={biz.neighborhoods?.name}
                neighborhoodSlug={biz.neighborhoods?.slug}
                address={biz.street_address}
                priceRange={biz.price_range}
                tier={biz.tier}
                showPremiumBadge
              />
            ))}
          </div>
        </section>
      )}

      {/* ========== 5. GET FEATURED CTA ========== */}
      <div className="site-container flex justify-center pb-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8 p-7 lg:px-10 border-2 border-[#e6c46d] bg-white max-w-[800px] w-full">
          <div>
            <h3 className="font-display text-[22px] font-semibold mb-1">
              {config.ctaTitle}
            </h3>
            <p className="text-[13px] text-gray-mid leading-relaxed">
              {config.ctaDescription}
            </p>
          </div>
          <Link
            href="/partner"
            className="inline-block px-6 py-2.5 bg-[#fee198] text-black text-[11px] font-semibold uppercase tracking-[0.1em] border-2 border-[#fee198] whitespace-nowrap hover:bg-black hover:text-[#fee198] hover:border-black transition-all"
          >
            Learn More →
          </Link>
        </div>
      </div>

      {/* ========== 6. MAP PLACEHOLDER ========== */}
      <section className="site-container pb-12">
        {/* Mobile toggle */}
        <button
          onClick={() => setShowMap(!showMap)}
          className="lg:hidden flex items-center gap-2 text-[13px] font-semibold mb-4"
        >
          <MapIcon size={16} />
          {showMap ? `Hide ${config.mapToggleLabel}` : `Show ${config.mapToggleLabel}`}
          {showMap ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className={`${showMap ? "block" : "hidden"} lg:block`}>
          <div className="relative w-full h-[280px] lg:h-[400px] bg-gray-200 overflow-hidden">
            <Image
              src={config.mapImage}
              alt={config.mapAlt}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="text-center bg-black/85 px-10 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white">
                  Interactive Map
                </p>
                <span className="text-xs text-white/60 block mt-1">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 7. GRID + SIDEBAR ========== */}
      <section className="site-container pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-9 lg:gap-16">
          {/* Main grid */}
          <div>
            <SectionHeader
              eyebrow={config.gridEyebrow}
              title="More to Explore"
              count={totalGridCount}
              countNoun={config.gridCountNoun}
            />

            {gridBusinesses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {gridBusinesses.slice(0, visibleCount).map((biz, index) => (
                    <Fragment key={biz.id}>
                      <BusinessCard
                        name={biz.business_name}
                        slug={biz.slug}
                        detailRoute={config.detailBasePath}
                        imageUrl={biz.primary_image_url || biz.logo || undefined}
                        category={biz.categories?.name}
                        neighborhood={biz.neighborhoods?.name}
                        neighborhoodSlug={biz.neighborhoods?.slug}
                        address={biz.street_address}
                        priceRange={biz.price_range}
                        tier={biz.tier}
                      />
                      {index === 5 && (
                        <div className="col-span-full lg:hidden my-4">
                          <NewsletterWidget />
                        </div>
                      )}
                      {index === 11 && (
                        <div className="col-span-full lg:hidden my-4">
                          <AdPlacementClient placementKey="HUB_INLINE_01" variant="inline" />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>

                {/* Mobile-only: SubmitCTA before Load More */}
                <div className="lg:hidden my-8">
                  <SubmitCTA />
                </div>

                {/* Load More */}
                {visibleCount < gridBusinesses.length && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={() => setVisibleCount((c) => c + 12)}
                      className="inline-flex items-center gap-2 px-8 py-3 border-2 border-black text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-all"
                    >
                      {config.loadMoreLabel}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty state */
              <div className="text-center py-16">
                <p className="text-gray-mid text-sm mb-4">
                  No {config.emptyNoun} match your current filters.
                </p>
                {hasFilters && (
                  <button
                    onClick={clearAll}
                    className="inline-block px-6 py-2.5 border-2 border-black text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-all mb-4"
                  >
                    Clear Filters
                  </button>
                )}
                <p className="text-gray-mid text-xs">
                  Know a great Atlanta {config.submitNoun}?{" "}
                  <Link
                    href="/submit"
                    className="text-red-brand hover:text-black underline"
                  >
                    Submit it here
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>

          {/* Sidebar (server-rendered via children, desktop only) */}
          <div className="hidden lg:block">
            {children}
          </div>
        </div>
      </section>

      {/* ========== 8. HORIZONTAL AD ========== */}
      <AdPlacementClient placementKey="HUB_HORIZONTAL_01" variant="horizontal" />

      {/* ========== 9. NEWSLETTER (FINAL) ========== */}
      <NewsletterBlock
        description={config.newsletterDescription}
        className="mt-12"
      />
    </>
  );
}
