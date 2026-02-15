import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { MediaAddClient } from "./MediaAddClient";

export const metadata: Metadata = {
  title: "Add Media | Admin CMS | ATL Vibes & Views",
  description: "Add a new media item.",
  robots: { index: false, follow: false },
};

export default async function MediaAddPage() {
  const supabase = createServerClient();

  const { data: neighborhoods } = (await supabase
    .from("neighborhoods")
    .select("id, name")
    .eq("is_active", true)
    .order("name")) as { data: { id: string; name: string }[] | null };

  return <MediaAddClient neighborhoods={neighborhoods ?? []} />;
}
