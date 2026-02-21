import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { PublishingClient } from "./PublishingClient";

export const metadata: Metadata = {
  title: "Publishing Queue | Admin CMS | ATL Vibes & Views",
  description: "Blog posts ready for publishing — attach media, preview, publish.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function PublishingPage() {
  const supabase = createServiceRoleClient();

  // Blog posts in draft or ready_for_review — the publishing queue is where drafts get media + published
  const { data: posts, error: postsErr } = (await supabase
    .from("blog_posts")
    .select("*, categories(name)")
    .in("status", ["draft", "ready_for_review"])
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      title: string;
      slug: string;
      status: string;
      type: string | null;
      content_source: string | null;
      category_id: string | null;
      featured_image_url: string | null;
      published_at: string | null;
      created_at: string;
      categories: { name: string } | null;
    }[] | null;
    error: unknown;
  };
  if (postsErr) console.error("Failed to fetch publishing posts:", postsErr);

  return (
    <PublishingClient
      posts={posts ?? []}
    />
  );
}
