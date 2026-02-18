import { AreaLandingContent } from "@/components/AreaLandingContent";
import {
  getAreas,
  getBlogPosts,
  getBusinesses,
  getContentIndexByToken,
  getMediaItems,
  getNeighborhoodsByPopularity,
  getUpcomingEvents,
} from "@/lib/queries";
import type { Metadata } from "next";

/* ============================================================
   AREA LANDING PAGE — /areas — Server Component

   Rendering extracted into <AreaLandingContent> (shared with /beyond-atl).
   This file handles data-fetching only.

   DO NOT TOUCH: app/page.tsx, app/areas/[slug]/page.tsx, components/Sidebar.tsx
   ============================================================ */

export const revalidate = 3600; // ISR: regenerate every hour

/* ============================================================
   METADATA — from content_index or safe defaults
   ============================================================ */
export async function generateMetadata(): Promise<Metadata> {
  const ci = await getContentIndexByToken("page-areas", { targetType: "area", activeUrl: "/areas" }).catch(() => null);
  const title = ci?.seo_title || "Explore Atlanta by Area — ATL Vibes & Views";
  const description =
    ci?.meta_description ||
    "Discover Atlanta's neighborhoods, restaurants, events, and culture across every area of the city.";
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

/* ============================================================
   PAGE
   ============================================================ */
export default async function AreasLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = q?.trim() || undefined;

  /* ── Data fetch — single parallel batch ── */
  const fetchStart = Date.now();
  const [
    areas,
    videos,
    stories,
    guides,
    businesses,
    upcomingEvents,
    topNeighborhoods,
  ] = await Promise.all([
    getAreas(),
    getMediaItems({ limit: 3, mediaType: "video" }),
    getBlogPosts({ limit: 3, contentType: "news" }),
    getBlogPosts({ limit: 3, contentType: "guide" }),
    getBusinesses({ featured: true, limit: 6 }),
    getUpcomingEvents({ limit: 4 }),
    getNeighborhoodsByPopularity({ limit: 8 }),
  ]);
  console.log(`[/areas] All queries completed in ${Date.now() - fetchStart}ms`);

  /* ── Search: filter areas ── */
  const filteredAreas = search
    ? areas.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : areas;

  return (
    <AreaLandingContent
      search={search}
      searchResultsLabel="Areas"
      filteredCards={filteredAreas}
      cards={areas}
      cardLinkPrefix="/areas/"
      mapCtaText="Explore All 261 Neighborhoods →"
      mapCtaHref="/neighborhoods"
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
