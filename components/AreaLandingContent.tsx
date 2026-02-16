import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { NewsletterForm } from "@/components/NewsletterForm";
import {
  Sidebar,
  NewsletterWidget,
  AdPlacement,
  SubmitCTA,
  NeighborhoodsWidget,
  TopEventsWidget,
} from "@/components/Sidebar";
import type {
  MediaItem,
  BlogPostWithAuthor,
  BusinessListingWithNeighborhood,
  EventItemWithNeighborhood,
  Neighborhood,
} from "@/lib/types";

/* ============================================================
   TYPES
   ============================================================ */

export interface LandingCardItem {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  hero_image_url?: string | null;
}

export interface AreaLandingContentProps {
  /* Search */
  search?: string;
  searchResultsLabel: string;
  filteredCards?: LandingCardItem[];

  /* Cards data (for map click interaction — developer task) */
  cards: LandingCardItem[];
  cardLinkPrefix: string;

  /* Map CTA */
  mapCtaText: string;
  mapCtaHref: string;

  /* Optional: hero section rendered above the grid */
  heroContent?: React.ReactNode;

  /* Optional: custom map component (replaces placeholder) */
  mapContent?: React.ReactNode;

  /* Videos */
  videos: MediaItem[];

  /* Stories & Guides */
  stories: BlogPostWithAuthor[];
  guides: BlogPostWithAuthor[];
  storiesSeeAllHref: string;
  guidesSeeAllHref: string;

  /* Businesses (Eats & Drinks) */
  businesses: BusinessListingWithNeighborhood[];
  businessesSeeAllHref: string;

  /* Sidebar data */
  topNeighborhoods: Neighborhood[];
  upcomingEvents: EventItemWithNeighborhood[];
}

/* ============================================================
   HELPERS
   ============================================================ */

const PH_POST = "https://placehold.co/600x400/1a1a1a/e6c46d?text=Story";
const PH_BIZ = "https://placehold.co/400x300/1a1a1a/e6c46d?text=Business";

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

/* ============================================================
   SHARED AREA / CITY LANDING CONTENT
   ============================================================ */

