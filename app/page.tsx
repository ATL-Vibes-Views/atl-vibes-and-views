import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ArrowRight, Play } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { SaveButton } from "@/components/SaveButton";
import { SearchBar } from "@/components/SearchBar";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getBlogPosts, getBusinesses, getEvents, getAreas } from "@/lib/queries";

/* ============================================================
   HOMEPAGE — Server Component, all data from Supabase
   ============================================================ */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = q?.trim() || undefined;

  /* --- Parallel data fetch --- */
  const [posts, businesses, events, areas] = await Promise.all([
    getBlogPosts({ limit: 4, search }),
    getBusinesses({ limit: 3, featured: search ? undefined : true, search }),
    getEvents({ limit: 3, upcoming: true, search }),
    getAreas(),
  ]);

  const heroPost = posts[0];
  const latestPosts = posts.slice(1, 4);

  /* --- Placeholder image helper --- */
  const ph = (label: string, w = 600, h = 400, bg = "1a1a1a", fg = "e6c46d") =>
    `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(label)}`;

  return (
    <>
      {/* ==================== SEARCH BAR ==================== */}
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

      {/* ==================== HERO ==================== */}
      {heroPost && (
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
      )}

      {/* ==================== MAIN + SIDEBAR ==================== */}
      <div className="site-container pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">

          {/* ---------- MAIN CONTENT ---------- */}
          <div className="space-y-28">

            {/* ===== EDITOR'S PICKS ===== */}
            {latestPosts.length > 0 && (
              <section>
                <SectionHeader eyebrow="Latest" title="Editor&rsquo;s Picks" href="/stories" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {latestPosts.map((post) => (
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

            {/* ===== VIDEO SECTION (placeholder until video table exists) ===== */}
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

            {/* ===== EATS & DRINKS ===== */}
            {businesses.length > 0 && (
              <section>
                <SectionHeader eyebrow="Eats & Drinks" title="Where to Eat in Atlanta" href="/hub/eats-and-drinks" />
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
            )}

            {/* ===== EVENTS ===== */}
            {events.length > 0 && (
              <section>
                <SectionHeader eyebrow="Events" title="What&rsquo;s Happening" href="/hub/events" />
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
              </section>
            )}

            {/* ===== NO RESULTS ===== */}
            {search && posts.length === 0 && businesses.length === 0 && events.length === 0 && (
              <section className="text-center py-20">
                <p className="text-gray-mid text-lg">No results found for &ldquo;{search}&rdquo;</p>
                <p className="text-gray-mid/60 text-sm mt-2">Try a different search term</p>
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

          {/* ---------- SIDEBAR ---------- */}
          <aside className="hidden lg:block">
            <Sidebar />
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
