import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Calendar, ArrowRight, ChevronRight, Play } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import {
  Sidebar,
  SidebarWidget,
  WidgetTitle,
  NewsletterWidget,
  AdPlacement,
  NeighborhoodsWidget,
  SubmitCTA,
  SubmitEventCTA,
} from "@/components/Sidebar";
import {
  getNeighborhoodBySlug,
  getNeighborhoods,
  getBlogPosts,
  getBusinesses,
  getEvents,
  getCategoryBySlug,
  getMediaItems,
} from "@/lib/queries";

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

const PH_HERO = "https://placehold.co/1920x600/1a1a1a/e6c46d?text=Neighborhood";
const PH_POST = "https://placehold.co/600x400/1a1a1a/e6c46d?text=Story";
const PH_BIZ = "https://placehold.co/600x400/c1121f/fee198?text=Business";
const PH_VIDEO = "https://placehold.co/960x540/222222/e6c46d?text=Video";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function eventDateParts(dateStr: string): { month: string; day: string } {
  const d = new Date(dateStr + "T00:00:00");
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate().toString(),
  };
}

function pickHeadline(slug: string, options: string[]): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return options[Math.abs(hash) % options.length];
}

function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? "";
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

  return (
    <>
      {/* ========== 1. HERO ========== */}
      <section className="relative w-full">
        <div className="relative w-full aspect-[21/7] md:aspect-[21/6] overflow-hidden">
          <Image
            src={neighborhood.hero_image_url || PH_HERO}
            alt={neighborhood.name}
            fill
            unoptimized
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3">
            {areaName}
          </span>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-white">
            {neighborhood.name}
          </h1>
          {neighborhood.tagline && (
            <p className="text-white/70 text-sm md:text-base mt-4 max-w-xl">
              {neighborhood.tagline}
            </p>
          )}
        </div>
      </section>

      {/* ========== 2. BREADCRUMBS ========== */}
      <div className="site-container pt-4 pb-2">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-gray-mid"
        >
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          {area ? (
            <>
              <Link href="/areas" className="hover:text-black transition-colors">
                Areas
              </Link>
              <ChevronRight size={12} />
              {areaSlug ? (
                <Link
                  href={`/areas/${areaSlug}`}
                  className="hover:text-black transition-colors"
                >
                  {areaName}
                </Link>
              ) : (
                <span>{areaName}</span>
              )}
              <ChevronRight size={12} />
            </>
          ) : (
            <>
              <Link
                href="/neighborhoods"
                className="hover:text-black transition-colors"
              >
                Neighborhoods
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-black font-medium">{neighborhood.name}</span>
        </nav>
      </div>

      {/* ========== 3. SEARCH BAR ========== */}
      <div className="site-container pb-6">
        <SearchBar
          placeholder={`Search in ${neighborhood.name}\u2026`}
          className="mx-auto"
        />
      </div>

      {/* ========== GRID A: STORIES + AD | SIDEBAR 1 ========== */}
      <div className="site-container pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- MAIN COLUMN (Grid A) ---------- */}
          <div className="space-y-28">
            {/* ===== 4. STORIES ===== */}
            <section>
              <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-4">
                <div>
                  <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
                    Stories
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
                    Latest from {storiesLabel}
                  </h2>
                </div>
                <Link
                  href="/city-watch"
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-black hover:text-red-brand transition-colors shrink-0 pb-1"
                >
                  See All <ArrowRight size={14} />
                </Link>
              </div>
              {stories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {stories.map((post) => (
                    <Link
                      key={post.id}
                      href={`/stories/${post.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden mb-4">
                        <Image
                          src={post.featured_image_url || PH_POST}
                          alt={post.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {post.categories?.name && (
                          <span className="px-3 py-1 bg-gold-light text-black text-[10px] font-semibold uppercase tracking-eyebrow rounded-full">
                            {post.categories.name}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-xl md:text-2xl font-semibold text-black leading-snug group-hover:text-red-brand transition-colors">
                        {post.title}
                      </h3>
                      {post.published_at && (
                        <p className="text-gray-mid text-xs mt-2">
                          {formatDate(post.published_at)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-mid text-base">
                  No stories in {storiesLabel} yet. Check back soon.
                </p>
              )}
            </section>

            {/* ===== 5. HORIZONTAL AD ===== */}
            <section>
              <Link
                href="/hub/businesses"
                className="block bg-gray-100 flex items-center justify-center py-12 border border-dashed border-gray-300 hover:border-[#e6c46d] hover:bg-gray-50 transition-colors group"
              >
                <div className="text-center">
                  <span className="text-xs text-gray-mid uppercase tracking-eyebrow group-hover:text-black transition-colors">
                    Advertise Here
                  </span>
                  <p className="text-sm text-gray-400 mt-1">
                    Reach thousands of Atlanta locals
                  </p>
                </div>
              </Link>
            </section>

            {/* ===== NO RESULTS (search mode) ===== */}
            {search &&
              stories.length === 0 &&
              eatsBusinesses.length === 0 &&
              events.length === 0 && (
                <section className="text-center py-16">
                  <p className="text-gray-mid text-lg">
                    No results for &ldquo;{search}&rdquo; in{" "}
                    {neighborhood.name}
                  </p>
                </section>
              )}
          </div>

          {/* ---------- SIDEBAR 1 ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              <NewsletterWidget
                title={`${neighborhood.name} Updates`}
                description={`Get the latest stories, events, and business openings from ${neighborhood.name}.`}
              />
              <AdPlacement slot="sidebar_top" />
              <NeighborhoodsWidget
                title={`Nearby in ${areaName}`}
                neighborhoods={nearbyNeighborhoods}
              />
            </Sidebar>
          </aside>
        </div>
      </div>

      {/* ========== 6. VIDEO SCROLLER — FULL-WIDTH PAGE BREAK ========== */}
      <section className="w-full bg-black py-16 md:py-24">
        <div className="site-container">
          <div className="flex items-end justify-between mb-10 border-b border-white/10 pb-4">
            <div>
              <span className="text-white text-[11px] font-semibold uppercase tracking-eyebrow">
                Watch &amp; Listen
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white leading-tight mt-1">
                Recent Video
              </h2>
            </div>
            <Link
              href="/media"
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-white/60 hover:text-[#fee198] transition-colors shrink-0 pb-1"
            >
              See All <ArrowRight size={14} />
            </Link>
          </div>

          {scrollerVideos.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
              {featuredVideo && (
                <div>
                  <Link href="/media" className="group block">
                    <div className="relative aspect-video bg-[#111] overflow-hidden">
                      {featuredVideo.embed_url ? (
                        <Image
                          src={`https://img.youtube.com/vi/${extractYouTubeId(featuredVideo.embed_url)}/hqdefault.jpg`}
                          alt={featuredVideo.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Image
                          src={PH_VIDEO}
                          alt={featuredVideo.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#fee198]/90 flex items-center justify-center group-hover:bg-[#fee198] transition-colors">
                          <Play size={24} className="text-black ml-1 fill-black" />
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="mt-5">
                    <span className="text-[#fee198] text-[10px] font-semibold uppercase tracking-eyebrow">
                      Video
                    </span>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-white mt-3 leading-snug">
                      {featuredVideo.title}
                    </h3>
                    {featuredVideo.published_at && (
                      <p className="text-white/40 text-xs mt-3">
                        {formatDate(featuredVideo.published_at)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {playlistVideos.length > 0 && (
                <div>
                  <Link
                    href="/media"
                    className="text-xs font-semibold uppercase tracking-eyebrow text-white/60 hover:text-[#fee198] transition-colors mb-6 block"
                  >
                    More Videos &rarr;
                  </Link>
                  <div className="space-y-5">
                    {playlistVideos.map((vid) => (
                      <Link
                        key={vid.id}
                        href="/media"
                        className="flex gap-4 group cursor-pointer"
                      >
                        <div className="relative w-28 h-20 shrink-0 bg-[#222] overflow-hidden">
                          {vid.embed_url ? (
                            <Image
                              src={`https://img.youtube.com/vi/${extractYouTubeId(vid.embed_url)}/hqdefault.jpg`}
                              alt={vid.title}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Image
                              src={PH_VIDEO}
                              alt={vid.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full bg-[#fee198]/80 flex items-center justify-center">
                              <Play size={10} className="text-black ml-0.5 fill-black" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-semibold uppercase tracking-eyebrow text-[#fee198]">
                            Video
                          </span>
                          <h4 className="text-white text-sm font-semibold leading-snug mt-1 line-clamp-2 group-hover:text-[#fee198] transition-colors">
                            {vid.title}
                          </h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
              <div>
                <div className="relative aspect-video bg-[#111] overflow-hidden">
                  <Image
                    src={PH_VIDEO}
                    alt="Video coming soon"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#fee198]/90 flex items-center justify-center">
                      <Play size={24} className="text-black ml-1 fill-black" />
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <span className="text-[#fee198] text-[10px] font-semibold uppercase tracking-eyebrow">
                    Video
                  </span>
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-white mt-3 leading-snug">
                    Video Content Coming Soon
                  </h3>
                  <p className="text-white/40 text-xs mt-3 uppercase tracking-wide">
                    ATL Vibes &amp; Views
                  </p>
                </div>
              </div>
              <div>
                <Link
                  href="/media"
                  className="text-xs font-semibold uppercase tracking-eyebrow text-white/60 hover:text-[#fee198] transition-colors mb-6 block"
                >
                  More Videos &rarr;
                </Link>
                <p className="text-white/30 text-sm">
                  More videos coming soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========== GRID B: EATS + EVENTS + NEWSLETTER | SIDEBAR 2 ========== */}
      <div className="site-container py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- MAIN COLUMN (Grid B) ---------- */}
          <div className="space-y-28">
            {/* ===== 7. EATS & DRINKS (6 items) ===== */}
            <section>
              <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-4">
                <div>
                  <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
                    Eats &amp; Drinks
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
                    {eatsHeadline}
                  </h2>
                </div>
                <Link
                  href="/hub/eats-and-drinks"
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-black hover:text-red-brand transition-colors shrink-0 pb-1"
                >
                  See All <ArrowRight size={14} />
                </Link>
              </div>
              {eatsBusinesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {eatsBusinesses.map((biz) => (
                    <Link
                      key={biz.id}
                      href={`/places/${biz.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden mb-4">
                        <Image
                          src={biz.logo || PH_BIZ}
                          alt={biz.business_name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {biz.is_featured && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#c1121f] text-white text-[10px] font-semibold uppercase tracking-eyebrow">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-semibold text-black group-hover:text-red-brand transition-colors">
                        {biz.business_name}
                      </h3>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-mid">
                        <MapPin size={13} />
                        {biz.neighborhoods?.name ?? "Atlanta"}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-mid text-base">
                  No restaurants listed in {eatsLabel} yet. Check back soon.
                </p>
              )}
            </section>

            {/* ===== 8. EVENTS (6 items) ===== */}
            <section>
              <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-4">
                <div>
                  <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
                    Events
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
                    {eventsHeadline}
                  </h2>
                </div>
                <Link
                  href="/hub/events"
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-black hover:text-red-brand transition-colors shrink-0 pb-1"
                >
                  See All <ArrowRight size={14} />
                </Link>
              </div>
              {events.length > 0 ? (
                <div className="space-y-0 divide-y divide-gray-100">
                  {events.map((event) => {
                    const { month, day } = eventDateParts(event.start_date);
                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="shrink-0 w-14 h-14 bg-[#c1121f] text-white flex flex-col items-center justify-center">
                          <span className="text-[10px] font-semibold uppercase">
                            {month}
                          </span>
                          <span className="text-lg font-display font-bold leading-none">
                            {day}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display text-base font-semibold text-black group-hover:text-red-brand transition-colors truncate">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-mid mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              {formatDate(event.start_date)}
                            </span>
                            {event.event_type && (
                              <span>{event.event_type}</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight
                          size={16}
                          className="shrink-0 text-gray-mid group-hover:text-red-brand transition-colors"
                        />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-mid text-base">
                  No upcoming events in {eventsLabel} right now.
                </p>
              )}
            </section>

            {/* ===== 9. NEWSLETTER SIGNUP ===== */}
            <section className="bg-[#f8f5f0] py-12 px-8 md:px-16 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-2 italic">
                Stay Connected to {neighborhood.name}
              </h2>
              <p className="text-gray-mid text-sm mb-8">
                Get the latest on {neighborhood.name}&rsquo;s culture,
                businesses, and events.
              </p>
              <form
                action="#"
                className="flex max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#e6c46d]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-black border-2 border-[#e6c46d] text-white text-xs font-semibold uppercase tracking-eyebrow hover:bg-[#e6c46d] hover:text-black transition-colors flex items-center gap-2"
                >
                  ✈ Subscribe
                </button>
              </form>
              <p className="text-gray-mid/60 text-xs mt-4">
                No spam. Unsubscribe anytime.
              </p>
            </section>
          </div>

          {/* ---------- SIDEBAR 2 ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              {/* S2-1: SubmitCTA */}
              <SubmitCTA
                heading={`Own a Business in ${neighborhood.name}?`}
                description="Get your business in front of thousands of Atlantans."
              />

              {/* S2-2: Featured in the Hub (6 stacked) / Ad fallback */}
              {hubBusinesses.length > 0 ? (
                <SidebarWidget>
                  <WidgetTitle className="text-[#c1121f]">
                    Featured in the Hub
                  </WidgetTitle>
                  <div className="space-y-0 divide-y divide-gray-100">
                    {hubBusinesses.map((biz) => (
                      <Link
                        key={biz.id}
                        href={`/places/${biz.slug}`}
                        className="group flex gap-4 items-start py-3 first:pt-0 last:pb-0"
                      >
                        <div className="relative w-20 h-16 shrink-0 overflow-hidden bg-gray-100">
                          <Image
                            src={
                              biz.logo ||
                              "https://placehold.co/200x160/1a1a1a/e6c46d?text=Biz"
                            }
                            alt={biz.business_name}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {biz.video_url && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-[#fee198] transition-colors">
                                <Play
                                  size={9}
                                  className="text-black ml-0.5 fill-black"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-sm font-semibold text-black group-hover:text-red-brand transition-colors leading-tight">
                            {biz.business_name}
                          </h4>
                          {biz.categories?.name && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gold-light text-black text-[9px] font-semibold uppercase tracking-eyebrow rounded-full">
                              {biz.categories.name}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </SidebarWidget>
              ) : (
                <Link
                  href="/partner"
                  className="block bg-gray-100 border border-dashed border-gray-300 hover:border-[#e6c46d] hover:bg-gray-50 transition-colors group min-h-[400px] flex items-center justify-center"
                >
                  <div className="text-center px-6">
                    <span className="text-xs text-gray-mid uppercase tracking-eyebrow group-hover:text-black transition-colors">
                      Advertise Here
                    </span>
                    <p className="text-sm text-gray-400 mt-1">
                      Reach thousands of Atlanta locals
                    </p>
                  </div>
                </Link>
              )}

              {/* S2-3: SubmitEventCTA */}
              <SubmitEventCTA />
            </Sidebar>
          </aside>
        </div>
      </div>
    </>
  );
}
