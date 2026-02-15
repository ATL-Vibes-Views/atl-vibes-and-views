import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, Play } from "lucide-react";
import { EventCard } from "@/components/ui/EventCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HeroSection } from "@/components/ui/HeroSection";
import { SearchBar } from "@/components/SearchBar";
import ServerAdPlacement from "@/components/ads/AdPlacement";
import {
  Sidebar,
  SidebarWidget,
  WidgetTitle,
  NewsletterWidget,
  NeighborhoodsWidget,
  SubmitCTA,
  SubmitEventCTA,
} from "@/components/Sidebar";

/* ============================================================
   SHARED LOCATION DETAIL LAYOUT
   Used by /neighborhoods/[slug] and /beyond-atl/[slug]
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

function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? "";
}

export interface LocationDetailProps {
  /* Identity */
  name: string;
  tagline?: string | null;
  heroImageUrl?: string | null;

  /* Layout labels */
  eyebrow: string;
  breadcrumbs: { label: string; href?: string }[];
  searchPlaceholder: string;
  search?: string;

  /* Mobile pills */
  pills: { name: string; slug: string }[];
  pillsLabel: string;
  pillsLinkPrefix: string;

  /* Stories */
  stories: any[];
  storiesLabel: string;

  /* Area stories — empty for city pages */
  areaStories: any[];
  areaName: string;
  areaSlug?: string;

  /* Story tip CTA — hidden for city pages */
  showStoryTip: boolean;

  /* Eats & Drinks */
  eatsBusinesses: any[];
  eatsLabel: string;
  eatsHeadline: string;

  /* Events */
  events: any[];
  eventsLabel: string;
  eventsHeadline: string;

  /* Video scroller */
  scrollerVideos: any[];
  featuredVideo: any | null;
  playlistVideos: any[];

  /* Sidebar 1 — nearby */
  nearbyTitle: string;
  nearbyItems: { name: string; slug: string }[];
  nearbyLinkPrefix?: string;
  nearbyAllHref?: string;
  nearbyAllLabel?: string;

  /* Sidebar 2 — hub businesses */
  hubBusinesses: any[];

  /* CTA labels */
  submitHeading: string;
  newsletterTitle: string;
  newsletterDescription: string;

  /* Ad placement keys */
  adInlineKey?: string;
  adSidebarKey?: string;
  adNeighborhoodId?: string;
  adAreaId?: string;
}

