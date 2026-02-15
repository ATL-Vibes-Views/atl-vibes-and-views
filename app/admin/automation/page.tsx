import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { AutomationClient } from "./AutomationClient";

export const metadata: Metadata = {
  title: "Automation | Admin CMS | ATL Vibes & Views",
  description: "Automation status and pipeline health.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AutomationPage() {
  const supabase = createServerClient();

  // Pipeline stats
  const counts = (await Promise.all([
    supabase.from("stories").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("stories").select("*", { count: "exact", head: true }).eq("status", "scored"),
    supabase.from("stories").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("stories").select("*", { count: "exact", head: true }).eq("status", "used"),
    supabase.from("scripts").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("scripts").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("script_batches").select("*", { count: "exact", head: true }),
    supabase.from("content_calendar").select("*", { count: "exact", head: true }),
  ])) as unknown as { count: number | null }[];

  // Recent script batches
  const { data: batches } = (await supabase
    .from("script_batches")
    .select("id, week_of, batch_name, status, notes, created_at")
    .order("week_of", { ascending: false })
    .limit(10)
  ) as {
    data: {
      id: string;
      week_of: string;
      batch_name: string | null;
      status: string;
      notes: string | null;
      created_at: string;
    }[] | null;
  };

  // Recent stories for pipeline view
  const { data: recentStories } = (await supabase
    .from("stories")
    .select("id, headline, status, score, tier, created_at")
    .order("created_at", { ascending: false })
    .limit(15)
  ) as {
    data: {
      id: string;
      headline: string;
      status: string;
      score: number | null;
      tier: string | null;
      created_at: string;
    }[] | null;
  };

  return (
    <AutomationClient
      stats={{
        newStories: counts[0].count ?? 0,
        scoredStories: counts[1].count ?? 0,
        inProgressStories: counts[2].count ?? 0,
        usedStories: counts[3].count ?? 0,
        draftScripts: counts[4].count ?? 0,
        approvedScripts: counts[5].count ?? 0,
        totalBatches: counts[6].count ?? 0,
        calendarEntries: counts[7].count ?? 0,
      }}
      batches={batches ?? []}
      recentStories={recentStories ?? []}
    />
  );
}
