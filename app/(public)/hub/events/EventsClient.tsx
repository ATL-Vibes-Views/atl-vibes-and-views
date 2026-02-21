"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { PH_DEFAULT, PH_MAP } from "@/lib/placeholders";
import {
  Search,
  X,
  ChevronDown,
  MapPin,
  Calendar,
  ArrowRight,
  Ticket,
  Star,
  Sparkles,
} from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */
interface FilterArea {
  id: string;
  name: string;
  slug: string;
}

interface FilterNeighborhood {
  id: string;
  name: string;
  slug: string;
  area_id: string;
}

interface FilterCategory {
  slug: string;
  name: string;
}

interface EventCard {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  event_type?: string;
  venue_name?: string;
  city?: string;
  is_free: boolean;
  ticket_price_min?: number;
  ticket_price_max?: number;
  featured_image_url?: string;
  is_featured?: boolean;
  tier?: string;
  latitude?: number;
  longitude?: number;
  neighborhoods?: { name: string; slug: string } | null;
  categories?: { name: string; slug: string } | null;
}

interface MapEvent {
  id: string;
  title: string;
  slug: string;
  latitude: number;
  longitude: number;
  is_featured?: boolean;
  tier?: string;
}

interface EventsClientProps {
  areas: FilterArea[];
  neighborhoods: FilterNeighborhood[];
  eventTypes: string[];
  categories: FilterCategory[];
  featuredEvents: EventCard[];
  mapEvents: MapEvent[];
  gridEvents: EventCard[];
  totalGridCount: number;
  currentFilters: {
    q?: string;
    area?: string;
    neighborhood?: string;
    type?: string;
    category?: string;
    mode?: string;
  };
  /** Server-rendered sidebar passed via composition */
  sidebar?: React.ReactNode;
}

/* ============================================================
   HELPERS
   ============================================================ */
const PH_EVENT = PH_DEFAULT;

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function eventDateParts(dateStr: string): { month: string; day: string } {
  const d = new Date(dateStr + "T00:00:00");
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate().toString(),
  };
}

function priceLabel(event: EventCard): string {
  if (event.is_free) return "Free";
  if (event.ticket_price_min && event.ticket_price_max) {
    return event.ticket_price_min === event.ticket_price_max
      ? `$${event.ticket_price_min}`
      : `$${event.ticket_price_min}–$${event.ticket_price_max}`;
  }
  if (event.ticket_price_min) return `From $${event.ticket_price_min}`;
  return "";
}

/* ============================================================
   EVENTS CLIENT COMPONENT
   ============================================================ */
