"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Fragment, useCallback, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ChevronDown, MapPin, ArrowRight, FileText } from "lucide-react";
import { RelatedStoryCard } from "@/components/ui/RelatedStoryCard";
import type { RelatedPost } from "@/components/ui/RelatedStoryCard";
import { NewsletterWidget, SubmitCTA } from "@/components/Sidebar";
import { AdBlock } from "@/components/ui/AdBlock";

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
  sidebar: React.ReactNode;
  currentFilters: {
    category?: string;
    area?: string;
    neighborhood?: string;
    search?: string;
  };
}

/* ============================================================
   HELPERS
   ============================================================ */

const PH_HERO = "https://placehold.co/1920x600/1a1a1a/e6c46d?text=Stories";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
  sidebar,
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

  const clearAllFilters = useCallback(() => {
    setSearchValue("");
    setVisibleCount(12);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const hasActiveFilters =
    currentFilters.category ||
    currentFilters.area ||
    currentFilters.neighborhood ||
    currentFilters.search;

  /* ── Featured posts (top 3 featured or most recent, only when no filters) ── */
  const featuredPosts: StoryPost[] = [];
  const gridPosts: StoryPost[] = [];

  if (!hasActiveFilters) {
    const featured = initialPosts.filter((p) => p.is_featured).slice(0, 3);
    if (featured.length >= 1) {
      featuredPosts.push(...featured);
    } else {
      featuredPosts.push(...initialPosts.slice(0, 3));
    }
    const featuredIds = new Set(featuredPosts.map((p) => p.id));
    gridPosts.push(...initialPosts.filter((p) => !featuredIds.has(p.id)));
  } else {
    gridPosts.push(...initialPosts);
  }

  const visibleGridPosts = gridPosts.slice(0, visibleCount);
  const hasMore = visibleCount < gridPosts.length;

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
      <section className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
        <Image
          src={heroImage || PH_HERO}
          alt={heroTitle}
          fill
          unoptimized
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="site-container pb-10 md:pb-14">
            <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3 block">
              {contentType === "news" ? "Atlanta News" : contentType === "guide" ? "Local Knowledge" : "Stories"}
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.05]">
              {heroTitle}
            </h1>
            <p className="text-white/60 text-sm md:text-base mt-3 max-w-lg">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ========== FILTER BAR ========== */}
      <section className="site-container py-8 md:py-10">
        <div className="space-y-4">
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
              placeholder="Search stories…"
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

            {/* Loading spinner */}
            {isPending && (
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

      {/* ========== FEATURED STORIES (only when no filters) ========== */}
      {!hasActiveFilters && featuredPosts.length > 0 && (
        <section className="site-container pb-12 md:pb-16">
          <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
            <div>
              <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-[0.1em]">
                Featured
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
                {contentType === "news" ? "Top Stories" : contentType === "guide" ? "Editor\u2019s Picks" : "Featured Stories"}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Large hero card */}
            {featuredPosts[0] && (
              <Link
                href={`/stories/${featuredPosts[0].slug}`}
                className="group block md:row-span-2"
              >
                <div className="relative aspect-[4/3] md:aspect-auto md:h-full overflow-hidden bg-gray-100">
                  <Image
                    src={featuredPosts[0].featured_image_url || PH_HERO}
                    alt={featuredPosts[0].title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    {featuredPosts[0].category_name && (
                      <span className="inline-block px-3 py-1 bg-[#fee198] text-black text-[10px] font-semibold uppercase tracking-[0.08em] rounded-full mb-3">
                        {featuredPosts[0].category_name}
                      </span>
                    )}
                    <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-snug group-hover:text-[#fee198] transition-colors">
                      {featuredPosts[0].title}
                    </h3>
                    {featuredPosts[0].excerpt && (
                      <p className="text-white/70 text-sm mt-2 line-clamp-2 hidden md:block">
                        {featuredPosts[0].excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {featuredPosts[0].published_at && (
                        <span className="text-white/50 text-xs">
                          {formatDate(featuredPosts[0].published_at)}
                        </span>
                      )}
                      {featuredPosts[0].neighborhood_name && (
                        <span className="inline-flex items-center gap-1 text-white/50 text-xs">
                          <MapPin size={10} />
                          {featuredPosts[0].neighborhood_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Stacked cards (right column) */}
            {featuredPosts.slice(1, 3).map((post) => (
              <Link
                key={post.id}
                href={`/stories/${post.slug}`}
                className="group block"
              >
                <div className="relative aspect-[16/10] overflow-hidden mb-3 bg-gray-100">
                  <Image
                    src={post.featured_image_url || PH_HERO}
                    alt={post.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {post.category_name && (
                  <span className="text-[#c1121f] text-[10px] font-semibold uppercase tracking-eyebrow">
                    {post.category_name}
                  </span>
                )}
                <h3 className="font-display text-lg md:text-xl font-semibold text-black leading-snug mt-1 group-hover:text-[#c1121f] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  {post.published_at && (
                    <span className="text-gray-mid text-xs">
                      {formatDate(post.published_at)}
                    </span>
                  )}
                  {post.neighborhood_name && post.neighborhood_slug && (
                    <span
                      onClick={(e) => e.stopPropagation()}
                      className="inline-block"
                    >
                      <Link
                        href={`/neighborhoods/${post.neighborhood_slug}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-[10px] text-gray-dark font-medium hover:bg-[#fee198] hover:text-black transition-colors"
                      >
                        <MapPin size={10} />
                        {post.neighborhood_name}
                      </Link>
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ========== STORIES GRID + SIDEBAR ========== */}
      <section className="site-container pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- Main Column ---------- */}
          <div>
            <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
              <div>
                <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-[0.1em]">
                  Stories
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
                  {currentFilters.search
                    ? `Results for \u201c${currentFilters.search}\u201d`
                    : "All Stories"}
                </h2>
              </div>
              <span className="text-xs text-gray-mid pb-1">
                {hasActiveFilters
                  ? `${gridPosts.length} result${gridPosts.length !== 1 ? "s" : ""}`
                  : `Showing ${Math.min(visibleCount, gridPosts.length)} of ${gridPosts.length}`}
              </span>
            </div>

            {visibleGridPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {visibleGridPosts.map((post, index) => (
                    <Fragment key={post.id}>
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
                        }}
                      />
                      {index === 5 && (
                        <div className="col-span-full lg:hidden my-4">
                          <NewsletterWidget />
                        </div>
                      )}
                      {index === 11 && (
                        <div className="col-span-full lg:hidden my-4">
                          <AdBlock variant="inline" />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>

                {/* Mobile-only: SubmitCTA before Load More */}
                <div className="lg:hidden my-8">
                  <SubmitCTA
                    heading="Have a Story Tip?"
                    description="Know something happening in Atlanta? We want to hear from you."
                    buttonText="Contact Us"
                    href="/contact"
                  />
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
          </div>

          {/* ---------- Sidebar (desktop only) ---------- */}
          {sidebar && (
            <aside className="hidden lg:block">
              <div className="lg:sticky lg:top-6 space-y-8 overflow-hidden">
                {sidebar}
              </div>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
