import { Metadata } from "next";
import Link from "next/link";
import { Star, Newspaper, Calendar } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatGrid } from "@/components/portal/StatGrid";
import { StatCard } from "@/components/portal/StatCard";
import { ActivityFeed } from "@/components/portal/ActivityFeed";
import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";

export const metadata: Metadata = {
  title: "Overview | Dashboard | ATL Vibes & Views",
  description: "Business dashboard overview with key metrics and recent activity.",
  robots: { index: false, follow: false },
};

export default async function OverviewPage() {
  const owner = getMockBusinessOwner();
  const businessId = owner.business_id!;
  const supabase = createServerClient();

  // Fetch business info
  const { data: business } = (await supabase
    .from("business_listings")
    .select("business_name, slug, status, tier, tier_start_date")
    .eq("id", businessId)
    .single()) as {
    data: {
      business_name: string;
      slug: string;
      status: string;
      tier: string;
      tier_start_date: string | null;
    } | null;
  };

  // Fetch review stats
  const { data: reviews } = (await supabase
    .from("reviews")
    .select("rating")
    .eq("business_id", businessId)
    .eq("status", "approved")) as { data: { rating: number }[] | null };

  const reviewCount = reviews?.length ?? 0;
  const avgRating =
    reviewCount > 0
      ? (reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
      : "0.0";

  // Fetch press mention count
  const { count: pressCount } = (await supabase
    .from("post_businesses")
    .select("id, blog_posts!inner(status)", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("blog_posts.status" as string, "published")) as { count: number | null };

  // Fetch upcoming event count
  const today = new Date().toISOString().split("T")[0];
  const { count: eventCount } = (await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .or(`venue_business_id.eq.${businessId},organizer_business_id.eq.${businessId}`)
    .eq("status", "active")
    .gte("start_date", today)) as { count: number | null };

  // Fetch recent reviews for activity feed
  const { data: recentReviews } = (await supabase
    .from("reviews")
    .select("title, rating, created_at")
    .eq("business_id", businessId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(3)) as { data: { title: string | null; rating: number; created_at: string }[] | null };

  // Fetch recent blog mentions
  const { data: recentMentions } = (await supabase
    .from("post_businesses")
    .select("mention_type, blog_posts(title, published_at)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(3)) as {
    data: {
      mention_type: string | null;
      blog_posts: { title: string; published_at: string } | null;
    }[] | null;
  };

  // Fetch recent events
  const { data: recentEvents } = (await supabase
    .from("events")
    .select("title, start_date, created_at")
    .or(`venue_business_id.eq.${businessId},organizer_business_id.eq.${businessId}`)
    .order("created_at", { ascending: false })
    .limit(3)) as { data: { title: string; start_date: string; created_at: string }[] | null };

  // Build activity items
  type FeedItem = {
    icon: React.ReactNode;
    iconColor: "gold" | "blue" | "green" | "red" | "purple";
    text: React.ReactNode;
    timestamp: string;
    date: string;
  };

  const activityItems: FeedItem[] = [];

  if (recentReviews && recentReviews.length > 0) {
    for (const r of recentReviews) {
      activityItems.push({
        icon: <Star size={16} />,
        iconColor: "gold",
        text: (
          <span>
            New {r.rating}-star review: &ldquo;{r.title || "Untitled review"}&rdquo;
          </span>
        ),
        timestamp: formatRelative(r.created_at),
        date: r.created_at,
      });
    }
  }

  if (recentMentions && recentMentions.length > 0) {
    for (const m of recentMentions) {
      const post = m.blog_posts;
      if (post) {
        activityItems.push({
          icon: <Newspaper size={16} />,
          iconColor: "blue",
          text: (
            <span>
              Your business was mentioned in &ldquo;{post.title}&rdquo;
            </span>
          ),
          timestamp: formatRelative(post.published_at),
          date: post.published_at,
        });
      }
    }
  }

  if (recentEvents && recentEvents.length > 0) {
    for (const e of recentEvents) {
      activityItems.push({
        icon: <Calendar size={16} />,
        iconColor: "green",
        text: <span>Event &ldquo;{e.title}&rdquo; scheduled for {e.start_date}</span>,
        timestamp: formatRelative(e.created_at),
        date: e.created_at,
      });
    }
  }

  // Sort by date desc
  activityItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // If no real data, show placeholders
  const feedItems =
    activityItems.length > 0
      ? activityItems.map(({ icon, iconColor, text, timestamp }) => ({
          icon,
          iconColor,
          text,
          timestamp,
        }))
      : [
          {
            icon: <Star size={16} />,
            iconColor: "gold" as const,
            text: <span>New 5-star review: &ldquo;Amazing atmosphere and service!&rdquo;</span>,
            timestamp: "2 hours ago",
          },
          {
            icon: <Newspaper size={16} />,
            iconColor: "blue" as const,
            text: (
              <span>
                Your business was mentioned in &ldquo;Top 10 Hidden Gems in Atlanta&rdquo;
              </span>
            ),
            timestamp: "1 day ago",
          },
          {
            icon: <Calendar size={16} />,
            iconColor: "green" as const,
            text: <span>Event &ldquo;Community Fitness Day&rdquo; scheduled for Feb 28</span>,
            timestamp: "3 days ago",
          },
          {
            icon: <Star size={16} />,
            iconColor: "gold" as const,
            text: <span>New 4-star review: &ldquo;Great trainers, love this place&rdquo;</span>,
            timestamp: "5 days ago",
          },
        ];

  const listingSlug = business?.slug ?? "blandtown-boxing";

  return (
    <>
      <PortalTopbar
        title="Overview"
        actions={
          <Link
            href={`/businesses/${listingSlug}`}
            className="text-[13px] font-body font-semibold text-[#c1121f] hover:underline"
          >
            View Live Listing &rarr;
          </Link>
        }
      />
      <div className="p-8 max-[899px]:pt-16">
        <StatGrid columns={3}>
          <StatCard
            label="Listing Status"
            value={capitalize(business?.status ?? "Active")}
            badge={{
              text: capitalize(business?.status ?? "Active"),
              variant: business?.status === "active" ? "green" : "gray",
            }}
          />
          <StatCard
            label="Current Tier"
            value={capitalize(business?.tier ?? "Free")}
            subtitle={
              business?.tier_start_date
                ? `Since ${formatDate(business.tier_start_date)}`
                : undefined
            }
            badge={{ text: capitalize(business?.tier ?? "Free"), variant: "gold" }}
          />
          <StatCard
            label="Reviews"
            value={avgRating}
            subtitle={`${reviewCount} total reviews`}
          />
          <StatCard
            label="Page Views"
            value="2,340"
            trend={{ value: "12% vs last month", direction: "up" }}
          />
          <StatCard
            label="Press Mentions"
            value={pressCount ?? 0}
            subtitle="Published stories"
          />
          <StatCard
            label="Upcoming Events"
            value={eventCount ?? 0}
            subtitle="Active events"
          />
        </StatGrid>

        <div className="mt-8">
          <ActivityFeed title="Recent Activity" items={feedItems} />
        </div>
      </div>
    </>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}
