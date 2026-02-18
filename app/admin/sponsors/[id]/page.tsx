import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { SponsorDetailClient } from "./SponsorDetailClient";
import type {
  SponsorData,
  DeliverableRow,
  FulfillmentLogRow,
  PostRow,
  CampaignRow,
  CreativeRow,
  FlightRow,
  SponsorNoteRow,
  BusinessContact,
} from "./SponsorDetailClient";

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

  if (!sponsor) {
    return (
      <div className="p-8">
        <p className="text-[13px] text-[#6b7280]">Sponsor not found.</p>
      </div>
    );
  }

  const s = sponsor as SponsorData;

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
  const { data: deliverables } = await supabase
    .from("sponsor_deliverables")
    .select("*")
    .eq("sponsor_id", id);

  // Fetch fulfillment log
  const { data: fulfillmentLog } = await supabase
    .from("sponsor_fulfillment_log")
    .select("*")
    .eq("sponsor_id", id)
    .order("delivered_at", { ascending: false });

  // ─── Phase 3B additions ────────────────────────────────────

  // Stat card: Content Pieces — count published blog posts via sponsor_business_id
  let blogPostCount = 0;
  if (s.business_id) {
    const { count } = await supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("sponsor_business_id", s.business_id)
      .eq("status", "published");
    blogPostCount = count ?? 0;
  }

  // Stat card: Placements denominator — SUM(quantity_owed) from deliverables
  const deliverableRows = (deliverables ?? []) as DeliverableRow[];
  const totalDeliverableOwed = deliverableRows.reduce((sum, d) => sum + (d.quantity_owed ?? 0), 0);

  // Stat card: Ad Campaigns count
  const adCampaignCount = (campaigns ?? []).length;

  // Sponsor notes (talking point log + internal note log)
  const { data: sponsorNotes } = (await supabase
    .from("sponsor_notes")
    .select("*")
    .eq("sponsor_id", id)
    .order("created_at", { ascending: false })
  ) as { data: SponsorNoteRow[] | null };

  // Contact auto-populate from business_listings
  let businessContact: BusinessContact | null = null;
  if (s.business_id) {
    const { data } = (await supabase
      .from("business_listings")
      .select("business_name, email, phone")
      .eq("id", s.business_id)
      .single()
    ) as { data: { business_name: string | null; email: string | null; phone: string | null } | null };
    if (data) {
      businessContact = {
        business_name: data.business_name,
        email: data.email,
        phone: data.phone,
      };
    }
  }

  return (
    <SponsorDetailClient
      sponsor={s}
      posts={posts}
      campaigns={(campaigns ?? []) as CampaignRow[]}
      creatives={creatives}
      flights={flights}
      deliverables={deliverableRows}
      fulfillmentLog={(fulfillmentLog ?? []) as FulfillmentLogRow[]}
      packageOptions={packageOptions ?? []}
      categoryOptions={categoryOptions ?? []}
      neighborhoodOptions={neighborhoodOptions ?? []}
      blogPostCount={blogPostCount}
      totalDeliverableOwed={totalDeliverableOwed}
      adCampaignCount={adCampaignCount}
      sponsorNotes={(sponsorNotes ?? []) as SponsorNoteRow[]}
      businessContact={businessContact}
    />
  );
}
