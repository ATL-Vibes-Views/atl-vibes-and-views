import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NewsletterBlock } from "@/components/ui/NewsletterBlock";
import { ShortsCarousel } from "@/components/ui/ShortsCarousel";
import { getMediaItems } from "@/lib/queries";
import { MediaLandingClient } from "./MediaLandingClient";

/* ============================================================
   MEDIA — /media
   Podcast episodes, video features, and short-form content
   ============================================================ */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media — Watch & Listen | ATL Vibes & Views",
  description:
    "Podcast episodes, video features, and short-form content covering Atlanta's neighborhoods, businesses, and culture.",
  openGraph: {
    title: "Media — Watch & Listen | ATL Vibes & Views",
    description:
      "Podcast episodes, video features, and short-form content covering Atlanta's neighborhoods, businesses, and culture.",
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

  /* Fetch items for active tab */
  const items = await getMediaItems({ mediaType: activeTab }).catch(() => []);

  /* Fetch shorts separately */
  const shorts = await getMediaItems({ mediaType: "short", limit: 12 }).catch(() => []);

  /* JSON-LD */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Media",
    description:
      "Podcast episodes, video features, and short-form content from ATL Vibes & Views.",
    url: "https://atlvibesandviews.com/media",
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

      {/* Browse Library CTA */}
      <div className="site-container pb-8 flex justify-center">
        <Link
          href="/media/library"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-[#f5d87a] transition-colors"
        >
          Browse Library
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Shorts carousel */}
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
