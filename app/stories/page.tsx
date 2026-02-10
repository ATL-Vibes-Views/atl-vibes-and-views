import Link from "next/link";
import type { Metadata } from "next";
import { NewsletterBlock } from "@/components/ui/NewsletterBlock";
import {
  NewsletterWidget,
  AdPlacement,
  SubmitCTA,
  SidebarWidget,
  WidgetTitle,
} from "@/components/Sidebar";
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
  }>;
}) {
  const filters = await searchParams;
  const categoryFilter = filters.category || undefined;
  const areaFilter = filters.area || undefined;
  const neighborhoodFilter = filters.neighborhood || undefined;
  const searchFilter = filters.search?.trim() || undefined;

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

  /* ── Fetch ALL posts (no contentType filter) ── */
  const allPosts = await getBlogPostsWithNeighborhood({
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

  /* ── Neighborhoods in Stories (for sidebar) ── */
  const neighborhoodCounts = new Map<string, { name: string; slug: string; count: number }>();
  allPosts.forEach((p) => {
    if (p.neighborhoods?.name && p.neighborhoods?.slug) {
      const key = p.neighborhoods.slug;
      const existing = neighborhoodCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        neighborhoodCounts.set(key, {
          name: p.neighborhoods.name,
          slug: p.neighborhoods.slug,
          count: 1,
        });
      }
    }
  });
  const storyNeighborhoods = [...neighborhoodCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  /* ── Map posts to client format ── */
  const storyPosts = finalPosts.map(mapPostToStoryPost);

  /* ── Sidebar ── */
  const sidebarContent = (
    <>
      <NewsletterWidget title="Stay in the Loop" />

      {storyNeighborhoods.length > 0 && (
        <SidebarWidget>
          <WidgetTitle className="text-[#c1121f]">
            Popular Neighborhoods
          </WidgetTitle>
          <ul className="space-y-1.5">
            {storyNeighborhoods.map((n) => (
              <li key={n.slug}>
                <Link
                  href={`/neighborhoods/${n.slug}`}
                  className="flex items-center justify-between text-sm text-gray-dark hover:text-black transition-colors py-1"
                >
                  <span>{n.name}</span>
                  <span className="text-xs text-gray-mid">{n.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </SidebarWidget>
      )}

      <AdPlacement slot="sidebar_top" />

      <SidebarWidget>
        <WidgetTitle className="text-[#c1121f]">Explore by Area</WidgetTitle>
        <ul className="space-y-1.5">
          {areas.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/areas/${a.slug}`}
                className="text-sm text-gray-dark hover:text-black transition-colors py-1 block"
              >
                {a.name}
              </Link>
            </li>
          ))}
        </ul>
      </SidebarWidget>

      <SubmitCTA
        heading="Have a Story Tip?"
        description="Know something happening in Atlanta? We want to hear from you."
        buttonText="Contact Us"
        href="/contact"
      />
    </>
  );

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
        sidebar={sidebarContent}
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
                name: "Stories",
              },
            ],
          }),
        }}
      />
    </>
  );
}
