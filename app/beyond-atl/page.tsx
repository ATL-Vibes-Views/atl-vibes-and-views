import {
  AreaLandingContent,
  buildFeed,
} from "@/components/AreaLandingContent";
import {
  getCities,
  getBlogPosts,
  getMediaItems,
} from "@/lib/queries";
import type { Metadata } from "next";

/* ============================================================
   BEYOND ATL LANDING PAGE — /beyond-atl — Server Component

   Shares rendering with /areas via <AreaLandingContent>.
   This file handles data-fetching only.
   ============================================================ */

export const revalidate = 3600; // ISR: regenerate every hour

const PH_HERO = "https://placehold.co/1920x600/1a1a1a/e6c46d?text=Beyond+ATL";

export const metadata: Metadata = {
  title: "Beyond ATL — Explore Cities Outside Atlanta | ATL Vibes & Views",
  description:
    "Discover restaurants, events, stories, and culture from cities just outside Atlanta — Decatur, Marietta, Sandy Springs, and more.",
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
  const [cities, blogPosts, mediaItems] = await Promise.all([
    getCities({ excludePrimary: true }),
    getBlogPosts({ limit: 8 }),
    getMediaItems({ limit: 4 }).catch(() => []),
  ]);
  console.log(`[/beyond-atl] All queries completed in ${Date.now() - fetchStart}ms`);

  /* ── Search: filter cities ── */
  const filteredCities = search
    ? cities.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : cities;

  /* ── Masonry feed: mix blogs + videos ── */
  const feed = buildFeed(blogPosts, mediaItems);

  return (
    <AreaLandingContent
      heroEyebrow="Beyond ATL"
      heroTitle="Explore Beyond Atlanta"
      heroIntro="From Decatur to Marietta, discover the vibrant cities and communities just outside Atlanta."
      heroImageUrl={PH_HERO}
      search={search}
      searchResultsLabel="Cities"
      filteredCards={filteredCities}
      cards={cities}
      cardLinkPrefix="/beyond-atl/"
      cardsEmptyText="City listings coming soon."
      mapCtaText="Explore All Cities →"
      mapCtaHref="/beyond-atl"
      feedEyebrow="Guides & Stories"
      feedTitle="Explore Beyond Atlanta"
      feedSeeAllHref="/city-watch"
      feed={feed}
    />
  );
}
