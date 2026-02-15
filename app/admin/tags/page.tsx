import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { TagsClient } from "./TagsClient";

export const metadata: Metadata = {
  title: "Tags | Admin CMS | ATL Vibes & Views",
  description: "Manage content tags.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const supabase = createServerClient();

  const { data: tags, error } = (await supabase
    .from("tags")
    .select("id, name, slug, description, is_active, created_at")
    .order("name", { ascending: true })
  ) as {
    data: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      is_active: boolean | null;
      created_at: string;
    }[] | null;
    error: unknown;
  };
  if (error) console.error("Failed to fetch tags:", error);

  // Fetch usage counts from join tables
  const { data: postTags } = (await supabase
    .from("post_tags")
    .select("tag_id")
  ) as { data: { tag_id: string }[] | null };

  const { data: bizTags } = (await supabase
    .from("business_tags")
    .select("tag_id")
  ) as { data: { tag_id: string }[] | null };

  const { data: eventTags } = (await supabase
    .from("event_tags")
    .select("tag_id")
  ) as { data: { tag_id: string }[] | null };

  const usageMap: Record<string, number> = {};
  [postTags, bizTags, eventTags].forEach((list) => {
    (list ?? []).forEach((row) => {
      usageMap[row.tag_id] = (usageMap[row.tag_id] ?? 0) + 1;
    });
  });

  return <TagsClient tags={tags ?? []} usageMap={usageMap} />;
}
