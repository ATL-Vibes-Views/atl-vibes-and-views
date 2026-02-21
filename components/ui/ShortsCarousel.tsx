import Link from "next/link";
import Image from "next/image";
import type { MediaItem } from "@/lib/types";
import { PH_DEFAULT } from "@/lib/placeholders";

/* ============================================================
   ShortsCarousel — Horizontal scrolling row of vertical shorts
   ============================================================ */

interface ShortsCarouselProps {
  shorts: MediaItem[];
  className?: string;
}

const PH_SHORT = PH_DEFAULT;

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ShortsCarousel({ shorts, className = "" }: ShortsCarouselProps) {
  if (shorts.length === 0) return null;

  return (
    <section className={`bg-[#f8f5f0] py-12 ${className}`}>
      <div className="site-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-[#c1121f] text-[10px] font-semibold uppercase tracking-eyebrow">
              Shorts
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-black leading-tight mt-1">
              Quick Takes
            </h2>
          </div>
          <Link
            href="/media?tab=short"
            className="text-xs font-semibold uppercase tracking-eyebrow text-[#c1121f] hover:text-black transition-colors"
          >
            See All →
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {shorts.map((short) => (
            <Link
              key={short.id}
              href={`/media/${short.slug}`}
              className="group block w-[180px] flex-shrink-0"
            >
              <div className="relative aspect-[9/16] overflow-hidden bg-gray-100 mb-2">
                <Image
                  src={PH_SHORT}
                  alt={short.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-display text-sm font-semibold text-black leading-snug line-clamp-2 group-hover:text-[#c1121f] transition-colors">
                {short.title}
              </h3>
              <p className="text-xs text-gray-mid mt-0.5">
                {relativeDate(short.published_at)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
