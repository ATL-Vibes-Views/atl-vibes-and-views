import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Play, ChevronRight } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { NewsletterForm } from "@/components/NewsletterForm";
import {
  Sidebar,
  NewsletterWidget,
  AdPlacement,
  NeighborhoodsWidget,
  SubmitCTA,
  SubmitEventCTA,
} from "@/components/Sidebar";
import {
  getAreas,
  getNeighborhoods,
  getBlogPosts,
  getContentIndexByToken,
  getMediaItems,
  getNeighborhoodsByPopularity,
} from "@/lib/queries";
import type { Metadata } from "next";

/* ============================================================
   AREA LANDING PAGE — /areas — Server Component

   LOCKED SECTION ORDER (main column):
   1. Hero (content_index driven: video → image → static)
   2. Search Bar (areas + neighborhoods)
   3. Interactive Map (text list fallback)
   4. Horizontal Ad Space
   5. Evergreen Masonry Feed (blogs + videos mixed)
   6. Newsletter CTA (full-width)

   SIDEBAR:
   1. NewsletterWidget
   2. AdPlacement
   3. Featured Neighborhoods (top 8)
   4. SubmitCTA
   5. SubmitEventCTA

   DO NOT TOUCH: app/page.tsx, app/areas/[slug]/page.tsx, components/Sidebar.tsx
   ============================================================ */

const PH_HERO = "https://placehold.co/1920x600/1a1a1a/e6c46d?text=Explore+Atlanta";
const PH_POST = "https://placehold.co/600x400/1a1a1a/e6c46d?text=Story";

