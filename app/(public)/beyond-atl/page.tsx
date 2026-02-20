import { AreaLandingContent } from "@/components/AreaLandingContent";
import { HeroSection } from "@/components/ui/HeroSection";
import {
  getCities,
  getBlogPosts,
  getBusinesses,
  getMediaItems,
  getNeighborhoodsByPopularity,
  getUpcomingEvents,
} from "@/lib/queries";
import type { Metadata } from "next";

/* ============================================================
   BEYOND ATL LANDING PAGE — /beyond-atl — Server Component

   Shares rendering with /areas via <AreaLandingContent>.
   This file handles data-fetching only.
   ============================================================ */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Beyond ATL — Explore Cities Outside Atlanta | ATL Vibes & Views",
  description:
    "Discover restaurants, events, stories, and culture from cities just outside Atlanta — Decatur, Marietta, Sandy Springs, and more.",
  openGraph: {
    title: "Beyond ATL — Explore Cities Outside Atlanta | ATL Vibes & Views",
    description:
      "Discover restaurants, events, stories, and culture from cities just outside Atlanta — Decatur, Marietta, Sandy Springs, and more.",
  },
};

/* ============================================================
   PAGE
   ============================================================ */
export default async function BeyondATLLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = q?.trim() || undefined;

  /* ── Data fetch — single parallel batch ── */
  const fetchStart = Date.now();
  const [
    cities,
    videos,
    stories,
    guides,
    businesses,
    upcomingEvents,
    topNeighborhoods,
  ] = await Promise.all([
    getCities({ excludePrimary: true }),
    getMediaItems({ limit: 3, mediaType: "video" }),
    getBlogPosts({ limit: 3, contentType: "news" }),
    getBlogPosts({ limit: 3, contentType: "guide" }),
    getBusinesses({ featured: true, limit: 6 }),
    getUpcomingEvents({ limit: 4 }),
    getNeighborhoodsByPopularity({ limit: 8 }),
  ]);
  console.log(`[/beyond-atl] All queries completed in ${Date.now() - fetchStart}ms`);

  /* ── Search: filter cities ── */
  const filteredCities = search
    ? cities.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : cities;

  return (
    <AreaLandingContent
      search={search}
      searchResultsLabel="Cities"
      heroContent={
        <HeroSection
          variant="overlay"
          backgroundImage="https://placehold.co/1920x600/1a1a1a/e6c46d?text=Beyond+ATL"
          eyebrow="Beyond ATL"
          title="Explore Other Cities"
          description="From Decatur to Marietta — discover what’s happening across metro Atlanta and beyond."
        />
      }
      filteredCards={filteredCities}
      cards={cities}
      cardLinkPrefix="/beyond-atl/"
      mapCtaText="Explore All Cities →"
      mapCtaHref="/beyond-atl"
      videos={videos}
      stories={stories}
      guides={guides}
      storiesSeeAllHref="/city-watch"
      guidesSeeAllHref="/hub/atlanta-guide"
      businesses={businesses}
      businessesSeeAllHref="/hub/eats-and-drinks"
      topNeighborhoods={topNeighborhoods}
      upcomingEvents={upcomingEvents}
    />
  );
}
