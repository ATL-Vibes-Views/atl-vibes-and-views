"use client";

import Link from "next/link";
import type { BusinessState } from "./TierBadge";

interface StoryPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  status: string;
}

interface StoryEntry {
  post_id: string | null;
  blog_posts: StoryPost | null;
}

interface StoriesClientProps {
  state: BusinessState;
  stories: StoryEntry[] | null;
  sponsoredPostIds: string[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StoriesClient({
  state,
  stories,
  sponsoredPostIds,
}: StoriesClientProps) {
  const isSponsor = state === "sponsor";

  // Filter to published posts only
  const published = (stories ?? []).filter(
    (s) => s.blog_posts && s.blog_posts.status === "published"
  );

  return (
    <div>
      {/* Story Cards */}
      {published.length > 0 ? (
        <div>
          {published.map((story) => {
            const post = story.blog_posts!;
            const isSponsored =
              isSponsor && sponsoredPostIds.includes(post.id);

            return (
              <div
                key={post.id}
                className="bg-white border border-[#e5e5e5] p-5 mb-3 flex gap-4"
              >
                {/* Thumbnail */}
                <div className="w-[120px] h-[80px] flex-shrink-0">
                  {post.featured_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#e5e7eb] flex items-center justify-center">
                      <span className="text-[10px] text-[#6b7280]">
                        No Image
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/stories/${post.slug}`}
                    className="text-[14px] font-semibold text-[#1a1a1a] hover:underline"
                  >
                    {post.title}
                  </Link>

                  {post.published_at && (
                    <div className="text-[11px] text-[#9ca3af] mb-1.5">
                      {formatDate(post.published_at)}
                    </div>
                  )}

                  {post.excerpt && (
                    <p className="text-[12px] text-[#6b7280] leading-[1.5] line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <Link
                      href={`/stories/${post.slug}`}
                      className="text-[12px] font-semibold text-[#c1121f] hover:underline"
                    >
                      Read Article &rarr;
                    </Link>
                    {isSponsored && (
                      <span className="inline-flex items-center rounded-full bg-[#fee198] px-2.5 py-0.5 text-[10px] font-semibold text-[#1a1a1a]">
                        Sponsored
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-[14px] text-[#6b7280]">
            No press coverage yet
          </div>
          <div className="text-[12px] text-[#9ca3af] mt-1">
            When your business is featured in our stories, they&rsquo;ll appear
            here.
          </div>
        </div>
      )}

      {/* Upsell CTA — all states except sponsor */}
      {!isSponsor && (
        <div className="bg-[#f5f5f5] text-center px-8 py-12 mt-8">
          <h3 className="font-display text-[22px] font-bold text-[#1a1a1a]">
            Want guaranteed coverage?
          </h3>
          <p className="text-[13px] text-[#6b7280] mt-2 max-w-[480px] mx-auto">
            Our partners get dedicated blog features, video reels, and
            newsletter mentions as part of their sponsorship package.
          </p>
          <Link
            href="/dashboard/sponsorship"
            className="inline-flex items-center justify-center rounded-full bg-[#fee198] px-6 py-2.5 text-[13px] font-semibold text-[#1a1a1a] hover:opacity-90 transition-opacity mt-4"
          >
            Explore Partnership Packages &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
