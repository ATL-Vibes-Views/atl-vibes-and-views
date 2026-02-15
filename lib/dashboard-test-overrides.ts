// TODO: REMOVE BEFORE LAUNCH — entire file is for testing only
import type { BusinessState } from "@/components/dashboard/TierBadge";

const VALID_STATES: BusinessState[] = ["free", "standard", "founding", "sponsor"];

/**
 * Parse the ?state= query param and return a valid BusinessState override,
 * or null if no override is requested.
 */
export function getStateOverride(
  searchParams: Record<string, string | string[] | undefined>
): BusinessState | null {
  const raw = searchParams.state;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && VALID_STATES.includes(value as BusinessState)) {
    return value as BusinessState;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Mock data for ?state=sponsor when no real sponsor exists in the database
// ---------------------------------------------------------------------------

export const MOCK_SPONSOR_OVERVIEW = {
  campaign_name: "Spring 2026 Feature Campaign",
  sponsor_packages: { name: "The Feature" } as { name: string },
};

export const MOCK_DELIVERABLES_OVERVIEW = [
  { quantity_owed: 4, quantity_delivered: 3 },
  { quantity_owed: 8, quantity_delivered: 5 },
  { quantity_owed: 2, quantity_delivered: 2 },
];

export const MOCK_SPONSOR_BILLING_TIER_CHANGES = [
  {
    id: "mock-tc-1",
    from_tier: "Standard",
    to_tier: "Premium",
    change_type: "upgrade",
    reason: "payment_success" as string | null,
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "mock-tc-2",
    from_tier: "Free",
    to_tier: "Standard",
    change_type: "upgrade",
    reason: "payment_success" as string | null,
    created_at: "2025-09-01T10:00:00Z",
  },
];

export const MOCK_SPONSOR_FULL = {
  id: "mock-sponsor-001",
  campaign_name: "Spring 2026 Feature Campaign",
  campaign_start: "2026-01-01",
  campaign_end: "2026-06-30",
  campaign_value: 7200,
  status: "active",
  is_active: true as const,
  sponsor_packages: {
    name: "The Feature",
    slug: "the-feature",
    price_display: "$1,200/mo",
    billing_cycle: "monthly",
    deliverables: [
      "1 dedicated blog feature per month",
      "2 social media reels",
      "Newsletter mention",
      "Homepage ad placement",
    ],
  },
};

export const MOCK_DELIVERABLES_FULL = [
  {
    id: "mock-del-1",
    label: "Blog Features",
    deliverable_type: "blog_feature",
    quantity_owed: 6,
    quantity_delivered: 4,
    notes: "Next feature scheduled for March",
  },
  {
    id: "mock-del-2",
    label: "Social Media Reels",
    deliverable_type: "reel",
    quantity_owed: 12,
    quantity_delivered: 8,
    notes: null,
  },
  {
    id: "mock-del-3",
    label: "Newsletter Mentions",
    deliverable_type: "newsletter",
    quantity_owed: 6,
    quantity_delivered: 5,
    notes: null,
  },
];

export const MOCK_FULFILLMENTS = [
  {
    id: "mock-ful-1",
    deliverable_type: "blog_feature",
    title: "Inside Blandtown Boxing: Atlanta's Hidden Fitness Gem",
    content_url: null,
    delivered_at: "2026-02-01T12:00:00Z",
    blog_posts: {
      title: "Inside Blandtown Boxing: Atlanta's Hidden Fitness Gem",
      slug: "inside-blandtown-boxing",
      featured_image_url: null,
    },
  },
  {
    id: "mock-ful-2",
    deliverable_type: "reel",
    title: "Blandtown Boxing — Morning Workout Reel",
    content_url: null,
    delivered_at: "2026-01-20T12:00:00Z",
    blog_posts: null,
  },
  {
    id: "mock-ful-3",
    deliverable_type: "blog_feature",
    title: "Top 10 Fitness Studios in Westside Atlanta",
    content_url: null,
    delivered_at: "2026-01-10T12:00:00Z",
    blog_posts: {
      title: "Top 10 Fitness Studios in Westside Atlanta",
      slug: "top-10-fitness-studios-westside",
      featured_image_url: null,
    },
  },
  {
    id: "mock-ful-4",
    deliverable_type: "reel",
    title: "Community Day Highlights",
    content_url: null,
    delivered_at: "2026-03-01T12:00:00Z",
    blog_posts: null,
  },
];

export const MOCK_FLIGHTS = [
  {
    id: "mock-flight-1",
    start_date: "2026-01-01",
    end_date: "2026-03-31",
    status: "active",
    ad_placements: {
      name: "Homepage Sidebar — 300x250",
      dimensions: "300x250",
      description: "Right sidebar on homepage",
    },
    ad_campaigns: {
      name: "Spring 2026 Campaign",
      sponsor_id: "mock-sponsor-001",
    },
  },
  {
    id: "mock-flight-2",
    start_date: "2026-04-01",
    end_date: "2026-06-30",
    status: "scheduled",
    ad_placements: {
      name: "Neighborhood Guide — Leaderboard",
      dimensions: "728x90",
      description: "Top banner on neighborhood pages",
    },
    ad_campaigns: {
      name: "Spring 2026 Campaign",
      sponsor_id: "mock-sponsor-001",
    },
  },
];
