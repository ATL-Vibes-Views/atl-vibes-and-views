import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, Play, CalendarPlus, Store } from "lucide-react";
import {
  Sidebar,
  NewsletterWidget,
  AdPlacement,
  NeighborhoodsWidget,
  SubmitCTA,
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
} from "@/lib/queries";

/* ============================================================
   HOMEPAGE — Server Component

   LOCKED LOGIC (do not modify without updating spec):
   A) Hero: featured_slot "home_hero" → featured+published → latest
   B) Editor's Picks (3): is_featured=true blogs, fill from latest if <3
   C) Businesses (3): category = Dining (slug lookup, no hardcoded ID)
   D) Events (6): upcoming published, no category filter; <3 → CTA
   E) Development (3): category name = "Development"; 0 → latest + relabel
   F) Sidebar neighborhoods: DB featured → curated fallback
   G) Search: always render; 0 results → "No results" + links

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

  // Lookup Dining category by slug (not hardcoded ID)
  const diningCat = await getCategoryBySlug("dining").catch(() => null);

  const [
    heroSlot,
    featuredPosts,       // B) is_featured blogs
    latestPosts,         // B fallback + E fallback
    diningBusinesses,    // C) businesses in Dining category
    upcomingEvents,      // D) upcoming events
    areas,               // Explore Atlanta
    dbNeighborhoods,     // F) sidebar
  ] = await Promise.all([
    search ? Promise.resolve(null) : getFeaturedSlot("home_hero").catch(() => null),
    getBlogPosts({ featured: true, limit: 6, search }),
    getBlogPosts({ limit: 12, search }),
    diningCat
      ? getBusinesses({ categoryId: diningCat.id, limit: 3, search })
      : getBusinesses({ limit: 3, search }),
    getEvents({ limit: 6, upcoming: true, search }),
    getAreas(),
    getNeighborhoods({ featured: true, limit: 8 }),
  ]);

  /* ==========================================================
     GLOBAL DEDUP — track used post IDs across all sections
     ========================================================== */
  const usedPostIds = new Set<string>();

  /* ----------------------------------------------------------
     A) HERO: slot → featured → latest
     ---------------------------------------------------------- */
  let heroPost = featuredPosts[0] ?? latestPosts[0] ?? null;

  if (heroSlot?.entity_type === "blog_post") {
    const slotPost = await getBlogPostById(heroSlot.entity_id).catch(() => null);
    if (slotPost) heroPost = slotPost;
  }

  if (heroPost) usedPostIds.add(heroPost.id);

  /* ----------------------------------------------------------
     B) EDITOR'S PICKS: is_featured=true, fill from latest, max 3
     DEDUP: exclude hero
     ---------------------------------------------------------- */
  const featuredOnly = featuredPosts.filter((p) => !usedPostIds.has(p.id));
  const editorsPicks = featuredOnly.slice(0, 3);

  // Fill from latest if we have fewer than 3 featured
  if (editorsPicks.length < 3) {
    const needed = 3 - editorsPicks.length;
    const pickIds = new Set(editorsPicks.map((p) => p.id));
    const fill = latestPosts
      .filter((p) => !usedPostIds.has(p.id) && !pickIds.has(p.id))
      .slice(0, needed);
    editorsPicks.push(...fill);
  }

  // Mark picks as used
  editorsPicks.forEach((p) => usedPostIds.add(p.id));

  /* ----------------------------------------------------------
     C) BUSINESSES: Dining category (no generic pull)
     ---------------------------------------------------------- */
  const businesses = diningBusinesses;

  /* ----------------------------------------------------------
     D) EVENTS: upcoming published, soonest first (no category filter)
     ---------------------------------------------------------- */
  const events = upcomingEvents;
  const showEventCTA = events.length < 3;

  /* ----------------------------------------------------------
     E) DEVELOPMENT: category name = "Development"
     DEDUP: exclude hero + editor's picks
     ---------------------------------------------------------- */
  const devPosts = latestPosts
    .filter(
      (p) =>
        !usedPostIds.has(p.id) &&
        p.categories?.name?.toLowerCase() === "development"
    )
    .slice(0, 3);

  // Fallback: latest posts not already used
  const devFallback = latestPosts
    .filter((p) => !usedPostIds.has(p.id))
    .slice(0, 3);

  const developmentPosts = devPosts.length > 0 ? devPosts : devFallback;
  const developmentLabel = devPosts.length > 0 ? "Development" : "Latest Stories";
  const developmentTitle = devPosts.length > 0 ? "Building Atlanta" : "More Stories";

  // Mark dev posts as used (for future sections if any)
  developmentPosts.forEach((p) => usedPostIds.add(p.id));

  /* ----------------------------------------------------------
     F) SIDEBAR NEIGHBORHOODS: DB featured → curated fallback
     ---------------------------------------------------------- */
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

  /* ----------------------------------------------------------
     G) SEARCH: total hit count
     ---------------------------------------------------------- */
  const totalResults = search
    ? latestPosts.length + businesses.length + events.length
    : -1;

  /* ==========================================================
     RENDER
     ========================================================== */
  return (
    <>
      {/* ==================== SEARCH BAR (G) ==================== */}
      <div className="site-container pt-6 pb-2">
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

      {/* ==================== HERO (A) ==================== */}
      {heroPost ? (
        <section className="relative w-full">
          <Link href={`/stories/${heroPost.slug}`} className="block relative group">
            <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
              <Image
                src={heroPost.featured_image_url || ph("Featured Story", 1920, 900)}
                alt={heroPost.title}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-20">
              {heroPost.categories?.name && (
                <span className="inline-block px-5 py-1.5 bg-gold-light text-black text-[10px] font-semibold uppercase tracking-eyebrow rounded-full mb-5">
                  {heroPost.categories.name}
                </span>
              )}
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-white max-w-5xl leading-tight italic">
                {heroPost.title}
              </h1>
              <p className="text-white/50 text-sm mt-5 uppercase tracking-wide">
                {heroPost.authors?.name ? `By ${heroPost.authors.name}` : "ATL Vibes & Views"}
                {heroPost.published_at &&
                  ` · ${new Date(heroPost.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
              </p>
            </div>
          </Link>
        </section>
      ) : (
        <section className="relative w-full h-[60vh] md:h-[80vh] bg-[#1a1a1a] flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-white italic mb-4">
              ATL Vibes &amp; Views
            </h1>
            <p className="text-white/50 text-sm uppercase tracking-wide">
              The City. The Culture. The Conversation.
            </p>
          </div>
        </section>
      )}

      {/* ==================== MAIN + SIDEBAR ==================== */}
      <div className="site-container pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">

          {/* ---------- MAIN CONTENT ---------- */}
          <div className="space-y-28">

            {/* ===== EDITOR'S PICKS (B) ===== */}
            {editorsPicks.length > 0 ? (
              <section>
                <SectionHeader eyebrow="Latest" title="Editor&rsquo;s Picks" href="/stories" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {editorsPicks.map((post) => (
                    <Link key={post.id} href={`/stories/${post.slug}`} className="group block">
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
                          {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            ) : !search ? (
              <section className="text-center py-16 bg-[#f8f5f0]">
                <h2 className="font-display text-2xl font-semibold mb-2">Stories Coming Soon</h2>
                <p className="text-gray-mid text-sm">Check back for the latest on Atlanta culture and neighborhoods.</p>
              </section>
            ) : null}

            {/* ===== EXPLORE ATLANTA ===== */}
            <section>
              <SectionHeader eyebrow="Neighborhoods" title="Explore Atlanta" />
              <div className="relative overflow-hidden bg-[#f5f0eb] aspect-[16/7]">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-gold-light/50 flex items-center justify-center mb-4">
                    <MapPin size={28} className="text-black" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-black mb-2">
                    Interactive Map Coming Soon
                  </h3>
                  <p className="text-gray-mid text-sm max-w-md">
                    Explore {areas.length} areas and 261 neighborhoods across Atlanta
                  </p>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <Link
                  href="/areas"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#e6c46d] text-black text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-black hover:text-white transition-colors"
                >
                  Explore All Areas <ArrowRight size={14} />
                </Link>
              </div>
            </section>

            {/* ===== VIDEO SECTION (placeholder) ===== */}
            <section>
              <SectionHeader eyebrow="Watch" title="Recent Video" subtitle="Stay up-to-date" href="/media" />
              <div className="relative aspect-video bg-[#f5f0eb] overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center mx-auto mb-4">
                    <Play size={28} className="text-black ml-1 fill-black" />
                  </div>
                  <p className="text-gray-mid text-sm">Video content coming soon</p>
                </div>
              </div>
            </section>

            {/* ===== WHERE ATLANTA IS EATING (C) ===== */}
            {businesses.length > 0 ? (
              <section>
                <SectionHeader eyebrow="Eats & Drinks" title="Where Atlanta Is Eating" href="/hub/eats-and-drinks" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {businesses.map((biz) => (
                    <div key={biz.id} className="group relative">
                      <Link href={`/places/${biz.slug}`} className="block">
                        <div className="relative aspect-[3/2] overflow-hidden">
                          <Image
                            src={biz.logo || ph(biz.business_name, 400, 280, "c1121f", "fee198")}
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
                              {biz.neighborhoods?.name ?? biz.city}
                            </span>
                            {biz.categories?.name && (
                              <span className="text-xs text-gray-mid">{biz.categories.name}</span>
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
                <SectionHeader eyebrow="Eats & Drinks" title="Where Atlanta Is Eating" href="/hub/eats-and-drinks" />
                <div className="text-center py-16 bg-[#f8f5f0] border border-gray-200">
                  <Store size={32} className="mx-auto text-gray-mid mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">Get Your Business Listed</h3>
                  <p className="text-gray-mid text-sm mb-6 max-w-md mx-auto">
                    Reach thousands of Atlanta locals. Claim your free listing today.
                  </p>
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#e6c46d] hover:text-black transition-colors"
                  >
                    Get Listed <ArrowRight size={14} />
                  </Link>
                </div>
              </section>
            )}

            {/* ===== EVENTS (D) ===== */}
            <section>
              <SectionHeader eyebrow="Events" title="What&rsquo;s Happening" href="/hub/events" />
              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {events.map((event) => {
                    const d = new Date(event.start_date + "T00:00:00");
                    const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                    const day = d.getDate().toString();
                    return (
                      <Link key={event.id} href={`/events/${event.slug}`} className="group block">
                        <div className="relative overflow-hidden">
                          <div className="relative aspect-[3/2] overflow-hidden">
                            <Image
                              src={event.featured_image_url || ph(event.title, 400, 280, "4a4a4a", "ffffff")}
                              alt={event.title}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-3 right-3 bg-white text-center px-3 py-2 shadow-md z-10">
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-red-brand leading-none">
                                {month}
                              </div>
                              <div className="text-xl font-bold text-black leading-tight">{day}</div>
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
                <div className={`text-center py-12 bg-[#f8f5f0] border border-gray-200${events.length > 0 ? " mt-10" : ""}`}>
                  <CalendarPlus size={32} className="mx-auto text-gray-mid mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">Submit Your Event</h3>
                  <p className="text-gray-mid text-sm mb-6 max-w-md mx-auto">
                    Have an upcoming event in Atlanta? Get it in front of our audience.
                  </p>
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#e6c46d] hover:text-black transition-colors"
                  >
                    Submit Event <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </section>

            {/* ===== DEVELOPMENT / MORE STORIES (E) ===== */}
            {developmentPosts.length > 0 && (
              <section>
                <SectionHeader eyebrow={developmentLabel} title={developmentTitle} href="/stories" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {developmentPosts.map((post) => (
                    <Link key={post.id} href={`/stories/${post.slug}`} className="group block">
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
                          {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ===== NO RESULTS (G) ===== */}
            {search && totalResults === 0 && (
              <section className="text-center py-20">
                <p className="text-gray-mid text-lg">No results found for &ldquo;{search}&rdquo;</p>
                <p className="text-gray-mid/60 text-sm mt-2 mb-6">Try a different search term or browse below</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/stories" className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#e6c46d] hover:text-black transition-colors">
                    All Stories
                  </Link>
                  <Link href="/hub/events" className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#e6c46d] hover:text-black transition-colors">
                    Events
                  </Link>
                  <Link href="/hub/businesses" className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#e6c46d] hover:text-black transition-colors">
                    Businesses
                  </Link>
                  <Link href="/areas" className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#e6c46d] hover:text-black transition-colors">
                    Areas
                  </Link>
                </div>
              </section>
            )}

            {/* ===== AD SPACE ===== */}
            <section>
              <Link
                href="/hub/businesses"
                className="block bg-gray-100 flex items-center justify-center py-12 border border-dashed border-gray-300 hover:border-[#e6c46d] hover:bg-gray-50 transition-colors group"
              >
                <div className="text-center">
                  <span className="text-xs text-gray-mid uppercase tracking-eyebrow group-hover:text-black transition-colors">
                    Advertise Here
                  </span>
                  <p className="text-sm text-gray-400 mt-1">Reach thousands of Atlanta locals</p>
                </div>
              </Link>
            </section>

            {/* ===== NEWSLETTER ===== */}
            <section className="bg-[#f8f5f0] py-16 px-8 md:px-16 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-2 italic">
                The ATL Newsletter
              </h2>
              <p className="text-gray-mid text-sm mb-8">
                Get the latest on Atlanta&rsquo;s culture, neighborhoods, and events.
              </p>
              <NewsletterForm />
              <p className="text-gray-mid/60 text-xs mt-4">No spam. Unsubscribe anytime.</p>
            </section>
          </div>

          {/* ---------- SIDEBAR (F) ---------- */}
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
    </>
  );
}

/* ============================================================
   SECTION HEADER
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
          <span className="text-red-brand text-[11px] font-semibold uppercase tracking-eyebrow">
            {eyebrow}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
            {title}
          </h2>
        </div>
        {subtitle && (
          <>
            <span className="hidden md:block w-px h-6 bg-gray-200" />
            <span className="hidden md:block text-gray-mid text-sm">{subtitle}</span>
          </>
        )}
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
