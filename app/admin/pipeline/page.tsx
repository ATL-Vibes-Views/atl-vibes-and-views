import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { PipelineClient } from "./PipelineClient";

export const metadata: Metadata = {
  title: "Pipeline | Admin CMS | ATL Vibes & Views",
  description: "Story bank — scored stories from RSS intake.",
  robots: { index: false, follow: false },
};

export default async function PipelinePage() {
  const supabase = createServerClient();

  const { data: stories, error: storiesErr } = (await supabase
    .from("stories")
    .select("*, categories(name)")
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      headline: string;
      source_name: string | null;
      status: string;
      score: number | null;
      tier: number | null;
      category_id: string | null;
      created_at: string;
      categories: { name: string } | null;
    }[] | null;
    error: unknown;
  };
  if (storiesErr) console.error("Failed to fetch stories:", storiesErr);

  const { data: categories, error: catErr } = (await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order")) as {
    data: { id: string; name: string }[] | null;
    error: unknown;
  };
  if (catErr) console.error("Failed to fetch categories:", catErr);

  return (
    <PipelineClient
      stories={stories ?? []}
      categories={categories ?? []}
    />
  );
}
