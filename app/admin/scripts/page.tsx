import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { ScriptsClient } from "./ScriptsClient";

export const metadata: Metadata = {
  title: "Scripts | Admin CMS | ATL Vibes & Views",
  description: "Video scripts and captions from automation — delivered every Friday.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ScriptsPage() {
  const supabase = createServerClient();

  // Filming scripts: platform='reel', format='talking_head'
  const { data: filmingScripts, error: scriptsErr } = (await supabase
    .from("scripts")
    .select("*, script_batches(batch_name), stories(headline)")
    .eq("platform", "reel")
    .eq("format", "talking_head")
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      title: string;
      script_text: string | null;
      script_batch_id: string | null;
      story_id: string | null;
      platform: string;
      format: string;
      status: string;
      scheduled_date: string | null;
      created_at: string;
      script_batches: { batch_name: string | null } | null;
      stories: { headline: string } | null;
    }[] | null;
    error: unknown;
  };
  if (scriptsErr) console.error("Failed to fetch filming scripts:", scriptsErr);

  // All caption rows (platform != 'reel') — grouped client-side by story_id
  const { data: captions, error: captionsErr } = (await supabase
    .from("scripts")
    .select("id, story_id, platform, caption, description, tags, hashtags, status")
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
  if (captionsErr) console.error("Failed to fetch captions:", captionsErr);

  const { data: batches } = (await supabase
    .from("script_batches")
    .select("id, batch_name")
    .order("week_of", { ascending: false })) as {
    data: { id: string; batch_name: string | null }[] | null;
  };

  return (
    <ScriptsClient
      filmingScripts={filmingScripts ?? []}
      captions={captions ?? []}
      batches={(batches ?? []).filter((b) => b.batch_name !== null) as { id: string; batch_name: string }[]}
    />
  );
}
