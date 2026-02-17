import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { SocialClient } from "./SocialClient";

export const metadata: Metadata = {
  title: "Social Queue | Admin CMS | ATL Vibes & Views",
  description: "Approved scripts and social-tier stories ready for distribution.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function SocialPage() {
  const supabase = createServiceRoleClient();

  // Approved scripts ready for social distribution
  const { data: scripts, error: scriptsErr } = (await supabase
    .from("scripts")
    .select("*, script_batches(batch_name), stories(headline, tier)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      title: string;
      story_id: string | null;
      status: string;
      platform: string | null;
      format: string | null;
      media_url: string | null;
      thumbnail_url: string | null;
      scheduled_date: string | null;
      created_at: string;
      script_batches: { batch_name: string | null } | null;
      stories: { headline: string; tier: string | null } | null;
    }[] | null;
    error: unknown;
  };
  if (scriptsErr) console.error("Failed to fetch social scripts:", scriptsErr);

  // Social-tier stories (assigned_social only)
  const { data: socialStories, error: storiesErr } = (await supabase
    .from("stories")
    .select("*, categories(name)")
    .eq("status", "assigned_social")
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      headline: string;
      source_name: string | null;
      status: string;
      score: number | null;
      tier: string | null;
      category_id: string | null;
      created_at: string;
      categories: { name: string } | null;
    }[] | null;
    error: unknown;
  };
  if (storiesErr) console.error("Failed to fetch social stories:", storiesErr);

  // Fetch caption script rows for preview (non-reel scripts linked to same stories)
  const storyIds = (scripts ?? []).map(s => s.story_id).filter(Boolean) as string[];
  let captionPreviews: { story_id: string; platform: string; caption: string | null }[] = [];
  if (storyIds.length > 0) {
    const { data: caps } = (await supabase
      .from("scripts")
      .select("story_id, platform, caption")
      .neq("platform", "reel")
      .in("story_id", storyIds)) as {
      data: { story_id: string; platform: string; caption: string | null }[] | null;
    };
    captionPreviews = caps ?? [];
  }

  return (
    <SocialClient
      scripts={scripts ?? []}
      socialStories={socialStories ?? []}
      captionPreviews={captionPreviews}
    />
  );
}
