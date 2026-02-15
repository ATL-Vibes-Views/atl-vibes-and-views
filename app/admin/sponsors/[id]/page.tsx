import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
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
  const supabase = createServerClient();

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

  // Fetch sponsor deliverables — join on business_id (sponsor_deliverables.sponsor_id = sponsor.business_id)
  const sponsorData = sponsor as SponsorData;
  const deliverableJoinId = sponsorData.business_id ?? id;
  const { data: deliverables } = await supabase
    .from("sponsor_deliverables")
    .select("id, deliverable_type, label, quantity_promised, quantity_delivered, status, due_date, completed_at, notes")
    .eq("sponsor_id", deliverableJoinId)
    .order("due_date", { ascending: true });

  // Fetch fulfillment log — correct table name is sponsor_fulfillment_log, same join
  const { data: fulfillmentLog } = await supabase
    .from("sponsor_fulfillment_log")
    .select("id, deliverable_id, action, content_url, notes, logged_at, logged_by")
    .eq("sponsor_id", deliverableJoinId)
    .order("logged_at", { ascending: false });

  return (
    <SponsorDetailClient
      sponsor={sponsor as SponsorData}
      posts={posts}
      campaigns={(campaigns ?? []) as CampaignRow[]}
      creatives={creatives}
      flights={flights}
      deliverables={(deliverables ?? []) as DeliverableRow[]}
      fulfillmentLog={(fulfillmentLog ?? []) as FulfillmentLogRow[]}
    />
  );
}
