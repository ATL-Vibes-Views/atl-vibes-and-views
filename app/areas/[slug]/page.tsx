import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Calendar, ArrowRight, ChevronRight } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import {
  getAreaBySlug,
  getAreas,
  getNeighborhoods,
  getNeighborhoodIdsForArea,
  getBlogPosts,
  getBusinesses,
  getEvents,
} from "@/lib/queries";

/* ============================================================
   HELPERS
   ============================================================ */
const PLACEHOLDER_IMG =
  "https://placehold.co/1920x600/1a1a1a/e6c46d?text=Area";
const PLACEHOLDER_BIZ =
  "https://placehold.co/400x280/c1121f/fee198?text=Business";

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

/* ============================================================
   AREA DETAIL PAGE — Server Component
   ============================================================ */
export default async function AreaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const search = q?.trim() || undefined;

  /* --- Fetch area --- */
  const area = await getAreaBySlug(slug);
  if (!area) return notFound();

  /* --- Fetch all related data in parallel --- */
  const neighborhoodIds = await getNeighborhoodIdsForArea(area!.id);

  const [neighborhoods, posts, businesses, events, allAreas] =
    await Promise.all([
      getNeighborhoods({ areaId: area.id, search }),
      getBlogPosts({
        neighborhoodIds: neighborhoodIds.length ? neighborhoodIds : undefined,
        limit: 4,
        search,
      }).catch(() => []),
      getBusinesses({
        neighborhoodIds: neighborhoodIds.length ? neighborhoodIds : undefined,
        limit: 4,
        search,
      }).catch(() => []),
      getEvents({
        neighborhoodIds: neighborhoodIds.length ? neighborhoodIds : undefined,
        upcoming: true,
        limit: 5,
        search,
      }).catch(() => []),
      getAreas().catch(() => []),
    ]);

  const otherAreas = allAreas.filter((a) => a.slug !== slug).slice(0, 6);

  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative w-full">
        <div className="relative w-full aspect-[21/7] md:aspect-[21/6] overflow-hidden">
          <Image
            src={area.hero_image_url || PLACEHOLDER_IMG}
            alt={area.name}
            fill
            unoptimized
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="text-gold-dark text-[11px] font-semibold uppercase tracking-[0.15em] mb-3">
            Explore Atlanta
          </span>
          <h1 className="font-display text-4xl md:text-6xl lg:text-hero font-semibold text-white">
            {area.name}
          </h1>
          {area.tagline && (
            <p className="text-white/70 text-sm md:text-base mt-3 max-w-xl">
              {area.tagline}
            </p>
          )}
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="bg-[#1a1a1a]">
        <div className="site-container py-5">
          <div className="flex items-center justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-gold-light font-display text-2xl md:text-3xl font-semibold">
                {neighborhoods.length}
              </div>
              <div className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.1em] mt-1">
                Neighborhoods
              </div>
            </div>
            <div className="text-center">
              <div className="text-gold-light font-display text-2xl md:text-3xl font-semibold">
                {businesses.length > 0 ? `${businesses.length}+` : "—"}
              </div>
              <div className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.1em] mt-1">
                Businesses
              </div>
            </div>
            <div className="text-center">
              <div className="text-gold-light font-display text-2xl md:text-3xl font-semibold">
                {posts.length > 0 ? posts.length : "—"}
              </div>
              <div className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.1em] mt-1">
                Stories
              </div>
            </div>
            <div className="text-center">
              <div className="text-gold-light font-display text-2xl md:text-3xl font-semibold">
                {events.length > 0 ? events.length : "—"}
              </div>
              <div className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.1em] mt-1">
                Events
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BREADCRUMB + SEARCH ========== */}
      <div className="site-container pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-gray-mid mb-4">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/areas" className="hover:text-black transition-colors">
            Areas
          </Link>
          <ChevronRight size={12} />
          <span className="text-black font-medium">{area.name}</span>
        </nav>
        <SearchBar
          placeholder={`Search in ${area.name}…`}
          className="max-w-md"
        />
        {search && (
          <p className="text-sm text-gray-mid mt-2">
            Showing results for &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="site-container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* --- Main Column --- */}
          <div>
            {/* About Section */}
            {area.description && (
              <section className="mb-14">
                <h2 className="font-display text-section-sm md:text-section font-semibold text-black mb-4">
                  About {area.name}
                </h2>
                <p className="text-gray-dark leading-relaxed text-base">
                  {area.description}
                </p>
              </section>
            )}

            {/* ===== STORIES ===== */}
            {posts.length > 0 && (
              <section className="mb-14">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-red-brand text-[11px] font-semibold uppercase tracking-[0.1em] block mb-1">
                      Stories
                    </span>
                    <h2 className="font-display text-section-sm font-semibold text-black">
                      Latest from {area.name}
                    </h2>
                  </div>
                  <Link
                    href={`/stories?area=${slug}`}
                    className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-red-brand hover:text-black transition-colors"
                  >
                    All Stories <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/stories/${post.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-[3/2] overflow-hidden mb-3">
                        <Image
                          src={post.featured_image_url || PLACEHOLDER_IMG}
                          alt={post.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {post.type && (
                        <span className="text-red-brand text-[11px] font-semibold uppercase tracking-eyebrow">
                          {post.type}
                        </span>
                      )}
                      <h3 className="font-display text-lg md:text-xl font-semibold text-black leading-snug mt-1 group-hover:text-red-brand transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-mid text-xs mt-2">
                        {formatDate(post.published_at)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ===== BUSINESSES ===== */}
            {businesses.length > 0 && (
              <section className="mb-14">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-red-brand text-[11px] font-semibold uppercase tracking-[0.1em] block mb-1">
                      Directory
                    </span>
                    <h2 className="font-display text-section-sm font-semibold text-black">
                      {area.name} Businesses
                    </h2>
                  </div>
                  <Link
                    href={`/hub/businesses?area=${slug}`}
                    className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-red-brand hover:text-black transition-colors"
                  >
                    All Businesses <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {businesses.map((biz) => (
                    <Link
                      key={biz.id}
                      href={`/places/${biz.slug}`}
                      className="group border border-gray-100 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="relative aspect-[3/2] overflow-hidden">
                        <Image
                          src={biz.logo || PLACEHOLDER_BIZ}
                          alt={biz.business_name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {biz.is_featured && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 bg-red-brand text-white text-[10px] font-semibold uppercase tracking-eyebrow">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-lg font-semibold text-black mt-1 group-hover:text-red-brand transition-colors">
                          {biz.business_name}
                        </h3>
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-mid">
                          <MapPin size={13} />
                          {biz.neighborhoods?.name ?? "Atlanta"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ===== EVENTS ===== */}
            {events.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-red-brand text-[11px] font-semibold uppercase tracking-[0.1em] block mb-1">
                      Happening
                    </span>
                    <h2 className="font-display text-section-sm font-semibold text-black">
                      What&rsquo;s Happening in {area.name}
                    </h2>
                  </div>
                  <Link
                    href={`/hub/events?area=${slug}`}
                    className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-red-brand hover:text-black transition-colors"
                  >
                    All Events <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="space-y-0 divide-y divide-gray-100">
                  {events.map((event) => {
                    const { month, day } = eventDateParts(event.start_date);
                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="shrink-0 w-14 h-14 bg-red-brand text-white flex flex-col items-center justify-center">
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
              </section>
            )}

            {/* ===== NO RESULTS ===== */}
            {search &&
              posts.length === 0 &&
              businesses.length === 0 &&
              events.length === 0 &&
              neighborhoods.length === 0 && (
                <section className="text-center py-16">
                  <p className="text-gray-mid text-lg">
                    No results for &ldquo;{search}&rdquo; in {area.name}
                  </p>
                </section>
              )}
          </div>

          {/* --- Sidebar --- */}
          <aside className="space-y-8">
            {/* Neighborhoods Widget */}
            {neighborhoods.length > 0 && (
              <div className="border border-gray-100 p-5">
                <h4 className="font-display text-lg font-semibold mb-4">
                  Neighborhoods in {area.name}
                </h4>
                <ul className="space-y-1.5">
                  {neighborhoods.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={`/neighborhoods/${n.slug}`}
                        className="flex items-center justify-between text-sm text-gray-dark hover:text-black transition-colors py-1.5"
                      >
                        <span>{n.name}</span>
                        <ArrowRight size={14} className="text-gray-mid" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Newsletter Widget */}
            <div className="bg-gold-light p-5">
              <h4 className="font-display text-lg font-semibold mb-2">
                {area.name} Updates
              </h4>
              <p className="text-sm text-gray-dark mb-4">
                Get the latest stories, events, and business openings from{" "}
                {area.name}.
              </p>
              <form>
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-3 py-2.5 text-sm border border-black/10 bg-white outline-none focus:border-black transition-colors mb-3"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow hover:bg-gray-dark transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Submit CTA */}
            <div className="bg-[#1a1a1a] p-5 text-white">
              <h4 className="font-display text-lg font-semibold mb-2">
                Own a Business in {area.name}?
              </h4>
              <p className="text-sm text-white/60 mb-4">
                Get your business in front of thousands of Atlantans.
              </p>
              <Link
                href="/submit"
                className="inline-flex items-center px-4 py-2 bg-gold-light text-black text-xs font-semibold uppercase tracking-eyebrow hover:bg-gold-dark transition-colors"
              >
                Get Listed
              </Link>
            </div>

            {/* Ad Placeholder */}
            <div className="bg-gray-light flex items-center justify-center">
              <div className="w-[300px] h-[250px] flex items-center justify-center border border-dashed border-gray-mid/30">
                <span className="text-xs text-gray-mid uppercase tracking-eyebrow">
                  Ad — Sidebar
                </span>
              </div>
            </div>

            {/* Other Areas Widget */}
            {otherAreas.length > 0 && (
              <div className="border border-gray-100 p-5">
                <h4 className="font-display text-lg font-semibold mb-4">
                  Explore Other Areas
                </h4>
                <ul className="space-y-1.5">
                  {otherAreas.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/areas/${a.slug}`}
                        className="flex items-center justify-between text-sm text-gray-dark hover:text-black transition-colors py-1.5"
                      >
                        <span>{a.name}</span>
                        <ArrowRight size={14} className="text-gray-mid" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/areas"
                  className="inline-block mt-4 text-xs font-semibold uppercase tracking-eyebrow text-red-brand hover:text-black transition-colors"
                >
                  See All Areas →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
