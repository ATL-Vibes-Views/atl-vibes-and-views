import { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";

export const metadata: Metadata = {
  title: "Press & Stories | Dashboard | ATL Vibes & Views",
  description: "View blog posts and stories that mention your business.",
  robots: { index: false, follow: false },
};

interface StoryMention {
  mention_type: string | null;
  blog_posts: {
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
    published_at: string | null;
  } | null;
}

export default async function StoriesPage() {
  const owner = getMockBusinessOwner();
  const businessId = owner.business_id!;
  const supabase = createServerClient();

  const { data: mentions } = (await supabase
    .from("post_businesses")
    .select("mention_type, blog_posts(title, slug, excerpt, featured_image_url, published_at)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })) as { data: StoryMention[] | null };

  // Filter out entries where blog_posts is null
  const stories = (mentions ?? []).filter((m) => m.blog_posts !== null);

  return (
    <>
      <PortalTopbar title="Press & Stories" />
      <div className="p-8 max-[899px]:pt-16">
        {stories.length > 0 ? (
          <div className="space-y-4">
            {stories.map((story, i) => {
              const post = story.blog_posts!;
              return (
                <div key={i} className="bg-white border border-[#e5e5e5] p-5 flex gap-5">
                  {post.featured_image_url ? (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-[140px] h-[100px] object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-[140px] h-[100px] bg-[#f5f5f5] flex items-center justify-center flex-shrink-0">
                      <Newspaper size={24} className="text-[#d1d5db]" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#c1121f]">
                      {story.mention_type ?? "Mentioned"}
                    </span>

                    <h3 className="font-display text-[18px] font-semibold text-black mt-1 leading-snug">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="text-[13px] font-body text-[#374151] mt-1 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      {post.published_at && (
                        <span className="text-[12px] text-[#6b7280]">
                          {new Date(post.published_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-[13px] font-semibold text-[#c1121f] hover:underline"
                      >
                        Read Full Story &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#e5e5e5] p-12 text-center">
            <Newspaper size={48} className="mx-auto mb-4 text-[#d1d5db]" />
            <h3 className="font-display text-[22px] font-semibold text-black mb-2">
              No press mentions yet
            </h3>
            <p className="text-[14px] font-body text-[#6b7280] max-w-[400px] mx-auto">
              When ATL Vibes &amp; Views features your business in a story, it will appear here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
