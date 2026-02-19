import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { SocialClient } from "./SocialClient";

export const metadata: Metadata = {
  title: "Social Queue | Admin CMS | ATL Vibes & Views",
  description: "Approved scripts ready for social distribution.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function SocialPage() {
  const supabase = createServiceRoleClient();

  // Approved scripts ready for social distribution
  const { data: scripts, error: scriptsErr } = (await supabase
    .from("scripts")
    .select("*, script_batches(batch_name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      title: string;
      story_id: string | null;
      script_batch_id: string | null;
      status: string;
      platform: string | null;
      format: string | null;
      media_url: string | null;
      thumbnail_url: string | null;
      platform_captions: Record<string, unknown> | null;
      scheduled_date: string | null;
      created_at: string;
      updated_at: string;
      script_batches: { batch_name: string | null } | null;
    }[] | null;
    error: unknown;
  };
  if (scriptsErr) console.error("Failed to fetch social scripts:", scriptsErr);

  // Stories for New Reel dropdown
  const { data: stories } = (await supabase
    .from("stories")
    .select("id, headline")
    .order("created_at", { ascending: false })
    .limit(200)) as { data: { id: string; headline: string }[] | null };

  // Active sponsors for New Reel dropdown
  const { data: sponsors } = (await supabase
    .from("sponsors")
    .select("id, sponsor_name")
    .eq("is_active", true)
    .order("sponsor_name")) as { data: { id: string; sponsor_name: string }[] | null };

  return (
    <SocialClient
      scripts={scripts ?? []}
      stories={stories ?? []}
      sponsors={sponsors ?? []}
    />
  );
}
