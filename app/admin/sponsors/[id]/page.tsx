import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { SponsorDetailClient } from "./SponsorDetailClient";
import type { SponsorData, DeliverableRow, FulfillmentLogRow, PostRow, CampaignRow, CreativeRow, FlightRow } from "./SponsorDetailClient";

export const metadata: Metadata = {
  title: "Sponsor Detail | Admin CMS | ATL Vibes & Views",
  description: "View and manage sponsor details.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SponsorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  // Fetch sponsor
  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("*")
    .eq("id", id)
    .single();

  // Fetch related blog posts via post_sponsors
  const { data: postSponsors } = await supabase
    .from("post_sponsors")
    .select("post_id, tier, published_at")
    .eq("sponsor_id", id);

  const postIds = (postSponsors ?? []).map((ps: { post_id: string }) => ps.post_id);
  let posts: PostRow[] = [];
  if (postIds.length > 0) {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, status, published_at")
      .in("id", postIds);
    posts = (data ?? []) as PostRow[];
  }

  // Fetch ad campaigns
  const { data: campaigns } = await supabase
    .from("ad_campaigns")
    .select("id, name, start_date, end_date, budget, status")
    .eq("sponsor_id", id)
    .order("start_date", { ascending: false });

  // Fetch ad creatives for this sponsor's campaigns
  const campaignIds = (campaigns ?? []).map((c: { id: string }) => c.id);
  let creatives: CreativeRow[] = [];
  if (campaignIds.length > 0) {
    const { data } = await supabase
      .from("ad_creatives")
      .select("id, campaign_id, creative_type, headline, target_url, image_url, is_active")
      .in("campaign_id", campaignIds);
    creatives = (data ?? []) as CreativeRow[];
  }

  // Fetch ad flights for this sponsor's campaigns
  let flights: FlightRow[] = [];
  if (campaignIds.length > 0) {
    const { data } = await supabase
      .from("ad_flights")
      .select("id, campaign_id, placement_id, creative_id, start_date, end_date, status, impressions, clicks")
      .in("campaign_id", campaignIds)
      .order("start_date", { ascending: false });
    flights = (data ?? []) as FlightRow[];
  }

  if (!sponsor) {
    return (
      <div className="p-8">
        <p className="text-[13px] text-[#6b7280]">Sponsor not found.</p>
      </div>
    );
  }

  // Fetch dropdown options for Tab 2
  const { data: packageOptions } = await (supabase
    .from("sponsor_packages" as never)
    .select("id, name")
    .order("name") as unknown as Promise<{ data: { id: string; name: string }[] | null }>);

  const { data: categoryOptions } = (await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name")
  ) as { data: { id: string; name: string }[] | null };

  const { data: neighborhoodOptions } = (await supabase
    .from("neighborhoods")
    .select("id, name")
    .order("name")
  ) as { data: { id: string; name: string }[] | null };

  // Fetch sponsor deliverables
  const { data: deliverables, error: delErr } = await supabase
    .from("sponsor_deliverables")
    .select("*")
    .eq("sponsor_id", id);
  console.log("[SponsorDetail] deliverables for", id, "→", deliverables?.length ?? 0, "rows", delErr ? `ERROR: ${JSON.stringify(delErr)}` : "");

  // Fetch fulfillment log
  const { data: fulfillmentLog, error: flErr } = await supabase
    .from("sponsor_fulfillment_log")
    .select("*")
    .eq("sponsor_id", id)
    .order("delivered_at", { ascending: false });
  console.log("[SponsorDetail] fulfillmentLog for", id, "→", fulfillmentLog?.length ?? 0, "rows", flErr ? `ERROR: ${JSON.stringify(flErr)}` : "");

  return (
    <SponsorDetailClient
      sponsor={sponsor as SponsorData}
      posts={posts}
      campaigns={(campaigns ?? []) as CampaignRow[]}
      creatives={creatives}
      flights={flights}
      deliverables={(deliverables ?? []) as DeliverableRow[]}
      fulfillmentLog={(fulfillmentLog ?? []) as FulfillmentLogRow[]}
      packageOptions={packageOptions ?? []}
      categoryOptions={categoryOptions ?? []}
      neighborhoodOptions={neighborhoodOptions ?? []}
    />
  );
}
