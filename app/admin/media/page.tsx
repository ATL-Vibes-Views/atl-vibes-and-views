import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { MediaClient } from "./MediaClient";

export const metadata: Metadata = {
  title: "Media | Admin CMS | ATL Vibes & Views",
  description: "Manage media items — videos, images, and audio.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const supabase = createServiceRoleClient();

  const { data: media, error: mediaErr } = (await supabase
    .from("media_items")
    .select("*")
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      title: string;
      slug: string;
      media_type: string;
      source_type: string;
      embed_url: string | null;
      thumbnail_url: string | null;
      status: string;
      is_featured: boolean;
      published_at: string | null;
      created_at: string;
    }[] | null;
    error: unknown;
  };
  if (mediaErr) console.error("Failed to fetch media items:", mediaErr);

  return <MediaClient media={media ?? []} />;
}
