import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { ScriptsClient } from "./ScriptsClient";

export const metadata: Metadata = {
  title: "Scripts | Admin CMS | ATL Vibes & Views",
  description: "Video scripts and captions from automation — delivered every Friday.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ScriptsPage() {
  const supabase = createServiceRoleClient();

  // Filming scripts: draft/pending only — approved scripts go to Social Queue
  // platform_captions JSONB stores per-platform caption data directly on the script row
  const { data: filmingScripts, error: scriptsErr } = (await supabase
    .from("scripts")
    .select("*, script_batches(batch_name), stories(headline)")
    .eq("platform", "reel")
    .eq("format", "talking_head")
    .in("status", ["draft"])
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
      platform_captions: Record<string, unknown> | null;
      scheduled_date: string | null;
      created_at: string;
      script_batches: { batch_name: string | null } | null;
      stories: { headline: string } | null;
    }[] | null;
    error: unknown;
  };
  if (scriptsErr) console.error("Failed to fetch filming scripts:", scriptsErr);

  const { data: batches } = (await supabase
    .from("script_batches")
    .select("id, batch_name")
    .order("week_of", { ascending: false })) as {
    data: { id: string; batch_name: string | null }[] | null;
  };

  // Count filming scripts by status for stat cards
  const { data: statusCounts } = (await supabase
    .from("scripts")
    .select("status")
    .eq("platform", "reel")
    .eq("format", "talking_head")) as {
    data: { status: string }[] | null;
  };

  const counts = {
    pending: (statusCounts ?? []).filter(s => s.status === "draft").length,
    approved: (statusCounts ?? []).filter(s => s.status === "approved").length,
    published: (statusCounts ?? []).filter(s => s.status === "posted" || s.status === "published").length,
  };

  return (
    <ScriptsClient
      filmingScripts={filmingScripts ?? []}
      batches={(batches ?? []).filter((b) => b.batch_name !== null) as { id: string; batch_name: string }[]}
      counts={counts}
    />
  );
}
