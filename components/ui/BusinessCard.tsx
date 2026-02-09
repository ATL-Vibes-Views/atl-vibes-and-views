import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";

/* ============================================================
   BUSINESS CARD v2

   Unified card for hub archive grids, search results, and
   listing pages. Uses next/image for optimized loading.

   Design base: inline BizCard from HubArchiveClient with
   premium badge, price range badge, category pill, address,
   and neighborhood link.
   ============================================================ */

const PH_BIZ = "https://placehold.co/600x400/1a1a1a/e6c46d?text=Business";

interface BusinessCardProps {
  name: string;
  slug: string;
  /** Base path for detail page link (default: "/places") */
  detailRoute?: string;
  imageUrl?: string;
  category?: string;
  neighborhood?: string;
  neighborhoodSlug?: string;
  address?: string;
  priceRange?: string;
  tier?: string;
  showPremiumBadge?: boolean;
  description?: string;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  className?: string;
}

export function BusinessCard({
  name,
  slug,
  detailRoute = "/places",
  imageUrl,
  category,
  neighborhood,
  neighborhoodSlug,
  address,
  priceRange,
  tier,
  showPremiumBadge = false,
  description,
  rating,
  reviewCount,
  tags,
  className = "",
}: BusinessCardProps) {
  const imgSrc = imageUrl || PH_BIZ;
  const isPremium = tier === "Premium";

  return (
    <Link href={`${detailRoute}/${slug}`} className={`group block ${className}`}>
      {/* Image */}
      <div
        className="relative overflow-hidden mb-3 bg-gray-100"
        style={{ paddingBottom: "66.66%" }}
      >
        <Image
          src={imgSrc}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Premium badge */}
        {(showPremiumBadge || isPremium) && isPremium && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 bg-[#fee198] text-black text-[10px] font-semibold uppercase tracking-[0.1em] rounded-full z-10 shadow-sm">
            <Star size={10} fill="currentColor" />
            Premium
          </span>
        )}
        {/* Price badge */}
        {priceRange && (
          <span className="absolute bottom-3 right-3 bg-white px-2.5 py-1.5 shadow-lg z-10 text-[13px] font-semibold text-black tracking-wider">
            {priceRange}
          </span>
        )}
      </div>

      {/* Category pill */}
      {category && (
        <span className="inline-block px-3 py-1 bg-[#fee198] text-black text-[10px] font-semibold uppercase tracking-[0.1em] rounded-full mb-2">
          {category}
        </span>
      )}

      {/* Title */}
      <h3 className="font-display text-xl font-semibold leading-snug text-black group-hover:text-red-brand transition-colors line-clamp-2">
        {name}
      </h3>

      {/* Description */}
      {description && tier !== "Free" && tier !== "free" && (
        <p className="text-sm text-gray-dark mt-2 line-clamp-2">
          {description}
        </p>
      )}

      {/* Address */}
      {address && (
        <div className="flex items-center gap-1 mt-2 text-[13px] text-gray-mid">
          <MapPin size={13} className="flex-shrink-0" />
          {address}
        </div>
      )}

      {/* Neighborhood */}
      {neighborhood && (
        <div className="mt-0.5 pl-[17px]">
          {neighborhoodSlug ? (
            <span
              className="text-xs text-gray-mid hover:text-black hover:underline transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/neighborhoods/${neighborhoodSlug}`}>
                {neighborhood}
              </Link>
            </span>
          ) : (
            <span className="text-xs text-gray-mid">{neighborhood}</span>
          )}
        </div>
      )}

      {/* Rating */}
      {rating !== undefined && rating > 0 && (
        <div className="flex items-center gap-1.5 mt-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.round(rating)
                    ? "fill-gold-dark text-gold-dark"
                    : "text-gray-mid/30"
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-mid">
            {rating.toFixed(1)}
            {reviewCount !== undefined && ` (${reviewCount})`}
          </span>
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && tier !== "Free" && tier !== "free" && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-light text-[10px] text-gray-dark"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
