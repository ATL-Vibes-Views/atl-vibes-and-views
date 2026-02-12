import {
  AreaLandingContent,
  buildFeed,
} from "@/components/AreaLandingContent";
import {
  getAreas,
  getBlogPosts,
  getContentIndexByToken,
  getMediaItems,
} from "@/lib/queries";
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
const DEFAULT_INTRO = "From Buckhead to the Westside, every corner of Atlanta has its own story. Explore the areas that make this city one of a kind.";

/* ============================================================
   METADATA — from content_index or safe defaults
   ============================================================ */
export async function generateMetadata(): Promise<Metadata> {
  const ci = await getContentIndexByToken("page-areas", { targetType: "area", activeUrl: "/areas" }).catch(() => null);
  return {
    title: ci?.seo_title || "Explore Atlanta by Area — ATL Vibes & Views",
    description:
      ci?.meta_description ||
      "Discover Atlanta's neighborhoods, restaurants, events, and culture across every area of the city.",
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
  const [ci, areas, blogPosts, mediaItems] = await Promise.all([
    getContentIndexByToken("page-areas", {
      targetType: "area",
      activeUrl: "/areas",
    }).catch(() => null),
    getAreas(),
    getBlogPosts({ limit: 8 }),
    getMediaItems({ limit: 4 }).catch(() => []),
  ]);
  console.log(`[/areas] All queries completed in ${Date.now() - fetchStart}ms`);

  /* ── Hero fields from content_index (fallback to defaults) ── */
  const heroTitle = ci?.page_title || DEFAULT_TITLE;
  const heroIntro = ci?.page_intro || DEFAULT_INTRO;
  const heroVideoUrl = ci?.hero_video_url || null;
  const heroImageUrl = ci?.hero_image_url || PH_HERO;

  /* ── Search: filter areas ── */
  const filteredAreas = search
    ? areas.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : areas;

  /* ── Masonry feed: mix blogs + videos ── */
  const feed = buildFeed(blogPosts, mediaItems);

  return (
    <AreaLandingContent
      heroEyebrow="Atlanta Areas"
      heroTitle={heroTitle}
      heroIntro={heroIntro}
      heroVideoUrl={heroVideoUrl}
      heroImageUrl={heroImageUrl}
      search={search}
      searchResultsLabel="Areas"
      filteredCards={filteredAreas}
      cards={areas}
      cardLinkPrefix="/areas/"
      cardsEmptyText="Area listings coming soon."
      mapCtaText="Explore All 261 Neighborhoods →"
      mapCtaHref="/neighborhoods"
      feedEyebrow="Guides & Stories"
      feedTitle="Explore More of Atlanta"
      feedSeeAllHref="/city-watch"
      feed={feed}
    />
  );
}
