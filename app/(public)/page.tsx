import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, Play, CalendarPlus, Store } from "lucide-react";
import {
  Sidebar,
  NewsletterWidget,
  AdPlacement,
  NeighborhoodsWidget,
  SubmitCTA,
  SocialFollowWidget,
  SubmitEventCTA,
} from "@/components/Sidebar";
import { SaveButton } from "@/components/SaveButton";
import { SearchBar } from "@/components/SearchBar";
import { NewsletterForm } from "@/components/NewsletterForm";
import {
  getBlogPosts,
  getBlogPostById,
  getBusinesses,
  getEvents,
  getAreas,
  getNeighborhoods,
  getFeaturedSlot,
  getCategoryBySlug,
  getMediaItems,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ATL Vibes & Views — The City. The Culture. The Conversation.",
  description:
    "Discover Atlanta's neighborhoods, businesses, events, and culture. Your guide to the city's best stories, eats, and things to do.",
  openGraph: {
    title: "ATL Vibes & Views — The City. The Culture. The Conversation.",
    description:
      "Discover Atlanta's neighborhoods, businesses, events, and culture.",
    url: "https://atlvibesandviews.com",
  },
};

/* ============================================================
   HOMEPAGE — Server Component — LOCKED SECTION ORDER

   1. Featured Stories (hero) — desktop as-is, mobile responsive
   2. Search bar — below hero
   3. Editor's Picks + Interactive Map + Sidebar A
   4. Video module "Watch & Listen" — full-width black page break
   5. Where Atlanta Is Eating + Ad + Events + Newsletter CTA + Sidebar B

   DELETED: Development section
   DEDUP: No item appears on the page twice.
   ============================================================ */

