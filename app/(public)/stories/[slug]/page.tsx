import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/ui/EventCard";
import { NewsletterBlock } from "@/components/ui/NewsletterBlock";
import { RelatedStoryCard } from "@/components/ui/RelatedStoryCard";
import type { RelatedPost } from "@/components/ui/RelatedStoryCard";
import {
  Sidebar,
  SidebarWidget,
  WidgetTitle,
  NewsletterWidget,
  AdPlacement,
  NeighborhoodsWidget,
  SubmitCTA,
  SubmitEventCTA,
} from "@/components/Sidebar";
import {
  getBlogPostBySlugFull,
  getBlogPosts,
  getBusinesses,
  getBusinessesByPostId,
  getEvents,
  getNeighborhoods,
} from "@/lib/queries";
import type { BlogPostFull } from "@/lib/types";
import { MarkdownArticle } from "@/components/ui/MarkdownArticle";

/* ============================================================
   BLOG POST DETAIL PAGE — /stories/[slug]

   Layout: hero + article column (2/3) + sidebar (1/3)
   Sidebar auto-detects variant based on category + content_type.
   ============================================================ */

const PH_HERO = "https://placehold.co/1920x600/1a1a1a/e6c46d?text=Story";
const PH_BIZ = "https://placehold.co/200x160/1a1a1a/e6c46d?text=Biz";

