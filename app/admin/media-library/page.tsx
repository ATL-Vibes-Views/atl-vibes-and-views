import type { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { MediaLibraryClient } from "./MediaLibraryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media Library | ATL Vibes Admin",
  description: "Manage all uploaded media assets.",
  robots: { index: false, follow: false },
};

export default async function MediaLibraryPage() {
  const supabase = createServiceRoleClient();

  const { data: assets } = await (supabase
    .from("media_assets")
    .select("id, file_url, file_name, file_type, mime_type, file_size, width, height, bucket, folder, title, alt_text, caption, created_at, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(48) as unknown as Promise<{
      data: {
        id: string;
        file_url: string;
        file_name: string;
        file_type: string;
        mime_type: string;
        file_size: number;
        width: number | null;
        height: number | null;
        bucket: string | null;
        folder: string | null;
        title: string | null;
        alt_text: string | null;
        caption: string | null;
        created_at: string;
        is_active: boolean;
      }[] | null;
      error: unknown;
    }>);

  return <MediaLibraryClient initialAssets={assets ?? []} />;
}
