import { AreaLandingContent } from "@/components/AreaLandingContent";
import { HeroSection } from "@/components/ui/HeroSection";
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
    ci,
  ] = await Promise.all([
    getAreas(),
    getMediaItems({ limit: 3, mediaType: "video" }),
    getBlogPosts({ limit: 3, contentType: "news" }),
    getBlogPosts({ limit: 3, contentType: "guide" }),
    getBusinesses({ featured: true, limit: 6 }),
    getUpcomingEvents({ limit: 4 }),
    getNeighborhoodsByPopularity({ limit: 8 }),
    getContentIndexByToken("page-areas", { targetType: "area", activeUrl: "/areas" }).catch(() => null),
  ]);
  console.log(`[/areas] All queries completed in ${Date.now() - fetchStart}ms`);

  /* ── Hero fields ── */
  const heroTitle = ci?.page_title || "Explore Atlanta by Area";
  const heroIntro = ci?.page_intro || "Discover Atlanta's neighborhoods, restaurants, events, and culture across every area of the city.";
  const heroImageUrl = ci?.hero_image_url || "https://placehold.co/1920x600/1a1a1a/e6c46d?text=Explore+Areas";

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
      heroContent={
        <HeroSection
          variant="overlay"
          backgroundImage={heroImageUrl}
          eyebrow="Explore Atlanta"
          title={heroTitle}
          description={heroIntro}
        />
      }
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
