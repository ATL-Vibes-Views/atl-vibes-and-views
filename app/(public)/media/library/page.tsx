import type { Metadata } from "next";
import { NewsletterBlock } from "@/components/ui/NewsletterBlock";
import { MediaLibraryClient } from "@/components/MediaLibraryClient";
import { getMediaItems } from "@/lib/queries";

export const dynamic = "force-dynamic";

/* ============================================================
   MEDIA LIBRARY — /media/library

   Full-width browsable archive of all videos, podcasts, and shorts.
   Mirrors /stories architecture: no sidebars, single-column layout.

   Section order:
   1. Hero (dark bg)
   2. Filter bar (tabs + search)
   3. Result count
   4. Video/Podcast grid (4-col, 16:9, Load More)
   5. Horizontal ad
   6. Shorts section (6-col, 9:16, Load More Shorts)
   7. Newsletter (#f8f5f0)
   ============================================================ */

export const metadata: Metadata = {
  title: "Media Library — Watch & Listen | ATL Vibes & Views",
  description:
    "Browse every video, podcast episode, and short from ATL Vibes & Views — Atlanta's culture, neighborhoods, and businesses.",
  openGraph: {
    title: "Media Library — Watch & Listen | ATL Vibes & Views",
    description:
      "Browse every video, podcast episode, and short from ATL Vibes & Views.",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/media/library",
  },
};

export default async function MediaLibraryPage() {
  /* Fetch all published media — videos/podcasts and shorts separately */
  const [allMedia, shorts] = await Promise.all([
    getMediaItems().catch(() => []),
    getMediaItems({ mediaType: "short" }).catch(() => []),
  ]);

  /* Filter out shorts from main items (they appear in their own section) */
  const mainItems = allMedia.filter((m) => m.media_type !== "short");

  /* Map to client-safe shape */
  const mapItem = (m: (typeof allMedia)[number]) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    excerpt: m.excerpt,
    media_type: m.media_type as "video" | "podcast" | "short",
    embed_url: m.embed_url,
    published_at: m.published_at,
    is_featured: m.is_featured,
  });

  /* JSON-LD */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Media Library",
    description:
      "Browse every video, podcast episode, and short from ATL Vibes & Views.",
    url: "https://atlvibesandviews.com/media/library",
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

      <MediaLibraryClient
        items={mainItems.map(mapItem)}
        shorts={shorts.map(mapItem)}
      />

      {/* Newsletter */}
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
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://atlvibesandviews.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Media",
                item: "https://atlvibesandviews.com/media",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Library",
              },
            ],
          }),
        }}
      />
    </>
  );
}
