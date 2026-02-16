import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { PostEditClient } from "./PostEditClient";

export const metadata: Metadata = {
  title: "Edit Blog Post | Admin CMS | ATL Vibes & Views",
  description: "Edit a blog post.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: post, error } = (await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single()) as { data: Record<string, unknown> | null; error: unknown };
  if (error) console.error("Failed to fetch post:", error);

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order") as unknown as Promise<{ data: { id: string; name: string }[] | null }>,
    supabase.from("neighborhoods").select("id, name").eq("is_active", true).order("name") as unknown as Promise<{ data: { id: string; name: string }[] | null }>,
  ]);

  return (
    <PostEditClient
      post={post}
      categories={categories ?? []}
      neighborhoods={neighborhoods ?? []}
    />
  );
}
