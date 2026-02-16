import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { BlogPostFormClient } from "./BlogPostFormClient";

export const metadata: Metadata = {
  title: "Add Blog Post | Admin CMS | ATL Vibes & Views",
  description: "Create a new blog post.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const supabase = createServiceRoleClient();

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order") as unknown as Promise<{ data: { id: string; name: string }[] | null }>,
    supabase.from("neighborhoods").select("id, name").eq("is_active", true).order("name") as unknown as Promise<{ data: { id: string; name: string }[] | null }>,
  ]);

  return (
    <BlogPostFormClient
      categories={categories ?? []}
      neighborhoods={neighborhoods ?? []}
    />
  );
}
