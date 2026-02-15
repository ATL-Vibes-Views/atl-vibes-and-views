import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { PublishingClient } from "./PublishingClient";

export const metadata: Metadata = {
  title: "Publishing Queue | Admin CMS | ATL Vibes & Views",
  description: "Blog posts ready for publishing — attach media, preview, publish.",
  robots: { index: false, follow: false },
};

export default async function PublishingPage() {
  const supabase = createServerClient();
  const today = new Date().toISOString().split("T")[0];

  // Blog posts in publishing pipeline (approved, scheduled, published)
  const { data: posts, error: postsErr } = (await supabase
    .from("blog_posts")
    .select("*, categories(name), neighborhoods(name)")
    .in("status", ["approved", "scheduled", "published"])
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
      today={today}
    />
  );
}
