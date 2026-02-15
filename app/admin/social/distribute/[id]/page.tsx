import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { DistributeClient } from "./DistributeClient";

export const metadata: Metadata = {
  title: "Distribute | Social Queue | Admin CMS | ATL Vibes & Views",
  description: "Distribute content to social platforms.",
  robots: { index: false, follow: false },
};

export default async function DistributePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerClient();

  // Fetch the filming script
  const { data: script, error: scriptErr } = (await supabase
    .from("scripts")
    .select("*, script_batches(batch_name), stories(headline, tier, source_name)")
    .eq("id", id)
    .single()) as {
    data: {
      id: string;
      title: string;
      script_text: string | null;
      script_batch_id: string | null;
      story_id: string | null;
      platform: string;
      format: string;
      status: string;
      hashtags: string | null;
      call_to_action: string | null;
      scheduled_date: string | null;
      created_at: string;
      script_batches: { batch_name: string | null } | null;
      stories: { headline: string; tier: number | null; source_name: string | null } | null;
    } | null;
    error: unknown;
  };
  if (scriptErr) console.error("Failed to fetch script:", scriptErr);

  // Fetch captions: all rows for this story_id where platform != 'reel'
  let captions: {
    id: string;
    story_id: string | null;
    platform: string;
    caption: string | null;
    description: string | null;
    tags: string | null;
    hashtags: string | null;
    status: string;
  }[] = [];

  if (script?.story_id) {
    const { data: captionData, error: captionErr } = (await supabase
      .from("scripts")
      .select("id, story_id, platform, caption, description, tags, hashtags, status")
      .eq("story_id", script.story_id)
      .neq("platform", "reel")
      .order("platform")) as {
      data: {
        id: string;
        story_id: string | null;
        platform: string;
        caption: string | null;
        description: string | null;
        tags: string | null;
        hashtags: string | null;
        status: string;
      }[] | null;
      error: unknown;
    };
    if (captionErr) console.error("Failed to fetch captions:", captionErr);
    captions = captionData ?? [];
  }

  return (
    <DistributeClient
      script={script}
      captions={captions}
    />
  );
}
