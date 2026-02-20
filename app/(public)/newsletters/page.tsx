import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NewsletterForm } from "@/components/NewsletterForm";
import {
  NewsletterWidget,
  AdPlacement,
  NeighborhoodsWidget,
  SubmitCTA,
} from "@/components/Sidebar";
import { getNewsletters, getNewsletterFeaturedImages, getNeighborhoodsByPopularity } from "@/lib/queries";
import { getNewsletterColor } from "@/components/newsletter/NewsletterColorMap";

/* ============================================================
   NEWSLETTERS — /newsletters
   Destination page: featured latest edition + past editions grid
   + sidebar with real widgets
   ============================================================ */

export const metadata: Metadata = {
  title: "Atlanta Newsletters — Weekly Guides & Local Intel | ATL Vibes & Views",
  description:
    "Stay informed with ATL Vibes & Views newsletters — weekly Atlanta guides, neighborhood spotlights, dining picks, development updates, and more.",
  openGraph: {
    title: "Atlanta in Your Inbox | ATL Vibes & Views",
    description:
      "Stay informed with ATL Vibes & Views newsletters — weekly Atlanta guides, neighborhood spotlights, dining picks, development updates, and more.",
    url: "https://atlvibesandviews.com/newsletters",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/newsletters",
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PH_NL = "https://placehold.co/600x375/1a1a1a/666?text=Newsletter";

export default async function NewslettersPage() {
  /* ── Fetch data in parallel ── */
  const [allNewsletters, featuredImageMap, topNeighborhoods] = await Promise.all([
    getNewsletters().catch(() => []),
    getNewsletterFeaturedImages().catch(() => new Map<string, string>()),
    getNeighborhoodsByPopularity({ limit: 5 }).catch(() => []),
  ]);

  const neighborhoodLinks = topNeighborhoods.map((n) => ({
    name: n.name,
    slug: n.slug,
  }));

  /* ── Split: latest (featured) + past 3 ── */
  const latestEdition = allNewsletters[0] ?? null;
  const pastEditions = allNewsletters.slice(1, 4);

  /* ── Helper: map newsletter to card shape ── */
  const toCard = (nl: (typeof allNewsletters)[number]) => {
    const color = getNewsletterColor(nl.name);
    return {
      id: nl.id,
      slug: nl.issue_slug,
      name: nl.name,
      issue_date: nl.issue_date,
      subject_line: nl.subject_line,
      preview_text: nl.preview_text ?? null,
      featured_image_url: featuredImageMap.get(nl.id) ?? null,
      border_color: color.borderColor,
      label_color: color.labelColor,
      label: color.label,
    };
  };

  const latestCard = latestEdition ? toCard(latestEdition) : null;
  const pastCards = pastEditions.map(toCard);

  /* ── JSON-LD ── */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Newsletters",
    description: "ATL Vibes & Views newsletters — weekly Atlanta guides and local intel.",
    url: "https://atlvibesandviews.com/newsletters",
    publisher: { "@type": "Organization", name: "ATL Vibes & Views" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ========== DARK HERO ========== */}
      <section className="relative w-full h-[200px] md:h-[240px] overflow-hidden bg-[#1a1a1a]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-display italic text-[80px] md:text-[120px] lg:text-[160px] text-[rgba(184,154,90,0.08)] leading-none whitespace-nowrap">
            Newsletters
          </span>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-6">
            <span className="text-[#fee198] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3 block">
              Newsletters
            </span>
            <h1 className="font-display text-[36px] md:text-4xl lg:text-[48px] font-semibold text-white leading-[1.05]">
              Atlanta in Your Inbox
            </h1>
            <p className="text-white/60 text-[15px] mt-3 max-w-md mx-auto">
              Weekly guides, neighborhood spotlights, dining picks, and local intel.
            </p>
          </div>
        </div>
      </section>

      {/* ========== BREADCRUMBS ========== */}
      <div className="site-container pt-6 pb-2">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Newsletters" }]}
        />
      </div>

      {/* ========== SUBSCRIBE STRIP ========== */}
      <div className="bg-[#f8f5f0]">
        <div className="site-container py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-dark font-medium text-center sm:text-left">
            Join Atlanta locals — free, weekly delivery
          </p>
          <NewsletterForm compact />
        </div>
      </div>

      {/* ========== TWO-COLUMN LAYOUT ========== */}
      <div className="site-container py-10 md:py-14">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">

          {/* ── MAIN CONTENT ── */}
          <main className="min-w-0 flex-1">

            {/* ── LATEST EDITION (featured) ── */}
            {latestCard ? (
              <section className="mb-10">
                <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-[0.15em] block mb-4">
                  Latest Edition
                </span>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                  style={{ borderLeftWidth: 4, borderLeftColor: latestCard.border_color }}>
                  {/* Preview image */}
                  <Link href={`/newsletters/${latestCard.slug}`} className="group relative aspect-[16/10] overflow-hidden bg-[#1a1a1a] block">
                    {latestCard.featured_image_url ? (
                      <Image
                        src={latestCard.featured_image_url}
                        alt={latestCard.subject_line || latestCard.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                        <div className="w-full max-w-[200px] bg-[#111] border border-white/10 p-4 text-center">
                          <div className="text-[#fee198] text-[9px] font-bold uppercase tracking-widest mb-1">ATL Vibes &amp; Views</div>
                          <div className="w-full h-px bg-white/10 mb-2" />
                          <div className="text-white/70 text-[10px] font-semibold uppercase tracking-wider mb-2"
                            style={{ color: latestCard.label_color }}>{latestCard.label}</div>
                          <div className="text-white text-[11px] font-bold leading-tight line-clamp-3">
                            {latestCard.subject_line || latestCard.name}
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
                  {/* Body */}
                  <div className="p-6 flex flex-col justify-center">
                    <span className="text-[10px] font-semibold uppercase tracking-eyebrow block mb-2"
                      style={{ color: latestCard.label_color }}>
                      {latestCard.label}
                    </span>
                    <Link href={`/newsletters/${latestCard.slug}`}>
                      <h2 className="font-display text-2xl md:text-3xl font-semibold text-black leading-tight hover:text-[#c1121f] transition-colors">
                        {latestCard.subject_line || latestCard.name}
                      </h2>
                    </Link>
                    {latestCard.preview_text && (
                      <p className="text-gray-mid text-sm mt-3 line-clamp-3">
                        {latestCard.preview_text}
                      </p>
                    )}
                    <span className="text-xs text-gray-mid mt-4 block">
                      {formatDate(latestCard.issue_date)}
                    </span>
                    <Link
                      href={`/newsletters/${latestCard.slug}`}
                      className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-[#f5d87a] transition-colors w-fit"
                    >
                      Read This Edition
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </section>
            ) : (
              <div className="text-center py-16 mb-10">
                <Mail size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-mid">No newsletters published yet. Check back soon.</p>
              </div>
            )}

            {/* ── MOBILE INLINE WIDGETS (hidden on desktop — sidebar handles those) ── */}

            {/* 1. NewsletterWidget — after Latest Edition, before hr */}
            <div className="lg:hidden mb-8">
              <NewsletterWidget />
            </div>

            <hr className="border-gray-200 mb-8" />

            {/* 2. Neighborhood pills — above Past Editions grid */}
            {neighborhoodLinks.length > 0 && (
              <div className="flex gap-2 overflow-x-auto lg:hidden pb-2 mb-8 scrollbar-hide">
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

            {/* ── PAST EDITIONS GRID ── */}
            {pastCards.length > 0 && (
              <section>
                <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-[0.15em] block mb-6">
                  Past Editions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastCards.map((card) => (
                    <Link
                      key={card.id}
                      href={`/newsletters/${card.slug}`}
                      className="group block border border-gray-200 hover:shadow-md transition-all overflow-hidden"
                      style={{ borderLeftWidth: 4, borderLeftColor: card.border_color }}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#1a1a1a]">
                        {card.featured_image_url ? (
                          <Image
                            src={card.featured_image_url}
                            alt={card.subject_line || card.name}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-display italic text-2xl text-white/10">Newsletter</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <span className="text-[10px] font-semibold uppercase tracking-eyebrow block mb-1.5"
                          style={{ color: card.label_color }}>
                          {card.label}
                        </span>
                        <h3 className="font-display text-[18px] font-bold text-black leading-snug group-hover:text-[#c1121f] transition-colors line-clamp-2">
                          {card.subject_line || card.name}
                        </h3>
                        {card.preview_text && (
                          <p className="text-[13px] text-gray-mid line-clamp-2 mt-1.5">
                            {card.preview_text}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-mid">{formatDate(card.issue_date)}</span>
                          <ArrowRight size={14} className="text-gray-400 group-hover:text-[#c1121f] group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Inline ad — 728×90 */}
                <div className="mt-10 flex justify-center">
                  <div className="hidden md:flex w-full max-w-[728px] h-[90px] border border-dashed border-gray-300 bg-gray-50 items-center justify-center">
                    <div className="text-center">
                      <span className="text-xs text-gray-mid uppercase tracking-eyebrow">Advertisement</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">728 × 90</p>
                    </div>
                  </div>
                  <div className="md:hidden w-full h-[60px] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                    <span className="text-xs text-gray-mid uppercase tracking-eyebrow">Advertisement</span>
                  </div>
                </div>

                {/* See All → /newsletters/archive */}
                <div className="mt-8 flex justify-center lg:justify-start">
                  <Link
                    href="/newsletters/archive"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-[#f5d87a] transition-colors"
                  >
                    Browse All Editions
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </section>
            )}

            {/* 3. SubmitCTA — after all content sections, before footer */}
            <div className="lg:hidden mt-10">
              <SubmitCTA />
            </div>
          </main>

          {/* ── SIDEBAR (desktop only) ── */}
          <aside className="hidden lg:block w-full lg:w-sidebar shrink-0 space-y-8">
            <NewsletterWidget />
            <AdPlacement slot="sidebar_top" />
            <NeighborhoodsWidget neighborhoods={neighborhoodLinks} />
            <SubmitCTA />
            <AdPlacement slot="sidebar_tall" className="hidden lg:block" />
          </aside>
        </div>
      </div>

      {/* ========== FOOTER SUBSCRIBE CTA ========== */}
      <section className="bg-[#1a1a1a] py-16 md:py-20">
        <div className="site-container text-center">
          <span className="text-[#fee198] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3 block">
            Stay Connected
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
            Atlanta in Your Inbox
          </h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-8">
            Get the latest on Atlanta&rsquo;s neighborhoods, events, and culture
            delivered to your inbox. No spam. Unsubscribe anytime.
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* BreadcrumbList schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://atlvibesandviews.com" },
              { "@type": "ListItem", position: 2, name: "Newsletters" },
            ],
          }),
        }}
      />
    </>
  );
}
