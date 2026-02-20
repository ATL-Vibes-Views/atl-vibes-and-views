import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NewsletterForm } from "@/components/NewsletterForm";
import { NewsletterArchiveClient } from "@/components/newsletter/NewsletterArchiveClient";
import {
  getNewsletters,
  getNewsletterTypes,
  getNewsletterFeaturedImages,
} from "@/lib/queries";
import {
  getNewsletterColor,
  buildFilterTabs,
} from "@/components/newsletter/NewsletterColorMap";
import type { NewsletterCardData } from "@/components/newsletter/NewsletterCard";

/* ============================================================
   NEWSLETTER ARCHIVE — /newsletters
   Two-zone layout: Latest Editions (grid + sidebar) →
   Ad Divider → Past Editions / Cross-promo (full-width grid)
   ============================================================ */

export const metadata: Metadata = {
  title: "Newsletter Archive — ATL Vibes & Views",
  description:
    "Browse every edition of the ATL Vibes & Views newsletters. Atlanta news, neighborhood guides, dining spotlights, and community stories delivered weekly.",
  openGraph: {
    title: "Newsletter Archive | ATL Vibes & Views",
    description:
      "Browse every edition of the ATL Vibes & Views newsletters.",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/newsletters",
  },
};

/* --- Page Component --- */

export default async function NewslettersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const filters = await searchParams;

  /* ── Fetch data in parallel ── */
  const [allNewsletters, , featuredImageMap] = await Promise.all([
    getNewsletters(),
    getNewsletterTypes(),
    getNewsletterFeaturedImages(),
  ]);

  /* ── Build filter tabs from actual newsletter data ── */
  const filterTabs = buildFilterTabs(allNewsletters);

  /* ── Build sidebar types list ── */
  const sidebarTypes = filterTabs.map((tab) => ({
    name: tab.name,
    color: tab.color,
  }));

  /* ── Map newsletters to card data ── */
  const cardData: NewsletterCardData[] = allNewsletters.map((nl) => {
    const color = getNewsletterColor(nl.name);
    return {
      id: nl.id,
      slug: nl.issue_slug,
      name: nl.name,
      issue_date: nl.issue_date,
      subject_line: nl.subject_line,
      preview_text: nl.preview_text ?? null,
      featured_image_url: featuredImageMap.get(nl.id) ?? null,
      type_slug: color.filterSlug,
      border_color: color.borderColor,
      label_color: color.labelColor,
      label: color.label,
    };
  });

  /* ── JSON-LD ── */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Newsletter Archive",
    description:
      "Browse every edition of the ATL Vibes & Views newsletters.",
    url: "https://atlvibesandviews.com/newsletters",
    publisher: {
      "@type": "Organization",
      name: "ATL Vibes & Views",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ========== DARK HERO ========== */}
      <section className="relative w-full bg-[#1a1a1a] h-[52vh] sm:h-[58vh] md:h-[65vh] min-h-[340px] max-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Gold watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-display italic text-[80px] md:text-[140px] lg:text-[200px] text-[rgba(184,154,90,0.06)] leading-none whitespace-nowrap">
            Newsletters
          </span>
        </div>
        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <span className="text-[#fee198] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3 block">
            Newsletters
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.05]">
            Atlanta in Your Inbox
          </h1>
          <p className="text-white/60 text-sm md:text-base mt-3 max-w-lg mx-auto">
            Weekly guides, neighborhood spotlights, development updates, and local intel — curated for Atlantans.
          </p>
        </div>
      </section>

      {/* ========== BREADCRUMBS ========== */}
      <div className="site-container pt-6 pb-2">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Newsletters" },
          ]}
        />
      </div>

      {/* ========== SUBSCRIBE STRIP ========== */}
      <div className="bg-[#f8f5f0]">
        <div className="site-container py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-dark font-medium text-center sm:text-left">
            Get Atlanta in your inbox — free, weekly delivery
          </p>
          <NewsletterForm compact />
        </div>
      </div>

      {/* ========== CLIENT ARCHIVE — Zones 1 + 2 ========== */}
      <div className="pt-10 md:pt-14">
        <Suspense
          fallback={
            <div className="site-container py-16 text-center text-gray-mid">
              Loading newsletters...
            </div>
          }
        >
          <NewsletterArchiveClient
            newsletters={cardData}
            filterTabs={filterTabs}
            sidebarTypes={sidebarTypes}
            currentFilters={{ type: filters.type }}
          />
        </Suspense>
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
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://atlvibesandviews.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Newsletter Archive",
              },
            ],
          }),
        }}
      />
    </>
  );
}