/* --- Helpers --- */

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(post: BlogPostFull): number {
  if (post.word_count) return Math.ceil(post.word_count / 200);
  const text = post.content_html || post.content_md || "";
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

type SidebarVariant = "directory" | "news" | "guide";

const DIRECTORY_SLUGS = [
  "dining",
  "restaurants",
  "events",
  "things-to-do",
  "businesses",
  "nightlife",
  "shopping",
  "fitness",
  "arts-entertainment",
];

function getSidebarVariant(
  categorySlug: string | null,
  contentType: string | null
): SidebarVariant {
  if (categorySlug && DIRECTORY_SLUGS.includes(categorySlug)) return "directory";
  if (contentType === "news") return "news";
  return "guide";
}

/* --- Metadata --- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlugFull(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.featured_image_url ? [post.featured_image_url] : [],
      type: "article",
      publishedTime: post.published_at || undefined,
    },
    alternates: {
      canonical:
        post.canonical_url ||
        `https://atlvibesandviews.com/stories/${post.slug}`,
    },
  };
}

/* --- Page Component --- */

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlugFull(slug);
  if (!post) return notFound();

  /* ── Resolved relations ── */
  const category = post.categories;
  const neighborhood = post.neighborhoods;
  const area = neighborhood?.areas;
  const author = post.authors;

  /* ── Sidebar variant ── */
  const sidebarVariant = getSidebarVariant(
    category?.slug ?? null,
    post.content_type ?? null
  );

  /* ── Related posts (same category, exclude current) ── */
  const relatedRaw = category
    ? await getBlogPosts({ categoryId: category.id, limit: 5 }).catch(() => [])
    : [];
  const relatedPosts: RelatedPost[] = relatedRaw
    .filter((p) => p.id !== post.id)
    .slice(0, 4)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      featured_image_url: p.featured_image_url ?? null,
      category_name: p.categories?.name ?? null,
      published_at: p.published_at ?? null,
    }));

  /* ── Sidebar data (fetched based on variant) ── */

  // NEWS sidebar: nearby neighborhoods from same area
  let nearbyNeighborhoods: { name: string; slug: string }[] = [];
  if (sidebarVariant === "news" && area) {
    const sameArea = await getNeighborhoods({ areaId: area.id, limit: 10 }).catch(
      () => []
    );
    nearbyNeighborhoods = sameArea
      .filter((n) => n.id !== neighborhood?.id)
      .slice(0, 6)
      .map((n) => ({ name: n.name, slug: n.slug }));
  }

  // DIRECTORY sidebar: nearby businesses + upcoming events
  let nearbyBusinesses: Awaited<ReturnType<typeof getBusinesses>> = [];
  let nearbyEvents: Awaited<ReturnType<typeof getEvents>> = [];
  if (sidebarVariant === "directory" && neighborhood) {
    [nearbyBusinesses, nearbyEvents] = await Promise.all([
      getBusinesses({ neighborhoodIds: [neighborhood.id], limit: 5 }).catch(
        () => []
      ),
      getEvents({
        neighborhoodIds: [neighborhood.id],
        upcoming: true,
        limit: 5,
      }).catch(() => []),
    ]);
  }

  // GUIDE sidebar: mentioned businesses via post_businesses
  let mentionedBusinesses: Awaited<ReturnType<typeof getBusinessesByPostId>> = [];
  if (sidebarVariant === "guide") {
    mentionedBusinesses = await getBusinessesByPostId(post.id, 5).catch(
      () => []
    );
  }

  /* ── Sponsor business name ── */
  let sponsorName: string | null = null;
  if (post.is_sponsored && post.sponsor_business_id) {
    const sponsorBiz = nearbyBusinesses.find(
      (b) => b.id === post.sponsor_business_id
    );
    sponsorName = sponsorBiz?.business_name ?? null;
  }

  /* ── Breadcrumbs ── */
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Stories", href: "/city-watch" },
    ...(neighborhood
      ? [
          {
            label: neighborhood.name,
            href: `/neighborhoods/${neighborhood.slug}`,
          },
        ]
      : category
        ? [
            {
              label: category.name,
              href: `/city-watch?category=${category.slug}`,
            },
          ]
        : []),
    { label: post.title },
  ];

  /* ── Read time ── */
  const readTime = estimateReadTime(post);

  /* ── Article body ── */
  // Prefer content_md (render as markdown). Fallback to content_html (render as HTML).
  const useMarkdown = !!post.content_md;
  const articleContent = post.content_md || post.content_html || "";

  /* ── JSON-LD Article schema ── */
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.featured_image_url || undefined,
    datePublished: post.published_at || undefined,
    author: author
      ? { "@type": "Person", name: author.name }
      : { "@type": "Organization", name: "ATL Vibes & Views" },
    publisher: {
      "@type": "Organization",
      name: "ATL Vibes & Views",
      url: "https://atlvibesandviews.com",
    },
    description: post.meta_description || post.excerpt || undefined,
  };

  return (
    <>
      {/* JSON-LD Article schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* ========== 1. HERO IMAGE ========== */}
      <div className="relative w-full h-[360px] md:h-[480px] overflow-hidden">
        <Image
          src={post.featured_image_url || PH_HERO}
          alt={post.title}
          fill
          unoptimized
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* ========== MAIN CONTENT AREA ========== */}
      <div className="site-container py-8 md:py-12">
        {/* ========== 2. BREADCRUMBS ========== */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* ========== TWO-COLUMN LAYOUT ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- ARTICLE COLUMN ---------- */}
          <article className="min-w-0">
            {/* 3. Category eyebrow */}
            {category && (
              <Link
                href={`/city-watch?category=${category.slug}`}
                className="inline-block text-[#c1121f] text-[10px] font-semibold uppercase tracking-eyebrow mb-3 hover:text-black transition-colors"
              >
                {category.name}
              </Link>
            )}

            {/* 4. Title */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-[44px] font-bold leading-tight text-black mb-5">
              {post.title}
            </h1>

            {/* 5. Author / Date / Read time */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-mid mb-6">
              {author && (
                <span>
                  By{" "}
                  <Link
                    href={`/authors/${author.slug}`}
                    className="text-black font-medium hover:text-[#c1121f] transition-colors"
                  >
                    {author.name}
                  </Link>
                </span>
              )}
              {post.published_at && <span>{formatDate(post.published_at)}</span>}
              <span>{readTime} min read</span>
            </div>

            {/* 6. Sponsored badge */}
            {post.is_sponsored && (
              <div className="inline-block px-3 py-1.5 bg-gold-light text-black text-[10px] font-semibold uppercase tracking-eyebrow mb-6">
                {sponsorName
                  ? `Presented by ${sponsorName}`
                  : "Sponsored Content"}
              </div>
            )}

            {/* 7. Article body */}
            {useMarkdown ? (
              <MarkdownArticle content={articleContent} />
            ) : (
              <div
                className="article-body max-w-none"
                dangerouslySetInnerHTML={{ __html: articleContent }}
              />
            )}

            {/* 8. Source attribution — only show if source_url is valid */}
            {post.source_url && (() => {
              try {
                const domain = new URL(post.source_url).hostname.replace(/^www\./, "");
                return (
                  <p className="text-sm text-gray-mid mt-8">
                    Source:{" "}
                    <a
                      href={post.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#c1121f] underline hover:text-black transition-colors"
                    >
                      {domain}
                    </a>
                  </p>
                );
              } catch {
                return null;
              }
            })()}

            {/* 9. Featured image credit */}
            {post.featured_image_credit && (
              <p className="text-xs text-gray-mid mt-4">
                Image: {post.featured_image_credit}
                {post.featured_image_source &&
                  ` / ${post.featured_image_source}`}
              </p>
            )}

            {/* 10. "Explore the Neighborhood" callout */}
            {neighborhood && (
              <div className="border-l-4 border-[#c1121f] bg-[#f8f5f0] px-6 py-5 mt-10">
                <p className="font-display text-lg font-semibold text-black mb-1">
                  Explore{" "}
                  <Link
                    href={`/neighborhoods/${neighborhood.slug}`}
                    className="text-[#c1121f] hover:text-black transition-colors underline"
                  >
                    {neighborhood.name}
                  </Link>
                </p>
                {area && (
                  <p className="text-sm text-gray-mid">
                    Part of{" "}
                    <Link
                      href={`/areas/${area.slug}`}
                      className="hover:text-black transition-colors underline"
                    >
                      {area.name}
                    </Link>
                  </p>
                )}
              </div>
            )}

            {/* 11. Related Stories grid */}
            {relatedPosts.length > 0 && (
              <section className="mt-16">
                <SectionHeader
                  eyebrow="More Stories"
                  title={
                    neighborhood
                      ? `More from ${neighborhood.name}`
                      : category
                        ? `Related in ${category.name}`
                        : "Related Stories"
                  }
                  action={{ label: "See All", href: "/city-watch" }}
                  className="mb-10"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {relatedPosts.map((rp) => (
                    <RelatedStoryCard key={rp.slug} post={rp} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* ---------- SIDEBAR ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              {sidebarVariant === "news" && (
                <NewsSidebar
                  neighborhoodName={neighborhood?.name ?? null}
                  areaName={area?.name ?? null}
                  nearbyNeighborhoods={nearbyNeighborhoods}
                />
              )}
              {sidebarVariant === "guide" && (
                <GuideSidebar
                  neighborhood={neighborhood ?? null}
                  area={area ?? null}
                  mentionedBusinesses={mentionedBusinesses}
                />
              )}
              {sidebarVariant === "directory" && (
                <DirectorySidebar
                  neighborhoodName={neighborhood?.name ?? null}
                  neighborhoodSlug={neighborhood?.slug ?? null}
                  nearbyBusinesses={nearbyBusinesses}
                  nearbyEvents={nearbyEvents}
                />
              )}
            </Sidebar>
          </aside>
        </div>
      </div>

      {/* ========== 12. NEWSLETTER SECTION ========== */}
      <NewsletterBlock
        heading="Atlanta in Your Inbox"
        description="Get the latest on Atlanta's neighborhoods, events, and culture delivered to your inbox. No spam. Unsubscribe anytime."
      />
    </>
  );
}

/* ============================================================
   SIDEBAR VARIANT COMPONENTS
   ============================================================ */

/* --- NEWS SIDEBAR --- */
function NewsSidebar({
  neighborhoodName,
  areaName,
  nearbyNeighborhoods,
}: {
  neighborhoodName: string | null;
  areaName: string | null;
  nearbyNeighborhoods: { name: string; slug: string }[];
}) {
  return (
    <>
      <NewsletterWidget
        title={neighborhoodName ? `${neighborhoodName} Updates` : "Stay in the Loop"}
      />
      <AdPlacement slot="sidebar_top" />
      {nearbyNeighborhoods.length > 0 && (
        <NeighborhoodsWidget
          title={areaName ? `Nearby in ${areaName}` : "Nearby Neighborhoods"}
          neighborhoods={nearbyNeighborhoods}
        />
      )}
      <SubmitCTA
        heading="Have a Story Tip?"
        description="Know something happening in Atlanta? We want to hear from you."
        buttonText="Contact Us"
        href="/contact"
      />
    </>
  );
}

/* --- GUIDE SIDEBAR --- */
function GuideSidebar({
  neighborhood,
  area,
  mentionedBusinesses,
}: {
  neighborhood: { name: string; slug: string; description?: string } | null;
  area: { name: string; slug: string } | null;
  mentionedBusinesses: Awaited<ReturnType<typeof getBusinessesByPostId>>;
}) {
  return (
    <>
      {/* Neighborhood Snapshot */}
      {neighborhood && (
        <SidebarWidget className="bg-[#f8f5f0] border-none">
          <WidgetTitle>About {neighborhood.name}</WidgetTitle>
          {neighborhood.description && (
            <p className="text-sm text-gray-dark mb-3 line-clamp-3">
              {neighborhood.description}
            </p>
          )}
          <Link
            href={`/neighborhoods/${neighborhood.slug}`}
            className="inline-block text-xs font-semibold uppercase tracking-eyebrow text-[#c1121f] hover:text-black transition-colors"
          >
            View Neighborhood →
          </Link>
          {area && (
            <p className="text-xs text-gray-mid mt-2">
              Part of{" "}
              <Link
                href={`/areas/${area.slug}`}
                className="hover:text-black transition-colors underline"
              >
                {area.name}
              </Link>
            </p>
          )}
        </SidebarWidget>
      )}

      {/* Mentioned businesses */}
      {mentionedBusinesses.length > 0 && (
        <SidebarWidget>
          <WidgetTitle className="text-[#c1121f]">
            Places Mentioned
          </WidgetTitle>
          <div className="space-y-0 divide-y divide-gray-100">
            {mentionedBusinesses.map((biz) => (
              <Link
                key={biz.id}
                href={`/places/${biz.slug}`}
                className="group flex gap-3 items-center py-3 first:pt-0 last:pb-0"
              >
                <div className="relative w-14 h-12 shrink-0 overflow-hidden bg-gray-100">
                  <Image
                    src={biz.logo || PH_BIZ}
                    alt={biz.business_name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-sm font-semibold text-black group-hover:text-red-brand transition-colors leading-tight truncate">
                    {biz.business_name}
                  </h4>
                  {biz.categories?.name && (
                    <span className="text-[10px] text-gray-mid">
                      {biz.categories.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </SidebarWidget>
      )}

      <NewsletterWidget />
      <AdPlacement slot="sidebar_top" />
      <SubmitCTA />
    </>
  );
}

/* --- DIRECTORY SIDEBAR --- */
function DirectorySidebar({
  neighborhoodName,
  neighborhoodSlug,
  nearbyBusinesses,
  nearbyEvents,
}: {
  neighborhoodName: string | null;
  neighborhoodSlug: string | null;
  nearbyBusinesses: Awaited<ReturnType<typeof getBusinesses>>;
  nearbyEvents: Awaited<ReturnType<typeof getEvents>>;
}) {
  return (
    <>
      {/* Businesses in Neighborhood */}
      {nearbyBusinesses.length > 0 && neighborhoodName && (
        <SidebarWidget>
          <WidgetTitle className="text-[#c1121f]">
            Places in {neighborhoodName}
          </WidgetTitle>
          <div className="space-y-0 divide-y divide-gray-100">
            {nearbyBusinesses.map((biz) => (
              <Link
                key={biz.id}
                href={`/places/${biz.slug}`}
                className="group flex gap-3 items-center py-3 first:pt-0 last:pb-0"
              >
                <div className="relative w-14 h-12 shrink-0 overflow-hidden bg-gray-100">
                  <Image
                    src={biz.logo || PH_BIZ}
                    alt={biz.business_name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-sm font-semibold text-black group-hover:text-red-brand transition-colors leading-tight truncate">
                    {biz.business_name}
                  </h4>
                  {biz.categories?.name && (
                    <span className="text-[10px] text-gray-mid">
                      {biz.categories.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {neighborhoodSlug && (
            <Link
              href={`/neighborhoods/${neighborhoodSlug}`}
              className="inline-block mt-4 text-xs font-semibold uppercase tracking-eyebrow text-[#c1121f] hover:text-black transition-colors"
            >
              View All →
            </Link>
          )}
        </SidebarWidget>
      )}

      {/* Upcoming Events */}
      {nearbyEvents.length > 0 && neighborhoodName && (
        <SidebarWidget>
          <WidgetTitle className="text-[#c1121f]">
            Upcoming in {neighborhoodName}
          </WidgetTitle>
          <div className="space-y-0 divide-y divide-gray-100">
            {nearbyEvents.map((event) => (
              <EventCard
                key={event.id}
                name={event.title}
                slug={event.slug}
                startDate={event.start_date}
                time={event.start_time ?? undefined}
                variant="list"
              />
            ))}
          </div>
          <Link
            href="/hub/events"
            className="inline-block mt-4 text-xs font-semibold uppercase tracking-eyebrow text-[#c1121f] hover:text-black transition-colors"
          >
            View All Events →
          </Link>
        </SidebarWidget>
      )}

      <SubmitCTA
        heading="Have a Business?"
        description="Get your business in front of thousands of Atlantans."
        buttonText="Get Listed"
        href="/submit"
      />
      <SubmitEventCTA />
      <AdPlacement slot="sidebar_mid" />
    </>
  );
}
