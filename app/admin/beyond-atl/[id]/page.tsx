import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { CityDetailClient } from "./CityDetailClient";

export const metadata: Metadata = {
  title: "City Detail | Admin | ATL Vibes & Views",
  description: "Edit Beyond ATL city details.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  const isNew = id === "new";

  let city = null;
  if (!isNew) {
    const { data, error } = (await supabase
      .from("cities")
      .select("*")
      .eq("id", id)
      .single()) as { data: Record<string, unknown> | null; error: unknown };
    if (error) console.error("Failed to fetch city:", error);
    city = data;
  }

  // Businesses in this city
  const { data: businesses } = isNew ? { data: null } : (await supabase
    .from("business_listings")
    .select("id, business_name, status, tier")
    .eq("city_id", id)
    .order("business_name")
    .limit(20)) as { data: { id: string; business_name: string; status: string; tier: string }[] | null };

  // Areas in this city
  const { data: areas } = isNew ? { data: null } : (await supabase
    .from("areas")
    .select("id, name, slug")
    .eq("city_id", id)
    .order("name")) as { data: { id: string; name: string; slug: string }[] | null };

  return (
    <CityDetailClient
      city={city}
      isNew={isNew}
      businesses={businesses ?? []}
      areas={areas ?? []}
    />
  );
}
