import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { AreaDetailClient } from "./AreaDetailClient";

export const metadata: Metadata = {
  title: "Area Detail | Admin | ATL Vibes & Views",
  description: "Edit area details.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AreaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  const isNew = id === "new";

  let area = null;
  if (!isNew) {
    const { data, error } = (await supabase
      .from("areas")
      .select("*")
      .eq("id", id)
      .single()) as { data: Record<string, unknown> | null; error: unknown };
    if (error) console.error("Failed to fetch area:", error);
    area = data;
  }

  // Neighborhoods in this area
  const { data: neighborhoods } = isNew ? { data: null } : (await supabase
    .from("neighborhoods")
    .select("id, name, slug, is_active")
    .eq("area_id", id)
    .order("name")) as { data: { id: string; name: string; slug: string; is_active: boolean }[] | null };

  // Cities lookup
  const { data: cities } = (await supabase
    .from("cities")
    .select("id, name")
    .order("name")) as { data: { id: string; name: string }[] | null };

  return (
    <AreaDetailClient
      area={area}
      isNew={isNew}
      neighborhoods={neighborhoods ?? []}
      cities={cities ?? []}
    />
  );
}
