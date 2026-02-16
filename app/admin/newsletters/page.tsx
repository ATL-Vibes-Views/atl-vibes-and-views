import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { NewslettersClient } from "./NewslettersClient";

export const metadata: Metadata = {
  title: "Newsletters | Admin CMS | ATL Vibes & Views",
  description: "Manage newsletters and issues.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewslettersPage() {
  const supabase = createServiceRoleClient();

  const { data: newsletters, error } = (await supabase
    .from("newsletters")
    .select("id, name, slug, issue_date, issue_slug, subject_line, status, is_public, open_rate, click_rate, send_count, newsletter_type_id, sponsor_business_id, created_at")
    .order("issue_date", { ascending: false })
  ) as {
    data: {
      id: string;
      name: string;
      slug: string;
      issue_date: string;
      issue_slug: string;
      subject_line: string;
      status: string;
      is_public: boolean | null;
      open_rate: number | null;
      click_rate: number | null;
      send_count: number | null;
      newsletter_type_id: string;
      sponsor_business_id: string | null;
      created_at: string;
    }[] | null;
    error: unknown;
  };
  if (error) console.error("Failed to fetch newsletters:", error);

  // Fetch newsletter types for labeling
  const { data: types } = (await supabase
    .from("newsletter_types")
    .select("id, name, slug, frequency")
    .eq("is_active", true)
    .order("name")
  ) as {
    data: { id: string; name: string; slug: string; frequency: string }[] | null;
  };

  return <NewslettersClient newsletters={newsletters ?? []} types={types ?? []} />;
}
