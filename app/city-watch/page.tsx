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
   CITY WATCH — /city-watch
   News archive: development, transit, policy, openings, breaking news
   ============================================================ */

export const metadata: Metadata = {
  title: "City Watch — Atlanta News & Development",
  description:
    "Stay current with Atlanta's latest development updates, transit news, business openings, and policy changes.",
  openGraph: {
    title: "City Watch — Atlanta News & Development | ATL Vibes & Views",
    description:
      "Stay current with Atlanta's latest development updates, transit news, business openings, and policy changes.",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/city-watch",
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

export default async function CityWatchPage({
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
    // Future inbound link: ?neighborhood=inman-park — resolve slug to ID
    // For now, treat as neighborhood ID (future: look up by slug)
    filterNeighborhoodIds = [neighborhoodFilter];
  } else if (areaFilter) {
    const areaRecord = areas.find((a) => a.slug === areaFilter);
    if (areaRecord) {
      filterNeighborhoodIds = await getNeighborhoodIdsForArea(areaRecord.id).catch(() => []);
      if (filterNeighborhoodIds.length === 0) filterNeighborhoodIds = undefined;
    }
  }

  /* ── Fetch all news posts with neighborhood data ── */
  const allPosts = await getBlogPostsWithNeighborhood({
    contentType: "news",
    ...(categoryFilter ? {} : {}),
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

  /* ── Neighborhoods in the News (for sidebar) ── */
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
  const newsNeighborhoods = [...neighborhoodCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  /* ── Map posts to client format ── */
  const storyPosts = finalPosts.map(mapPostToStoryPost);

  /* ── Sidebar ── */
  const sidebarContent = (
    <>
      <NewsletterWidget title="Stay in the Loop" />

      {newsNeighborhoods.length > 0 && (
        <SidebarWidget>
          <WidgetTitle className="text-[#c1121f]">
            Neighborhoods in the News
          </WidgetTitle>
          <ul className="space-y-1.5">
            {newsNeighborhoods.map((n) => (
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
    name: "City Watch",
    description:
      "Atlanta news, development updates, and what's happening across the city.",
    url: "https://atlvibesandviews.com/city-watch",
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
        contentType="news"
        heroTitle="City Watch"
        heroSubtitle="Atlanta news, development updates, and what's happening across the city."
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

      {/* Visible breadcrumbs + BreadcrumbList schema */}
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
                name: "City Watch",
              },
            ],
          }),
        }}
      />
    </>
  );
}
