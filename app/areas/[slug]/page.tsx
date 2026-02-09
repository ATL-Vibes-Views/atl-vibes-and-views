import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { EventCard } from "@/components/ui/EventCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SearchBar } from "@/components/SearchBar";
import {
  Sidebar,
  NewsletterWidget,
  AdPlacement,
  NeighborhoodsWidget,
  SubmitCTA,
} from "@/components/Sidebar";
import {
  getAreaBySlug,
  getNeighborhoodIdsForArea,
  getNeighborhoods,
  getBlogPosts,
  getBusinesses,
  getEvents,
  getCategoryBySlug,
} from "@/lib/queries";

/* ============================================================
   HELPERS
   ============================================================ */
const PH_HERO = "https://placehold.co/1920x600/1a1a1a/e6c46d?text=Area";
const PH_POST = "https://placehold.co/600x400/1a1a1a/e6c46d?text=Story";
const PH_BIZ = "https://placehold.co/600x400/c1121f/fee198?text=Business";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* Deterministic headline rotation based on slug */
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
   AREA DETAIL PAGE — /areas/[slug]
   ============================================================ */
export default async function AreaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const search = q?.trim() || undefined;

  /* ── Step 0: Area record + neighborhood IDs ── */
  const area = await getAreaBySlug(slug);
  if (!area) return notFound();

  const neighborhoodIds = await getNeighborhoodIdsForArea(area.id);
  const hasNeighborhoods = neighborhoodIds.length > 0;

  /* ── Dining category for Eats & Drinks filter ── */
  const diningCat = await getCategoryBySlug("dining").catch(() => null);

  /* ── Parallel data fetch ── */
  const [sidebarNeighborhoods, areaPosts, eatsRaw, eventsRaw] =
    await Promise.all([
      /* Sidebar: 10 neighborhoods for this area */
      getNeighborhoods({ areaId: area.id, limit: 10 }),

      /* Stories: blog posts linked to area's neighborhoods */
      hasNeighborhoods
        ? getBlogPosts({
            neighborhoodIds,
            limit: 4,
            search,
          }).catch(() => [])
        : Promise.resolve([]),

      /* Eats & Drinks: dining businesses in area */
      hasNeighborhoods
        ? getBusinesses({
            ...(diningCat ? { categoryId: diningCat.id } : {}),
            neighborhoodIds,
            limit: 3,
            search,
          }).catch(() => [])
        : Promise.resolve([]),

      /* Events: upcoming in area */
      hasNeighborhoods
        ? getEvents({
            neighborhoodIds,
            upcoming: true,
            limit: 5,
            search,
          }).catch(() => [])
        : Promise.resolve([]),
    ]);

  /* ── Stories fallback: if 0 area-specific, show city-wide (limit 3) ── */
  let posts = areaPosts;
  const isStoriesFallback = areaPosts.length === 0 && !search;
  if (isStoriesFallback) {
    posts = await getBlogPosts({ limit: 3 }).catch(() => []);
  }
  const storiesLabel = isStoriesFallback ? "Atlanta" : area.name;

  /* ── Eats fallback: if 0 area dining, show city-wide dining (limit 6) ── */
  let eatsList = eatsRaw;
  const isEatsFallback = eatsRaw.length === 0 && !search;
  if (isEatsFallback) {
    eatsList = await getBusinesses({
      ...(diningCat ? { categoryId: diningCat.id } : {}),
      limit: 3,
    }).catch(() => []);
  }
  const eatsLabel = isEatsFallback ? "Atlanta" : area.name;

  /* ── Events fallback: if 0 area events, show city-wide upcoming (limit 5) ── */
  let eventsList = eventsRaw;
  const isEventsFallback = eventsRaw.length === 0 && !search;
  if (isEventsFallback) {
    eventsList = await getEvents({ upcoming: true, limit: 5 }).catch(() => []);
  }
  const eventsLabel = isEventsFallback ? "Atlanta" : area.name;

  /* ── Dedup: track used IDs so nothing appears twice ── */
  const usedIds = new Set<string>();

  const stories = posts.slice(0, 3);
  stories.forEach((p) => usedIds.add(p.id));

  const eatsBusinesses = eatsList.filter((b) => !usedIds.has(b.id));
  eatsBusinesses.forEach((b) => usedIds.add(b.id));

  const events = eventsList.filter((e) => !usedIds.has(e.id));

  /* ── Rotating headlines (use label so fallback says "Atlanta") ── */
  const eatsHeadline = `${pickHeadline(slug, EATS_HEADLINES)} ${eatsLabel}`;
  const eventsHeadline = `${pickHeadline(slug, EVENTS_HEADLINES)} ${eventsLabel}`;

  /*
   * FALLBACK LABEL EXAMPLE — when Buckhead has no area dining results:
   * storiesLabel → "Atlanta" (if no area stories) or "Buckhead"
   * eatsLabel    → "Atlanta" (if no area dining)  or "Buckhead"
   * eventsLabel  → "Atlanta" (if no area events)  or "Buckhead"
   * Headlines render as e.g. "Where to Eat in Atlanta" instead of "Buckhead".
   */

  /* ── Sidebar neighborhood data ── */
  const sidebarNeighborhoodLinks = sidebarNeighborhoods.map((n) => ({
    name: n.name,
    slug: n.slug,
  }));

  return (
    <>
      {/* ========== 1. HERO ========== */}
      <section className="relative w-full">
        <div className="relative w-full h-[52vh] sm:h-[58vh] md:h-[65vh] min-h-[340px] max-h-[640px] overflow-hidden">
          <Image
            src={area.hero_image_url || PH_HERO}
            alt={area.name}
            fill
            unoptimized
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3">
            Explore Atlanta
          </span>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-white">
            {area.name}
          </h1>
          {area.tagline && (
            <p className="text-white/70 text-sm md:text-base mt-3 max-w-xl">
              {area.tagline}
            </p>
          )}
        </div>
      </section>

      {/* ========== 2. BREADCRUMBS ========== */}
      <div className="site-container pt-6 pb-2">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Areas", href: "/areas" },
            { label: area.name },
          ]}
          className="mb-4"
        />

        {/* ========== 3. SEARCH BAR ========== */}
        <SearchBar
          placeholder={`Search in ${area.name}\u2026`}
          className="max-w-md"
        />
        {search && (
          <p className="text-sm text-gray-mid mt-2">
            Showing results for &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      {/* ========== 4. MAIN CONTENT + SIDEBAR ========== */}
      <div className="site-container pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- Main Column ---------- */}
          <div className="space-y-28">
            {/* ===== STORIES (editorial) ===== */}
            <section>
              <SectionHeader
                eyebrow="Stories"
                title={`Latest from ${storiesLabel}`}
                action={{ label: "See All", href: "/city-watch" }}
                className="mb-10"
              />

              {stories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {stories.map((post) => (
                    <Link
                      key={post.id}
                      href={`/stories/${post.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden mb-5">
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

            {/* ===== AD SPACE — horizontal (matches homepage) ===== */}
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

            {/* ===== EATS & DRINKS ===== */}
            <section>
              <SectionHeader
                eyebrow="Eats & Drinks"
                title={eatsHeadline}
                action={{ label: "See All", href: "/hub/eats-and-drinks" }}
                className="mb-10"
              />

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

            {/* ===== EVENTS / THINGS TO DO ===== */}
            <section>
              <SectionHeader
                eyebrow="Events"
                title={eventsHeadline}
                action={{ label: "See All", href: "/hub/events" }}
                className="mb-10"
              />

              {events.length > 0 ? (
                <div className="space-y-0 divide-y divide-gray-100">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      name={event.title}
                      slug={event.slug}
                      startDate={event.start_date}
                      eventType={event.event_type}
                      variant="list"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-mid text-base">
                  No upcoming events in {eventsLabel} right now.
                </p>
              )}
            </section>

            {/* ===== NO RESULTS (search mode only) ===== */}
            {search &&
              stories.length === 0 &&
              eatsBusinesses.length === 0 &&
              events.length === 0 && (
                <section className="text-center py-16">
                  <p className="text-gray-mid text-lg">
                    No results for &ldquo;{search}&rdquo; in {area.name}
                  </p>
                </section>
              )}
          </div>

          {/* ---------- Sidebar (LOCKED ORDER) ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              <NewsletterWidget
                title={`${area.name} Updates`}
                description={`Get the latest stories, events, and business openings from ${area.name}.`}
              />
              <AdPlacement slot="sidebar_top" />
              <NeighborhoodsWidget
                title={`Neighborhoods in ${area.name}`}
                neighborhoods={sidebarNeighborhoodLinks}
              />
              <SubmitCTA
                heading={`Own a Business in ${area.name}?`}
                description="Get your business in front of thousands of Atlantans."
              />
            </Sidebar>
          </aside>
        </div>
      </div>
    </>
  );
}
