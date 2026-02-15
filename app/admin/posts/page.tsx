import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { PostsClient } from "./PostsClient";

export const metadata: Metadata = {
  title: "Blog Posts | Admin CMS | ATL Vibes & Views",
  description: "Manage published and scheduled blog posts.",
  robots: { index: false, follow: false },
};

export default async function PostsPage() {
  const supabase = createServerClient();

  // Exclude drafts — they enter via the publishing queue
  const { data: posts, error: postsErr } = (await supabase
    .from("blog_posts")
    .select("*, categories(name), neighborhoods(name)")
    .neq("status", "draft")
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      title: string;
      slug: string;
      status: string;
      type: string | null;
      content_type: string | null;
      category_id: string | null;
      neighborhood_id: string | null;
      word_count: number | null;
      featured_image_url: string | null;
      published_at: string | null;
      created_at: string;
      categories: { name: string } | null;
      neighborhoods: { name: string } | null;
    }[] | null;
    error: unknown;
  };
  if (postsErr) console.error("Failed to fetch blog posts:", postsErr);

  const { data: categories } = (await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order")) as { data: { id: string; name: string }[] | null };

  return (
    <PostsClient
      posts={posts ?? []}
      categories={categories ?? []}
    />
  );
}
