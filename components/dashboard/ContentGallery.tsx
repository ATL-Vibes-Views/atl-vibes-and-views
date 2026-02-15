"use client";

import Link from "next/link";

interface Fulfillment {
  id: string;
  deliverable_type: string;
  title: string;
  content_url: string | null;
  delivered_at: string;
  blog_posts: {
    title: string;
    slug: string;
    featured_image_url: string | null;
  } | null;
}

interface ContentGalleryProps {
  fulfillments: Fulfillment[] | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTypeBadge(type: string): { label: string; classes: string } {
  if (type === "blog" || type === "blog_feature") {
    return {
      label: "Blog Feature",
      classes: "bg-[#fee198] text-[#1a1a1a]",
    };
  }
  return {
    label: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " "),
    classes: "bg-[#e5e7eb] text-[#374151]",
  };
}

export function ContentGallery({ fulfillments }: ContentGalleryProps) {
  return (
    <div className="mb-8">
      <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#c1121f]">
        CONTENT
      </div>
      <h3 className="font-display text-[18px] font-bold text-[#1a1a1a] mt-1 mb-4">
        Your Content Gallery
      </h3>

      {!fulfillments || fulfillments.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] p-5 text-center text-[13px] text-[#6b7280]">
          No content delivered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fulfillments.map((item) => {
            const badge = getTypeBadge(item.deliverable_type);
            const imageUrl = item.blog_posts?.featured_image_url;
            const articleSlug = item.blog_posts?.slug;

            return (
              <div
                key={item.id}
                className="bg-white border border-[#e5e5e5]"
              >
                {/* Image placeholder */}
                <div
                  className="w-full bg-[#e5e7eb]"
                  style={{ height: 140 }}
                >
                  {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="text-[13px] font-semibold text-[#1a1a1a]">
                    {item.blog_posts?.title ?? item.title}
                  </div>
                  <div className="text-[11px] text-[#6b7280] mt-1">
                    Delivered {formatDate(item.delivered_at)}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  {articleSlug && (
                    <Link
                      href={`/blog/${articleSlug}`}
                      className="inline-block mt-2 text-[12px] font-semibold text-[#c1121f] hover:underline"
                    >
                      Read Article &rarr;
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
