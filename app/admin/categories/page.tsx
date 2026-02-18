import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { CategoriesClient } from "./CategoriesClient";

export const metadata: Metadata = {
  title: "Categories | Admin CMS | ATL Vibes & Views",
  description: "Manage content categories.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = createServiceRoleClient();

  const { data: categories, error } = (await supabase
    .from("categories")
    .select("id, name, slug, description, applies_to, sort_order, is_active, created_at")
    .order("sort_order", { ascending: true })
  ) as {
    data: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      applies_to: string[];
      sort_order: number;
      is_active: boolean;
      created_at: string;
    }[] | null;
    error: unknown;
  };
  if (error) console.error("Failed to fetch categories:", error);

  // Fetch usage counts
  const { data: postCats } = (await supabase
    .from("blog_posts")
    .select("category_id")
  ) as { data: { category_id: string | null }[] | null };

  const { data: bizCats } = (await supabase
    .from("business_listings")
    .select("category_id")
  ) as { data: { category_id: string | null }[] | null };

  const { data: eventCats } = (await supabase
    .from("events")
    .select("category_id")
  ) as { data: { category_id: string | null }[] | null };

  // Build usage map
  const usageMap: Record<string, number> = {};
  [postCats, bizCats, eventCats].forEach((list) => {
    (list ?? []).forEach((row) => {
      if (row.category_id) {
        usageMap[row.category_id] = (usageMap[row.category_id] ?? 0) + 1;
      }
    });
  });

  return <CategoriesClient categories={categories ?? []} usageMap={usageMap} />;
}
