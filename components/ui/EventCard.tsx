import Link from "next/link";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

/* ============================================================
   EVENT CARD v2

   Unified card for event listings across all pages.

   Variants:
   - "featured" — larger with image and featured badge
   - "standard" — image + date overlay
   - "list"     — horizontal row with date badge, title, arrow
   ============================================================ */

interface EventCardProps {
  name: string;
  slug: string;
  /** Raw date string (e.g. "2026-02-14") — computes badge and display date */
  startDate?: string;
  /** Override: pre-formatted short date (e.g. "Feb 14") */
  dateShort?: string;
  /** Override: pre-formatted display date (e.g. "Feb 14, 2026") */
  date?: string;
  time?: string;
  category?: string;
  eventType?: string;
  neighborhood?: string;
  neighborhoodSlug?: string;
  venue?: string;
  imageUrl?: string;
  description?: string;
  featured?: boolean;
  variant?: "featured" | "standard" | "list";
  className?: string;
}

/* ---------- Helpers ---------- */

function eventDateParts(dateStr: string): { month: string; day: string } {
  const d = new Date(dateStr + "T00:00:00");
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate().toString(),
  };
}

function formatDateStr(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ---------- Component ---------- */

export function EventCard({
  name,
  slug,
  startDate,
  date,
  dateShort,
  time,
  category,
  eventType,
  neighborhood,
  neighborhoodSlug,
  venue,
  imageUrl,
  description,
  featured = false,
  variant = "standard",
  className = "",
}: EventCardProps) {
  /* Compute date parts from startDate or dateShort */
  const dateParts = startDate
    ? eventDateParts(startDate)
    : dateShort
      ? {
          month: dateShort.split(" ")[0]?.toUpperCase(),
          day: dateShort.split(" ")[1],
        }
      : null;

  const displayDate =
    date || (startDate ? formatDateStr(startDate) : undefined);

  /* --- List Variant --- */
  if (variant === "list") {
    return (
      <Link
        href={`/events/${slug}`}
        className={`group flex items-center gap-4 py-4 first:pt-0 last:pb-0 ${className}`}
      >
        {/* Date Block */}
        {dateParts && (
          <div className="shrink-0 w-14 h-14 bg-[#c1121f] text-white flex flex-col items-center justify-center">
            <span className="text-[10px] font-semibold uppercase">
              {dateParts.month}
            </span>
            <span className="text-lg font-display font-bold leading-none">
              {dateParts.day}
            </span>
          </div>
        )}

        {/* Thumbnail (fallback when no date) */}
        {imageUrl && !dateParts && (
          <div className="w-14 h-14 shrink-0 overflow-hidden bg-gray-light">
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-base font-semibold text-black leading-tight group-hover:text-red-brand transition-colors truncate">
            {name}
          </h4>
          <div className="flex items-center gap-3 text-xs text-gray-mid mt-1">
            {displayDate && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {displayDate}
              </span>
            )}
            {eventType && <span>{eventType}</span>}
            {neighborhood && !eventType && (
              <span className="flex items-center gap-0.5">
                <MapPin size={10} />
                {neighborhood}
              </span>
            )}
          </div>
        </div>

        <ArrowRight
          size={16}
          className="shrink-0 text-gray-mid group-hover:text-red-brand transition-colors"
        />
      </Link>
    );
  }

  /* --- Featured / Standard Variant --- */
  return (
    <article className={`group ${className}`}>
      <Link href={`/events/${slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/2] overflow-hidden bg-gray-light">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-light" />
          )}

          {/* Featured Badge */}
          {featured && (
            <span className="absolute top-3 left-3 category-tag category-tag--featured text-[10px]">
              Featured
            </span>
          )}

          {/* Date Overlay */}
          {dateParts && (
            <div className="absolute bottom-3 right-3 bg-white px-3 py-1.5 text-center shadow-sm">
              <span className="block text-[10px] font-semibold uppercase text-red-brand">
                {dateParts.month}
              </span>
              <span className="block text-lg font-display font-bold leading-none">
                {dateParts.day}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pt-3">
          {category && (
            <span className="eyebrow eyebrow-red text-[10px] mb-1 block">
              {category}
            </span>
          )}

          <h3
            className={`font-display font-semibold leading-tight group-hover:text-red-brand transition-colors ${
              variant === "featured" ? "text-card" : "text-card-sm"
            }`}
          >
            {name}
          </h3>

          {description && variant === "featured" && (
            <p className="text-sm text-gray-dark mt-2 line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-meta-sm text-gray-mid">
            {displayDate && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {displayDate}
              </span>
            )}
            {(neighborhood || venue) && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {venue || neighborhood}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