export function LocationDetailContent(props: LocationDetailProps) {
  const {
    name,
    tagline,
    heroImageUrl,
    eyebrow,
    breadcrumbs,
    searchPlaceholder,
    search,
    pills,
    pillsLabel,
    pillsLinkPrefix,
    stories,
    storiesLabel,
    areaStories,
    areaName,
    areaSlug,
    showStoryTip,
    eatsBusinesses,
    eatsLabel,
    eatsHeadline,
    events,
    eventsLabel,
    eventsHeadline,
    scrollerVideos,
    featuredVideo,
    playlistVideos,
    nearbyTitle,
    nearbyItems,
    nearbyLinkPrefix = "/neighborhoods",
    nearbyAllHref = "/neighborhoods",
    nearbyAllLabel = "See All Neighborhoods →",
    hubBusinesses,
    submitHeading,
    newsletterTitle,
    newsletterDescription,
    adInlineKey = "NEIGHBORHOOD_INLINE_01",
    adSidebarKey = "NEIGHBORHOOD_SIDEBAR_01",
    adNeighborhoodId,
    adAreaId,
  } = props;

  return (
    <>
      {/* ========== 1. HERO ========== */}
      <HeroSection
        variant="overlay"
        backgroundImage={heroImageUrl || PH_HERO}
        eyebrow={eyebrow}
        title={name}
        description={tagline ?? undefined}
      />

      {/* ========== 2. BREADCRUMBS ========== */}
      <div className="site-container pt-4 pb-2">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* ========== 3. SEARCH BAR ========== */}
      <div className="site-container pb-6">
        <SearchBar
          placeholder={searchPlaceholder}
          className="mx-auto"
        />
      </div>

      {/* ========== MOBILE: Nearby pills (horizontal scroll) ========== */}
      {pills.length > 0 && (
        <div className="lg:hidden site-container pb-6 overflow-x-auto -mx-4 px-4">
          <p className="text-[10px] font-semibold uppercase tracking-eyebrow text-[#c1121f] mb-2">
            {pillsLabel}
          </p>
          <div className="flex gap-2 whitespace-nowrap">
            {pills.map((n) => (
              <Link
                key={n.slug}
                href={`${pillsLinkPrefix}/${n.slug}`}
                className="inline-block px-3 py-1.5 bg-[#f8f5f0] text-sm text-[#1a1a1a] hover:bg-[#fee198] transition-colors flex-shrink-0"
              >
                {n.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ========== GRID A: STORIES + AD | SIDEBAR 1 ========== */}
      <div className="site-container pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- MAIN COLUMN (Grid A) ---------- */}
          <div className="space-y-28">
            {/* ===== 4. STORIES ===== */}
            <section>
              <SectionHeader
                eyebrow="Stories"
                title={`Latest from ${storiesLabel}`}
                action={{ label: "See All", href: "/city-watch" }}
                className="mb-10"
              />
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

            {/* ===== MOBILE: Newsletter after stories ===== */}
            <div className="lg:hidden">
              <NewsletterWidget
                title={newsletterTitle}
                description={newsletterDescription}
              />
            </div>

            {/* ===== 4b. MORE FROM [AREA] ===== */}
            {areaStories.length > 0 && (
              <section>
                <SectionHeader
                  eyebrow="From the Area"
                  title={`More from ${areaName}`}
                  action={areaSlug ? { label: "View All", href: `/stories?area=${areaSlug}` } : undefined}
                  className="mb-10"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                  {areaStories.map((post) => (
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
                      <h3 className="font-display text-lg font-semibold text-black leading-snug group-hover:text-red-brand transition-colors">
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
              </section>
            )}

            {/* ===== STORY TIP CTA ===== */}
            {showStoryTip && (
              <section className="bg-[#f8f5f0] px-6 py-8 md:px-10">
                <p className="text-sm text-gray-dark mb-3">
                  Know something happening in {name}?
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-black hover:text-red-brand transition-colors"
                >
                  Submit a Tip <ArrowRight size={14} />
                </Link>
              </section>
            )}

            {/* ===== MOBILE: Ad slot between stories and eats ===== */}
            <div className="lg:hidden">
              <ServerAdPlacement placementKey={adInlineKey} variant="inline" neighborhoodId={adNeighborhoodId} areaId={adAreaId} />
            </div>

            {/* ===== 5. HORIZONTAL AD ===== */}
            <section>
              <ServerAdPlacement placementKey={adInlineKey} variant="inline" neighborhoodId={adNeighborhoodId} areaId={adAreaId} />
            </section>

            {/* ===== NO RESULTS (search mode) ===== */}
            {search &&
              stories.length === 0 &&
              eatsBusinesses.length === 0 &&
              events.length === 0 && (
                <section className="text-center py-16">
                  <p className="text-gray-mid text-lg">
                    No results for &ldquo;{search}&rdquo; in{" "}
                    {name}
                  </p>
                </section>
              )}
          </div>

          {/* ---------- SIDEBAR 1 ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              <NewsletterWidget
                title={newsletterTitle}
                description={newsletterDescription}
              />
              <ServerAdPlacement placementKey={adSidebarKey} variant="sidebar" neighborhoodId={adNeighborhoodId} areaId={adAreaId} />
              <NeighborhoodsWidget
                title={nearbyTitle}
                neighborhoods={nearbyItems}
                linkPrefix={nearbyLinkPrefix}
                seeAllHref={nearbyAllHref}
                seeAllLabel={nearbyAllLabel}
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

            {/* ===== MOBILE: SubmitCTA between sections ===== */}
            <div className="lg:hidden">
              <SubmitCTA
                heading={submitHeading}
                description="Get your business in front of thousands of Atlantans."
              />
            </div>

            {/* ===== 8. EVENTS (6 items) ===== */}
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

            {/* ===== 9. NEWSLETTER SIGNUP ===== */}
            <section className="bg-[#f8f5f0] py-12 px-8 md:px-16 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-2 italic">
                Stay Connected to {name}
              </h2>
              <p className="text-gray-mid text-sm mb-8">
                Get the latest on {name}&rsquo;s culture,
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
                heading={submitHeading}
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
