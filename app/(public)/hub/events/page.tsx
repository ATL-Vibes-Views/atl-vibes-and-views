import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import {
  getAreas,
  getNeighborhoods,
  getEvents,
  getNeighborhoodIdsForArea,
  getNeighborhoodsByPopularity,
} from "@/lib/queries";
import { getPageHero, getHeroPost } from "@/lib/queries/settings";
import { HeroSection } from "@/components/ui/HeroSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events in Atlanta",
  description:
    "Concerts, food festivals, art walks, and everything happening across Atlanta. Find your next experience.",
  openGraph: {
    title: "Events in Atlanta | ATL Vibes & Views",
    description:
      "Concerts, food festivals, art walks, and everything happening across Atlanta.",
    url: "https://atlvibesandviews.com/hub/events",
  },
};
import {
  SubmitEventCTA,
  SidebarWidget,
  WidgetTitle,
  NeighborhoodsWidget,
} from "@/components/Sidebar";
import { EventsClient } from "./EventsClient";

/* ============================================================
   CONSTANTS
   ============================================================ */
const PH_HERO = "/images/default-hero.png";

/* ============================================================
   EVENTS ARCHIVE PAGE — /hub/events
   ============================================================ */
export default async function EventsArchivePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    area?: string;
    neighborhood?: string;
    type?: string;
    category?: string;
    mode?: string;
  }>;
}) {
  const filters = await searchParams;
  const search = filters.q?.trim() || undefined;
  const areaFilter = filters.area || undefined;
  const neighborhoodFilter = filters.neighborhood || undefined;
  const typeFilter = filters.type || undefined;
  const categoryFilter = filters.category || undefined;
  const mode = filters.mode || "upcoming";

  const today = new Date().toISOString().split("T")[0];

  /* ── Hero ── */
  const _hero = await getPageHero("hub_events").catch(() => ({ type: null, imageUrl: null, videoUrl: null, postId: null, alt: null }));
  const _heroPost = _hero.type === "post" ? await getHeroPost(_hero.postId).catch(() => null) : null;

  /* ── Parallel: areas, neighborhoods, popular neighborhoods ── */
  const [areas, allNeighborhoods, popularNeighborhoods] = await Promise.all([
    getAreas(),
    getNeighborhoods(),
    getNeighborhoodsByPopularity({ limit: 8 }),
  ]);

  /* ── Resolve neighborhood IDs for area-based filtering ── */
  let filterNeighborhoodIds: string[] | undefined;

  if (neighborhoodFilter) {
    filterNeighborhoodIds = [neighborhoodFilter];
  } else if (areaFilter) {
    filterNeighborhoodIds = await getNeighborhoodIdsForArea(areaFilter);
    if (filterNeighborhoodIds.length === 0) filterNeighborhoodIds = undefined;
  }

  /* ── Fetch ALL active events (we'll partition client-side) ── */
  const allEvents = await getEvents({
    status: "active",
    search,
    ...(filterNeighborhoodIds ? { neighborhoodIds: filterNeighborhoodIds } : {}),
  });

  /* ── Partition: current/upcoming vs past ── */
  const upcomingEvents = allEvents.filter((e) => {
    if (e.end_date) return e.end_date >= today;
    return e.start_date >= today;
  });

  const currentEvents = allEvents.filter((e) => {
    if (e.end_date) return e.start_date <= today && e.end_date >= today;
    return e.start_date === today;
  });

  const pastEvents = allEvents
    .filter((e) => {
      if (e.end_date) return e.end_date < today;
      return e.start_date < today;
    })
    .sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

  /* ── Apply event_type + category filters ── */
  const filterByTypeAndCategory = (events: typeof allEvents) => {
    let result = events;
    if (typeFilter) result = result.filter((e) => e.event_type === typeFilter);
    if (categoryFilter)
      result = result.filter((e) => e.categories?.slug === categoryFilter);
    return result;
  };

  const filteredUpcoming = filterByTypeAndCategory(upcomingEvents);
  const filteredCurrent = filterByTypeAndCategory(currentEvents);
  const filteredPast = filterByTypeAndCategory(pastEvents);

  /* ── Distinct event types for filter dropdown ── */
  const eventTypes = [
    ...new Set(allEvents.map((e) => e.event_type).filter(Boolean)),
  ].sort() as string[];

  /* ── Distinct categories for filter dropdown ── */
  const categories = [
    ...new Map(
      allEvents
        .filter((e) => e.categories?.name && e.categories?.slug)
        .map((e) => [e.categories!.slug, e.categories!.name])
    ),
  ]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  /* ── Section 3: Featured Events (Premium-first) ── */
  const seenEventIds = new Set<string>();

  let featuredEvents = filteredUpcoming
    .filter((e) => e.tier === "Premium" || e.is_featured)
    .sort((a, b) => {
      const dateA = new Date(a.start_date + "T" + (a.start_time || "00:00"));
      const dateB = new Date(b.start_date + "T" + (b.start_time || "00:00"));
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  /* Fallback: latest 3 upcoming if no premium/featured */
  if (featuredEvents.length === 0 && !search && !typeFilter && !categoryFilter) {
    featuredEvents = filteredUpcoming.slice(0, 3);
  }

  featuredEvents.forEach((e) => seenEventIds.add(e.id));

  /* ── Map events (all upcoming with coordinates, NO dedup) ── */
  const mapEvents = filteredUpcoming
    .filter((e) => e.latitude != null && e.longitude != null)
    .map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      latitude: e.latitude!,
      longitude: e.longitude!,
      is_featured: e.is_featured,
      tier: e.tier,
    }));

  /* ── Grid events (deduped against featured) ── */
  const activeList =
    mode === "past"
      ? filteredPast
      : mode === "current"
      ? filteredCurrent
      : filteredUpcoming;
  const gridEvents = activeList.filter((e) => !seenEventIds.has(e.id));

  /* ── Sidebar: popular neighborhoods ── */
  const sidebarNeighborhoodLinks = popularNeighborhoods.map((n) => ({
    name: n.name,
    slug: n.slug,
  }));

  /* ── Sidebar component (passed to client via composition) ── */
  const sidebarContent = (
    <>
      {/* Submit Event CTA (primary) */}
      <SubmitEventCTA />

      {/* Ad Slot — Sidebar */}
      <SidebarWidget className="bg-gray-50 border border-gray-200">
        <div className="flex items-center justify-center h-[250px] text-center">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-[0.1em]">
              Advertisement
            </p>
            <p className="text-[10px] text-gray-300 mt-1">300 × 250</p>
          </div>
        </div>
      </SidebarWidget>

      {/* Top Neighborhoods — From Supabase · By Event Count */}
      <NeighborhoodsWidget
        title="Top Neighborhoods"
        neighborhoods={sidebarNeighborhoodLinks}
      />
    </>
  );

  return (
    <>
      {/* ========== 1. HERO ========== */}
      <HeroSection
        eyebrow="Explore Atlanta"
        title="Events in Atlanta"
        description="Concerts, food festivals, art walks, and everything happening across the city. Find your next Atlanta experience."
        heroType={(_hero.type ?? "image") as "image" | "video" | "post"}
        backgroundImage={_hero.imageUrl ?? PH_HERO}
        videoUrl={_hero.videoUrl ?? undefined}
        heroPost={_heroPost}
      />

      {/* ========== 2. BREADCRUMBS ========== */}
      <div className="site-container pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-gray-mid">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/hub" className="hover:text-black transition-colors">
            The Hub
          </Link>
          <ChevronRight size={12} />
          <span className="text-black font-medium">Events</span>
        </nav>
      </div>

      {/* ========== SECTIONS 3–END (interactive) ========== */}
      <EventsClient
        areas={areas.map((a) => ({ id: a.id, name: a.name, slug: a.slug }))}
        neighborhoods={allNeighborhoods.map((n) => ({
          id: n.id,
          name: n.name,
          slug: n.slug,
          area_id: n.area_id,
        }))}
        eventTypes={eventTypes}
        categories={categories}
        featuredEvents={featuredEvents}
        mapEvents={mapEvents}
        gridEvents={gridEvents}
        totalGridCount={gridEvents.length}
        currentFilters={{
          q: search,
          area: areaFilter,
          neighborhood: neighborhoodFilter,
          type: typeFilter,
          category: categoryFilter,
          mode: mode === "upcoming" ? undefined : mode,
        }}
        sidebar={sidebarContent}
      />

      {/* ========== JSON-LD: BreadcrumbList ========== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://atlvibesandviews.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "The Hub",
                item: "https://atlvibesandviews.com/hub",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Events",
              },
            ],
          }),
        }}
      />
    </>
  );
}
