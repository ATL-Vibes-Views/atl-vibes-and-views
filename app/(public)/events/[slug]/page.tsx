import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PH_DEFAULT } from "@/lib/placeholders";
import {
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  ArrowRight,
  Ticket,
  Globe,
  CalendarPlus,
  Navigation,
  ExternalLink,
  DollarSign,
  Tag,
} from "lucide-react";
import {
  Sidebar,
  SidebarWidget,
  WidgetTitle,
  NewsletterWidget,
  AdPlacement,
  SubmitEventCTA,
} from "@/components/Sidebar";
import {

  getEventBySlug,
  getEvents,
  getMediaItems,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug).catch(() => null);
  if (!event) return { title: "Event Not Found" };

  const title = event.title;
  const description =
    event.tagline ||
    event.description?.slice(0, 160).replace(/<[^>]*>/g, "") ||
    `${event.title} — an event in Atlanta.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ATL Vibes & Views`,
      description,
      url: `https://atlvibesandviews.com/events/${slug}`,
      ...(event.featured_image_url
        ? { images: [{ url: event.featured_image_url }] }
        : {}),
    },
  };
}

/* ============================================================
   HELPERS
   ============================================================ */
const PH_HERO = PH_DEFAULT;
const PH_EVENT = PH_DEFAULT;

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr?: string | null): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function eventDateParts(dateStr: string): { month: string; day: string } {
  const d = new Date(dateStr + "T00:00:00");
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate().toString(),
  };
}

function buildDateTimeString(
  startDate: string,
  startTime?: string | null,
  endDate?: string | null,
  endTime?: string | null
): string {
  let str = formatDate(startDate);
  if (startTime) str += ` · ${formatTime(startTime)}`;
  if (endTime) str += ` – ${formatTime(endTime)}`;
  if (endDate && endDate !== startDate) {
    str += ` → ${formatDateShort(endDate)}`;
    if (endTime && !startTime) str += ` ${formatTime(endTime)}`;
  }
  return str;
}

function buildPriceDisplay(
  isFree: boolean,
  min?: number | null,
  max?: number | null
): string {
  if (isFree) return "Free";
  if (min != null && max != null && min !== max) {
    return `$${min} – $${max}`;
  }
  if (min != null) return `$${min}`;
  if (max != null) return `Up to $${max}`;
  return "See event page";
}

