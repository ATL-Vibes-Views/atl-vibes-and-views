import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Share2 } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { NewsletterForm } from "@/components/NewsletterForm";
import {
  Sidebar,
  SidebarWidget,
  WidgetTitle,
  SubmitCTA,
  SubmitEventCTA,
} from "@/components/Sidebar";
import {
  getNeighborhoods,
  getBlogPosts,
  getBusinesses,
  getContentIndexByToken,
  getMediaItems,
  getNeighborhoodsByPopularity,
  getCategoryBySlug,
} from "@/lib/queries";
import type { Metadata } from "next";

/* ============================================================
   NEIGHBORHOOD LANDING PAGE — /neighborhoods — Server Component

   MIRRORS: Area Landing Page (app/areas/page.tsx)
   Same intent (explore + discovery), same structure, scoped data.

   LOCKED SECTION ORDER (main column):
   1. Hero (content_index driven: video → image → static)
   2. Search Bar (neighborhoods only)
   3. Featured Neighborhoods Cluster (replaces map)
   4. Horizontal Ad Space
   5. Evergreen Masonry Feed (blogs + videos mixed)
   6. Newsletter CTA (full-width)

   SIDEBAR:
   1. Featured in the Hub (1 featured business, exclude dining/events)
   2. Social Share (X, Facebook, LinkedIn)
   3. SubmitCTA
   4. SubmitEventCTA

   DO NOT TOUCH: app/page.tsx, app/areas/page.tsx, app/areas/[slug]/page.tsx
   ============================================================ */

const PH_HERO = "https://placehold.co/1920x600/1a1a1a/e6c46d?text=Explore+Neighborhoods";
const PH_POST = "https://placehold.co/600x400/1a1a1a/e6c46d?text=Story";
const PH_NEIGHBORHOOD = "https://placehold.co/400x260/1a1a1a/e6c46d?text=Neighborhood";

const DEFAULT_TITLE = "Explore Atlanta Neighborhoods";
const DEFAULT_INTRO =
  "From historic streets to emerging hotspots, discover the neighborhoods that give Atlanta its character.";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ============================================================
   METADATA
   ============================================================ */
export async function generateMetadata(): Promise<Metadata> {
  const ci = await getContentIndexByToken("page-neighborhoods", {
    targetType: "neighborhood",
    activeUrl: "/neighborhoods",
  }).catch(() => null);
  return {
    title: ci?.seo_title || "Explore Atlanta Neighborhoods — ATL Vibes & Views",
    description:
      ci?.meta_description ||
      "Discover Atlanta's neighborhoods — from Inman Park to Buckhead Village. Local restaurants, events, culture, and more.",
  };
}

/* ============================================================
   PAGE
   ============================================================ */
