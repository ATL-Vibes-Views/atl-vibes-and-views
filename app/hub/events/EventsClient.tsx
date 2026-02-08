"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  ChevronDown,
  MapPin,
  Calendar,
  ArrowRight,
  Map as MapIcon,
  ChevronUp,
  Ticket,
  Star,
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
  featuredEvents: EventCard[];
  mapEvents: MapEvent[];
  gridEvents: EventCard[];
  totalGridCount: number;
  currentFilters: {
    q?: string;
    area?: string;
    neighborhood?: string;
    type?: string;
    mode?: string;
  };
  /** Server-rendered sidebar passed via composition */
  sidebar?: React.ReactNode;
}

/* ============================================================
   HELPERS
   ============================================================ */
const PH_EVENT = "https://placehold.co/600x400/1a1a1a/e6c46d?text=Event";

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
  const [showMap, setShowMap] = useState(false);
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
    (currentFilters.mode && currentFilters.mode !== "upcoming");

  /* Visible grid events (progressive reveal) */
  const visibleGridEvents = gridEvents.slice(0, visibleCount);
  const hasMoreEvents = visibleCount < gridEvents.length;

  return (
    <>
      {/* ========== 2. SEARCH + FILTER BAR ========== */}
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
                  <option value="">All Types</option>
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

            {/* Date Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-full p-0.5">
              {["upcoming", "past"].map((mode) => (
                <button
                  key={mode}
                  onClick={() =>
                    pushFilters({
                      mode: mode === "upcoming" ? undefined : mode,
                    })
                  }
                  className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] rounded-full transition-colors ${
                    (currentFilters.mode ?? "upcoming") === mode
                      ? "bg-black text-white"
                      : "text-gray-mid hover:text-black"
                  }`}
                >
                  {mode === "upcoming" ? "Upcoming" : "Past"}
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

      {/* ========== 3. FEATURED EVENTS ========== */}
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
            {featuredEvents.map((event) => {
              const { month, day } = eventDateParts(event.start_date);
              const price = priceLabel(event);

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden mb-4">
                    <Image
                      src={event.featured_image_url || PH_EVENT}
                      alt={event.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Date badge */}
                    <div className="absolute top-3 left-3 w-12 h-12 bg-[#c1121f] text-white flex flex-col items-center justify-center">
                      <span className="text-[9px] font-semibold uppercase leading-none">
                        {month}
                      </span>
                      <span className="text-base font-display font-bold leading-none">
                        {day}
                      </span>
                    </div>
                    {/* Featured badge */}
                    {(event.tier === "Premium" || event.is_featured) && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-[#fee198] text-black text-[10px] font-semibold uppercase tracking-[0.08em]">
                        <Star size={10} />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-2 mb-2">
                    {event.categories?.name && (
                      <span className="px-3 py-1 bg-[#fee198] text-black text-[10px] font-semibold uppercase tracking-[0.08em] rounded-full">
                        {event.categories.name}
                      </span>
                    )}
                    {event.event_type && !event.categories?.name && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-dark text-[10px] font-semibold uppercase tracking-[0.08em] rounded-full">
                        {event.event_type}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl md:text-2xl font-semibold text-black leading-snug group-hover:text-[#c1121f] transition-colors">
                    {event.title}
                  </h3>

                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-mid">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(event.start_date)}
                    </span>
                    {event.venue_name && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {event.venue_name}
                      </span>
                    )}
                  </div>

                  {price && (
                    <div className="flex items-center gap-1 mt-1.5 text-sm">
                      <Ticket size={12} className="text-gray-mid" />
                      <span
                        className={
                          event.is_free
                            ? "text-green-700 font-medium"
                            : "text-gray-dark"
                        }
                      >
                        {price}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ========== 4. EVENTS MAP (Mapbox-ready placeholder) ========== */}
      {mapEvents.length > 0 && (
        <section className="site-container pb-12 md:pb-16">
          {/* Mobile: collapsible toggle */}
          <button
            onClick={() => setShowMap(!showMap)}
            className="md:hidden flex items-center gap-2 text-sm font-semibold text-black mb-4"
          >
            <MapIcon size={16} />
            {showMap ? "Hide Map" : `Show Map (${mapEvents.length} events)`}
            {showMap ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Desktop: always visible. Mobile: toggle */}
          <div
            className={`${showMap ? "block" : "hidden"} md:block`}
          >
            <div
              className="w-full h-[400px] bg-gray-100 border border-gray-200 flex items-center justify-center relative overflow-hidden"
              data-map-events={JSON.stringify(mapEvents)}
              data-map-center='{"lat":33.749,"lng":-84.388}'
              data-map-zoom="11"
            >
              {/* Placeholder content — replaced when Mapbox is installed */}
              <div className="text-center">
                <MapIcon size={40} className="text-gray-mid mx-auto mb-3" />
                <p className="text-sm text-gray-mid font-medium">
                  Interactive Map
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {mapEvents.length} events with locations
                </p>
                {/* Pin legend */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-mid">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#c1121f]" />
                    Featured
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]" />
                    Standard
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== 5. NEWSLETTER SIGNUP ========== */}
      <section className="bg-[#1a1a1a] py-16 md:py-20 mb-12 md:mb-16">
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

      {/* ========== 6. MORE TO EXPLORE (Main Grid) ========== */}
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
                  {visibleGridEvents.map((event) => {
                    const { month, day } = eventDateParts(event.start_date);
                    const price = priceLabel(event);

                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="group block"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden mb-4">
                          <Image
                            src={event.featured_image_url || PH_EVENT}
                            alt={event.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Date badge */}
                          <div className="absolute top-3 left-3 w-11 h-11 bg-[#c1121f] text-white flex flex-col items-center justify-center">
                            <span className="text-[8px] font-semibold uppercase leading-none">
                              {month}
                            </span>
                            <span className="text-sm font-display font-bold leading-none">
                              {day}
                            </span>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-2 mb-2">
                          {event.event_type && (
                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-dark text-[10px] font-semibold uppercase tracking-[0.08em] rounded-full">
                              {event.event_type}
                            </span>
                          )}
                          {price && (
                            <span
                              className={`text-[11px] font-medium ${
                                event.is_free
                                  ? "text-green-700"
                                  : "text-gray-dark"
                              }`}
                            >
                              {price}
                            </span>
                          )}
                        </div>

                        <h3 className="font-display text-lg md:text-xl font-semibold text-black leading-snug group-hover:text-[#c1121f] transition-colors">
                          {event.title}
                        </h3>

                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-mid">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {formatDate(event.start_date)}
                          </span>
                          {event.neighborhoods?.name && (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} />
                              {event.neighborhoods.name}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
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

          {/* ---------- Sidebar (desktop only) ---------- */}
          {sidebar && (
            <aside className="hidden lg:block">
              <div className="sticky top-6 space-y-8">{sidebar}</div>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
