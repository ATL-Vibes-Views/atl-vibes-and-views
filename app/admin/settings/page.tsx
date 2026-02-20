import { Metadata } from "next";
import { SettingsClient } from "./SettingsClient";
import { createServiceRoleClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Settings | Admin CMS | ATL Vibes & Views",
  description: "Site configuration and integrations.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sb = createServiceRoleClient();
  const { data: settings } = await sb
    .from("site_settings")
    .select("*")
    .order("group_name")
    .order("key") as { data: Record<string, unknown>[] | null };

  return <SettingsClient initialSettings={settings ?? []} />;
}
