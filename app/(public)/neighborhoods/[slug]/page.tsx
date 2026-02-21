import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  LocationDetailContent,
} from "@/components/LocationDetailContent";
import {

  getNeighborhoodBySlug,
  getNeighborhoods,
  getBlogPosts,
  getBusinesses,
  getEvents,
  getCategoryBySlug,
  getMediaItems,
} from "@/lib/queries";
import { getRecordHero, getHeroPost } from "@/lib/queries/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const neighborhood = await getNeighborhoodBySlug(slug).catch(() => null);
  if (!neighborhood) return { title: "Neighborhood Not Found" };

  const areaName = neighborhood.areas?.name || "Atlanta";
  const title = `${neighborhood.name} — ${areaName}`;
  const description =
    neighborhood.tagline ||
    `Explore ${neighborhood.name} in ${areaName} — restaurants, events, stories, and things to do.`;

  return {
    title,
    description,
    openGraph: {
      title: `${neighborhood.name} | ATL Vibes & Views`,
      description,
      url: `https://atlvibesandviews.com/neighborhoods/${slug}`,
      ...(neighborhood.hero_image_url
        ? { images: [{ url: neighborhood.hero_image_url }] }
        : {}),
    },
  };
}

/* ============================================================
   NEIGHBORHOOD DETAIL PAGE — /neighborhoods/[slug]

   LAYOUT (LOCKED):

   GRID A (main + Sidebar 1) — above page break:
   1. Hero
   2. Breadcrumbs
   3. Search Bar
   4. Stories
   5. Horizontal Ad
   + Sidebar 1: NewsletterWidget, AdPlacement, Nearby Neighborhoods

   FULL-WIDTH PAGE BREAK:
   6. Video Scroller (black bg, 3 videos, #fee198 controls)
      Fallback: neighborhood → area → citywide

   GRID B (main + Sidebar 2) — below page break:
   7. Eats & Drinks (6 items)
   8. Events (6 items)
   9. Newsletter Signup
   + Sidebar 2: SubmitCTA, Featured in the Hub (6 stacked),
     SubmitEventCTA. If zero businesses → ad fallback.

   3-TIER FALLBACK CHAIN:
   Tier 1: This neighborhood        → label = neighborhood.name
   Tier 2: Same-area neighbors       → label = area.name
   Tier 3: Citywide                  → label = "Atlanta"

   DO NOT TOUCH: app/page.tsx, app/areas/page.tsx, app/areas/[slug]/page.tsx
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
   PAGE
   ============================================================ */
