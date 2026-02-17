import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { CalendarClient } from "./CalendarClient";

export const metadata: Metadata = {
  title: "Content Calendar | Admin CMS | ATL Vibes & Views",
  description: "Weekly content calendar for ATL Vibes & Views.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const supabase = createServiceRoleClient();

  // Fetch content_calendar entries with story and post joins
  const { data: entries, error: entriesErr } = (await supabase
    .from("content_calendar")
    .select("*, stories(headline), blog_posts(title, slug)")
    .order("scheduled_date", { ascending: true })) as {
    data: {
      id: string;
      story_id: string | null;
      post_id: string | null;
      tier: string | null;
      scheduled_date: string;
      status: string | null;
      stories: { headline: string } | null;
      blog_posts: { title: string; slug: string | null } | null;
    }[] | null;
    error: unknown;
  };
  if (entriesErr) console.error("Failed to fetch calendar entries:", entriesErr);

  // Fetch scripts with scheduled_date
  const { data: scripts } = (await supabase
    .from("scripts")
    .select("id, title, platform, scheduled_date, status")
    .not("scheduled_date", "is", null)
    .order("scheduled_date", { ascending: true })) as {
    data: {
      id: string;
      title: string;
      platform: string | null;
      scheduled_date: string | null;
      status: string;
    }[] | null;
  };

  // Fetch events for the calendar
  const { data: events } = (await supabase
    .from("events")
    .select("id, title, start_date, status")
    .order("start_date", { ascending: true })) as {
    data: {
      id: string;
      title: string;
      start_date: string | null;
      status: string;
    }[] | null;
  };

  // Fetch newsletters for the calendar
  const { data: newsletters } = (await supabase
    .from("newsletters")
    .select("id, subject, scheduled_send_date, status")
    .not("scheduled_send_date", "is", null)
    .order("scheduled_send_date", { ascending: true })) as {
    data: {
      id: string;
      subject: string;
      scheduled_send_date: string | null;
      status: string;
    }[] | null;
  };

  return (
    <CalendarClient
      entries={entries ?? []}
      scripts={scripts ?? []}
      events={events ?? []}
      newsletters={newsletters ?? []}
    />
  );
}
