"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Fragment, useCallback, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ChevronDown, ArrowRight, FileText } from "lucide-react";
import { RelatedStoryCard } from "@/components/ui/RelatedStoryCard";
import { AdBlock } from "@/components/ui/AdBlock";
import type { HeroPost } from "@/components/ui/HeroSection";
import { PH_DEFAULT } from "@/lib/placeholders";

/* ============================================================
   TYPES
   ============================================================ */

interface FilterArea {
  id: string;
  name: string;
  slug: string;
}

interface FilterCategory {
  slug: string;
  name: string;
}

interface StoryPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  is_featured: boolean;
  category_name: string | null;
  category_slug: string | null;
  neighborhood_name: string | null;
  neighborhood_slug: string | null;
  area_slug: string | null;
  author_name: string | null;
}

interface StoriesArchiveClientProps {
  initialPosts: StoryPost[];
  categories: FilterCategory[];
  areas: FilterArea[];
  contentType?: "news" | "guide";
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  heroType?: "image" | "video" | "post";
  videoUrl?: string;
  heroPost?: HeroPost | null;
  showTabs?: boolean;
  currentFilters: {
    category?: string;
    area?: string;
    neighborhood?: string;
    search?: string;
    pillar?: string;
  };
}

/* ============================================================
   HELPERS
   ============================================================ */

const PH_HERO = PH_DEFAULT;

/* ============================================================
   PILLAR TABS
   ============================================================ */

const PILLARS = [
  { label: "All", value: "" },
  { label: "City Watch", value: "news" },
  { label: "Atlanta Guide", value: "guide" },
] as const;

/* ============================================================
   STORIES ARCHIVE CLIENT
   ============================================================ */

