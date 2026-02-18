import Image from "next/image";
import { AreaLandingContent } from "@/components/AreaLandingContent";
import AreaMap from "@/components/maps/AreaMap";
import {
  getAreas,
  getBlogPosts,
  getBusinesses,
  getContentIndexByToken,
  getMediaItems,
  getNeighborhoods,
  getNeighborhoodsByPopularity,
  getUpcomingEvents,
} from "@/lib/queries";
import { getAllAreaCardData } from "@/lib/queries/map-card-data";
import type { Metadata } from "next";

/* ============================================================
   AREA LANDING PAGE — /areas — Server Component

   Rendering extracted into <AreaLandingContent> (shared with /beyond-atl).
   This file handles data-fetching only.

   DO NOT TOUCH: app/page.tsx, app/areas/[slug]/page.tsx, components/Sidebar.tsx
   ============================================================ */

export const revalidate = 3600; // ISR: regenerate every hour

const PH_HERO = "https://placehold.co/1920x600/1a1a1a/e6c46d?text=Explore+Atlanta";
const DEFAULT_TITLE = "Explore Atlanta by Area";
const DEFAULT_INTRO =
  "From Buckhead to the Westside, every corner of Atlanta has its own story. Explore the areas that make this city one of a kind.";

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
    neighborhoods,
    videos,
    stories,
    guides,
    businesses,
    upcomingEvents,
    topNeighborhoods,
    ci,
    areaCardData,
  ] = await Promise.all([
    getAreas(),
    getNeighborhoods(),
    getMediaItems({ limit: 3, mediaType: "video" }),
    getBlogPosts({ limit: 3, contentType: "news" }),
    getBlogPosts({ limit: 3, contentType: "guide" }),
    getBusinesses({ featured: true, limit: 6 }),
    getUpcomingEvents({ limit: 4 }),
    getNeighborhoodsByPopularity({ limit: 8 }),
    getContentIndexByToken("page-areas", {
      targetType: "area",
      activeUrl: "/areas",
    }).catch(() => null),
    getAllAreaCardData(),
  ]);
  console.log(`[/areas] All queries completed in ${Date.now() - fetchStart}ms`);

  /* ── Hero fields from content_index ── */
  const heroTitle = ci?.page_title || DEFAULT_TITLE;
  const heroIntro = ci?.page_intro || DEFAULT_INTRO;
  const heroVideoUrl = ci?.hero_video_url || null;
  const heroImageUrl = ci?.hero_image_url || PH_HERO;

  /* ── Search: filter areas ── */
  const filteredAreas = search
    ? areas.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : areas;

  /* ── Map data — adapt types for AreaMap props ── */
  const mapAreas = areas.map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    map_center_lat: a.map_center_lat ?? 33.749,
    map_center_lng: a.map_center_lng ?? -84.388,
  }));

  const mapNeighborhoods = neighborhoods.map((n) => ({
    id: n.id,
    name: n.name,
    slug: n.slug,
    area_id: n.area_id,
    geojson_key: n.geojson_key ?? null,
    map_center_lat: n.map_center_lat ?? 33.749,
    map_center_lng: n.map_center_lng ?? -84.388,
  }));

  return (
    <AreaLandingContent
      heroContent={
        <section className="relative w-full">
          <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-[65vh] overflow-hidden">
            {heroVideoUrl ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={heroVideoUrl} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={heroImageUrl}
                alt={heroTitle}
                fill
                unoptimized
                className="object-cover"
                priority
                sizes="100vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-20">
            <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3">
              Atlanta Areas
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white max-w-4xl leading-tight">
              {heroTitle}
            </h1>
            <p className="text-white/70 text-sm md:text-base mt-4 max-w-xl">
              {heroIntro}
            </p>
          </div>
        </section>
      }
      mapContent={
        <AreaMap
          mode="areas"
          areas={mapAreas}
          neighborhoods={mapNeighborhoods}
          areaCardData={areaCardData}
          height="600px"
        />
      }
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