export default async function NeighborhoodDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const search = q?.trim() || undefined;

  /* ── Neighborhood record (includes area via join) ── */
  const neighborhood = await getNeighborhoodBySlug(slug);
  if (!neighborhood) return notFound();

  /* ── Hero ── */
  const _hero = await getRecordHero(neighborhood as unknown as Record<string, unknown>).catch(() => ({ type: null, imageUrl: null, videoUrl: null, postId: null, alt: null }));
  console.log("[DEBUG] neighborhood hero_content_type:", neighborhood.hero_content_type);
  console.log("[DEBUG] neighborhood hero_featured_post_id:", neighborhood.hero_featured_post_id);
  console.log("[DEBUG] _hero result:", JSON.stringify(_hero));
  const _heroPost = (_hero.type === "post" || _hero.type === "featured_post") ? await getHeroPost(_hero.postId).catch(() => null) : null;
  console.log("[DEBUG] _heroPost result:", JSON.stringify(_heroPost));

  const area = neighborhood.areas;
  const areaName = area?.name || "Atlanta";
  const areaSlug = area?.slug;

  /* ── Same-area neighbor IDs (for tier-2 fallback) ── */
  const sameAreaNeighborhoods = area
    ? await getNeighborhoods({ areaId: area.id, limit: 30 }).catch(() => [])
    : [];
  const neighborIds = sameAreaNeighborhoods
    .filter((n) => n.id !== neighborhood.id)
    .map((n) => n.id);

  /* ── Dining category ── */
  const diningCat = await getCategoryBySlug("dining").catch(() => null);

  /* ── Parallel data fetch (tier 1: this neighborhood) ── */
  const [neighborhoodPosts, eatsT1, eventsT1] = await Promise.all([
    getBlogPosts({
      neighborhoodIds: [neighborhood.id],
      limit: 4,
      search,
    }).catch(() => []),

    getBusinesses({
      ...(diningCat ? { categoryId: diningCat.id } : {}),
      neighborhoodIds: [neighborhood.id],
      limit: 6,
      search,
    }).catch(() => []),

    getEvents({
      neighborhoodIds: [neighborhood.id],
      upcoming: true,
      limit: 6,
      search,
    }).catch(() => []),
  ]);

  /* ── 3-TIER FALLBACK: Stories ── */
  let posts = neighborhoodPosts;
  let storiesLabel = neighborhood.name;

  if (posts.length === 0 && !search && neighborIds.length > 0) {
    posts = await getBlogPosts({ neighborhoodIds: neighborIds, limit: 4 }).catch(
      () => []
    );
    if (posts.length > 0) storiesLabel = areaName;
  }
  if (posts.length === 0 && !search) {
    posts = await getBlogPosts({ limit: 3 }).catch(() => []);
    if (posts.length > 0) storiesLabel = "Atlanta";
  }

  /* ── 3-TIER FALLBACK: Eats & Drinks ── */
  let eatsList = eatsT1;
  let eatsLabel = neighborhood.name;

  if (eatsList.length === 0 && !search && neighborIds.length > 0) {
    eatsList = await getBusinesses({
      ...(diningCat ? { categoryId: diningCat.id } : {}),
      neighborhoodIds: neighborIds,
      limit: 6,
    }).catch(() => []);
    if (eatsList.length > 0) eatsLabel = areaName;
  }
  if (eatsList.length === 0 && !search) {
    eatsList = await getBusinesses({
      ...(diningCat ? { categoryId: diningCat.id } : {}),
      limit: 6,
    }).catch(() => []);
    if (eatsList.length > 0) eatsLabel = "Atlanta";
  }

  /* ── 3-TIER FALLBACK: Events ── */
  let eventsList = eventsT1;
  let eventsLabel = neighborhood.name;

  if (eventsList.length === 0 && !search && neighborIds.length > 0) {
    eventsList = await getEvents({
      neighborhoodIds: neighborIds,
      upcoming: true,
      limit: 6,
    }).catch(() => []);
    if (eventsList.length > 0) eventsLabel = areaName;
  }
  if (eventsList.length === 0 && !search) {
    eventsList = await getEvents({ upcoming: true, limit: 6 }).catch(() => []);
    if (eventsList.length > 0) eventsLabel = "Atlanta";
  }

  /* ── Area-wide stories (sibling neighborhoods, excluding this one) ── */
  const areaStoryIds = new Set(posts.map((p) => p.id));
  let areaStories: typeof posts = [];
  if (area && neighborIds.length > 0 && !search) {
    const areaPostsRaw = await getBlogPosts({
      neighborhoodIds: neighborIds,
      limit: 6,
    }).catch(() => []);
    areaStories = areaPostsRaw.filter((p) => !areaStoryIds.has(p.id)).slice(0, 6);
  }

  /* ── Dedup: track used IDs ── */
  const usedIds = new Set<string>();
  const stories = posts.slice(0, 4);
  stories.forEach((p) => usedIds.add(p.id));
  areaStories.forEach((p) => usedIds.add(p.id));

  const eatsBusinesses = eatsList.filter((b) => !usedIds.has(b.id));
  eatsBusinesses.forEach((b) => usedIds.add(b.id));

  const events = eventsList.filter((e) => !usedIds.has(e.id));

  /* ── Rotating headlines ── */
  const eatsHeadline = `${pickHeadline(slug, EATS_HEADLINES)} ${eatsLabel}`;
  const eventsHeadline = `${pickHeadline(slug, EVENTS_HEADLINES)} ${eventsLabel}`;

  /* ── Sidebar 1: nearby neighborhoods ── */
  const nearbyNeighborhoods = sameAreaNeighborhoods
    .filter((n) => n.slug !== slug)
    .slice(0, 8)
    .map((n) => ({ name: n.name, slug: n.slug }));

  /* ── Video Scroller: neighborhood → area → citywide (3 videos) ── */
  let scrollerVideos = await getMediaItems({
    limit: 3,
    targetType: "neighborhood",
    targetIds: [neighborhood.id],
  }).catch(() => []);
  if (scrollerVideos.length === 0 && area) {
    scrollerVideos = await getMediaItems({
      limit: 3,
      targetType: "area",
      targetIds: [area.id],
    }).catch(() => []);
  }
  if (scrollerVideos.length === 0) {
    scrollerVideos = await getMediaItems({ limit: 3 }).catch(() => []);
  }
  const featuredVideo = scrollerVideos[0] ?? null;
  const playlistVideos = scrollerVideos.slice(1);

  /* ── Sidebar 2: Featured in the Hub (6 businesses, exclude dining + events) ── */
  const eventsCat = await getCategoryBySlug("events").catch(() => null);
  const excludeCatIds = new Set(
    [diningCat?.id, eventsCat?.id].filter(Boolean) as string[]
  );

  let hubBizRaw = await getBusinesses({
    featured: true,
    neighborhoodIds: [neighborhood.id],
    limit: 10,
  }).catch(() => []);
  if (hubBizRaw.length === 0 && neighborIds.length > 0) {
    hubBizRaw = await getBusinesses({
      featured: true,
      neighborhoodIds: neighborIds,
      limit: 10,
    }).catch(() => []);
  }
  if (hubBizRaw.length === 0) {
    hubBizRaw = await getBusinesses({ featured: true, limit: 10 }).catch(
      () => []
    );
  }
  const hubBusinesses = hubBizRaw
    .filter((b) => !b.category_id || !excludeCatIds.has(b.category_id))
    .slice(0, 6);

  /* ── Breadcrumbs ── */
  const breadcrumbs = area
    ? [
        { label: "Home", href: "/" },
        { label: "Areas", href: "/areas" },
        ...(areaSlug
          ? [{ label: areaName, href: `/areas/${areaSlug}` }]
          : [{ label: areaName }]),
        { label: neighborhood.name },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Neighborhoods", href: "/neighborhoods" },
        { label: neighborhood.name },
      ];

  return (
    <LocationDetailContent
      name={neighborhood.name}
      tagline={neighborhood.tagline}
      heroImageUrl={_hero.imageUrl ?? neighborhood.hero_image_url}
      heroType={(_hero.type ?? "image") as "image" | "video" | "post" | "featured_post"}
      heroVideoUrl={_hero.videoUrl ?? undefined}
      heroPost={_heroPost}
      eyebrow={areaName}
      breadcrumbs={breadcrumbs}
      searchPlaceholder={`Search in ${neighborhood.name}\u2026`}
      search={search}
      pills={nearbyNeighborhoods}
      pillsLabel={`Nearby in ${areaName}`}
      pillsLinkPrefix="/neighborhoods"
      stories={stories}
      storiesLabel={storiesLabel}
      areaStories={areaStories}
      areaName={areaName}
      areaSlug={areaSlug}
      showStoryTip={true}
      eatsBusinesses={eatsBusinesses}
      eatsLabel={eatsLabel}
      eatsHeadline={eatsHeadline}
      events={events}
      eventsLabel={eventsLabel}
      eventsHeadline={eventsHeadline}
      scrollerVideos={scrollerVideos}
      featuredVideo={featuredVideo}
      playlistVideos={playlistVideos}
      nearbyTitle={`Nearby in ${areaName}`}
      nearbyItems={nearbyNeighborhoods}
      hubBusinesses={hubBusinesses}
      submitHeading={`Own a Business in ${neighborhood.name}?`}
      newsletterTitle={`${neighborhood.name} Updates`}
      newsletterDescription={`Get the latest stories, events, and business openings from ${neighborhood.name}.`}
    />
  );
}
