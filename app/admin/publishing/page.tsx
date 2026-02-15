import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { PublishingClient } from "./PublishingClient";

export const metadata: Metadata = {
  title: "Publishing Queue | Admin CMS | ATL Vibes & Views",
  description: "Blog posts ready for publishing — attach media, preview, publish.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function PublishingPage() {
  const supabase = createServerClient();

  // Blog posts in draft — the publishing queue is where drafts get media + published
  const { data: posts, error: postsErr } = (await supabase
    .from("blog_posts")
    .select("*, categories(name), neighborhoods(name)")
    .eq("status", "draft")
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
      neighborhoods: { name: string } | null;
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
