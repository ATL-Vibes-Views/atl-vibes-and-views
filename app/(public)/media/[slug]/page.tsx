import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Headphones, Share2, Bookmark } from "lucide-react";
import {
  getMediaItemBySlug,
  getMediaItems,
  getMediaItemLinks,
} from "@/lib/queries";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { extractYouTubeId } from "@/lib/media-utils";
import { InstagramFeed } from "@/components/ui/InstagramFeed";
import {
  NewsletterWidget,
  NeighborhoodsWidget,
  SubmitCTA,
} from "@/components/Sidebar";
import ServerAdPlacement from "@/components/ads/AdPlacement";

/* ============================================================
   /media/[slug] — Media Detail Page
   Video feature / podcast episode with show notes + sidebar
   ============================================================ */

/* --- Metadata --- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getMediaItemBySlug(slug);
  if (!item) return { title: "Not Found" };

  const title = item.seo_title || `${item.title} | ATL Vibes & Views`;
  const description =
    item.meta_description || item.excerpt || item.description || "";

  return {
    title,
    description,
    openGraph: { title, description, type: "video.other" },
    alternates: { canonical: `https://atlvibesandviews.com/media/${slug}` },
  };
}

/* --- Helpers --- */

const PH_VIDEO = "https://placehold.co/640x360/1a1a1a/e6c46d?text=Video";
const PH_PODCAST = "https://placehold.co/640x360/1a1a1a/e6c46d?text=Podcast";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getThumbnailFromUrl(url: string | null, type: string): string {
  if (url) {
    const ytId = extractYouTubeId(url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return type === "podcast" ? PH_PODCAST : PH_VIDEO;
}

/* --- Page --- */

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const item = await getMediaItemBySlug(slug);
  if (!item) notFound();

  /* Parallel data fetches */
  const [links, related] = await Promise.all([
    getMediaItemLinks(item.id),
    getMediaItems({
      mediaType: item.media_type,
      excludeId: item.id,
      limit: 4,
    }).catch(() => []),
  ]);

  const videoId = item.embed_url ? extractYouTubeId(item.embed_url) : null;

  /* Next item for end-screen */
  const nextItem = related[0]
    ? {
        title: related[0].title,
        slug: related[0].slug,
        thumbnailUrl: getThumbnailFromUrl(
          related[0].embed_url,
          related[0].media_type
        ),
      }
    : undefined;

  /* JSON-LD */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": item.media_type === "podcast" ? "PodcastEpisode" : "VideoObject",
    name: item.title,
    description: item.excerpt || item.description || "",
    datePublished: item.published_at,
    url: `https://atlvibesandviews.com/media/${slug}`,
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

      {/* ========== EMBED / PLAYER ========== */}
      <section className="bg-black">
        <div className="max-w-[1280px] mx-auto">
          {videoId ? (
            <YouTubeEmbed
              videoId={videoId}
              title={item.title}
              aspectRatio={
                item.media_type === "short" ? "9/16" : "16/9"
              }
              nextItem={nextItem}
              relatedItems={related.slice(1, 4).map((r) => ({
                title: r.title,
                slug: r.slug,
                thumbnailUrl: getThumbnailFromUrl(r.embed_url, r.media_type),
              }))}
            />
          ) : item.embed_url ? (
            /* Fallback iframe for non-YouTube embeds */
            <div className="relative aspect-video">
              <iframe
                src={item.embed_url}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          ) : (
            /* No embed — show placeholder */
            <div className="relative aspect-video bg-[#1a1a1a] flex items-center justify-center">
              {item.media_type === "podcast" ? (
                <Headphones size={64} className="text-[#e6c46d]" />
              ) : (
                <Play size={64} className="text-[#e6c46d]" />
              )}
            </div>
          )}
        </div>
      </section>

      {/* ========== BREADCRUMBS ========== */}
      <nav className="site-container pt-6 pb-2">
        <ol className="flex items-center gap-1.5 text-xs text-gray-mid">
          <li>
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/media" className="hover:text-black transition-colors">
              Media
            </Link>
          </li>
          <li>/</li>
          <li className="text-black font-medium truncate max-w-[200px]">
            {item.title}
          </li>
        </ol>
      </nav>

      {/* ========== TWO-COLUMN LAYOUT ========== */}
      <div className="site-container grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16 pb-16 md:pb-20">
        {/* ── MAIN COLUMN ── */}
        <main className="min-w-0">
          {/* Header */}
          <div className="pt-4 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#1a1a1a] text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                {item.media_type}
              </span>
              {item.is_featured && (
                <span className="bg-[#fee198] text-[#1a1a1a] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                  Featured
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-semibold text-black leading-[1.1] mb-3">
              {item.title}
            </h1>

            {item.excerpt && (
              <p className="text-gray-mid text-base leading-relaxed mb-4">
                {item.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-mid">
                {item.published_at && (
                  <time dateTime={item.published_at}>
                    {formatDate(item.published_at)}
                  </time>
                )}
              </div>

              {/* Share / Save */}
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-1.5 text-xs text-gray-mid hover:text-black transition-colors"
                  aria-label="Share"
                >
                  <Share2 size={14} />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs text-gray-mid hover:text-black transition-colors"
                  aria-label="Save"
                >
                  <Bookmark size={14} />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>
            </div>
          </div>

          {/* Show Notes / Description */}
          {item.description && (
            <div className="py-8 border-b border-gray-100">
              <h2 className="font-display text-xl font-semibold text-black mb-4">
                {item.media_type === "podcast" ? "Show Notes" : "About This Video"}
              </h2>
              <div className="article-body text-gray-dark text-sm leading-relaxed whitespace-pre-line">
                {item.description}
              </div>
            </div>
          )}

          {/* Featured in This Episode — from media_item_links */}
          {links.length > 0 && (
            <div className="py-8 border-b border-gray-100">
              <h2 className="font-display text-xl font-semibold text-black mb-4">
                Featured in This Episode
              </h2>
              <div className="space-y-3">
                {links.map((link) => {
                  let href = "#";
                  let label = link.target_type;
                  if (link.target_type === "business") {
                    href = `/places/${link.target_id}`;
                    label = "Business";
                  } else if (link.target_type === "neighborhood") {
                    href = `/neighborhoods/${link.target_id}`;
                    label = "Neighborhood";
                  } else if (link.target_type === "event") {
                    href = `/events/${link.target_id}`;
                    label = "Event";
                  } else if (link.target_type === "homepage") {
                    href = "/";
                    label = "Homepage Feature";
                  }

                  return (
                    <Link
                      key={link.id}
                      href={href}
                      className="flex items-center gap-3 p-3 border border-gray-100 hover:border-[#e6c46d] transition-colors group"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#c1121f]">
                        {label}
                      </span>
                      <ArrowRight
                        size={12}
                        className="ml-auto text-gray-mid group-hover:text-[#c1121f] transition-colors"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Media */}
          {related.length > 0 && (
            <div className="pt-8">
              <div className="flex items-end justify-between mb-6">
                <h2 className="font-display text-xl font-semibold text-black">
                  More{" "}
                  {item.media_type === "podcast" ? "Episodes" : "Videos"}
                </h2>
                <Link
                  href={`/media?tab=${item.media_type === "podcast" ? "podcast" : "video"}`}
                  className="text-xs font-semibold uppercase tracking-eyebrow text-[#c1121f] hover:text-black transition-colors"
                >
                  See All →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/media/${r.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-100 mb-2">
                      <Image
                        src={getThumbnailFromUrl(r.embed_url, r.media_type)}
                        alt={r.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 bg-black/60 flex items-center justify-center">
                          <Play
                            size={16}
                            className="text-white ml-0.5"
                            fill="white"
                          />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-display text-sm font-semibold text-black leading-snug line-clamp-2 group-hover:text-[#c1121f] transition-colors">
                      {r.title}
                    </h3>
                    {r.published_at && (
                      <span className="text-xs text-gray-mid mt-1 block">
                        {formatDate(r.published_at)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ── SIDEBAR ── */}
        <aside className="space-y-8" role="complementary">
          <NewsletterWidget />
          <ServerAdPlacement placementKey="MEDIA_DETAIL_SIDEBAR_01" variant="sidebar" />
          <NeighborhoodsWidget
            neighborhoods={[
              { name: "Virginia-Highland", slug: "virginia-highland" },
              { name: "Inman Park", slug: "inman-park" },
              { name: "Old Fourth Ward", slug: "old-fourth-ward" },
              { name: "Grant Park", slug: "grant-park" },
              { name: "Decatur", slug: "decatur" },
            ]}
          />
          <SubmitCTA />
          <InstagramFeed variant="sidebar" />
        </aside>
      </div>

      {/* ========== BREADCRUMB SCHEMA ========== */}
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
              { "@type": "ListItem", position: 3, name: item.title },
            ],
          }),
        }}
      />
    </>
  );
}