const DEFAULT_TITLE = "Explore Atlanta by Area";
const DEFAULT_INTRO = "From Buckhead to the Westside, every corner of Atlanta has its own story. Explore the areas that make this city one of a kind.";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

  /* ── Data fetch ── */
  const ci = await getContentIndexByToken("page-areas", { targetType: "area", activeUrl: "/areas" }).catch(() => null);

  const [areas, allNeighborhoods, blogPosts, popularNeighborhoods] =
    await Promise.all([
      getAreas(),
      getNeighborhoods({ limit: 261 }),
      getBlogPosts({ limit: 8 }),
      getNeighborhoodsByPopularity({ limit: 8 }).catch(() => []),
    ]);

  /* ── Media: prefer area-linked videos, fallback to sitewide ── */
  const areaIds = areas.map((a) => a.id);
  let mediaItems = await getMediaItems({
    limit: 4,
    targetType: "area",
    targetIds: areaIds,
  }).catch(() => []);
  if (mediaItems.length === 0) {
    mediaItems = await getMediaItems({ limit: 4 }).catch(() => []);
  }

  /* ── Hero fields from content_index (fallback to defaults) ── */
  const heroTitle = ci?.page_title || DEFAULT_TITLE;
  const heroIntro = ci?.page_intro || DEFAULT_INTRO;
  const heroVideoUrl = ci?.hero_video_url || null;
  const heroImageUrl = ci?.hero_image_url || PH_HERO;

  /* ── Search: filter areas + neighborhoods ── */
  const filteredAreas = search
    ? areas.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : areas;

  const filteredNeighborhoods = search
    ? allNeighborhoods.filter((n) =>
        n.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const hasSearchResults =
    !search || filteredAreas.length > 0 || filteredNeighborhoods.length > 0;

  /* ── Sidebar neighborhoods (ranked by story count → biz count → alpha) ── */
  /* getNeighborhoodsByPopularity handles ranking; alphabetical fallback if it fails */
  const sidebarNeighborhoods =
    popularNeighborhoods.length > 0
      ? popularNeighborhoods.map((n) => ({ name: n.name, slug: n.slug }))
      : allNeighborhoods
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 8)
          .map((n) => ({ name: n.name, slug: n.slug }));

  /* ── Masonry feed: mix blogs + videos ── */
  /* Rule: 1 video per 4 cards, max 2 videos in first 8 */
  const usedIds = new Set<string>();

  type FeedItem =
    | { kind: "blog"; id: string; title: string; slug: string; image?: string; category?: string; date?: string }
    | { kind: "video"; id: string; title: string; slug: string; embed_url?: string; date?: string };

  const blogCards: FeedItem[] = blogPosts.map((p) => ({
    kind: "blog" as const,
    id: p.id,
    title: p.title,
    slug: p.slug,
    image: p.featured_image_url || undefined,
    category: p.categories?.name || undefined,
    date: p.published_at || undefined,
  }));

  const videoCards: FeedItem[] = mediaItems.map((m) => ({
    kind: "video" as const,
    id: m.id,
    title: m.title,
    slug: m.slug,
    embed_url: m.embed_url || undefined,
    date: m.published_at || undefined,
  }));

  /* Interleave: insert 1 video after every 4 blogs */
  const feed: FeedItem[] = [];
  let blogIdx = 0;
  let videoIdx = 0;
  let videosPlaced = 0;

  while (blogIdx < blogCards.length || videoIdx < videoCards.length) {
    /* Place up to 4 blogs */
    for (let i = 0; i < 4 && blogIdx < blogCards.length; i++) {
      const card = blogCards[blogIdx++];
      if (!usedIds.has(card.id)) {
        usedIds.add(card.id);
        feed.push(card);
      }
    }
    /* Place 1 video (max 2 total in first 8) */
    if (videoIdx < videoCards.length && videosPlaced < 2) {
      const card = videoCards[videoIdx++];
      if (!usedIds.has(card.id)) {
        usedIds.add(card.id);
        feed.push(card);
        videosPlaced++;
      }
    }
  }

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <>
      {/* ========== 1. HERO ========== */}
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

      {/* ========== 2. SEARCH BAR ========== */}
      <div className="site-container pt-10 pb-4">
        <SearchBar
          placeholder="Search areas and neighborhoods…"
          className="mx-auto"
        />
        {search && (
          <p className="text-sm text-gray-mid mt-3 text-center">
            Showing results for &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      {/* ── Search Results (only when searching) ── */}
      {search && (
        <div className="site-container pb-8">
          {hasSearchResults ? (
            <div className="space-y-6">
              {filteredAreas.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-eyebrow text-[#c1121f] mb-3">
                    Areas
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {filteredAreas.map((a) => (
                      <Link
                        key={a.id}
                        href={`/areas/${a.slug}`}
                        className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#fee198] hover:text-black transition-colors"
                      >
                        {a.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {filteredNeighborhoods.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-eyebrow text-[#c1121f] mb-3">
                    Neighborhoods
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {filteredNeighborhoods.slice(0, 12).map((n) => (
                      <Link
                        key={n.id}
                        href={`/neighborhoods/${n.slug}`}
                        className="px-4 py-1.5 border border-gray-200 text-xs text-black rounded-full hover:border-[#e6c46d] hover:bg-gold-light/30 transition-colors"
                      >
                        {n.name}
                      </Link>
                    ))}
                    {filteredNeighborhoods.length > 12 && (
                      <span className="px-4 py-1.5 text-xs text-gray-mid">
                        +{filteredNeighborhoods.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-mid text-sm text-center">
              No matches &mdash; try a different search.
            </p>
          )}
        </div>
      )}

      {/* ========== 3–6: MAIN + SIDEBAR GRID ========== */}
      <div className="site-container pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- MAIN COLUMN ---------- */}
          <div className="space-y-28">
            {/* ===== 3. AREA CARDS GRID ===== */}
            <section>
              <SectionHeader eyebrow="Areas" title="Explore Atlanta" />
              {areas.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {areas.map((area) => (
                    <Link
                      key={area.id}
                      href={`/areas/${area.slug}`}
                      className="group block relative overflow-hidden aspect-[4/3]"
                    >
                      {area.hero_image_url ? (
                        <Image
                          src={area.hero_image_url}
                          alt={area.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#1a1a1a]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-display text-xl md:text-2xl font-semibold text-white group-hover:text-[#fee198] transition-colors">
                          {area.name}
                        </h3>
                        {area.tagline && (
                          <p className="text-white/60 text-xs mt-1 line-clamp-2">
                            {area.tagline}
                          </p>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={18} className="text-white" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-mid text-sm text-center py-12">
                  Area listings coming soon.
                </p>
              )}
              {/* Transition CTA to neighborhoods */}
              <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
                <Link
                  href="/neighborhoods"
                  className="flex items-center gap-2 text-sm font-semibold text-black hover:text-[#c1121f] transition-colors"
                >
                  Explore Atlanta Neighborhoods <ArrowRight size={15} />
                </Link>
              </div>
            </section>

            {/* ===== 4. HORIZONTAL AD SPACE ===== */}
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

            {/* ===== 5. EVERGREEN MASONRY FEED ===== */}
            <section>
              <SectionHeader
                eyebrow="Guides & Stories"
                title="Explore More of Atlanta"
                href="/city-watch"
              />
              {feed.length > 0 ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                  {feed.map((item) =>
                    item.kind === "blog" ? (
                      <Link
                        key={item.id}
                        href={`/stories/${item.slug}`}
                        className="group block break-inside-avoid mb-6"
                      >
                        <div className="relative aspect-[3/2] overflow-hidden mb-3">
                          <Image
                            src={item.image || PH_POST}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        {item.category && (
                          <span className="inline-block px-2.5 py-0.5 bg-gold-light text-black text-[9px] font-semibold uppercase tracking-eyebrow rounded-full mb-1.5">
                            {item.category}
                          </span>
                        )}
                        <h3 className="font-display text-base font-semibold text-black leading-snug group-hover:text-red-brand transition-colors">
                          {item.title}
                        </h3>
                        {item.date && (
                          <p className="text-gray-mid text-[11px] mt-1.5">
                            {formatDate(item.date)}
                          </p>
                        )}
                      </Link>
                    ) : (
                      <Link
                        key={item.id}
                        href={`/media`}
                        className="group block break-inside-avoid mb-6"
                      >
                        <div className="relative aspect-video overflow-hidden mb-3 bg-black">
                          {item.embed_url ? (
                            <Image
                              src={`https://img.youtube.com/vi/${extractYouTubeId(item.embed_url)}/hqdefault.jpg`}
                              alt={item.title}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-[#1a1a1a]" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-[#fee198] transition-colors">
                              <Play size={14} className="text-black ml-0.5 fill-black" />
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] font-semibold uppercase tracking-eyebrow text-[#c1121f]">
                          Video
                        </span>
                        <h3 className="font-display text-base font-semibold text-black leading-snug mt-1 group-hover:text-red-brand transition-colors">
                          {item.title}
                        </h3>
                        {item.date && (
                          <p className="text-gray-mid text-[11px] mt-1.5">
                            {formatDate(item.date)}
                          </p>
                        )}
                      </Link>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#f8f5f0]">
                  <h3 className="font-display text-2xl font-semibold mb-2">
                    More Guides Coming Soon
                  </h3>
                  <p className="text-gray-mid text-sm">
                    We&rsquo;re building out area guides, stories, and videos. Check back soon.
                  </p>
                </div>
              )}
            </section>

            {/* ===== 6. NEWSLETTER CTA (full-width at bottom) ===== */}
            <section className="bg-[#f8f5f0] py-16 px-8 md:px-16 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-2 italic">
                Join The A-List Newsletter
              </h2>
              <p className="text-gray-mid text-sm mb-8">
                Get the latest on Atlanta&rsquo;s culture, neighborhoods, and events.
              </p>
              <NewsletterForm />
              <p className="text-gray-mid/60 text-xs mt-4">No spam. Unsubscribe anytime.</p>
            </section>
          </div>

          {/* ---------- SIDEBAR ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              <NewsletterWidget />
              <AdPlacement slot="sidebar_top" />
              <NeighborhoodsWidget
                title="Featured Neighborhoods"
                neighborhoods={sidebarNeighborhoods}
              />
              <SubmitCTA />
              <SubmitEventCTA />
            </Sidebar>
          </aside>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   LOCAL COMPONENTS
   ============================================================ */

function SectionHeader({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-4">
      <div>
        <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
          {eyebrow}
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-black hover:text-red-brand transition-colors shrink-0 pb-1"
        >
          See All <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

/* Extract YouTube video ID from various URL formats */
function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? "";
}
