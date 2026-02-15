import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { SponsorDetailClient } from "./SponsorDetailClient";

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
  const { data: sponsor } = (await supabase
    .from("sponsors")
    .select("*")
    .eq("id", id)
    .single()
  ) as {
    data: {
      id: string;
      sponsor_name: string;
      business_id: string | null;
      contact_name: string | null;
      contact_email: string | null;
      contact_phone: string | null;
      campaign_name: string | null;
      campaign_start: string | null;
      campaign_end: string | null;
      campaign_value: number | null;
      placement: unknown;
      talking_points: string | null;
      status: string;
      notes: string | null;
      package_type: string | null;
      placements_total: number | null;
      placements_used: number | null;
      category_focus: string | null;
      neighborhood_focus: string | null;
      is_active: boolean | null;
      created_at: string;
      updated_at: string;
    } | null;
  };

  // Fetch related blog posts via post_sponsors
  const { data: postSponsors } = (await supabase
    .from("post_sponsors")
    .select("post_id, tier, published_at")
    .eq("sponsor_id", id)
  ) as {
    data: { post_id: string; tier: string | null; published_at: string | null }[] | null;
  };

  // Fetch post titles for linked posts
  const postIds = (postSponsors ?? []).map((ps) => ps.post_id);
  let posts: { id: string; title: string; slug: string; status: string; published_at: string | null }[] = [];

  if (postIds.length > 0) {
    const { data: postData } = (await supabase
      .from("blog_posts")
      .select("id, title, slug, status, published_at")
      .in("id", postIds)
    ) as {
      data: { id: string; title: string; slug: string; status: string; published_at: string | null }[] | null;
    };
    posts = postData ?? [];
  }

  // Fetch ad campaigns for this sponsor
  const { data: campaigns } = (await supabase
    .from("ad_campaigns")
    .select("id, name, start_date, end_date, budget, status")
    .eq("sponsor_id", id)
    .order("start_date", { ascending: false })
  ) as {
    data: { id: string; name: string; start_date: string; end_date: string; budget: number | null; status: string }[] | null;
  };

  // Fetch ad creatives for campaigns
  const campaignIds = (campaigns ?? []).map((c) => c.id);
  let creatives: { id: string; campaign_id: string; creative_type: string; headline: string | null; target_url: string; image_url: string | null; is_active: boolean }[] = [];

  if (campaignIds.length > 0) {
    const { data: creativeData } = (await supabase
      .from("ad_creatives")
      .select("id, campaign_id, creative_type, headline, target_url, image_url, is_active")
      .in("campaign_id", campaignIds)
    ) as {
      data: { id: string; campaign_id: string; creative_type: string; headline: string | null; target_url: string; image_url: string | null; is_active: boolean }[] | null;
    };
    creatives = creativeData ?? [];
  }

  if (!sponsor) {
    return (
      <div className="p-8">
        <p className="text-[13px] text-[#6b7280]">Sponsor not found.</p>
      </div>
    );
  }

  return (
    <SponsorDetailClient
      sponsor={sponsor}
      posts={posts}
      campaigns={campaigns ?? []}
      creatives={creatives}
    />
  );
}
