import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NewsletterBlock } from "@/components/ui/NewsletterBlock";
import { ShortsCarousel } from "@/components/ui/ShortsCarousel";
import {
  NewsletterWidget,
  AdPlacement,
  NeighborhoodsWidget,
  SubmitCTA,
} from "@/components/Sidebar";
import { getMediaItems, getNeighborhoodsByPopularity } from "@/lib/queries";
import { MediaLandingClient } from "./MediaLandingClient";

/* ============================================================
   MEDIA — /media
   Podcast episodes, video features, and short-form content
   ============================================================ */

export const metadata: Metadata = {
  title: "Watch & Listen — Videos, Podcasts & Shorts | ATL Vibes & Views",
  description:
    "Watch and listen to ATL Vibes & Views — video features, podcast episodes, and short-form content covering Atlanta neighborhoods, culture, and development.",
  openGraph: {
    title: "Watch & Listen | ATL Vibes & Views",
    description:
      "Watch and listen to ATL Vibes & Views — video features, podcast episodes, and short-form content covering Atlanta neighborhoods, culture, and development.",
    url: "https://atlvibesandviews.com/media",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/media",
  },
};

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = params.tab === "video" ? "video" : "podcast";

  /* Fetch in parallel */
  const [items, shorts, topNeighborhoods] = await Promise.all([
    getMediaItems({ mediaType: activeTab }).catch(() => []),
    getMediaItems({ mediaType: "short", limit: 12 }).catch(() => []),
    getNeighborhoodsByPopularity({ limit: 5 }).catch(() => []),
  ]);

  const neighborhoodLinks = topNeighborhoods.map((n) => ({
    name: n.name,
    slug: n.slug,
  }));

  /* JSON-LD */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Media",
    description:
      "Podcast episodes, video features, and short-form content from ATL Vibes & Views.",
    url: "https://atlvibesandviews.com/media",
    publisher: { "@type": "Organization", name: "ATL Vibes & Views" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ========== HERO ========== */}
      <section className="relative w-full bg-[#1a1a1a] h-[52vh] sm:h-[58vh] md:h-[65vh] min-h-[340px] max-h-[640px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-display italic text-[80px] md:text-[140px] lg:text-[200px] text-[rgba(184,154,90,0.06)] leading-none whitespace-nowrap">
            Media
          </span>
        </div>
        <div className="relative z-10 text-center px-6">
          <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3 block">
            Media
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.05] mb-3">
            Watch &amp; Listen
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-lg mx-auto">
            Podcast episodes, video features, and short-form content covering Atlanta.
          </p>
        </div>
      </section>

      {/* ========== BREADCRUMBS ========== */}
      <div className="site-container pt-5 pb-2">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Media" }]}
        />
      </div>

      {/* ========== TWO-COLUMN LAYOUT ========== */}
      <div className="site-container pb-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">

          {/* ── MAIN CONTENT ── */}
          <main className="min-w-0 flex-1">
            <Suspense fallback={null}>
              <MediaLandingClient
                items={items.map((m) => ({
                  id: m.id,
                  title: m.title,
                  slug: m.slug,
                  excerpt: m.excerpt,
                  description: m.description,
                  media_type: m.media_type,
                  embed_url: m.embed_url,
                  thumbnail_url: m.thumbnail_url,
                  published_at: m.published_at,
                  is_featured: m.is_featured,
                }))}
                activeTab={activeTab}
              />
            </Suspense>

            {/* ── MOBILE INLINE WIDGETS (lg:hidden — sidebar handles desktop) ── */}

            {/* 1. NewsletterWidget — after featured/grid */}
            <div className="lg:hidden mt-8">
              <NewsletterWidget />
            </div>

            <hr className="border-gray-200 my-8 lg:hidden" />

            {/* 2. Neighborhood pills — horizontal scroll */}
            {neighborhoodLinks.length > 0 && (
              <div className="flex gap-2 overflow-x-auto lg:hidden pb-2 scrollbar-hide">
                {neighborhoodLinks.map((n) => (
                  <Link
                    key={n.slug}
                    href={`/neighborhoods/${n.slug}`}
                    className="flex-shrink-0 px-4 py-1.5 rounded-full border border-gray-200 text-xs font-semibold whitespace-nowrap bg-white hover:border-gray-400 transition-colors"
                  >
                    {n.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Browse Library CTA */}
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link
                href="/media/library"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-[#f5d87a] transition-colors"
              >
                Browse Full Library
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* 3. SubmitCTA — after all content, before footer */}
            <div className="lg:hidden mt-8">
              <SubmitCTA />
            </div>
          </main>

          {/* ── SIDEBAR (desktop only) ── */}
          <aside className="hidden lg:block w-full lg:w-sidebar shrink-0 space-y-8">
            <NewsletterWidget />
            <AdPlacement slot="sidebar_top" />
            <NeighborhoodsWidget neighborhoods={neighborhoodLinks} />
            <SubmitCTA />
            <AdPlacement slot="sidebar_mid" />
          </aside>
        </div>
      </div>

      {/* Shorts carousel — full width */}
      <ShortsCarousel shorts={shorts} />

      {/* Newsletter CTA */}
      <NewsletterBlock
        heading="Atlanta in Your Inbox"
        description="Get the latest on Atlanta's neighborhoods, events, and culture delivered to your inbox. No spam. Unsubscribe anytime."
      />

      {/* BreadcrumbList schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://atlvibesandviews.com" },
              { "@type": "ListItem", position: 2, name: "Media" },
            ],
          }),
        }}
      />
    </>
  );
}
