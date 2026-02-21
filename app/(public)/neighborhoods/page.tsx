import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, Play } from "lucide-react";
import { PH_DEFAULT } from "@/lib/placeholders";
import { NewsletterForm } from "@/components/NewsletterForm";
import { NeighborhoodsDiscover } from "@/components/NeighborhoodsDiscover";
import {
  Sidebar,
  SidebarWidget,
  WidgetTitle,
  SubmitCTA,
  SubmitEventCTA,
} from "@/components/Sidebar";
import {
  getAreas,
  getNeighborhoods,
  getBlogPosts,
  getBusinesses,
  getContentIndexByToken,
  getMediaItems,
  getCategoryBySlug,
  getBusinessCountsByNeighborhood,
  getStoryCountsByNeighborhood,
} from "@/lib/queries";
import { getPageHero, getHeroPost } from "@/lib/queries/settings";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

/* ============================================================
   NEIGHBORHOOD LANDING PAGE — /neighborhoods — Server Component

   SECTION ORDER:

   1. Hero
   2. Breadcrumbs
   3. Grid A: Discover Your Neighborhood (search + area dropdown + cards) + Sidebar A
   4. Horizontal Ad
   5. Video Scroller (full-width black page break)
   6. Grid B: Masonry Feed + Sidebar B
   7. Newsletter CTA (full-width)
   ============================================================ */

