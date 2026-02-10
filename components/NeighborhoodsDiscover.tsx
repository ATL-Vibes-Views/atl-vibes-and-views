"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight } from "lucide-react";

interface NeighborhoodCard {
  id: string;
  name: string;
  slug: string;
  area_id: string;
  hero_image_url: string | null;
}

interface AreaOption {
  id: string;
  name: string;
  slug: string;
}

interface NeighborhoodsDiscoverProps {
  neighborhoods: NeighborhoodCard[];
  areas: AreaOption[];
  bizCounts: Record<string, number>;
  storyCounts: Record<string, number>;
  areaNameMap: Record<string, string>;
}

const PAGE_SIZE = 12;
const PH_NEIGHBORHOOD =
  "https://placehold.co/400x260/1a1a1a/e6c46d?text=Neighborhood";

function NeighborhoodsDiscoverInner({
  neighborhoods,
  areas,
  bizCounts,
  storyCounts,
  areaNameMap,
}: NeighborhoodsDiscoverProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const areaSlugParam = searchParams.get("area") || "";

  /* Slug ↔ ID maps */
  const areaSlugToId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of areas) map[a.slug] = a.id;
    return map;
  }, [areas]);

  const selectedAreaId = areaSlugParam
    ? (areaSlugToId[areaSlugParam] ?? null)
    : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* Filter by area + search */
  const filtered = useMemo(() => {
    let result = neighborhoods;
    if (selectedAreaId) {
      result = result.filter((n) => n.area_id === selectedAreaId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((n) => n.name.toLowerCase().includes(q));
    }
    return result;
  }, [neighborhoods, selectedAreaId, searchQuery]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function handleAreaChange(slug: string) {
    setVisibleCount(PAGE_SIZE);
    if (slug) {
      router.push(`/neighborhoods?area=${slug}`, { scroll: false });
    } else {
      router.push("/neighborhoods", { scroll: false });
    }
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-4">
        <div>
          <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
            Neighborhoods
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
            Discover Your Neighborhood
          </h2>
        </div>
      </div>

      {/* Search + Area Dropdown */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex flex-1">
          <input
            type="text"
            placeholder="Search neighborhoods..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 border border-gray-200 px-4 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#e6c46d] transition-colors"
          />
          <button
            className="px-4 py-2 bg-[#fee198] text-[#1a1a1a] border border-l-0 border-gray-200 hover:bg-[#f5d87a] transition-colors"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </div>
        <select
          value={areaSlugParam}
          onChange={(e) => handleAreaChange(e.target.value)}
          className="bg-white border border-gray-200 text-[#1a1a1a] px-4 py-2 text-sm"
        >
          <option value="">All Areas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.slug}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-mid mb-6">
        Showing {Math.min(visibleCount, filtered.length)} of {filtered.length}{" "}
        neighborhood{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Card Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((n) => {
            const bizCount = bizCounts[n.id] ?? 0;
            const storyCount = storyCounts[n.id] ?? 0;
            return (
              <Link
                key={n.id}
                href={`/neighborhoods/${n.slug}`}
                className="group block border border-gray-200 hover:border-[#e6c46d] transition-colors overflow-hidden"
              >
                <div className="relative aspect-[3/2] bg-[#1a1a1a] overflow-hidden">
                  <Image
                    src={n.hero_image_url || PH_NEIGHBORHOOD}
                    alt={n.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-eyebrow text-[#c1121f]">
                    {areaNameMap[n.area_id] ?? "Atlanta"}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-black mt-1 group-hover:text-red-brand transition-colors">
                    {n.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-mid">
                    <span>
                      {storyCount > 0
                        ? `${storyCount} ${storyCount === 1 ? "story" : "stories"}`
                        : "0 stories"}
                    </span>
                    <span>
                      {bizCount > 0
                        ? `${bizCount} business${bizCount !== 1 ? "es" : ""}`
                        : "0 businesses"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#f8f5f0]">
          <h3 className="font-display text-2xl font-semibold mb-2">
            No neighborhoods found
          </h3>
          <p className="text-gray-mid text-sm">
            Try a different search or area filter.
          </p>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-black text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-all"
          >
            Load More <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export function NeighborhoodsDiscover(props: NeighborhoodsDiscoverProps) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 w-64" />
          <div className="h-10 bg-gray-100" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100" />
            ))}
          </div>
        </div>
      }
    >
      <NeighborhoodsDiscoverInner {...props} />
    </Suspense>
  );
}
