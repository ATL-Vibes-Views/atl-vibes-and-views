"use client";

import { Fragment, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Play, ArrowRight, Headphones } from "lucide-react";
import { extractYouTubeId } from "@/lib/media-utils";
import { AdBlock } from "@/components/ui/AdBlock";

/* ============================================================
   MediaLandingClient — Tabs, featured hero, media grid
   ============================================================ */

interface MediaClientItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  media_type: string;
  embed_url: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  is_featured: boolean;
}

interface MediaLandingClientProps {
  items: MediaClientItem[];
  activeTab: "podcast" | "video";
}

const TABS = [
  { label: "Podcast", value: "podcast" },
  { label: "Video", value: "video" },
] as const;

const PH_VIDEO = "https://placehold.co/640x360/1a1a1a/e6c46d?text=Video";
const PH_PODCAST = "https://placehold.co/640x360/1a1a1a/e6c46d?text=Podcast";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getThumbnail(item: MediaClientItem): string {
  if (item.embed_url) {
    const ytId = extractYouTubeId(item.embed_url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  if (item.thumbnail_url) return item.thumbnail_url;
  return item.media_type === "podcast" ? PH_PODCAST : PH_VIDEO;
}

export function MediaLandingClient({ items, activeTab }: MediaLandingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(12);

  const switchTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "podcast") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    router.push(`/media${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  /* Split featured item from rest */
  const featured = items.find((m) => m.is_featured) || items[0] || null;
  const remaining = items.filter((m) => m !== featured);
  const visibleItems = remaining.slice(0, visibleCount);
  const hasMore = visibleCount < remaining.length;

  return (
    <>
      {/* ========== HERO ========== */}
      <section className="bg-[#1a1a1a] pt-10 pb-10">
        <div className="site-container text-center">
          <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 block">
            Media
          </span>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-[1.05] mb-2">
            Watch &amp; Listen
          </h1>
          <p className="text-white/60 text-sm max-w-lg mx-auto">
            Podcast episodes, video features, and short-form content covering Atlanta.
          </p>
        </div>
      </section>

      {/* ========== TABS + CONTENT ========== */}
      <section className="site-container pt-8 md:pt-10 pb-16 md:pb-20">
        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-8">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => switchTab(t.value)}
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

        {/* Featured item */}
        {featured && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
            <Link
              href={`/media/${featured.slug}`}
              className="group relative aspect-video overflow-hidden bg-gray-100 block"
            >
              <Image
                src={getThumbnail(featured)}
                alt={featured.title}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  {featured.media_type === "podcast" ? (
                    <Headphones size={28} className="text-white" />
                  ) : (
                    <Play size={28} className="text-white ml-1" fill="white" />
                  )}
                </div>
              </div>
            </Link>

            <div className="flex flex-col justify-center">
              <span className="text-[#c1121f] text-[10px] font-semibold uppercase tracking-[0.15em] mb-3">
                {featured.is_featured ? "Featured" : "Latest"}{" "}
                {activeTab === "podcast" ? "Episode" : "Video"}
              </span>
              <Link href={`/media/${featured.slug}`}>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-black leading-tight hover:text-[#c1121f] transition-colors">
                  {featured.title}
                </h2>
              </Link>
              {featured.excerpt && (
                <p className="text-gray-mid text-sm mt-3 line-clamp-3">
                  {featured.excerpt}
                </p>
              )}
              {featured.published_at && (
                <span className="text-gray-mid text-xs mt-4 block">
                  {formatDate(featured.published_at)}
                </span>
              )}
              <Link
                href={`/media/${featured.slug}`}
                className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-[0.1em] hover:bg-[#f5d87a] transition-colors w-fit"
              >
                {activeTab === "podcast" ? "Listen Now" : "Watch Now"}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        <div className="mb-6 mt-8">
          <span className="text-xs text-gray-mid">
            {items.length} {activeTab === "podcast" ? "episode" : "video"}
            {items.length !== 1 ? "s" : ""}
          </span>
        </div>

        {visibleItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {visibleItems.map((item, index) => (
                <Fragment key={item.id}>
                  <MediaCard item={item} />
                  {(index + 1) % 8 === 0 && (
                    <div className="col-span-full my-4">
                      <AdBlock variant="inline" />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisibleCount((c) => c + 12)}
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
                >
                  Load More
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : !featured ? (
          <div className="text-center py-20">
            <p className="text-gray-mid text-lg mb-4">
              No {activeTab === "podcast" ? "episodes" : "videos"} yet. Check back soon.
            </p>
          </div>
        ) : null}
      </section>
    </>
  );
}

/* ============================================================
   MEDIA CARD
   ============================================================ */

function MediaCard({ item }: { item: MediaClientItem }) {
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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-black/60 flex items-center justify-center">
            {item.media_type === "podcast" ? (
              <Headphones size={20} className="text-white" />
            ) : (
              <Play size={20} className="text-white ml-0.5" fill="white" />
            )}
          </div>
        </div>
        <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
          {item.media_type}
        </span>
      </div>

      <h3 className="font-display text-base font-semibold text-black leading-snug line-clamp-2 group-hover:text-[#c1121f] transition-colors">
        {item.title}
      </h3>

      {item.excerpt && (
        <p className="text-sm text-gray-mid mt-1 line-clamp-2 hidden lg:block">
          {item.excerpt}
        </p>
      )}

      <div className="flex items-center justify-between mt-2">
        {item.published_at && (
          <span className="text-xs text-gray-mid">
            {formatDate(item.published_at)}
          </span>
        )}
        <ArrowRight
          size={14}
          className="text-gray-mid group-hover:text-[#c1121f] transition-colors"
        />
      </div>
    </Link>
  );
}
