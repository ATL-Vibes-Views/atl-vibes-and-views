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

  // Fetch published blog posts directly
  const { data: blogPosts } = (await supabase
    .from("blog_posts")
    .select("id, title, slug, featured_image_url, excerpt, published_at, status")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: true })) as {
    data: {
      id: string;
      title: string;
      slug: string | null;
      featured_image_url: string | null;
      excerpt: string | null;
      published_at: string;
      status: string;
    }[] | null;
  };

  // Fetch posted scripts only
  const { data: scripts } = (await supabase
    .from("scripts")
    .select("id, title, platform, scheduled_date, status, media_url, platform_captions, posted_at")
    .eq("status", "posted")
    .not("posted_at", "is", null)
    .order("posted_at", { ascending: true })) as {
    data: {
      id: string;
      title: string;
      platform: string | null;
      scheduled_date: string | null;
      status: string;
      media_url: string | null;
      platform_captions: Record<string, unknown> | null;
      posted_at: string | null;
    }[] | null;
  };

  // Fetch sent newsletters for the calendar
  const { data: newsletters } = (await supabase
    .from("newsletters")
    .select("id, subject, scheduled_send_date, status")
    .eq("status", "sent")
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
      blogPosts={blogPosts ?? []}
      scripts={scripts ?? []}
      newsletters={newsletters ?? []}
    />
  );
}