function buildDirectionsUrl(
  lat?: number | null,
  lng?: number | null,
  address?: string | null,
  city?: string | null,
  state?: string | null,
  zip?: string | null
): string | null {
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  const parts = [address, city, state, zip].filter(Boolean).join(", ");
  if (parts) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parts)}`;
  }
  return null;
}

/* ============================================================
   EVENT DETAIL PAGE — /events/[slug]
   ============================================================ */
export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  /* ── Fetch event ── */
  const event = await getEventBySlug(slug);
  if (!event || event.status !== "active") return notFound();

  /* ── Related events: same neighborhood → same event_type → upcoming ── */
  const today = new Date().toISOString().split("T")[0];
  const relatedRaw = await getEvents({
    upcoming: true,
    limit: 12,
  }).catch(() => []);

  const related = relatedRaw
    .filter((e) => e.id !== event.id && e.status === "active")
    .sort((a, b) => {
      /* Priority 1: same neighborhood */
      const aNeighborhood =
        event.neighborhood_id && a.neighborhood_id === event.neighborhood_id
          ? 1
          : 0;
      const bNeighborhood =
        event.neighborhood_id && b.neighborhood_id === event.neighborhood_id
          ? 1
          : 0;
      if (bNeighborhood !== aNeighborhood)
        return bNeighborhood - aNeighborhood;

      /* Priority 2: same event_type */
      const aType =
        event.event_type && a.event_type === event.event_type ? 1 : 0;
      const bType =
        event.event_type && b.event_type === event.event_type ? 1 : 0;
      if (bType !== aType) return bType - aType;

      /* Priority 3: featured first */
      const aFeat = a.is_featured ? 1 : 0;
      const bFeat = b.is_featured ? 1 : 0;
      if (bFeat !== aFeat) return bFeat - aFeat;

      /* Priority 4: soonest first */
      return a.start_date.localeCompare(b.start_date);
    })
    .slice(0, 3);

  /* ── Featured video (media_item_links → media_items for this event) ── */
  let featuredVideo = null;
  try {
    const videos = await getMediaItems({
      targetType: "event",
      targetIds: [event.id],
      limit: 1,
    });
    if (videos.length > 0 && videos[0].embed_url) {
      featuredVideo = videos[0];
    }
  } catch {
    /* No media — hide section */
  }

  /* ── Derived values ── */
  const hasCoords = event.latitude != null && event.longitude != null;
  const hasAddress = Boolean(event.street_address);
  const hasLocation = hasCoords || hasAddress;
  const directionsUrl = buildDirectionsUrl(
    event.latitude,
    event.longitude,
    event.street_address,
    event.cities?.name,
    event.state,
    event.zip_code
  );
  const dateTimeStr = buildDateTimeString(
    event.start_date,
    event.start_time,
    event.end_date,
    event.end_time
  );
  const priceStr = buildPriceDisplay(
    event.is_free,
    event.ticket_price_min,
    event.ticket_price_max
  );
  const primaryCta = event.ticket_url || event.website || null;
  const neighborhoodName = event.neighborhoods?.name;
  const neighborhoodSlug = event.neighborhoods?.slug;
  const categoryName = event.categories?.name;
  const locationLabel =
    event.venue_name ||
    [event.street_address, event.cities?.name, event.state].filter(Boolean).join(", ") ||
    null;

  /* ── Mapbox static map URL (prefer coords) ── */
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const staticMapUrl =
    hasCoords && mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-s+c1121f(${event.longitude},${event.latitude})/${event.longitude},${event.latitude},14,0/800x450@2x?access_token=${mapboxToken}`
      : null;
  const miniMapUrl =
    hasCoords && mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-s+c1121f(${event.longitude},${event.latitude})/${event.longitude},${event.latitude},14,0/340x200@2x?access_token=${mapboxToken}`
      : null;

  return (
    <>
      {/* ========== 1. HERO ========== */}
      <section className="relative w-full">
        <div className="relative w-full h-[52vh] sm:h-[58vh] md:h-[65vh] min-h-[340px] max-h-[640px] overflow-hidden">
          <Image
            src={event.featured_image_url || PH_HERO}
            alt={event.title}
            fill
            unoptimized
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {/* Event type pill */}
          {event.event_type && (
            <span className="inline-block px-5 py-1.5 bg-[#fee198] text-black text-[10px] font-semibold uppercase tracking-[0.12em] rounded-full mb-5">
              {event.event_type}
            </span>
          )}

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight max-w-4xl">
            {event.title}
          </h1>

          {event.tagline && (
            <p className="text-white/70 text-sm md:text-base mt-3 max-w-2xl">
              {event.tagline}
            </p>
          )}

          {/* Date/time line */}
          <div className="flex items-center gap-2 text-white/60 text-xs sm:text-sm mt-5">
            <Calendar size={14} />
            <span>{dateTimeStr}</span>
          </div>

          {/* CTAs */}
          {(primaryCta || directionsUrl) && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {primaryCta && (
                <a
                  href={primaryCta}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#fee198] text-black text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-black hover:text-[#fee198] transition-colors"
                >
                  <Ticket size={14} />
                  {event.ticket_url ? "Get Tickets" : "Visit Website"}
                </a>
              )}
              <button
                className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-transparent text-white text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full border border-white/30 hover:border-[#fee198] hover:text-[#fee198] transition-colors"
                aria-label="Add to calendar"
              >
                <CalendarPlus size={14} />
                Add to Calendar
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========== 2. BREADCRUMBS ========== */}
      <div className="site-container pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-gray-mid flex-wrap">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          {neighborhoodSlug && neighborhoodName && (
            <>
              <Link
                href={`/neighborhoods/${neighborhoodSlug}`}
                className="hover:text-black transition-colors"
              >
                {neighborhoodName}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <Link href="/hub/events" className="hover:text-black transition-colors">
            Events
          </Link>
          <ChevronRight size={12} />
          <span className="text-black font-medium">{event.title}</span>
        </nav>
      </div>

      {/* ========== 3 + 4. MAIN CONTENT + SIDEBAR ========== */}
      <div className="site-container pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- Main Column ---------- */}
          <div className="space-y-16">
            {/* ===== 3a. DESCRIPTION ===== */}
            <section>
              <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
                <div>
                  <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
                    About This Event
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-black leading-tight mt-1">
                    Event Details
                  </h2>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                {event.description ? (
                  <div
                    className="space-y-4 text-[15px] leading-[1.8]"
                    dangerouslySetInnerHTML={{
                      __html: event.description.replace(/\n/g, "<br/>"),
                    }}
                  />
                ) : (
                  <p className="text-gray-mid text-base italic">
                    Details coming soon.
                  </p>
                )}
              </div>
            </section>

            {/* ===== 3b. FEATURED VIDEO (conditional) ===== */}
            {featuredVideo && featuredVideo.embed_url && (
              <section>
                <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
                  <div>
                    <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
                      Watch
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-semibold text-black leading-tight mt-1">
                      Event Preview
                    </h2>
                  </div>
                </div>
                <div className="relative w-full aspect-video overflow-hidden bg-black">
                  <iframe
                    src={featuredVideo.embed_url}
                    title={featuredVideo.title || "Event video"}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {featuredVideo.title && (
                  <p className="text-sm font-semibold mt-3">
                    {featuredVideo.title}
                  </p>
                )}
              </section>
            )}

            {/* ===== 3c. IMAGE GALLERY — TODO: Implement when event_images table exists ===== */}
            {/* 
              Future: Query event_images WHERE event_id = event.id
              Order: is_primary DESC, sort_order ASC, created_at ASC
              Limit: event_tier_visibility_rules.max_items (fallback: 6)
              Hide if 0 images.
            */}

            {/* ===== 3d. MAIN MAP ===== */}
            {hasLocation ? (
              <section>
                <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
                  <div>
                    <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
                      Location
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-semibold text-black leading-tight mt-1">
                      Getting There
                    </h2>
                  </div>
                </div>

                {/* Map image */}
                <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
                  {staticMapUrl ? (
                    <Image
                      src={staticMapUrl}
                      alt={`Map showing ${event.venue_name || event.title}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MapPin
                          size={32}
                          className="text-[#c1121f] mx-auto mb-2"
                        />
                        <p className="text-sm text-gray-mid">
                          {locationLabel || "Event Location"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location label + directions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                  {locationLabel && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-gray-mid shrink-0" />
                      <span className="font-medium">{locationLabel}</span>
                    </div>
                  )}
                  {directionsUrl && (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a1a1a] text-white text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-[#e6c46d] hover:text-black transition-colors shrink-0"
                    >
                      <Navigation size={13} />
                      Get Directions
                    </a>
                  )}
                </div>
              </section>
            ) : (
              <section>
                <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
                  <div>
                    <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
                      Location
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-semibold text-black leading-tight mt-1">
                      Getting There
                    </h2>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 px-6 py-10 text-center">
                  <MapPin
                    size={28}
                    className="text-gray-mid mx-auto mb-2"
                  />
                  <p className="text-gray-mid text-sm font-medium">
                    Location TBA
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Check back for venue details.
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* ---------- SIDEBAR ---------- */}
          <aside className="lg:sticky lg:top-6 self-start space-y-6">
            {/* ===== 4a. EVENT DETAILS CARD ===== */}
            <SidebarWidget>
              <WidgetTitle>Event Details</WidgetTitle>

              {/* Date & Time */}
              <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                <Calendar
                  size={16}
                  className="text-gray-mid shrink-0 mt-0.5"
                />
                <div>
                  <div className="text-[10px] text-gray-mid uppercase tracking-[0.08em] font-semibold">
                    Date & Time
                  </div>
                  <div className="text-sm font-medium mt-0.5">
                    {formatDateShort(event.start_date)}
                    {event.start_time && (
                      <>
                        <br />
                        {formatTime(event.start_time)}
                        {event.end_time && ` – ${formatTime(event.end_time)}`}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                <DollarSign
                  size={16}
                  className="text-gray-mid shrink-0 mt-0.5"
                />
                <div>
                  <div className="text-[10px] text-gray-mid uppercase tracking-[0.08em] font-semibold">
                    Price
                  </div>
                  <div
                    className={`text-sm font-semibold mt-0.5 ${
                      event.is_free ? "text-[#c1121f]" : "text-black"
                    }`}
                  >
                    {priceStr}
                  </div>
                </div>
              </div>

              {/* Event type */}
              {event.event_type && (
                <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                  <Tag
                    size={16}
                    className="text-gray-mid shrink-0 mt-0.5"
                  />
                  <div>
                    <div className="text-[10px] text-gray-mid uppercase tracking-[0.08em] font-semibold">
                      Type
                    </div>
                    <div className="text-sm font-medium mt-0.5">
                      {event.event_type}
                    </div>
                  </div>
                </div>
              )}

              {/* Neighborhood */}
              {neighborhoodSlug && neighborhoodName && (
                <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                  <MapPin
                    size={16}
                    className="text-gray-mid shrink-0 mt-0.5"
                  />
                  <div>
                    <div className="text-[10px] text-gray-mid uppercase tracking-[0.08em] font-semibold">
                      Neighborhood
                    </div>
                    <Link
                      href={`/neighborhoods/${neighborhoodSlug}`}
                      className="text-sm font-medium text-[#c1121f] hover:underline mt-0.5 inline-block"
                    >
                      {neighborhoodName} →
                    </Link>
                  </div>
                </div>
              )}

              {/* Venue / Organizer — plain text (future: link to /places/[slug]) */}
              {(event.venue_name || event.organizer_name) && (
                <div className="pt-4 mt-2 border-t border-gray-200">
                  <div className="text-[10px] text-gray-mid uppercase tracking-[0.08em] font-semibold mb-2">
                    {event.venue_name ? "Venue" : "Organizer"}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-gray-mid" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold">
                        {event.venue_name || event.organizer_name}
                      </p>
                      {event.organizer_name && event.venue_name && (
                        <p className="text-xs text-gray-mid mt-0.5">
                          by {event.organizer_name}
                        </p>
                      )}
                      {event.organizer_url && (
                        <a
                          href={event.organizer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#c1121f] hover:underline mt-0.5 inline-flex items-center gap-1"
                        >
                          Visit <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* TODO: When venue_business_id / organizer_business_id exist, 
                  query business_listings for full card + business_contacts */}

              {/* Sidebar CTAs */}
              <div className="flex flex-col gap-2 mt-6">
                {primaryCta && (
                  <a
                    href={primaryCta}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-[#fee198] text-black text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-black hover:text-[#fee198] transition-colors"
                  >
                    <Ticket size={14} />
                    {event.ticket_url ? "Get Tickets" : "Visit Website"}
                  </a>
                )}
                {event.website && event.ticket_url && (
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 border border-gray-200 text-black text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full hover:border-[#e6c46d] transition-colors"
                  >
                    <Globe size={14} />
                    Visit Website
                  </a>
                )}
              </div>
            </SidebarWidget>

            {/* ===== 4b. MINI MAP ===== */}
            {hasLocation && (
              <SidebarWidget className="!p-0 overflow-hidden">
                <div className="relative w-full h-[200px] bg-gray-100">
                  {miniMapUrl ? (
                    <Image
                      src={miniMapUrl}
                      alt="Event location"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <MapPin size={24} className="text-gray-mid" />
                    </div>
                  )}
                </div>
                <div className="px-4 py-3">
                  {locationLabel && (
                    <p className="text-xs font-semibold">{locationLabel}</p>
                  )}
                  {neighborhoodName && (
                    <p className="text-[11px] text-gray-mid mt-0.5">
                      {neighborhoodName}
                      {event.cities?.name ? `, ${event.cities.name}` : ""}
                      {event.state ? `, ${event.state}` : ""}
                    </p>
                  )}
                </div>
              </SidebarWidget>
            )}

            {/* ===== 4c. SIDEBAR CTAs (Add to Calendar + Get Directions) ===== */}
            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-[#1a1a1a] text-white text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-[#e6c46d] hover:text-black transition-colors">
                <CalendarPlus size={14} />
                Add to Calendar
              </button>
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 border border-gray-200 text-black text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full hover:border-[#e6c46d] transition-colors"
                >
                  <Navigation size={14} />
                  Get Directions
                </a>
              )}
            </div>

            {/* ===== Submit Event CTA ===== */}
            <SubmitEventCTA />
          </aside>
        </div>
      </div>

      {/* ========== 5. RELATED EVENTS ========== */}
      <div className="site-container border-t border-gray-200 pt-12 pb-16">
        <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-4">
          <div>
            <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
              More Events
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
              You Might Also Like
            </h2>
          </div>
          <Link
            href="/hub/events"
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-black hover:text-red-brand transition-colors shrink-0 pb-1"
          >
            See All
            <ArrowRight size={14} />
          </Link>
        </div>

        {related.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {related.map((rel) => {
              const { month, day } = eventDateParts(rel.start_date);
              return (
                <Link
                  key={rel.id}
                  href={`/events/${rel.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/2] overflow-hidden mb-4">
                    <Image
                      src={rel.featured_image_url || PH_EVENT}
                      alt={rel.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {rel.is_featured && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-[#fee198] text-black text-[10px] font-semibold uppercase tracking-[0.1em] rounded-full z-10">
                        Featured
                      </span>
                    )}
                    {/* Date badge */}
                    <div className="absolute bottom-3 right-3 bg-white text-center px-3 py-2 shadow-md z-10">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#c1121f]">
                        {month}
                      </div>
                      <div className="text-xl font-bold text-black leading-none">
                        {day}
                      </div>
                    </div>
                  </div>

                  {(rel.event_type || rel.categories?.name) && (
                    <span className="inline-block px-3 py-1 bg-[#fee198] text-black text-[10px] font-semibold uppercase tracking-[0.1em] rounded-full mb-2">
                      {rel.event_type || rel.categories?.name}
                    </span>
                  )}

                  <h3 className="font-display text-lg font-semibold text-black leading-snug group-hover:text-red-brand transition-colors">
                    {rel.title}
                  </h3>

                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-mid">
                    <MapPin size={13} />
                    {rel.neighborhoods?.name ||
                      rel.venue_name ||
                      "Atlanta"}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16 bg-[#f5f0eb] border border-gray-200">
            <h3 className="font-display text-xl font-semibold mb-2">
              No Upcoming Events Listed Yet
            </h3>
            <p className="text-sm text-gray-mid mb-6 max-w-sm mx-auto">
              Have an event coming up? Submit it and we&rsquo;ll get it
              live.
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#fee198] text-black text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-black hover:text-[#fee198] transition-colors"
            >
              Submit an Event
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
