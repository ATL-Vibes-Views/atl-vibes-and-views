import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { MediaAddClient } from "./MediaAddClient";

export const metadata: Metadata = {
  title: "Add Media | Admin CMS | ATL Vibes & Views",
  description: "Add a new media item.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function MediaAddPage() {
  const supabase = createServiceRoleClient();

  const { data: neighborhoods } = (await supabase
    .from("neighborhoods")
    .select("id, name")
    .eq("is_active", true)
    .order("name")) as { data: { id: string; name: string }[] | null };

  const { data: sponsors } = (await supabase
    .from("sponsors")
    .select("id, sponsor_name")
    .eq("is_active", true)
    .order("sponsor_name")) as { data: { id: string; sponsor_name: string }[] | null };

  return <MediaAddClient neighborhoods={neighborhoods ?? []} sponsors={sponsors ?? []} />;
}
