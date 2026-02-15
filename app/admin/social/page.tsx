import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { SocialClient } from "./SocialClient";

export const metadata: Metadata = {
  title: "Social Queue | Admin CMS | ATL Vibes & Views",
  description: "Approved scripts and tier-3 stories ready for social distribution.",
  robots: { index: false, follow: false },
};

export default async function SocialPage() {
  const supabase = createServerClient();

  // Approved filming scripts (ready for social distribution)
  const { data: scripts, error: scriptsErr } = (await supabase
    .from("scripts")
    .select("*, script_batches(batch_name), stories(headline, tier)")
    .eq("platform", "reel")
    .eq("format", "talking_head")
    .eq("status", "approved")
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      title: string;
      story_id: string | null;
      status: string;
      scheduled_date: string | null;
      created_at: string;
      script_batches: { batch_name: string | null } | null;
      stories: { headline: string; tier: number | null } | null;
    }[] | null;
    error: unknown;
  };
  if (scriptsErr) console.error("Failed to fetch social scripts:", scriptsErr);

  // Tier-3 scored stories (social-only, no blog post)
  const { data: socialStories, error: storiesErr } = (await supabase
    .from("stories")
    .select("*, categories(name)")
    .eq("tier", 3)
    .eq("status", "scored")
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
  if (storiesErr) console.error("Failed to fetch social stories:", storiesErr);

  return (
    <SocialClient
      scripts={scripts ?? []}
      socialStories={socialStories ?? []}
    />
  );
}
