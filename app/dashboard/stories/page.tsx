import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import { getBusinessState } from "@/components/dashboard/TierBadge";
import { StoriesClient } from "@/components/dashboard/StoriesClient";
// TODO: REMOVE BEFORE LAUNCH — test override import
import {
  getStateOverride,
  MOCK_STORIES_SPONSORED_POST_IDS,
} from "@/lib/dashboard-test-overrides";

export async function generateMetadata() {
  return {
    title: "Press & Stories | Dashboard | ATL Vibes & Views",
    description: "See press coverage for your business on ATL Vibes & Views",
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const owner = getMockBusinessOwner();
  const businessId = owner.business_id!;
  const supabase = createServerClient();

  // TODO: REMOVE BEFORE LAUNCH — testing state override
  const resolvedParams = await searchParams;
  const stateOverride = getStateOverride(resolvedParams);

  const { data: business } = (await supabase
    .from("business_listings")
    .select("id, business_name, slug, tier, status, is_founding_member")
    .eq("id", businessId)
    .single()) as {
    data: {
      id: string;
      business_name: string;
      slug: string;
      tier: string;
      status: string;
      is_founding_member: boolean;
    } | null;
  };

  const { data: sponsor } = (await supabase
    .from("sponsors")
    .select("*, sponsor_packages(name)")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .maybeSingle()) as {
    data: {
      id: string;
      is_active: boolean;
      sponsor_packages: { name: string } | null;
    } | null;
  };

  // Stories — post_businesses uses post_id (NOT blog_post_id)
  const { data: stories } = (await supabase
    .from("post_businesses")
    .select(
      "*, blog_posts(id, title, slug, excerpt, featured_image_url, published_at, status)"
    )
    .eq("business_id", businessId)) as {
    data: {
      post_id: string | null;
      blog_posts: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        featured_image_url: string | null;
        published_at: string | null;
        status: string;
      } | null;
    }[] | null;
  };

  // Sponsored post IDs (for badge display)
  let sponsoredPostIds: string[] = [];
  if (sponsor) {
    const { data } = (await supabase
      .from("sponsor_fulfillment_log")
      .select("post_id")
      .eq("sponsor_id", sponsor.id)
      .not("post_id", "is", null)) as {
      data: { post_id: string | null }[] | null;
    };
    sponsoredPostIds =
      data?.map((d) => d.post_id).filter((id): id is string => !!id) ?? [];
  }

  const realState = getBusinessState(business, sponsor);
  // TODO: REMOVE BEFORE LAUNCH — apply test override
  const state = stateOverride ?? realState;

  // TODO: REMOVE BEFORE LAUNCH — inject mock sponsored post IDs for sponsor test
  const sponsoredIds =
    state === "sponsor" && sponsoredPostIds.length === 0
      ? MOCK_STORIES_SPONSORED_POST_IDS(stories)
      : sponsoredPostIds;

  return (
    <StoriesClient
      state={state}
      stories={stories}
      sponsoredPostIds={sponsoredIds}
    />
  );
}