export function StoriesArchiveClient({
  initialPosts,
  categories,
  areas,
  contentType,
  heroTitle,
  heroSubtitle,
  heroImage,
  heroType = "image",
  videoUrl,
  heroPost,
  showTabs = false,
  currentFilters,
}: StoriesArchiveClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(currentFilters.search ?? "");
  const [visibleCount, setVisibleCount] = useState(12);

  /* Push filter changes to URL → triggers server re-render */
  const pushFilters = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, val] of Object.entries(overrides)) {
        if (val && val.trim()) {
          params.set(key, val.trim());
        } else {
          params.delete(key);
        }
      }

      setVisibleCount(12);
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const switchPillar = useCallback(
    (pillarValue: string) => {
      setSearchValue("");
      setVisibleCount(12);
      const params = new URLSearchParams();
      if (pillarValue) params.set("pillar", pillarValue);
      startTransition(() => {
        router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
      });
    },
    [pathname, router]
  );

  const clearAllFilters = useCallback(() => {
    setSearchValue("");
    setVisibleCount(12);
    const params = new URLSearchParams();
    if (currentFilters.pillar) params.set("pillar", currentFilters.pillar);
    startTransition(() => {
      router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
    });
  }, [pathname, router, currentFilters.pillar]);

  const hasActiveFilters =
    currentFilters.category ||
    currentFilters.area ||
    currentFilters.neighborhood ||
    currentFilters.search;

  const activePillar = currentFilters.pillar ?? "";

  const visiblePosts = initialPosts.slice(0, visibleCount);
  const hasMore = visibleCount < initialPosts.length;

  /* ── Active filter labels for chips ── */
  const activeFilterChips: { key: string; label: string }[] = [];
  if (currentFilters.category) {
    const cat = categories.find((c) => c.slug === currentFilters.category);
    activeFilterChips.push({
      key: "category",
      label: `Category: ${cat?.name || currentFilters.category}`,
    });
  }
  if (currentFilters.area) {
    const area = areas.find((a) => a.slug === currentFilters.area);
    activeFilterChips.push({
      key: "area",
      label: `Area: ${area?.name || currentFilters.area}`,
    });
  }
  if (currentFilters.neighborhood) {
    activeFilterChips.push({
      key: "neighborhood",
      label: `Neighborhood: ${currentFilters.neighborhood}`,
    });
  }
  if (currentFilters.search) {
    activeFilterChips.push({
      key: "search",
      label: `Search: "${currentFilters.search}"`,
    });
  }

  return (
    <>
      {/* ========== HERO ========== */}
      {(() => {
        const effectiveType = heroType === "video" && videoUrl ? "video" : heroType === "post" && heroPost ? "post" : "image";
        const bgSrc = effectiveType === "post" ? (heroPost?.featured_image_url ?? PH_HERO) : (heroImage ?? PH_HERO);
        const heroContent = (
          <section className={`relative w-full h-[52vh] sm:h-[58vh] md:h-[65vh] min-h-[340px] max-h-[640px] overflow-hidden ${effectiveType === "post" ? "cursor-pointer group" : ""}`}>
            {effectiveType === "video" && videoUrl ? (
              <video src={videoUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <Image src={bgSrc} alt={effectiveType === "post" ? (heroPost?.title ?? heroTitle) : heroTitle} fill unoptimized priority className={`object-cover ${effectiveType === "post" ? "transition-transform duration-700 group-hover:scale-105" : ""}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex items-end">
              <div className="site-container pb-8 md:pb-10">
                {effectiveType === "post" && heroPost ? (
                  <>
                    {heroPost.category && (
                      <span className="inline-block bg-[#c1121f] text-white text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 mb-2">{heroPost.category}</span>
                    )}
                    <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-[1.05]">{heroPost.title}</h1>
                    {(heroPost.author || heroPost.published_at) && (
                      <p className="text-white/70 text-xs mt-1">
                        {heroPost.author ? `BY ${heroPost.author.toUpperCase()}` : ""}{heroPost.author && heroPost.published_at ? " · " : ""}{heroPost.published_at ? new Date(heroPost.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                      </p>
                    )}
                    <p className="text-white/70 text-sm mt-1">Read Story →</p>
                  </>
                ) : (
                  <>
                    <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 block">
                      {contentType === "news" ? "Atlanta News" : contentType === "guide" ? "Local Knowledge" : "Stories"}
                    </span>
                    <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-[1.05]">{heroTitle}</h1>
                    <p className="text-white/60 text-sm mt-2 max-w-lg">{heroSubtitle}</p>
                  </>
                )}
              </div>
            </div>
          </section>
        );
        return effectiveType === "post" && heroPost ? <Link href={`/stories/${heroPost.slug}`}>{heroContent}</Link> : heroContent;
      })()}

      {/* ========== TABS + FILTER BAR ========== */}
      <section className="site-container py-8 md:py-10">
        <div className="space-y-4">
          {/* Pillar tabs */}
          {showTabs && (
            <div className="flex items-center gap-6 border-b border-gray-200 mb-2">
              {PILLARS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => switchPillar(p.value)}
                  className={`pb-3 text-sm font-semibold transition-colors ${
                    activePillar === p.value
                      ? "text-black border-b-2 border-[#b89a5a]"
                      : "text-gray-mid hover:text-black"
                  }`}
                >
                  {p.label}
                </button>
              ))}

              {/* Loading spinner */}
              {isPending && (
                <div className="w-4 h-4 border-2 border-[#e6c46d] border-t-transparent rounded-full animate-spin ml-auto" />
              )}
            </div>
          )}

          {/* Search row */}
          <div className="relative w-full max-w-2xl">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-mid pointer-events-none"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") pushFilters({ search: searchValue });
              }}
              placeholder="Search ATL Vibes & Views..."
              className="w-full pl-11 pr-10 py-3 text-sm bg-white border-2 border-[#e6c46d] rounded-full outline-none focus:border-[#d4a94e] focus:shadow-[0_0_0_3px_rgba(230,196,109,0.2)] transition-all placeholder:text-gray-mid"
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("");
                  pushFilters({ search: undefined });
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-mid hover:text-black"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category */}
            {categories.length > 0 && (
              <div className="relative">
                <select
                  value={currentFilters.category ?? ""}
                  onChange={(e) =>
                    pushFilters({ category: e.target.value || undefined })
                  }
                  className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-sm text-gray-dark focus:border-[#e6c46d] focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid pointer-events-none"
                />
              </div>
            )}

            {/* Area */}
            {areas.length > 0 && (
              <div className="relative">
                <select
                  value={currentFilters.area ?? ""}
                  onChange={(e) =>
                    pushFilters({ area: e.target.value || undefined })
                  }
                  className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-sm text-gray-dark focus:border-[#e6c46d] focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="">All Areas</option>
                  {areas.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid pointer-events-none"
                />
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs font-semibold text-[#c1121f] hover:text-black transition-colors"
              >
                <X size={12} />
                Clear Filters
              </button>
            )}

            {/* Loading spinner (when no tabs) */}
            {!showTabs && isPending && (
              <div className="w-4 h-4 border-2 border-[#e6c46d] border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* Filter chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => {
                    if (chip.key === "search") setSearchValue("");
                    pushFilters({ [chip.key]: undefined });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-xs text-gray-dark font-medium hover:bg-gray-200 transition-colors"
                >
                  {chip.label}
                  <X size={12} />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== FULL-WIDTH STORIES GRID ========== */}
      <section className="site-container pb-16 md:pb-20">
        {/* Results count */}
        <div className="mb-6">
          <span className="text-xs text-gray-mid">
            {hasActiveFilters
              ? `${initialPosts.length} result${initialPosts.length !== 1 ? "s" : ""}`
              : `Showing ${Math.min(visibleCount, initialPosts.length)} of ${initialPosts.length} stories`}
          </span>
        </div>

        {visiblePosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {visiblePosts.map((post, index) => (
                <Fragment key={post.id}>
                  <div className={post.is_featured ? "border-l-4 border-[#b89a5a] pl-3" : ""}>
                    <RelatedStoryCard
                      post={{
                        slug: post.slug,
                        title: post.title,
                        featured_image_url: post.featured_image_url,
                        category_name: post.category_name,
                        published_at: post.published_at,
                        neighborhood_name: post.neighborhood_name,
                        neighborhood_slug: post.neighborhood_slug,
                        excerpt: post.excerpt,
                        is_featured: post.is_featured,
                      }}
                    />
                  </div>
                  {/* Inline ad banner after every 8th card */}
                  {(index + 1) % 8 === 0 && (
                    <div className="col-span-full my-4">
                      <AdBlock variant="inline" />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisibleCount((c) => c + 12)}
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
                >
                  Load More Stories
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-20">
            <FileText
              size={48}
              className="text-gray-300 mx-auto mb-4"
            />
            <p className="text-gray-mid text-lg mb-6">
              No stories found. Try a different search or filter.
            </p>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}