const ph = (label: string, w = 600, h = 400, bg = "1a1a1a", fg = "e6c46d") =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(label)}`;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = q?.trim() || undefined;

  /* ==========================================================
     DATA FETCHING
     ========================================================== */
  const diningCat = await getCategoryBySlug("dining").catch(() => null);

  const [
    heroSlot,
    featuredPosts,
    latestPosts,
    diningBusinesses,
    upcomingEvents,
    areas,
    dbNeighborhoods,
    homeVideos,
  ] = await Promise.all([
    search
      ? Promise.resolve(null)
      : getFeaturedSlot("home_hero").catch(() => null),
    getBlogPosts({ featured: true, limit: 6, search }).catch(() => []),
    getBlogPosts({ limit: 12, search }).catch(() => []),
    diningCat
      ? getBusinesses({ categoryId: diningCat.id, limit: 3, search }).catch(() => [])
      : getBusinesses({ limit: 3, search }).catch(() => []),
    getEvents({ limit: 6, upcoming: true, search }).catch(() => []),
    getAreas().catch(() => []),
    getNeighborhoods({ featured: true, limit: 8 }).catch(() => []),
    getMediaItems({ mediaType: "video", limit: 3 }).catch(() => []),
  ]);

  /* ==========================================================
     GLOBAL DEDUP
     ========================================================== */
  const usedPostIds = new Set<string>();

  /* --- A) HERO --- */
  let heroPost = featuredPosts[0] ?? latestPosts[0] ?? null;
  if (heroSlot?.entity_type === "blog_post") {
    const slotPost = await getBlogPostById(heroSlot.entity_id).catch(
      () => null
    );
    if (slotPost) heroPost = slotPost;
  }
  if (heroPost) usedPostIds.add(heroPost.id);

  /* --- B) EDITOR'S PICKS: is_featured, fill from latest, max 3 --- */
  const featuredOnly = featuredPosts.filter((p) => !usedPostIds.has(p.id));
  const editorsPicks = featuredOnly.slice(0, 3);
  if (editorsPicks.length < 3) {
    const needed = 3 - editorsPicks.length;
    const pickIds = new Set(editorsPicks.map((p) => p.id));
    const fill = latestPosts
      .filter((p) => !usedPostIds.has(p.id) && !pickIds.has(p.id))
      .slice(0, needed);
    editorsPicks.push(...fill);
  }
  editorsPicks.forEach((p) => usedPostIds.add(p.id));

  /* --- C) BUSINESSES: Dining category --- */
  const businesses = diningBusinesses;

  /* --- D) EVENTS: featured first, fallback to most recent 3 --- */
  const featuredEvents = upcomingEvents.filter((e) => e.is_featured);
  const nonFeaturedEvents = upcomingEvents.filter((e) => !e.is_featured);
  const events =
    featuredEvents.length > 0
      ? [...featuredEvents, ...nonFeaturedEvents].slice(0, 3)
      : upcomingEvents.slice(0, 3);
  const showEventCTA = events.length < 3;

  /* --- F) SIDEBAR NEIGHBORHOODS --- */
  const curatedFallback = [
    { name: "Virginia-Highland", slug: "virginia-highland" },
    { name: "Inman Park", slug: "inman-park" },
    { name: "Old Fourth Ward", slug: "old-fourth-ward" },
    { name: "Grant Park", slug: "grant-park" },
    { name: "Decatur", slug: "decatur" },
    { name: "Midtown", slug: "midtown" },
  ];
  const sidebarNeighborhoods =
    dbNeighborhoods.length > 0
      ? dbNeighborhoods.map((n) => ({ name: n.name, slug: n.slug }))
      : curatedFallback;

  /* --- G) SEARCH --- */
  const totalResults = search
    ? latestPosts.length + businesses.length + events.length
    : -1;

  /* ==========================================================
     RENDER
     ========================================================== */
  return (
    <>
      {/* ==================== 1. HERO ==================== */}
      {heroPost ? (
        <section className="relative w-full">
          <Link
            href={`/stories/${heroPost.slug}`}
            className="block relative group"
          >
            <div className="relative w-full h-[45vh] sm:h-[55vh] md:h-[80vh] min-h-[340px] max-h-[640px] overflow-hidden">
              <Image
                  src={
  heroPost.featured_image_url ||
  "/images/default-hero.png"
                }
                alt={heroPost.title}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-20">
              {heroPost.categories?.name && (
                <span className="inline-block bg-[#fee198] text-[#1a1a1a] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-5">
                  {heroPost.categories.name}
                </span>
              )}
              <h1 className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-white max-w-5xl leading-tight italic">
                {heroPost.title}
              </h1>
              <p className="text-white/50 text-xs sm:text-sm mt-4 sm:mt-5 uppercase tracking-wide">
                {heroPost.authors?.name
                  ? `By ${heroPost.authors.name}`
                  : "ATL Vibes & Views"}
                {heroPost.published_at &&
                  ` · ${new Date(heroPost.published_at).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                  )}`}
              </p>
            </div>
          </Link>
        </section>
      ) : (
        <section className="relative w-full h-[45vh] sm:h-[55vh] md:h-[80vh] min-h-[340px] max-h-[640px] bg-[#1a1a1a] flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-semibold text-white italic mb-4">
              ATL Vibes &amp; Views
            </h1>
            <p className="text-white/50 text-xs sm:text-sm uppercase tracking-wide">
              The City. The Culture. The Conversation.
            </p>
          </div>
        </section>
      )}

      {/* ==================== 2. SEARCH BAR (below hero) ==================== */}
      <div className="site-container pt-10 pb-4">
        <SearchBar
          placeholder="Search stories, businesses, events, neighborhoods…"
          className="mx-auto"
        />
        {search && (
          <p className="text-sm text-gray-mid mt-3 text-center">
            Showing results for &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      {/* ==================== 3. EDITOR'S PICKS + MAP + SIDEBAR A ==================== */}
      <div className="site-container pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- MAIN CONTENT ---------- */}
          <div className="space-y-28">
            {/* ===== EDITOR'S PICKS ===== */}
            {editorsPicks.length > 0 ? (
              <section>
                <SectionHeader
                  eyebrow="Latest"
                  title="Editor&rsquo;s Picks"
                  href="/stories"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {editorsPicks.map((post) => (
                    <Link
                      key={post.id}
                      href={`/stories/${post.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden mb-5">
                        <Image
                          src={post.featured_image_url || ph(post.title)}
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
                        <p className="text-gray-mid text-xs mt-3 uppercase tracking-wide">
                          {new Date(post.published_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            ) : !search ? (
              <section className="text-center py-16 bg-[#f8f5f0]">
                <h2 className="font-display text-2xl font-semibold mb-2">
                  Stories Coming Soon
                </h2>
                <p className="text-gray-mid text-sm">
                  Check back for the latest on Atlanta culture and
                  neighborhoods.
                </p>
              </section>
            ) : null}

            {/* ===== INTERACTIVE MAP (no change) ===== */}
            <section>
              <SectionHeader
                eyebrow="Neighborhoods"
                title="Explore Atlanta"
              />
              <div className="relative overflow-hidden bg-[#f5f0eb] aspect-[16/7]">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-gold-light/50 flex items-center justify-center mb-4">
                    <MapPin size={28} className="text-black" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-black mb-2">
                    Interactive Map Coming Soon
                  </h3>
                  <p className="text-gray-mid text-sm max-w-md">
                    Explore {areas.length} areas and 261 neighborhoods across
                    Atlanta
                  </p>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <Link
                  href="/areas"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#fee198] text-black text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-black hover:text-[#fee198] transition-colors"
                >
                  Explore All Areas
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          </div>

          {/* ---------- SIDEBAR A ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              <NewsletterWidget />
              <AdPlacement slot="sidebar_top" />
              <NeighborhoodsWidget neighborhoods={sidebarNeighborhoods} />
              <SubmitCTA />
            </Sidebar>
          </aside>
        </div>
      </div>

      {/* ==================== 4. VIDEO MODULE — FULL-WIDTH BLACK PAGE BREAK ==================== */}
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
              See All
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* 70/30 layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
            {/* LEFT — Featured Video (~70%) */}
            <div>
              {homeVideos[0] ? (
                <Link href={`/media/${homeVideos[0].slug}`} className="group block">
                  <div className="relative aspect-video bg-[#111] overflow-hidden">
                    <Image
                      src={homeVideos[0].thumbnail_url || (homeVideos[0].embed_url ? `https://img.youtube.com/vi/${homeVideos[0].embed_url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/)?.[1]}/hqdefault.jpg` : ph("Featured Video", 960, 540, "222222", "e6c46d"))}
                      alt={homeVideos[0].title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white transition-colors">
                        <Play size={24} className="text-black ml-1 fill-black" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <span className="text-white text-[10px] font-semibold uppercase tracking-eyebrow">Video</span>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-white mt-3 leading-snug group-hover:text-[#fee198] transition-colors">
                      {homeVideos[0].title}
                    </h3>
                  </div>
                </Link>
              ) : (
                <div>
                  <div className="relative aspect-video bg-[#111] overflow-hidden">
                    <Image src={ph("Featured Video", 960, 540, "222222", "e6c46d")} alt="Featured video" fill unoptimized className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 flex items-center justify-center">
                        <Play size={24} className="text-black ml-1 fill-black" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <span className="text-white text-[10px] font-semibold uppercase tracking-eyebrow">Watch &amp; Listen</span>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-white mt-3 leading-snug">Video Content Coming Soon</h3>
                    <p className="text-white/60 text-xs mt-3 uppercase tracking-wide">ATL Vibes &amp; Views</p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Video Playlist (~30%) */}
            <div>
              <Link
                href="/media"
                className="text-xs font-semibold uppercase tracking-eyebrow text-white/60 hover:text-[#fee198] transition-colors mb-6 block"
              >
                More Videos →
              </Link>
              <div className="space-y-5">
                {(homeVideos.slice(1).length > 0 ? homeVideos.slice(1).map((vid) => ({
                  id: vid.id,
                  slug: vid.slug,
                  category: "Video",
                  title: vid.title,
                  thumb: vid.thumbnail_url || (vid.embed_url ? `https://img.youtube.com/vi/${vid.embed_url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/)?.[1]}/hqdefault.jpg` : null),
                })) : [
                  { id: "1", slug: null, category: "Fashion", title: "Atlanta's Emerging Fashion Scene", thumb: null },
                  { id: "2", slug: null, category: "News", title: "BeltLine Phase 3 Update", thumb: null },
                  { id: "3", slug: null, category: "Creative", title: "Local Artists Transforming Westside", thumb: null },
                ]).map((item) => (
                  <div key={item.id} className="flex gap-4 group cursor-pointer">
                    <div className="relative w-28 h-20 shrink-0 bg-[#222] overflow-hidden">
                      <Image
                        src={item.thumb || ph(item.title, 160, 100, "333333", "e6c46d")}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center">
                          <Play
                            size={10}
                            className="text-black ml-0.5 fill-black"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-eyebrow text-white">
                        {item.category}
                      </span>
                      <h4 className="text-white text-sm font-semibold leading-snug mt-1 line-clamp-2 group-hover:text-[#fee198] transition-colors">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. MAIN CONTENT + SIDEBAR B ==================== */}
      <div className="site-container pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- MAIN CONTENT ---------- */}
          <div className="space-y-28">
            {/* ===== WHERE ATLANTA IS EATING (no change) ===== */}
            {businesses.length > 0 ? (
              <section>
                <SectionHeader
                  eyebrow="Eats & Drinks"
                  title="Where Atlanta Is Eating"
                  href="/hub/eats-and-drinks"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {businesses.map((biz) => (
                    <div key={biz.id} className="group relative">
                      <Link href={`/places/${biz.slug}`} className="block">
                        <div className="relative aspect-[3/2] overflow-hidden">
                          <Image
                            src={
                              biz.logo ||
                              ph(biz.business_name, 400, 280, "c1121f", "fee198")
                            }
                            alt={biz.business_name}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {biz.is_featured && (
                            <span className="absolute top-3 left-3 px-3 py-1 bg-gold-light text-black text-[10px] font-semibold uppercase tracking-eyebrow rounded-full z-10">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="pt-4">
                          <h3 className="font-display text-lg font-semibold text-black group-hover:text-red-brand transition-colors">
                            {biz.business_name}
                          </h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className="flex items-center gap-1 text-sm text-gray-mid">
                              <MapPin size={13} />
                              {biz.neighborhoods?.name ?? biz.cities?.name}
                            </span>
                            {biz.categories?.name && (
                              <span className="text-xs text-gray-mid">
                                {biz.categories.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <SaveButton slug={biz.slug} />
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section>
                <SectionHeader
                  eyebrow="Eats & Drinks"
                  title="Where Atlanta Is Eating"
                  href="/hub/eats-and-drinks"
                />
                <div className="text-center py-16 bg-[#f8f5f0] border border-gray-200">
                  <Store size={32} className="mx-auto text-gray-mid mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">
                    Get Your Business Listed
                  </h3>
                  <p className="text-gray-mid text-sm mb-6 max-w-md mx-auto">
                    Reach thousands of Atlanta locals. Claim your free listing
                    today.
                  </p>
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#fee198] hover:text-black transition-colors"
                  >
                    Get Listed
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </section>
            )}

            {/* ===== AD SPACE — horizontal ===== */}
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

            {/* ===== EVENTS ===== */}
            <section>
              <SectionHeader
                eyebrow="Events"
                title="What&rsquo;s Happening"
                href="/hub/events"
              />
              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {events.map((event) => {
                    const d = new Date(event.start_date + "T00:00:00");
                    const month = d
                      .toLocaleDateString("en-US", { month: "short" })
                      .toUpperCase();
                    const day = d.getDate().toString();
                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="group block"
                      >
                        <div className="relative overflow-hidden">
                          <div className="relative aspect-[3/2] overflow-hidden">
                            <Image
                              src={
                                event.featured_image_url ||
                                ph(event.title, 400, 280, "4a4a4a", "ffffff")
                              }
                              alt={event.title}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-3 right-3 bg-white text-center px-3 py-2 shadow-md z-10">
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-red-brand leading-none">
                                {month}
                              </div>
                              <div className="text-xl font-bold text-black leading-tight">
                                {day}
                              </div>
                            </div>
                            {event.is_featured && (
                              <span className="absolute top-3 left-3 px-3 py-1 bg-gold-light text-black text-[10px] font-semibold uppercase tracking-eyebrow rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="pt-4">
                            {event.categories?.name && (
                              <span className="px-3 py-1 bg-gold-light text-black text-[10px] font-semibold uppercase tracking-eyebrow rounded-full">
                                {event.categories.name}
                              </span>
                            )}
                            <h3 className="font-display text-lg font-semibold text-black mt-3 group-hover:text-red-brand transition-colors">
                              {event.title}
                            </h3>
                            {event.venue_name && (
                              <div className="flex items-center gap-1 mt-2 text-sm text-gray-mid">
                                <MapPin size={13} />
                                {event.venue_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : null}

              {showEventCTA && (
                <div
                  className={`text-center py-12 bg-[#f8f5f0] border border-gray-200${
                    events.length > 0 ? " mt-10" : ""
                  }`}
                >
                  <CalendarPlus
                    size={32}
                    className="mx-auto text-gray-mid mb-4"
                  />
                  <h3 className="font-display text-xl font-semibold mb-2">
                    Submit Your Event
                  </h3>
                  <p className="text-gray-mid text-sm mb-6 max-w-md mx-auto">
                    Have an upcoming event in Atlanta? Get it in front of our
                    audience.
                  </p>
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#fee198] hover:text-black transition-colors"
                  >
                    Submit Event
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </section>

            {/* ===== NO RESULTS ===== */}
            {search && totalResults === 0 && (
              <section className="text-center py-20">
                <p className="text-gray-mid text-lg">
                  No results found for &ldquo;{search}&rdquo;
                </p>
                <p className="text-gray-mid/60 text-sm mt-2 mb-6">
                  Try a different search term or browse below
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/stories"
                    className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#fee198] hover:text-black transition-colors"
                  >
                    All Stories
                  </Link>
                  <Link
                    href="/hub/events"
                    className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#fee198] hover:text-black transition-colors"
                  >
                    Events
                  </Link>
                  <Link
                    href="/hub/businesses"
                    className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#fee198] hover:text-black transition-colors"
                  >
                    Businesses
                  </Link>
                  <Link
                    href="/areas"
                    className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#fee198] hover:text-black transition-colors"
                  >
                    Areas
                  </Link>
                </div>
              </section>
            )}

            {/* ===== FINAL NEWSLETTER CTA ===== */}
            <section className="bg-[#f8f5f0] py-16 px-8 md:px-16 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-2 italic">
                Join The A-List Newsletter
              </h2>
              <p className="text-gray-mid text-sm mb-8">
                Get the latest on Atlanta&rsquo;s culture, neighborhoods, and
                events.
              </p>
              <NewsletterForm />
              <p className="text-gray-mid/60 text-xs mt-4">
                No spam. Unsubscribe anytime.
              </p>
            </section>
          </div>

          {/* ---------- SIDEBAR B ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              <SocialFollowWidget />
              <SubmitEventCTA />
            </Sidebar>
          </aside>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   SECTION HEADER — eyebrow uses #c1121f
   ============================================================ */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-4">
      <div className="flex items-baseline gap-4">
        <div>
          <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
            {eyebrow}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
            {title}
          </h2>
        </div>
        {subtitle && (
          <>
            <span className="hidden md:block w-px h-6 bg-gray-200" />
            <span className="hidden md:block text-gray-mid text-sm">
              {subtitle}
            </span>
          </>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-black hover:text-red-brand transition-colors shrink-0 pb-1"
        >
          See All
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
