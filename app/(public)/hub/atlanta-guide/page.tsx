import type { Metadata } from "next";
import { NewsletterBlock } from "@/components/ui/NewsletterBlock";
import { StoriesArchiveClient } from "@/components/StoriesArchiveClient";
import {
  getBlogPostsWithNeighborhood,
  getAreas,
  getNeighborhoodIdsForArea,
} from "@/lib/queries";
import { getPageHero, getHeroPost } from "@/lib/queries/settings";
import type { BlogPostFull } from "@/lib/types";

/* ============================================================
   ATLANTA GUIDE — /hub/atlanta-guide
   Evergreen guides: neighborhood spotlights, best-of lists, local knowledge
   ============================================================ */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Atlanta Guide — Best of ATL, Neighborhood Guides & More",
  description:
    "Your insider's guide to Atlanta — neighborhood deep dives, best-of lists, dining guides, and local knowledge that lasts.",
  openGraph: {
    title:
      "Atlanta Guide — Best of ATL, Neighborhood Guides & More | ATL Vibes & Views",
    description:
      "Your insider's guide to Atlanta — neighborhood deep dives, best-of lists, dining guides, and local knowledge that lasts.",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/hub/atlanta-guide",
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

export default async function AtlantaGuidePage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    area?: string;
    neighborhood?: string;
    search?: string;
  }>;
}) {
  const filters = await searchParams;
  const categoryFilter = filters.category || undefined;
  const areaFilter = filters.area || undefined;
  const neighborhoodFilter = filters.neighborhood || undefined;
  const searchFilter = filters.search?.trim() || undefined;

  /* ── Hero ── */
  const _hero = await getPageHero("hub_atlanta_guide").catch(() => ({ type: null, imageUrl: null, videoUrl: null, postId: null, alt: null }));
  const _heroPost = (_hero.type === "post" || _hero.type === "featured_post") ? await getHeroPost(_hero.postId).catch(() => null) : null;

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

  /* ── Fetch all guide posts with neighborhood data ── */
  const allPosts = await getBlogPostsWithNeighborhood({
    contentType: "guide",
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
    name: "Atlanta Guide",
    description:
      "Your insider's guide to the city — neighborhood deep dives, best-of lists, and local knowledge.",
    url: "https://atlvibesandviews.com/hub/atlanta-guide",
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
        contentType="guide"
        heroType={(_hero.type ?? "image") as "image" | "video" | "post" | "featured_post"}
        videoUrl={_hero.videoUrl ?? undefined}
        heroPost={_heroPost}
        heroTitle="Atlanta Guide"
        heroSubtitle="Your insider's guide to the city — neighborhood deep dives, best-of lists, and local knowledge."
        currentFilters={{
          category: categoryFilter,
          area: areaFilter,
          neighborhood: neighborhoodFilter,
          search: searchFilter,
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
                name: "The Hub",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Atlanta Guide",
              },
            ],
          }),
        }}
      />
    </>
  );
}