export function EventsClient({
  areas,
  neighborhoods,
  eventTypes,
  categories,
  featuredEvents,
  mapEvents,
  gridEvents,
  totalGridCount,
  currentFilters,
  sidebar,
}: EventsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /* --- Filter state (mirrors URL params) --- */
  const [searchValue, setSearchValue] = useState(currentFilters.q ?? "");
  const [visibleCount, setVisibleCount] = useState(12);

  /* Cascading neighborhoods: filter by selected area */
  const filteredNeighborhoods = currentFilters.area
    ? neighborhoods.filter((n) => n.area_id === currentFilters.area)
    : neighborhoods;

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

      /* Reset visible count when filters change */
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
    currentFilters.q ||
    currentFilters.area ||
    currentFilters.neighborhood ||
    currentFilters.type ||
    currentFilters.category ||
    (currentFilters.mode && currentFilters.mode !== "upcoming");

  /* Visible grid events (progressive reveal) */
  const visibleGridEvents = gridEvents.slice(0, visibleCount);
  const hasMoreEvents = visibleCount < gridEvents.length;

  return (
    <>
      {/* ========== 3. SEARCH + FILTER BAR ========== */}
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
                if (e.key === "Enter") pushFilters({ q: searchValue });
              }}
              placeholder="Search events by name, venue, or city…"
              className="w-full pl-11 pr-10 py-3 text-sm bg-white border-2 border-[#e6c46d] rounded-full outline-none focus:border-[#d4a94e] focus:shadow-[0_0_0_3px_rgba(230,196,109,0.2)] transition-all placeholder:text-gray-mid"
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("");
                  pushFilters({ q: undefined });
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
            {/* Area */}
            <div className="relative">
              <select
                value={currentFilters.area ?? ""}
                onChange={(e) =>
                  pushFilters({
                    area: e.target.value || undefined,
                    neighborhood: undefined, // reset cascading
                  })
                }
                className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-sm text-gray-dark focus:border-[#e6c46d] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="">All Areas</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid pointer-events-none"
              />
            </div>

            {/* Neighborhood (cascades from area) */}
            <div className="relative">
              <select
                value={currentFilters.neighborhood ?? ""}
                onChange={(e) =>
                  pushFilters({ neighborhood: e.target.value || undefined })
                }
                className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-sm text-gray-dark focus:border-[#e6c46d] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="">All Neighborhoods</option>
                {filteredNeighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid pointer-events-none"
              />
            </div>

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

            {/* Event Type */}
            {eventTypes.length > 0 && (
              <div className="relative">
                <select
                  value={currentFilters.type ?? ""}
                  onChange={(e) =>
                    pushFilters({ type: e.target.value || undefined })
                  }
                  className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-sm text-gray-dark focus:border-[#e6c46d] focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="">All Event Types</option>
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid pointer-events-none"
                />
              </div>
            )}

            {/* Date Mode Toggle — 3 modes: Upcoming / Current / Past */}
            <div className="flex items-center bg-gray-100 rounded-full p-0.5">
              {(["upcoming", "current", "past"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() =>
                    pushFilters({
                      mode: m === "upcoming" ? undefined : m,
                    })
                  }
                  className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] rounded-full transition-colors ${
                    (currentFilters.mode ?? "upcoming") === m
                      ? "bg-black text-white"
                      : "text-gray-mid hover:text-black"
                  }`}
                >
                  {m === "upcoming"
                    ? "Upcoming"
                    : m === "current"
                    ? "Current"
                    : "Past"}
                </button>
              ))}
            </div>

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
        </div>
      </section>

      {/* ========== 4. FEATURED EVENTS ========== */}
      {featuredEvents.length > 0 && (
        <section className="site-container pb-12 md:pb-16">
          <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
            <div>
              <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-[0.1em]">
                Featured
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
                Don&rsquo;t Miss These
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <EventCardComponent key={event.id} event={event} variant="featured" />
            ))}
          </div>
        </section>
      )}

      {/* ========== 5. GET YOUR EVENT FEATURED — Centered CTA ========== */}
      <section className="site-container pb-12 md:pb-16">
        <div className="flex justify-center">
          <div className="w-full max-w-[800px] bg-[#fefaf0] border-2 border-[#e6c46d] rounded-lg p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles size={18} className="text-[#e6c46d]" />
              <span className="font-display text-2xl font-semibold text-black">
                Get Your Event Featured
              </span>
            </div>
            <p className="text-sm text-gray-mid mb-6 max-w-md mx-auto">
              Put your event in front of thousands of Atlantans with a premium
              Featured placement at the top of the page.
            </p>
            <Link
              href="/partner"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#1a1a1a] text-white text-xs font-semibold uppercase tracking-[0.08em] rounded-full hover:bg-[#fee198] hover:text-black transition-colors"
            >
              Learn More
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== 6. MAP PLACEHOLDER ========== */}
      <section className="site-container pb-12 md:pb-16">
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-lg">
          <Image
            src={PH_MAP}
            alt="Atlanta event locations map"
            fill
            unoptimized
            className="object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center">
              <p className="text-white font-display text-2xl md:text-3xl font-semibold">
                Interactive Map
              </p>
              <p className="text-white/70 text-sm mt-2">Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 7. EVENTS GRID + SIDEBAR ========== */}
      <section className="site-container pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- Main Column ---------- */}
          <div>
            <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
              <div>
                <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-[0.1em]">
                  Events
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
                  More to Explore
                </h2>
              </div>
              <span className="text-xs text-gray-mid pb-1">
                {totalGridCount} event{totalGridCount !== 1 ? "s" : ""}
              </span>
            </div>

            {visibleGridEvents.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {visibleGridEvents.map((event) => (
                    <EventCardComponent key={event.id} event={event} variant="grid" />
                  ))}
                </div>

                {/* Load More */}
                {hasMoreEvents && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={() => setVisibleCount((c) => c + 12)}
                      className="inline-flex items-center gap-2 px-8 py-3 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
                    >
                      Load More Events
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty state */
              <div className="text-center py-20">
                <Calendar
                  size={48}
                  className="text-gray-300 mx-auto mb-4"
                />
                <p className="text-gray-mid text-lg mb-6">
                  No events match your current filters.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
                  >
                    Clear Filters
                  </button>
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#fee198] text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-[#fee198] transition-colors"
                  >
                    Submit an Event
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ---------- Sidebar (visible desktop + mobile) ---------- */}
          {sidebar && (
            <aside>
              <div className="lg:sticky lg:top-6 space-y-8 overflow-hidden">
                {sidebar}
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* ========== 8. HORIZONTAL AD ========== */}
      <section className="site-container pb-12 md:pb-16">
        <div className="bg-gray-50 border border-gray-200 flex items-center justify-center h-[90px] md:h-[120px]">
          <div className="text-center">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-[0.1em]">
              Advertisement
            </p>
            <p className="text-[10px] text-gray-300 mt-1">728 × 90</p>
          </div>
        </div>
      </section>

      {/* ========== 9. NEWSLETTER SIGNUP (always last) ========== */}
      <section className="bg-[#1a1a1a] py-16 md:py-20">
        <div className="site-container text-center">
          <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em]">
            Stay in the Loop
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mt-2 mb-3">
            Never Miss an Event
          </h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-8">
            Get weekly events, Atlanta drops, and local culture delivered to your
            inbox.
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

/* ============================================================
   EVENT CARD COMPONENT
   Matches /events/[slug] related events card pattern:
   - Image with Featured badge (top-right, gold pill) + Date badge (bottom-right, white bg, month above day)
   - Category pill (gold, rounded-full)
   - Title (max 2 lines desktop, 1 line mobile)
   - Location (venue/street with MapPin)
   - Neighborhood (always link to /neighborhoods/[slug], always last)
   ============================================================ */
function EventCardComponent({
  event,
  variant,
}: {
  event: EventCard;
  variant: "featured" | "grid";
}) {
  const { month, day } = eventDateParts(event.start_date);
  const price = priceLabel(event);
  const isFeatured = event.tier === "Premium" || event.is_featured;

  return (
    <Link href={`/events/${event.slug}`} className="group block">
      {/* Image container — 3:2 aspect */}
      <div className="relative w-full overflow-hidden mb-3" style={{ paddingBottom: "66.66%" }}>
        <Image
          src={event.featured_image_url || PH_EVENT}
          alt={event.title}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500 absolute top-0 left-0 w-full h-full"
        />

        {/* Featured badge — top-right, gold pill */}
        {isFeatured && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-[#fee198] text-black text-[10px] font-semibold uppercase tracking-[0.08em] rounded-full shadow-sm">
            <Star size={10} />
            Featured
          </span>
        )}

        {/* Date badge — bottom-right, white bg, shadow, month above day */}
        <div className="absolute bottom-3 right-3 w-12 h-14 bg-white rounded shadow-md flex flex-col items-center justify-center">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-mid leading-none block">
            {month}
          </span>
          <span className="text-lg font-display font-bold text-black leading-none block mt-0.5">
            {day}
          </span>
        </div>
      </div>

      {/* Category pill — gold */}
      <div className="mb-2">
        {event.categories?.name ? (
          <span className="inline-block px-3 py-1 bg-[#fee198] text-black text-[10px] font-semibold uppercase tracking-[0.08em] rounded-full">
            {event.categories.name}
          </span>
        ) : event.event_type ? (
          <span className="inline-block px-3 py-1 bg-[#fee198] text-black text-[10px] font-semibold uppercase tracking-[0.08em] rounded-full">
            {event.event_type}
          </span>
        ) : null}
      </div>

      {/* Title — 2 lines desktop, 1 line mobile */}
      <h3
        className={`font-display font-semibold text-black leading-snug group-hover:text-[#c1121f] transition-colors line-clamp-1 md:line-clamp-2 ${
          variant === "featured"
            ? "text-xl md:text-2xl"
            : "text-lg md:text-xl"
        }`}
      >
        {event.title}
      </h3>

      {/* Location — venue/street with MapPin */}
      {event.venue_name && (
        <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-mid">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate">{event.venue_name}</span>
        </div>
      )}

      {/* Neighborhood — always a link, always last */}
      {event.neighborhoods?.name && event.neighborhoods?.slug && (
        <div className="mt-1.5">
          <span
            onClick={(e) => e.stopPropagation()}
            className="inline-block"
          >
            <Link
              href={`/neighborhoods/${event.neighborhoods.slug}`}
              className="text-xs text-[#c1121f] font-medium hover:text-black transition-colors"
            >
              {event.neighborhoods.name}
            </Link>
          </span>
        </div>
      )}
    </Link>
  );
}