export function AreaLandingContent({
  search,
  searchResultsLabel,
  filteredCards,
  cards,
  cardLinkPrefix,
  mapCtaText,
  mapCtaHref,
  heroContent,
  mapContent,
  videos,
  stories,
  guides,
  storiesSeeAllHref,
  guidesSeeAllHref,
  businesses,
  businessesSeeAllHref,
  topNeighborhoods,
  upcomingEvents,
}: AreaLandingContentProps) {
  const hasSearchResults = !search || (filteredCards && filteredCards.length > 0);

  return (
    <>
      {/* ========== HERO (optional — rendered above grid) ========== */}
      {heroContent}

      {/* ========== SECTIONS 1-3: Main + Sidebar Grid ========== */}
      <div className="site-container pt-10 pb-16 md:pt-12 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- MAIN COLUMN ---------- */}
          <div className="space-y-16">
            {/* ===== 1. SEARCH BAR ===== */}
            <section>
              <SearchBar
                placeholder="Search ATL Vibes & Views..."
                className="mx-auto"
              />
              {search && (
                <p className="text-sm text-gray-mid mt-3 text-center">
                  Showing results for &ldquo;{search}&rdquo;
                </p>
              )}
              {search && (
                <div className="mt-6">
                  {hasSearchResults ? (
                    filteredCards && filteredCards.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-eyebrow text-[#c1121f] mb-3">
                          {searchResultsLabel}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {filteredCards.map((c) => (
                            <Link
                              key={c.id}
                              href={`${cardLinkPrefix}${c.slug}`}
                              className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-[#fee198] hover:text-black transition-colors"
                            >
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  ) : (
                    <p className="text-gray-mid text-sm text-center">
                      No matches &mdash; try a different search.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* ===== 2. FEATURED VIDEOS ===== */}
            {videos.length > 0 && (
              <section>
                <SectionHeader eyebrow="Watch" title="Featured Videos" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((v) => (
                    <Link
                      key={v.id}
                      href={`/media/${v.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-video overflow-hidden bg-black">
                        {v.embed_url ? (
                          <Image
                            src={`https://img.youtube.com/vi/${extractYouTubeId(v.embed_url)}/hqdefault.jpg`}
                            alt={v.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[#1a1a1a]" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-[#fee198] transition-colors">
                            <Play
                              size={16}
                              className="text-black ml-0.5 fill-black"
                            />
                          </div>
                        </div>
                      </div>
                      <h3 className="font-display text-base font-semibold text-black leading-snug mt-3 group-hover:text-red-brand transition-colors line-clamp-2">
                        {v.title}
                      </h3>
                      {v.published_at && (
                        <p className="text-gray-mid text-[11px] mt-1">
                          {formatDate(v.published_at)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Mobile only — Top Neighborhoods after videos */}
            {topNeighborhoods.length > 0 && (
              <div className="lg:hidden">
                <NeighborhoodsWidget
                  title="Top Neighborhoods"
                  neighborhoods={topNeighborhoods}
                />
              </div>
            )}

            {/* ===== 3. INTERACTIVE MAP ===== */}
            <section>
              {mapContent ?? (
                <div className="bg-[#f5f5f5] border border-dashed border-gray-300 aspect-[16/7] flex items-center justify-center text-center">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">
                      Interactive Map
                    </p>
                    <p className="text-xs text-gray-300">
                      Mapbox integration — developer task
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-6 text-center">
                <Link
                  href={mapCtaHref}
                  className="inline-block px-6 py-3 bg-[#fee198] text-[#1a1a1a] font-semibold text-sm rounded-full hover:opacity-90 transition-opacity"
                >
                  {mapCtaText}
                </Link>
              </div>
            </section>

            {/* Mobile only — Newsletter after map */}
            <div className="lg:hidden">
              <NewsletterWidget />
            </div>
          </div>

          {/* ---------- SIDEBAR (desktop only) ---------- */}
          <div className="hidden lg:block">
            <Sidebar>
              <NeighborhoodsWidget
                title="Top Neighborhoods"
                neighborhoods={topNeighborhoods}
              />
              <NewsletterWidget />
              <AdPlacement slot="sidebar_top" />
            </Sidebar>
          </div>
        </div>
      </div>

      {/* ========== 4. AD SPACE / PAGE BREAK (full width) ========== */}
      <section className="site-container pb-16">
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

      {/* ========== 5. STORIES & GUIDES (full width) ========== */}
      <section className="site-container pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Latest Stories */}
          <div>
            <SectionHeader
              eyebrow="Latest"
              title="Latest Stories"
              href={storiesSeeAllHref}
            />
            {stories.length > 0 ? (
              <div className="space-y-6">
                {stories.map((post) => (
                  <StoryCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-gray-mid text-sm">Stories coming soon.</p>
            )}
          </div>

          {/* Right: Atlanta Guides */}
          <div>
            <SectionHeader
              eyebrow="Explore"
              title="Atlanta Guides"
              href={guidesSeeAllHref}
            />
            {guides.length > 0 ? (
              <div className="space-y-6">
                {guides.map((post) => (
                  <StoryCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-gray-mid text-sm">Guides coming soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* ========== 6. WHERE TO EAT & DRINK + SIDEBAR ========== */}
      <div className="site-container pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- MAIN COLUMN ---------- */}
          <section>
            <SectionHeader
              eyebrow="Discover"
              title="Where to Eat & Drink"
              href={businessesSeeAllHref}
            />
            {businesses.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((biz) => (
                  <BusinessCard key={biz.id} business={biz} />
                ))}
              </div>
            ) : (
              <p className="text-gray-mid text-sm text-center py-12">
                Restaurant listings coming soon.
              </p>
            )}
            <div className="mt-8 text-center">
              <Link
                href={businessesSeeAllHref}
                className="inline-block px-6 py-3 bg-[#fee198] text-[#1a1a1a] font-semibold text-sm rounded-full hover:opacity-90 transition-opacity"
              >
                Explore All Restaurants →
              </Link>
            </div>

            {/* Mobile only — Get Listed CTA */}
            <div className="lg:hidden mt-12">
              <SubmitCTA />
            </div>

            {/* Mobile only — Top Events */}
            {upcomingEvents.length > 0 && (
              <div className="lg:hidden mt-8">
                <TopEventsWidget events={upcomingEvents} />
              </div>
            )}
          </section>

          {/* ---------- SIDEBAR (desktop only) ---------- */}
          <div className="hidden lg:block">
            <Sidebar>
              <SubmitCTA />
              {upcomingEvents.length > 0 && (
                <TopEventsWidget events={upcomingEvents} />
              )}
              <AdPlacement slot="sidebar_mid" />
            </Sidebar>
          </div>
        </div>
      </div>

      {/* ========== 7. NEWSLETTER (full width) ========== */}
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

function StoryCard({ post }: { post: BlogPostWithAuthor }) {
  return (
    <Link href={`/stories/${post.slug}`} className="group flex gap-4">
      <div className="relative w-28 h-20 sm:w-36 sm:h-24 shrink-0 overflow-hidden">
        <Image
          src={post.featured_image_url || PH_POST}
          alt={post.title}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 min-w-0">
        {post.categories?.name && (
          <span className="inline-block px-2.5 py-0.5 bg-gold-light text-black text-[9px] font-semibold uppercase tracking-eyebrow rounded-full mb-1">
            {post.categories.name}
          </span>
        )}
        <h3 className="font-display text-sm sm:text-base font-semibold text-black leading-snug group-hover:text-red-brand transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.published_at && (
          <p className="text-gray-mid text-[11px] mt-1">
            {formatDate(post.published_at)}
          </p>
        )}
      </div>
    </Link>
  );
}

function BusinessCard({
  business,
}: {
  business: BusinessListingWithNeighborhood;
}) {
  return (
    <Link href={`/places/${business.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f5f5]">
        <Image
          src={business.logo || PH_BIZ}
          alt={business.business_name}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <h3 className="font-display text-sm sm:text-base font-semibold text-black mt-3 group-hover:text-red-brand transition-colors line-clamp-1">
        {business.business_name}
      </h3>
      {business.neighborhoods?.name && (
        <p className="text-gray-mid text-xs mt-0.5">
          {business.neighborhoods.name}
        </p>
      )}
      {business.tagline && (
        <p className="text-gray-mid text-xs mt-0.5 line-clamp-1">
          {business.tagline}
        </p>
      )}
    </Link>
  );
}
