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

  return <SocialClient scripts={scripts ?? []} />;
}
