import type { Metadata } from "next";
import { NewsletterBlock } from "@/components/ui/NewsletterBlock";
import { StoriesArchiveClient } from "@/components/StoriesArchiveClient";
import {
  getBlogPostsWithNeighborhood,
  getAreas,
  getNeighborhoodIdsForArea,
} from "@/lib/queries";
import type { BlogPostFull } from "@/lib/types";

/* ============================================================
   STORIES — /stories
   Master blog archive: all content types (news + guides)
   ============================================================ */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stories — Atlanta News, Guides & Culture",
  description:
    "Explore the latest Atlanta stories, neighborhood guides, dining spotlights, and city news from ATL Vibes & Views.",
  openGraph: {
    title: "Stories | ATL Vibes & Views",
    description:
      "Explore the latest Atlanta stories, neighborhood guides, dining spotlights, and city news.",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/stories",
  },
};

/* --- Helpers --- */

function mapPostToStoryPost(post: BlogPostFull) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? null,
    featured_image_url: post.featured_image_url ?? null,
    published_at: post.published_at ?? null,
    is_featured: post.is_featured,
    category_name: post.categories?.name ?? null,
    category_slug: post.categories?.slug ?? null,
    neighborhood_name: post.neighborhoods?.name ?? null,
    neighborhood_slug: post.neighborhoods?.slug ?? null,
    area_slug: post.neighborhoods?.areas?.slug ?? null,
    author_name: post.authors?.name ?? null,
  };
}

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    area?: string;
    neighborhood?: string;
    search?: string;
    pillar?: string;
  }>;
}) {
  const filters = await searchParams;
  const categoryFilter = filters.category || undefined;
  const areaFilter = filters.area || undefined;
  const neighborhoodFilter = filters.neighborhood || undefined;
  const searchFilter = filters.search?.trim() || undefined;
  const pillarFilter = filters.pillar || undefined;

  /* ── Fetch areas for filter dropdown ── */
  const areas = await getAreas().catch(() => []);

  /* ── Resolve neighborhood IDs for area-based filtering ── */
  let filterNeighborhoodIds: string[] | undefined;
  if (neighborhoodFilter) {
    filterNeighborhoodIds = [neighborhoodFilter];
  } else if (areaFilter) {
    const areaRecord = areas.find((a) => a.slug === areaFilter);
    if (areaRecord) {
      filterNeighborhoodIds = await getNeighborhoodIdsForArea(areaRecord.id).catch(() => []);
      if (filterNeighborhoodIds.length === 0) filterNeighborhoodIds = undefined;
    }
  }

  /* ── Resolve content_type from pillar param ── */
  const contentTypeFromPillar =
    pillarFilter === "news" ? "news" : pillarFilter === "guide" ? "guide" : undefined;

  /* ── Fetch posts (filtered by pillar content_type if set) ── */
  const allPosts = await getBlogPostsWithNeighborhood({
    ...(contentTypeFromPillar ? { contentType: contentTypeFromPillar } : {}),
    ...(filterNeighborhoodIds ? { neighborhoodIds: filterNeighborhoodIds } : {}),
    ...(searchFilter ? { search: searchFilter } : {}),
  }).catch(() => []);

  /* ── Client-side category filtering (by slug) ── */
  const filteredPosts = categoryFilter
    ? allPosts.filter((p) => p.categories?.slug === categoryFilter)
    : allPosts;

  /* ── Area filtering (by slug in neighborhood.areas) ── */
  let finalPosts = filteredPosts;
  if (areaFilter && !filterNeighborhoodIds) {
    finalPosts = filteredPosts.filter(
      (p) => p.neighborhoods?.areas?.slug === areaFilter
    );
  }

  /* ── Extract distinct categories from posts ── */
  const categoriesMap = new Map<string, string>();
  allPosts.forEach((p) => {
    if (p.categories?.slug && p.categories?.name) {
      categoriesMap.set(p.categories.slug, p.categories.name);
    }
  });
  const categories = [...categoriesMap.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  /* ── Map posts to client format ── */
  const storyPosts = finalPosts.map(mapPostToStoryPost);

  /* ── JSON-LD ── */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Stories",
    description:
      "Atlanta stories, neighborhood guides, dining spotlights, and city news.",
    url: "https://atlvibesandviews.com/stories",
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

      <StoriesArchiveClient
        initialPosts={storyPosts}
        categories={categories}
        areas={areas.map((a) => ({ id: a.id, name: a.name, slug: a.slug }))}
        heroTitle="Stories"
        heroSubtitle="Atlanta news, neighborhood guides, dining spotlights, and culture from every corner of the city."
        showTabs={true}
        currentFilters={{
          category: categoryFilter,
          area: areaFilter,
          neighborhood: neighborhoodFilter,
          search: searchFilter,
          pillar: pillarFilter,
        }}
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
                name: "Stories",
              },
            ],
          }),
        }}
      />
    </>
  );
}
