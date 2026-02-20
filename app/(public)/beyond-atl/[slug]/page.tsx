import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  LocationDetailContent,
} from "@/components/LocationDetailContent";
import {

  getCityBySlug,
  getCities,
  getBlogPosts,
  getBusinesses,
  getEvents,
  getCategoryBySlug,
  getMediaItems,
} from "@/lib/queries";
import { getRecordHero, getHeroPost } from "@/lib/queries/settings";

export const dynamic = "force-dynamic";

/* ============================================================
   CITY DETAIL PAGE — /beyond-atl/[slug]

   Uses the same LocationDetailContent component as
   /neighborhoods/[slug] — identical layout, city data.

   2-TIER FALLBACK CHAIN:
   Tier 1: This city             → label = city.name
   Tier 2: Citywide (all cities) → label = "Atlanta Metro"

   DO NOT TOUCH: app/neighborhoods/[slug]/page.tsx
   ============================================================ */

function pickHeadline(slug: string, options: string[]): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return options[Math.abs(hash) % options.length];
}

const EATS_HEADLINES = [
  "Best Places to Eat in",
  "Where to Eat in",
  "Top Eats & Drinks in",
];

const EVENTS_HEADLINES = [
  "Things to Do in",
  "Latest Events in",
  "What\u2019s Happening in",
];

/* ============================================================
   METADATA
   ============================================================ */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) return {};
  const title = `${city.name} — Beyond ATL | ATL Vibes & Views`;
  const description =
    city.description ||
    `Explore ${city.name} — restaurants, events, stories, and more from just outside Atlanta.`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

/* ============================================================
   PAGE
   ============================================================ */
export default async function CityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const search = q?.trim() || undefined;

  /* ── City record ── */
  const city = await getCityBySlug(slug);
  if (!city) return notFound();

  /* ── Hero ── */
  const _hero = await getRecordHero(city as unknown as Record<string, unknown>).catch(() => ({ type: null, imageUrl: null, videoUrl: null, postId: null, alt: null }));
  const _heroPost = _hero.type === "post" ? await getHeroPost(_hero.postId).catch(() => null) : null;

  /* ── Other cities for sidebar/pills ── */
  const otherCities = await getCities({
    excludePrimary: true,
    excludeId: city.id,
  }).catch(() => []);

  /* ── Dining category ── */
  const diningCat = await getCategoryBySlug("dining").catch(() => null);

  /* ── Parallel data fetch (tier 1: this city) ── */
  const [cityPosts, eatsT1, eventsT1] = await Promise.all([
    getBlogPosts({ limit: 4, search }).catch(() => []),
    getBusinesses({
      ...(diningCat ? { categoryId: diningCat.id } : {}),
      cityId: city.id,
      limit: 6,
      search,
    }).catch(() => []),
    getEvents({
      cityId: city.id,
      upcoming: true,
      limit: 6,
      search,
    }).catch(() => []),
  ]);

  /* ── 2-TIER FALLBACK: Stories ── */
  let posts = cityPosts;
  let storiesLabel = city.name;

  if (posts.length === 0 && !search) {
    posts = await getBlogPosts({ limit: 3 }).catch(() => []);
    if (posts.length > 0) storiesLabel = "Atlanta Metro";
  }

  /* ── 2-TIER FALLBACK: Eats & Drinks ── */
  let eatsList = eatsT1;
  let eatsLabel = city.name;

  if (eatsList.length === 0 && !search) {
    eatsList = await getBusinesses({
      ...(diningCat ? { categoryId: diningCat.id } : {}),
      limit: 6,
    }).catch(() => []);
    if (eatsList.length > 0) eatsLabel = "Atlanta Metro";
  }

  /* ── 2-TIER FALLBACK: Events ── */
  let eventsList = eventsT1;
  let eventsLabel = city.name;

  if (eventsList.length === 0 && !search) {
    eventsList = await getEvents({ upcoming: true, limit: 6 }).catch(() => []);
    if (eventsList.length > 0) eventsLabel = "Atlanta Metro";
  }

  /* ── Dedup: track used IDs ── */
  const usedIds = new Set<string>();
  const stories = posts.slice(0, 4);
  stories.forEach((p) => usedIds.add(p.id));

  const eatsBusinesses = eatsList.filter((b) => !usedIds.has(b.id));
  eatsBusinesses.forEach((b) => usedIds.add(b.id));

  const events = eventsList.filter((e) => !usedIds.has(e.id));

  /* ── Rotating headlines ── */
  const eatsHeadline = `${pickHeadline(slug, EATS_HEADLINES)} ${eatsLabel}`;
  const eventsHeadline = `${pickHeadline(slug, EVENTS_HEADLINES)} ${eventsLabel}`;

  /* ── Video Scroller: city → citywide (2-tier) ── */
  let scrollerVideos = await getMediaItems({
    limit: 3,
    targetType: "city",
    targetIds: [city.id],
  }).catch(() => []);
  if (scrollerVideos.length === 0) {
    scrollerVideos = await getMediaItems({ limit: 3 }).catch(() => []);
  }
  const featuredVideo = scrollerVideos[0] ?? null;
  const playlistVideos = scrollerVideos.slice(1);

  /* ── Sidebar 2: Featured in the Hub (6 businesses) ── */
  const eventsCat = await getCategoryBySlug("events").catch(() => null);
  const excludeCatIds = new Set(
    [diningCat?.id, eventsCat?.id].filter(Boolean) as string[]
  );

  let hubBizRaw = await getBusinesses({
    featured: true,
    cityId: city.id,
    limit: 10,
  }).catch(() => []);
  if (hubBizRaw.length === 0) {
    hubBizRaw = await getBusinesses({ featured: true, limit: 10 }).catch(
      () => []
    );
  }
  const hubBusinesses = hubBizRaw
    .filter((b) => !b.category_id || !excludeCatIds.has(b.category_id))
    .slice(0, 6);

  /* ── Sidebar pills: other cities ── */
  const cityPills = otherCities
    .slice(0, 8)
    .map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <LocationDetailContent
      name={city.name}
      tagline={city.tagline}
      heroImageUrl={_hero.imageUrl ?? city.hero_image_url}
      heroType={(_hero.type ?? "image") as "image" | "video" | "post"}
      heroVideoUrl={_hero.videoUrl ?? undefined}
      heroPost={_heroPost}
      eyebrow="Beyond ATL"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Beyond ATL", href: "/beyond-atl" },
        { label: city.name },
      ]}
      searchPlaceholder={`Search in ${city.name}\u2026`}
      search={search}
      pills={cityPills}
      pillsLabel="Explore Beyond ATL"
      pillsLinkPrefix="/beyond-atl"
      stories={stories}
      storiesLabel={storiesLabel}
      areaStories={[]}
      areaName=""
      showStoryTip={false}
      eatsBusinesses={eatsBusinesses}
      eatsLabel={eatsLabel}
      eatsHeadline={eatsHeadline}
      events={events}
      eventsLabel={eventsLabel}
      eventsHeadline={eventsHeadline}
      scrollerVideos={scrollerVideos}
      featuredVideo={featuredVideo}
      playlistVideos={playlistVideos}
      nearbyTitle="Other Cities"
      nearbyItems={cityPills}
      nearbyLinkPrefix="/beyond-atl"
      nearbyAllHref="/beyond-atl"
      nearbyAllLabel="Explore All Cities →"
      hubBusinesses={hubBusinesses}
      submitHeading={`Own a Business in ${city.name}?`}
      newsletterTitle={`${city.name} Updates`}
      newsletterDescription={`Get the latest stories, events, and business openings from ${city.name}.`}
    />
  );
}
