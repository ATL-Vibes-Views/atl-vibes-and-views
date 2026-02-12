"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Play, Headphones, ArrowRight, Film } from "lucide-react";
import { extractYouTubeId } from "@/lib/media-utils";
import { AdBlock } from "@/components/ui/AdBlock";

/* ============================================================
   TYPES
   ============================================================ */

interface MediaLibraryItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  media_type: "video" | "podcast" | "short";
  embed_url: string | null;
  published_at: string | null;
  is_featured: boolean;
}

interface MediaLibraryClientProps {
  items: MediaLibraryItem[];
  shorts: MediaLibraryItem[];
}

/* ============================================================
   HELPERS
   ============================================================ */

const PH_VIDEO = "https://placehold.co/640x360/1a1a1a/e6c46d?text=Video";
const PH_PODCAST = "https://placehold.co/640x360/1a1a1a/e6c46d?text=Podcast";
const PH_SHORT = "https://placehold.co/360x640/1a1a1a/e6c46d?text=Short";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getThumbnail(item: MediaLibraryItem): string {
  if (item.embed_url) {
    const ytId = extractYouTubeId(item.embed_url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  if (item.media_type === "podcast") return PH_PODCAST;
  if (item.media_type === "short") return PH_SHORT;
  return PH_VIDEO;
}

/* ============================================================
   TABS
   ============================================================ */

const TABS = [
  { label: "All", value: "all" },
  { label: "Videos", value: "video" },
  { label: "Podcasts", value: "podcast" },
  { label: "Shorts", value: "shorts" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

/* ============================================================
   MEDIA LIBRARY CLIENT
   ============================================================ */

export function MediaLibraryClient({ items, shorts }: MediaLibraryClientProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchValue, setSearchValue] = useState("");
  const [mainVisibleCount, setMainVisibleCount] = useState(8);
  const [shortsVisibleCount, setShortsVisibleCount] = useState(6);
  const shortsRef = useRef<HTMLDivElement>(null);

  /* ── Filter logic ── */
  const searchLower = searchValue.trim().toLowerCase();

  const filteredMainItems =
    activeTab === "shorts"
      ? []
      : items.filter((item) => {
          if (activeTab === "video" && item.media_type !== "video") return false;
          if (activeTab === "podcast" && item.media_type !== "podcast") return false;
          if (searchLower && !item.title.toLowerCase().includes(searchLower)) return false;
          return true;
        });

  const filteredShorts = shorts.filter((s) => {
    if (searchLower && !s.title.toLowerCase().includes(searchLower)) return false;
    return true;
  });

  const totalCount =
    activeTab === "shorts"
      ? filteredShorts.length
      : filteredMainItems.length + filteredShorts.length;

  const visibleMainItems = filteredMainItems.slice(0, mainVisibleCount);
  const hasMoreMain = mainVisibleCount < filteredMainItems.length;

  const visibleShorts = filteredShorts.slice(0, shortsVisibleCount);
  const hasMoreShorts = shortsVisibleCount < filteredShorts.length;

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    setMainVisibleCount(8);
    setShortsVisibleCount(6);
    if (tab === "shorts" && shortsRef.current) {
      shortsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setMainVisibleCount(8);
    setShortsVisibleCount(6);
  };

  return (
    <>
      {/* ========== HERO ========== */}
      <section className="bg-[#1a1a1a] pt-10 pb-10">
        <div className="site-container text-center">
          <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 block">
            Media Library
          </span>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-[1.05] mb-2">
            Watch &amp; Listen
          </h1>
          <p className="text-white/60 text-sm max-w-lg mx-auto">
            Browse every video, podcast episode, and short from ATL Vibes &amp; Views.
          </p>
        </div>
      </section>

      {/* ========== FILTER BAR ========== */}
      <section className="site-container py-8 md:py-10">
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200 mb-2">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTabChange(t.value)}
                className={`pb-3 text-sm font-semibold transition-colors ${
                  activeTab === t.value
                    ? "text-black border-b-2 border-[#b89a5a]"
                    : "text-gray-mid hover:text-black"
                }`}
              >
                {t.label}
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
                setMainVisibleCount(8);
                setShortsVisibleCount(6);
              }}
              placeholder="Search ATL Vibes & Views..."
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
          Showing {Math.min(activeTab === "shorts" ? visibleShorts.length : visibleMainItems.length + visibleShorts.length, totalCount)} of {totalCount} results
        </span>
      </div>

      {/* ========== MAIN GRID (Videos + Podcasts) ========== */}
      {activeTab !== "shorts" && (
        <section className="site-container pb-16 md:pb-20">
          {visibleMainItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {visibleMainItems.map((item) => (
                  <MainMediaCard key={item.id} item={item} />
                ))}
              </div>

              {hasMoreMain && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setMainVisibleCount((c) => c + 8)}
                    className="inline-flex items-center gap-2 px-8 py-3 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
                  >
                    Load More
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Film size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-mid text-lg">
                {searchLower
                  ? `No results for "${searchValue}". Try a different search.`
                  : "No media found."}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ========== HORIZONTAL AD ========== */}
      {activeTab !== "shorts" && (
        <div className="site-container pb-8">
          <AdBlock variant="inline" />
        </div>
      )}

      {/* ========== SHORTS SECTION ========== */}
      <section ref={shortsRef} className="site-container pb-16 md:pb-20">
        <div className="mb-8">
          <span className="text-[#c1121f] text-[10px] font-semibold uppercase tracking-[0.15em] mb-1 block">
            Quick Hits
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-black leading-tight">
            Shorts
          </h2>
        </div>

        {visibleShorts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {visibleShorts.map((short) => (
                <ShortCard key={short.id} item={short} />
              ))}
            </div>

            {hasMoreShorts && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setShortsVisibleCount((c) => c + 6)}
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
                >
                  Load More Shorts
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-mid text-base text-center py-12">
            {searchLower
              ? `No shorts match "${searchValue}".`
              : "No shorts available yet."}
          </p>
        )}
      </section>
    </>
  );
}

/* ============================================================
   MAIN MEDIA CARD (Video / Podcast — 16:9)
   ============================================================ */

function MainMediaCard({ item }: { item: MediaLibraryItem }) {
  const isVideo = item.media_type === "video";

  return (
    <Link href={`/media/${item.slug}`} className="group block">
      <div className="relative aspect-video overflow-hidden bg-gray-100 mb-3">
        <Image
          src={getThumbnail(item)}
          alt={item.title}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#fee198]/90 flex items-center justify-center group-hover:bg-[#fee198] transition-colors">
            {isVideo ? (
              <Play size={18} className="text-black ml-0.5 fill-black" />
            ) : (
              <Headphones size={18} className="text-black" />
            )}
          </div>
        </div>
        {/* Type badge */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
            isVideo
              ? "bg-[#c1121f] text-white"
              : "bg-[#fee198] text-[#1a1a1a]"
          }`}
        >
          {isVideo ? "Video" : "Podcast"}
        </span>
      </div>

      <h3 className="font-display text-[15px] font-bold text-black leading-snug line-clamp-2 group-hover:text-[#c1121f] transition-colors">
        {item.title}
      </h3>

      {item.published_at && (
        <span className="text-xs text-[#999] mt-1 block">
          {formatDate(item.published_at)}
        </span>
      )}
    </Link>
  );
}

/* ============================================================
   SHORT CARD (9:16 vertical)
   ============================================================ */

function ShortCard({ item }: { item: MediaLibraryItem }) {
  return (
    <Link href={`/media/${item.slug}`} className="group block">
      <div className="relative aspect-[9/16] overflow-hidden bg-gray-100 mb-2">
        <Image
          src={getThumbnail(item)}
          alt={item.title}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-[#fee198]/90 flex items-center justify-center group-hover:bg-[#fee198] transition-colors">
            <Play size={14} className="text-black ml-0.5 fill-black" />
          </div>
        </div>
        {/* SHORT badge */}
        <span className="absolute top-2 left-2 bg-[#c1121f] text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
          Short
        </span>
      </div>

      <h4 className="text-[13px] font-bold text-black leading-snug line-clamp-2 group-hover:text-[#c1121f] transition-colors">
        {item.title}
      </h4>
    </Link>
  );
}
