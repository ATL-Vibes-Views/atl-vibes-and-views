import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { PackagesClient } from "./PackagesClient";

export const metadata: Metadata = {
  title: "Sponsor Packages | Admin CMS | ATL Vibes & Views",
  description: "Manage sponsor package templates.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PackageTemplate {
  id: string;
  name: string;
  price: number | null;
  price_display: string | null;
  billing_cycle: string | null;
  placements_included: number | null;
  description: string | null;
  features: string | null;
  deliverables: Record<string, unknown>[] | null;
  is_active: boolean;
  created_at: string;
}

export default async function PackagesPage() {
  const supabase = createServerClient();

  // sponsor_packages may not exist yet — use .returns<>() pattern
  const { data: packages, error } = await (supabase
    .from("sponsor_packages" as never)
    .select("*")
    .order("created_at", { ascending: false }) as unknown as Promise<{ data: PackageTemplate[] | null; error: unknown }>);

  if (error) console.error("Failed to fetch sponsor packages:", error);

  // Also fetch sponsors grouped by package_type for usage stats
  const { data: sponsors } = (await supabase
    .from("sponsors")
    .select("id, package_type, status")
  ) as { data: { id: string; package_type: string | null; status: string }[] | null };

  return <PackagesClient packages={packages ?? []} sponsors={sponsors ?? []} />;
}
