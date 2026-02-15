import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { BusinessesClient } from "./BusinessesClient";

export const metadata: Metadata = {
  title: "Business Listings | Admin | ATL Vibes & Views",
  description: "Manage business listings in ATL Vibes & Views.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function BusinessesPage() {
  const supabase = createServerClient();

  const { data: businesses, error: bizErr } = (await supabase
    .from("business_listings")
    .select("id, business_name, slug, status, tier, claimed, claim_status, created_at, categories(name), neighborhoods(name)")
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      business_name: string;
      slug: string;
      status: string;
      tier: string;
      claimed: boolean;
      claim_status: string;
      created_at: string;
      categories: { name: string } | null;
      neighborhoods: { name: string } | null;
    }[] | null;
    error: unknown;
  };
  if (bizErr) console.error("Failed to fetch businesses:", bizErr);

  const { data: categories } = (await supabase
    .from("categories")
    .select("id, name")
    .contains("applies_to", ["businesses"])
    .eq("is_active", true)
    .order("name")) as {
    data: { id: string; name: string }[] | null;
  };

  const { data: neighborhoods } = (await supabase
    .from("neighborhoods")
    .select("id, name")
    .order("name")) as {
    data: { id: string; name: string }[] | null;
  };

  return (
    <BusinessesClient
      businesses={businesses ?? []}
      categories={categories ?? []}
      neighborhoods={neighborhoods ?? []}
    />
  );
}