export default async function NeighborhoodsLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = q?.trim() || undefined;

  /* ── Content index for hero/SEO ── */
  const ci = await getContentIndexByToken("page-neighborhoods", {
    targetType: "neighborhood",
    activeUrl: "/neighborhoods",
  }).catch(() => null);

  /* ── Parallel data fetch ── */
  const [allNeighborhoods, featuredNeighborhoods, blogPosts] =
    await Promise.all([
      getNeighborhoods({ limit: 261 }),
      getNeighborhoodsByPopularity({ limit: 12 }).catch(() => []),
      getBlogPosts({ limit: 8 }),
    ]);

  /* ── Media: prefer neighborhood-linked videos, fallback sitewide ── */
  const neighborhoodIds = allNeighborhoods.map((n) => n.id);
  let mediaItems = await getMediaItems({
    limit: 4,
    targetType: "neighborhood",
    targetIds: neighborhoodIds,
  }).catch(() => []);
  if (mediaItems.length === 0) {
    mediaItems = await getMediaItems({ limit: 4 }).catch(() => []);
  }

  /* ── Sidebar: Featured in the Hub (1 business, exclude dining + events) ── */
  const [diningCat, eventsCat] = await Promise.all([
    getCategoryBySlug("dining").catch(() => null),
    getCategoryBySlug("events").catch(() => null),
  ]);
  const excludeCatIds = new Set(
    [diningCat?.id, eventsCat?.id].filter(Boolean) as string[]
  );
  const featuredBizRaw = await getBusinesses({ featured: true, limit: 5 }).catch(
    () => []
  );
  const featuredBiz = featuredBizRaw.find(
    (b) => !b.category_id || !excludeCatIds.has(b.category_id)
  );

  /* ── Hero fields ── */
  const heroTitle = ci?.page_title || DEFAULT_TITLE;
  const heroIntro = ci?.page_intro || DEFAULT_INTRO;
  const heroVideoUrl = ci?.hero_video_url || null;
  const heroImageUrl = ci?.hero_image_url || PH_HERO;

  /* ── Search: neighborhoods only ── */
  const filteredNeighborhoods = search
    ? allNeighborhoods.filter((n) =>
        n.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const hasSearchResults = !search || filteredNeighborhoods.length > 0;

  /* ── Masonry feed: mix blogs + videos ── */
  const usedIds = new Set<string>();

  type FeedItem =
    | {
        kind: "blog";
        id: string;
        title: string;
        slug: string;
        image?: string;
        category?: string;
        date?: string;
      }
    | {
        kind: "video";
        id: string;
        title: string;
        slug: string;
        embed_url?: string;
        date?: string;
      };

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

  /* Interleave: 1 video after every 4 blogs, max 2 videos in first 8 */
  const feed: FeedItem[] = [];
  let blogIdx = 0;
  let videoIdx = 0;
  let videosPlaced = 0;

  while (blogIdx < blogCards.length || videoIdx < videoCards.length) {
    for (let i = 0; i < 4 && blogIdx < blogCards.length; i++) {
      const card = blogCards[blogIdx++];
      if (!usedIds.has(card.id)) {
        usedIds.add(card.id);
        feed.push(card);
      }
    }
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
            Atlanta Neighborhoods
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
          placeholder="Search neighborhoods…"
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
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-eyebrow text-[#c1121f] mb-3">
                Neighborhoods
              </h3>
              <div className="flex flex-wrap gap-2">
                {filteredNeighborhoods.slice(0, 16).map((n) => (
                  <Link
                    key={n.id}
                    href={`/neighborhoods/${n.slug}`}
                    className="px-4 py-1.5 border border-gray-200 text-xs text-black rounded-full hover:border-[#e6c46d] hover:bg-gold-light/30 transition-colors"
                  >
                    {n.name}
                  </Link>
                ))}
                {filteredNeighborhoods.length > 16 && (
                  <span className="px-4 py-1.5 text-xs text-gray-mid">
                    +{filteredNeighborhoods.length - 16} more
                  </span>
                )}
              </div>
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
            {/* ===== 3. FEATURED NEIGHBORHOODS CLUSTER (replaces map) ===== */}
            <section>
              <SectionHeader
                eyebrow="Neighborhoods"
                title="Discover Your Neighborhood"
              />
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
                {featuredNeighborhoods.map((n) => (
                  <Link
                    key={n.id}
                    href={`/neighborhoods/${n.slug}`}
                    className="group block break-inside-avoid mb-4"
                  >
                    <div className="relative overflow-hidden bg-[#f5f0eb] aspect-[3/2]">
                      <Image
                        src={n.hero_image_url || PH_NEIGHBORHOOD}
                        alt={n.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-display text-sm font-semibold text-white leading-tight">
                          {n.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Transition CTA */}
              <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
                <Link
                  href="/neighborhoods"
                  className="flex items-center gap-2 text-sm font-semibold text-black hover:text-[#c1121f] transition-colors"
                >
                  Explore all Atlanta neighborhoods <ArrowRight size={15} />
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
                title="Neighborhood Guides"
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
                    We&rsquo;re building out neighborhood guides, stories, and videos. Check back soon.
                  </p>
                </div>
              )}
            </section>

            {/* ===== 6. NEWSLETTER CTA (full-width) ===== */}
            <section className="bg-[#f8f5f0] py-16 px-8 md:px-16 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-2 italic">
                Join The A-List Newsletter
              </h2>
              <p className="text-gray-mid text-sm mb-8">
                Get the latest on Atlanta&rsquo;s culture, neighborhoods, and events.
              </p>
              <NewsletterForm />
              <p className="text-gray-mid/60 text-xs mt-4">
                No spam. Unsubscribe anytime.
              </p>
            </section>
          </div>

          {/* ---------- SIDEBAR ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              {/* 1. Featured in the Hub */}
              {featuredBiz && (
                <SidebarWidget>
                  <WidgetTitle className="text-[#c1121f]">
                    Featured in the Hub
                  </WidgetTitle>
                  <Link
                    href={`/places/${featuredBiz.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 mb-3">
                      <Image
                        src={
                          featuredBiz.logo ||
                          "https://placehold.co/400x300/1a1a1a/e6c46d?text=Business"
                        }
                        alt={featuredBiz.business_name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {featuredBiz.video_url && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-[#fee198] transition-colors">
                            <Play
                              size={14}
                              className="text-black ml-0.5 fill-black"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <h4 className="font-display text-sm font-semibold text-black group-hover:text-red-brand transition-colors leading-tight">
                      {featuredBiz.business_name}
                    </h4>
                    {featuredBiz.neighborhoods?.name && (
                      <p className="text-[11px] text-gray-mid mt-1">
                        {featuredBiz.neighborhoods.name}
                      </p>
                    )}
                  </Link>
                </SidebarWidget>
              )}

              {/* 2. Social Share */}
              <SidebarWidget className="border-none bg-transparent px-0">
                <WidgetTitle>Share This Page</WidgetTitle>
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://twitter.com/intent/tweet?url=https://atlvibesandviews.com/neighborhoods&text=Explore+Atlanta+Neighborhoods"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    aria-label="Share on X"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/sharer/sharer.php?u=https://atlvibesandviews.com/neighborhoods"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/sharing/share-offsite/?url=https://atlvibesandviews.com/neighborhoods"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </SidebarWidget>

              {/* 3. SubmitCTA */}
              <SubmitCTA />

              {/* 4. SubmitEventCTA */}
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

function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? "";
}