const PH_HERO = PH_DEFAULT;
const PH_POST = PH_DEFAULT;
const PH_VIDEO = PH_DEFAULT;

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
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await searchParams;

  /* ── Content index for hero/SEO ── */
  const ci = await getContentIndexByToken("page-neighborhoods", {
    targetType: "neighborhood",
    activeUrl: "/neighborhoods",
  }).catch(() => null);

  /* ── Parallel data fetch ── */
  const [areas, allNeighborhoods, blogPosts] = await Promise.all([
    getAreas(),
    getNeighborhoods({ limit: 261 }),
    getBlogPosts({ limit: 8 }),
  ]);

  /* ── Video Scroller: area-linked → citywide fallback (3 videos) ── */
  const areaIds = areas.map((a) => a.id);
  let scrollerVideos = await getMediaItems({
    limit: 3,
    targetType: "area",
    targetIds: areaIds,
  }).catch(() => []);
  if (scrollerVideos.length === 0) {
    scrollerVideos = await getMediaItems({ limit: 3 }).catch(() => []);
  }

  /* ── Masonry media: neighborhood-linked → sitewide fallback ── */
  const neighborhoodIds = allNeighborhoods.map((n) => n.id);
  let masonryMedia = await getMediaItems({
    limit: 4,
    targetType: "neighborhood",
    targetIds: neighborhoodIds,
  }).catch(() => []);
  if (masonryMedia.length === 0) {
    masonryMedia = await getMediaItems({ limit: 4 }).catch(() => []);
  }

  /* ── Sidebar B: Featured in the Hub (1 business, exclude dining + events) ── */
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
  const _hero = await getPageHero("neighborhoods_landing").catch(() => ({ type: null, imageUrl: null, videoUrl: null, postId: null, alt: null }));
  const _heroPost = (_hero.type === "post" || _hero.type === "featured_post") ? await getHeroPost(_hero.postId).catch(() => null) : null;
  const effectiveHeroType = _hero.type ?? "image";
  const effectiveHeroImage = _hero.imageUrl ?? heroImageUrl;
  const effectiveHeroVideo = _hero.videoUrl ?? heroVideoUrl;

  /* ── Business + story counts per neighborhood ── */
  const [bizCounts, storyCounts] = await Promise.all([
    getBusinessCountsByNeighborhood(),
    getStoryCountsByNeighborhood(),
  ]);

  /* ── Area name map for card eyebrows ── */
  const areaNameMap: Record<string, string> = {};
  for (const a of areas) areaNameMap[a.id] = a.name;

  /* ── Sort neighborhoods by story count (most stories first, 0 stories last alphabetically) ── */
  const sortedNeighborhoods = [...allNeighborhoods]
    .sort((a, b) => {
      const aCount = storyCounts[a.id] ?? 0;
      const bCount = storyCounts[b.id] ?? 0;
      if (aCount === 0 && bCount === 0) return a.name.localeCompare(b.name);
      if (aCount === 0) return 1;
      if (bCount === 0) return -1;
      return bCount - aCount;
    })
    .map((n) => ({
      id: n.id,
      name: n.name,
      slug: n.slug,
      area_id: n.area_id,
      hero_image_url: n.hero_image_url ?? null,
    }));

  const discoverAreas = areas.map((a) => ({ id: a.id, name: a.name, slug: a.slug }));

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

  const videoCards: FeedItem[] = masonryMedia.map((m) => ({
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

  /* ── Video scroller: featured (first) + playlist (rest) ── */
  const featuredVideo = scrollerVideos[0] ?? null;
  const playlistVideos = scrollerVideos.slice(1);

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <>
      {/* ========== 1. HERO ========== */}
      <section className="relative w-full">
        <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-[65vh] overflow-hidden">
          {effectiveHeroType === "video" && effectiveHeroVideo ? (
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src={effectiveHeroVideo} type="video/mp4" />
            </video>
          ) : (effectiveHeroType === "post" || effectiveHeroType === "featured_post") && _heroPost ? (
            <Image src={_heroPost.featured_image_url ?? effectiveHeroImage} alt={_heroPost.title} fill unoptimized className="object-cover" priority sizes="100vw" />
          ) : (
            <Image src={effectiveHeroImage} alt={heroTitle} fill unoptimized className="object-cover" priority sizes="100vw" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-20">
          {(effectiveHeroType === "post" || effectiveHeroType === "featured_post") && _heroPost ? (
            <>
              {_heroPost.category && (
                <span className="inline-block bg-[#c1121f] text-white text-[11px] font-semibold uppercase tracking-[0.12em] px-3 py-1 mb-4">{_heroPost.category}</span>
              )}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white max-w-4xl leading-tight">{_heroPost.title}</h1>
              {(_heroPost.author || _heroPost.published_at) && (
                <p className="text-white/70 text-sm mt-3">
                  {_heroPost.author ? `BY ${_heroPost.author.toUpperCase()}` : ""}{_heroPost.author && _heroPost.published_at ? " · " : ""}{_heroPost.published_at ? new Date(_heroPost.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                </p>
              )}
              <Link href={`/stories/${_heroPost.slug}`} className="text-white/70 text-sm hover:text-white transition-colors mt-2">Read Story →</Link>
            </>
          ) : (
            <>
              <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3">Atlanta Neighborhoods</span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white max-w-4xl leading-tight">{heroTitle}</h1>
              <p className="text-white/70 text-sm md:text-base mt-4 max-w-xl">{heroIntro}</p>
            </>
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
          <span className="text-black font-medium">Neighborhoods</span>
        </nav>
      </div>

      {/* ========== 3. DISCOVER YOUR NEIGHBORHOOD + SIDEBAR A ========== */}
      <div className="site-container pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- MAIN: Discover Section ---------- */}
          <NeighborhoodsDiscover
            neighborhoods={sortedNeighborhoods}
            areas={discoverAreas}
            bizCounts={bizCounts}
            storyCounts={storyCounts}
            areaNameMap={areaNameMap}
          />

          {/* ---------- SIDEBAR A ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              {/* Social Share */}
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

              <SubmitCTA />
              <SubmitEventCTA />
            </Sidebar>
          </aside>
        </div>
      </div>

      {/* ========== 4. HORIZONTAL AD (full-width) ========== */}
      <div className="site-container pb-12 md:pb-16">
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
      </div>

      {/* ========== 5. VIDEO SCROLLER — FULL-WIDTH BLACK PAGE BREAK ========== */}
      <section className="w-full bg-black py-16 md:py-24">
        <div className="site-container">
          {/* Section header */}
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
              {/* LEFT — Featured Video (~70%) */}
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
                      <p className="text-white/60 text-xs mt-3">
                        {formatDate(featuredVideo.published_at)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* RIGHT — Video Playlist (~30%) */}
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
            /* Placeholder when no videos exist */
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
                  <p className="text-white/60 text-xs mt-3 uppercase tracking-wide">
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
                <p className="text-white/50 text-sm">
                  More videos coming soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========== GRID B: Masonry Feed + Sidebar B ========== */}
      <div className="site-container pt-16 pb-16 md:pt-20 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- MAIN: 6. MASONRY FEED ---------- */}
          <div>
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
                      href="/media"
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
          </div>

          {/* ---------- SIDEBAR B ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              {/* 1. SubmitCTA */}
              <SubmitCTA />

              {/* 2. Featured in the Hub / Vertical Ad fallback */}
              {featuredBiz ? (
                <SidebarWidget>
                  <WidgetTitle className="text-[#c1121f]">
                    Featured in the Hub
                  </WidgetTitle>
                  <Link
                    href={`/places/${featuredBiz.slug}`}
                    className="group flex gap-4 items-start"
                  >
                    <div className="relative w-24 h-20 shrink-0 overflow-hidden bg-gray-100">
                      <Image
                        src={
                          featuredBiz.logo ||
                          PH_DEFAULT
                        }
                        alt={featuredBiz.business_name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {featuredBiz.video_url && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-[#fee198] transition-colors">
                            <Play size={10} className="text-black ml-0.5 fill-black" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm font-semibold text-black group-hover:text-red-brand transition-colors leading-tight">
                        {featuredBiz.business_name}
                      </h4>
                      {featuredBiz.categories?.name && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gold-light text-black text-[9px] font-semibold uppercase tracking-eyebrow rounded-full">
                          {featuredBiz.categories.name}
                        </span>
                      )}
                      {featuredBiz.neighborhoods?.name && (
                        <p className="text-[11px] text-gray-mid mt-1">
                          {featuredBiz.neighborhoods.name}
                        </p>
                      )}
                    </div>
                  </Link>
                </SidebarWidget>
              ) : (
                <Link
                  href="/partner"
                  className="block bg-gray-100 border border-dashed border-gray-300 hover:border-[#e6c46d] hover:bg-gray-50 transition-colors group min-h-[600px] flex items-center justify-center"
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
            </Sidebar>
          </aside>
        </div>
      </div>

      {/* ========== 7. NEWSLETTER CTA (full-width) ========== */}
      <section className="bg-[#f8f5f0] py-16 px-8 md:px-16 text-center">
        <div className="site-container">
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
        </div>
      </section>
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
