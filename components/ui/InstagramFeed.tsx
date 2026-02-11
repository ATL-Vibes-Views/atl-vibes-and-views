import Link from "next/link";

/* ============================================================
   InstagramFeed — Placeholder until Instagram Graph API connected
   Two variants: full-width landing section + compact sidebar
   ============================================================ */

interface InstagramPost {
  id: string;
  caption: string | null;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url: string | null;
  permalink: string;
  timestamp: string;
}

interface InstagramFeedProps {
  variant: "full" | "sidebar";
  posts?: InstagramPost[];
  className?: string;
}

const IG_PROFILE = "https://www.instagram.com/atlvibesandviews";

export function InstagramFeed({
  variant,
  posts = [],
  className = "",
}: InstagramFeedProps) {
  /* ── Full-width variant ── */
  if (variant === "full") {
    return (
      <section className={`bg-[#f8f5f0] py-12 ${className}`}>
        <div className="site-container">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-[#c1121f] text-[10px] font-semibold uppercase tracking-eyebrow">
                Follow Along
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-black leading-tight mt-1">
                ATL Vibes &amp; Views on Instagram
              </h2>
            </div>
            <a
              href={IG_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold uppercase tracking-eyebrow text-[#c1121f] hover:text-black transition-colors"
            >
              Follow @atlvibesandviews →
            </a>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {posts.slice(0, 12).map((post) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.media_type === "VIDEO" ? (post.thumbnail_url || post.media_url) : post.media_url}
                    alt={post.caption?.slice(0, 80) || "Instagram post"}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay with caption */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center px-3">
                    <p className="text-white text-xs text-center line-clamp-2">
                      {post.caption || "View on Instagram"}
                    </p>
                  </div>
                  {/* Video play icon */}
                  {post.media_type === "VIDEO" && (
                    <div className="absolute bottom-2 left-2 w-5 h-5 bg-black/70 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                        <polygon points="2,1 9,5 2,9" />
                      </svg>
                    </div>
                  )}
                </a>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-12">
              <p className="text-gray-mid text-sm mb-4">
                Follow us on Instagram for daily Atlanta content.
              </p>
              <a
                href={IG_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-[0.1em] hover:bg-[#f5d87a] transition-colors"
              >
                @atlvibesandviews
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  /* ── Sidebar variant ── */
  return (
    <div className={`border border-gray-100 p-5 ${className}`}>
      <h4 className="font-display text-card-sm font-semibold mb-4 text-[#c1121f]">
        On Instagram
      </h4>

      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            {posts.slice(0, 6).map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden bg-gray-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.media_type === "VIDEO" ? (post.thumbnail_url || post.media_url) : post.media_url}
                  alt={post.caption?.slice(0, 40) || "Instagram post"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <p className="text-white text-[10px] text-center line-clamp-2 px-1">
                    {post.caption || "View"}
                  </p>
                </div>
              </a>
            ))}
          </div>
          <a
            href={IG_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs font-semibold uppercase tracking-eyebrow text-[#c1121f] hover:text-black transition-colors"
          >
            Follow @atlvibesandviews →
          </a>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-mid text-xs mb-3">
            Follow us on Instagram for daily Atlanta content.
          </p>
          <a
            href={IG_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#c1121f] hover:text-black transition-colors"
          >
            @atlvibesandviews →
          </a>
        </div>
      )}
    </div>
  );
}
