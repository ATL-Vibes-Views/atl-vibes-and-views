import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { EventDetailClient } from "./EventDetailClient";

export const metadata: Metadata = {
  title: "Event Detail | Admin | ATL Vibes & Views",
  description: "Edit event details.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerClient();
  const isNew = id === "new";

  let event = null;
  if (!isNew) {
    const { data, error } = (await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()) as { data: Record<string, unknown> | null; error: unknown };
    if (error) console.error("Failed to fetch event:", error);
    event = data;
  }

  // Event images
  const { data: eventImages } = isNew ? { data: null } : (await supabase
    .from("event_images")
    .select("*")
    .eq("event_id", id)
    .order("sort_order")) as { data: { id: string; image_url: string; caption: string | null; alt_text: string | null; sort_order: number; is_primary: boolean }[] | null };

  // Event tags
  const { data: tags } = (await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name")) as { data: { id: string; name: string; slug: string }[] | null };

  let activeTagIds: string[] = [];
  if (!isNew) {
    const { data: et } = (await supabase
      .from("event_tags")
      .select("tag_id")
      .eq("event_id", id)) as { data: { tag_id: string }[] | null };
    activeTagIds = (et ?? []).map((t) => t.tag_id);
  }

  // Related blog posts
  let relatedPosts: { id: string; title: string; status: string; published_at: string | null }[] = [];
  if (!isNew) {
    const { data: pe } = (await supabase
      .from("post_events")
      .select("blog_posts(id, title, status, published_at)")
      .eq("event_id", id)
      .limit(10)) as { data: { blog_posts: { id: string; title: string; status: string; published_at: string | null } | null }[] | null };
    relatedPosts = (pe ?? []).filter((p) => p.blog_posts !== null).map((p) => p.blog_posts!);
  }

  // Lookup data
  const [categoriesRes, neighborhoodsRes, citiesRes, businessesRes] = await Promise.all([
    supabase.from("categories").select("id, name").eq("is_active", true).order("name") as unknown as Promise<{ data: { id: string; name: string }[] | null }>,
    supabase.from("neighborhoods").select("id, name").order("name") as unknown as Promise<{ data: { id: string; name: string }[] | null }>,
    supabase.from("cities").select("id, name").order("name") as unknown as Promise<{ data: { id: string; name: string }[] | null }>,
    supabase.from("business_listings").select("id, business_name").eq("status", "active").order("business_name") as unknown as Promise<{ data: { id: string; business_name: string }[] | null }>,
  ]);

  return (
    <EventDetailClient
      event={event}
      isNew={isNew}
      eventImages={eventImages ?? []}
      tags={tags ?? []}
      activeTagIds={activeTagIds}
      relatedPosts={relatedPosts}
      categories={categoriesRes.data ?? []}
      neighborhoods={neighborhoodsRes.data ?? []}
      cities={citiesRes.data ?? []}
      businesses={(businessesRes.data ?? []).map((b) => ({ value: b.id, label: b.business_name }))}
    />
  );
}
