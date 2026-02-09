"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, type ReactNode } from "react";
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
   HELPERS
   ============================================================ */
function pluralize(count: number, noun: [string, string]) {
  return count === 1 ? noun[0] : noun[1];
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

  /* Active tag (for tag pills) */
  const activeTag = currentFilters.tag ?? "";

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
        <form onSubmit={handleSearch} className="relative max-w-[640px] mb-4">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-mid"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={config.searchPlaceholder}
            className="w-full py-3 pl-11 pr-4 text-sm border-2 border-[#e6c46d] rounded-full outline-none bg-white placeholder:text-gray-mid"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                pushFilters({ q: undefined });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-mid hover:text-black"
            >
              <X size={14} />
            </button>
          )}
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
            <option value="">All Tiers</option>
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

        {/* Tag pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((t) => (
              <button
                key={t.id}
                onClick={() =>
                  pushFilters({
                    tag: activeTag === t.slug ? undefined : t.slug,
                  })
                }
                className={`px-3.5 py-1 text-[11px] font-semibold border rounded-full cursor-pointer transition-all ${
                  activeTag === t.slug
                    ? "bg-[#fee198] border-[#fee198] text-black"
                    : "bg-white border-gray-200 text-gray-dark hover:border-[#e6c46d]"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ========== 4. FEATURED (Premium only) ========== */}
      {featuredBusinesses.length > 0 && (
        <section className="site-container pb-12">
          <div className="flex items-end justify-between border-b border-gray-200 pb-4 mb-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-red-brand">
                Featured
              </span>
              <h2 className="font-display text-4xl lg:text-[36px] font-semibold leading-[1.1] mt-1">
                {config.featuredTitle}
              </h2>
            </div>
            <span className="text-xs text-gray-mid pb-1">
              {featuredBusinesses.length} {pluralize(featuredBusinesses.length, config.featuredCountNoun)}
            </span>
          </div>
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
            <div className="flex items-end justify-between border-b border-gray-200 pb-4 mb-8">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-red-brand">
                  {config.gridEyebrow}
                </span>
                <h2 className="font-display text-4xl lg:text-[36px] font-semibold leading-[1.1] mt-1">
                  More to Explore
                </h2>
              </div>
              <span className="text-xs text-gray-mid pb-1">
                {totalGridCount} {pluralize(totalGridCount, config.gridCountNoun)}
              </span>
            </div>

            {gridBusinesses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {gridBusinesses.slice(0, visibleCount).map((biz) => (
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
                    />
                  ))}
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

          {/* Sidebar (server-rendered via children) */}
          {children}
        </div>
      </section>

      {/* ========== 8. HORIZONTAL AD ========== */}
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="w-full h-[120px] bg-gray-light border border-dashed border-gray-mid flex items-center justify-center">
          <span className="text-[11px] text-gray-mid uppercase tracking-widest">
            Ad — Horizontal
          </span>
        </div>
      </div>

      {/* ========== 9. NEWSLETTER (FINAL) ========== */}
      <section className="bg-black py-16 mt-12">
        <div className="site-container text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#e6c46d]">
            Stay in the Loop
          </span>
          <h2 className="font-display text-4xl text-white mt-2 mb-3">
            Atlanta in Your Inbox
          </h2>
          <p className="text-white/60 text-sm max-w-[420px] mx-auto mb-8 leading-relaxed">
            {config.newsletterDescription}
          </p>
          <div className="max-w-lg mx-auto">
            <form
              className="flex items-center bg-white rounded-full overflow-hidden shadow-sm border border-gray-200"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter Your Email"
                className="flex-1 px-6 py-4 text-sm outline-none bg-transparent placeholder:text-gray-mid"
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-[0.08em] rounded-full mr-1 hover:text-[#fee198] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
