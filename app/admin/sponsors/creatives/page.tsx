import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { CreativesClient } from "./CreativesClient";

export const metadata: Metadata = {
  title: "Ad Creatives | Admin CMS | ATL Vibes & Views",
  description: "Browse and manage ad creative assets.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CreativesPage() {
  const supabase = createServerClient();

  // Fetch all creatives with campaign info
  const { data: creatives, error } = (await supabase
    .from("ad_creatives")
    .select("id, campaign_id, creative_type, headline, body, cta_text, target_url, image_url, alt_text, utm_campaign, is_active, created_at")
    .order("created_at", { ascending: false })
  ) as {
    data: {
      id: string;
      campaign_id: string;
      creative_type: string;
      headline: string | null;
      body: string | null;
      cta_text: string | null;
      target_url: string;
      image_url: string | null;
      alt_text: string | null;
      utm_campaign: string | null;
      is_active: boolean;
      created_at: string;
    }[] | null;
    error: unknown;
  };

  if (error) console.error("Failed to fetch creatives:", error);

  // Fetch campaigns for lookup
  const { data: campaigns } = (await supabase
    .from("ad_campaigns")
    .select("id, name, sponsor_id")
  ) as { data: { id: string; name: string; sponsor_id: string }[] | null };

  // Fetch sponsors for lookup
  const { data: sponsors } = (await supabase
    .from("sponsors")
    .select("id, sponsor_name")
  ) as { data: { id: string; sponsor_name: string }[] | null };

  return (
    <CreativesClient
      creatives={creatives ?? []}
      campaigns={campaigns ?? []}
      sponsors={sponsors ?? []}
    />
  );
}
