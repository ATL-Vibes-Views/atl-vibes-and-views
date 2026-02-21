import { PH_DEFAULT } from "@/lib/placeholders";
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
import { getPageHero, getHeroPost } from "@/lib/queries/settings";
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

  /* ── Hero ── */
  const _hero = await getPageHero("beyond_atl").catch(() => ({ type: null, imageUrl: null, videoUrl: null, postId: null, alt: null }));
  const _heroPost = (_hero.type === "post" || _hero.type === "featured_post") ? await getHeroPost(_hero.postId).catch(() => null) : null;

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
          eyebrow="Beyond ATL"
          title="Beyond Atlanta"
          variant="overlay"
          heroType={(_hero.type ?? "image") as "image" | "video" | "post" | "featured_post"}
          backgroundImage={_hero.imageUrl ?? PH_DEFAULT}
          videoUrl={_hero.videoUrl ?? undefined}
          heroPost={_heroPost}
          description="From Decatur to Marietta — discover what's happening across metro Atlanta and beyond."
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
