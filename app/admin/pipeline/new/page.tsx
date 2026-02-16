import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { StoryFormClient } from "./StoryFormClient";

export const metadata: Metadata = {
  title: "Add Story | Admin CMS | ATL Vibes & Views",
  description: "Manually add a story to the pipeline.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const supabase = createServiceRoleClient();

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order") as unknown as Promise<{ data: { id: string; name: string }[] | null }>,
    supabase.from("neighborhoods").select("id, name").eq("is_active", true).order("name") as unknown as Promise<{ data: { id: string; name: string }[] | null }>,
  ]);

  return (
    <StoryFormClient
      categories={categories ?? []}
      neighborhoods={neighborhoods ?? []}
    />
  );
}
