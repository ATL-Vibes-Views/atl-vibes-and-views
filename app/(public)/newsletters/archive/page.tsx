import type { Metadata } from "next";
import { Suspense } from "react";
import { getNewsletters, getNewsletterFeaturedImages } from "@/lib/queries";
import { getNewsletterColor } from "@/components/newsletter/NewsletterColorMap";
import { NewsletterArchivePageClient } from "./NewsletterArchivePageClient";
import { getPageHero, getHeroPost } from "@/lib/queries/settings";

export const dynamic = "force-dynamic";

/* ============================================================
   NEWSLETTER ARCHIVE — /newsletters/archive
   Full-width browsable archive of all newsletter editions.
   Mirrors /media/library architecture.
   ============================================================ */

export const metadata: Metadata = {
  title: "Newsletter Archive — Every Edition | ATL Vibes & Views",
  description:
    "Browse every past ATL Vibes & Views newsletter — weekly briefs, dining guides, development updates, events, real estate snapshots, and more.",
  openGraph: {
    title: "Newsletter Archive | ATL Vibes & Views",
    description:
      "Browse every past ATL Vibes & Views newsletter — weekly briefs, dining guides, development updates, events, real estate snapshots, and more.",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/newsletters/archive",
  },
};

export default async function NewsletterArchivePage() {
  /* Fetch all published newsletters + featured images */
  const _hero = await getPageHero("newsletters_archive").catch(() => ({ type: null, imageUrl: null, videoUrl: null, postId: null, alt: null }));
  const _heroPost = (_hero.type === "post" || _hero.type === "featured_post") ? await getHeroPost(_hero.postId).catch(() => null) : null;

  const [allNewsletters, featuredImageMap] = await Promise.all([
    getNewsletters().catch(() => []),
    getNewsletterFeaturedImages().catch(() => new Map<string, string>()),
  ]);

  /* Map to client-safe shape */
  const items = allNewsletters.map((nl) => {
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
      type_slug: color.filterSlug,
    };
  });

  /* Build type tabs from distinct type_slugs in data */
  const typeCounts = new Map<string, { label: string; count: number }>();
  for (const item of items) {
    const existing = typeCounts.get(item.type_slug);
    if (existing) {
      existing.count++;
    } else {
      typeCounts.set(item.type_slug, { label: item.label, count: 1 });
    }
  }
  const typeTabs = Array.from(typeCounts.entries()).map(([slug, { label, count }]) => ({
    slug,
    label,
    count,
  }));

  /* JSON-LD */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Newsletter Archive",
    description: "Browse every past ATL Vibes & Views newsletter.",
    url: "https://atlvibesandviews.com/newsletters/archive",
    publisher: { "@type": "Organization", name: "ATL Vibes & Views" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense
        fallback={
          <div className="site-container py-16 text-center text-gray-mid">
            Loading archive…
          </div>
        }
      >
        <NewsletterArchivePageClient
          items={items}
          typeTabs={typeTabs}
          totalCount={items.length}
        />
      </Suspense>

      {/* BreadcrumbList schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://atlvibesandviews.com" },
              { "@type": "ListItem", position: 2, name: "Newsletters", item: "https://atlvibesandviews.com/newsletters" },
              { "@type": "ListItem", position: 3, name: "Archive" },
            ],
          }),
        }}
      />
    </>
  );
}
