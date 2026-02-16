import { Metadata } from "next";
import {
  FileText,
  Film,
  Star,
  BookOpen,
  ClipboardList,
  Clock,
} from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { WorkflowBanner } from "@/components/portal/WorkflowBanner";
import { AlertCard } from "@/components/portal/AlertCard";
import { ActivityFeed } from "@/components/portal/ActivityFeed";
import { createServiceRoleClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Admin Dashboard | ATL Vibes & Views",
  description: "Admin dashboard for ATL Vibes & Views CMS.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = createServiceRoleClient();
  const today = new Date().toISOString().split("T")[0];

  // Fetch stats in parallel
  const counts = (await Promise.all([
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("business_listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("events").select("*", { count: "exact", head: true }).gte("start_date", today),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("stories").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("newsletters").select("*", { count: "exact", head: true }).eq("status", "sent"),
    supabase.from("sponsors").select("*", { count: "exact", head: true }).eq("status", "active"),
    // For alerts
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "scheduled"),
  ])) as unknown as { count: number | null }[];

  const totalPosts = counts[0].count ?? 0;
  const activeListings = counts[1].count ?? 0;
  const upcomingEvents = counts[2].count ?? 0;
  const pendingReviews = counts[3].count ?? 0;
  const newStories = counts[4].count ?? 0;
  const totalUsers = counts[5].count ?? 0;
  const sentNewsletters = counts[6].count ?? 0;
  const activeSponsors = counts[7].count ?? 0;
  const pendingSubmissions = counts[8].count ?? 0;
  const draftPosts = counts[9].count ?? 0;
  const scheduledPosts = counts[10].count ?? 0;

  // Build alerts dynamically from real data
  const alerts: { icon: React.ReactNode; iconBg: string; text: React.ReactNode; timestamp: string }[] = [];

  if (pendingSubmissions > 0) {
    alerts.push({
      icon: <ClipboardList size={14} className="text-[#c1121f]" />,
      iconBg: "bg-[#fee2e2]",
      text: <><strong>{pendingSubmissions}</strong> submission{pendingSubmissions !== 1 ? "s" : ""} awaiting review</>,
      timestamp: "Now",
    });
  }

  if (pendingReviews > 0) {
    alerts.push({
      icon: <Star size={14} className="text-[#ea580c]" />,
      iconBg: "bg-[#ffedd5]",
      text: <><strong>{pendingReviews}</strong> review{pendingReviews !== 1 ? "s" : ""} pending moderation</>,
      timestamp: "Now",
    });
  }

  if (draftPosts > 0) {
    alerts.push({
      icon: <FileText size={14} className="text-[#2563eb]" />,
      iconBg: "bg-[#dbeafe]",
      text: <><strong>{draftPosts}</strong> blog post{draftPosts !== 1 ? "s" : ""} in draft</>,
      timestamp: "Now",
    });
  }

  if (scheduledPosts > 0) {
    alerts.push({
      icon: <Clock size={14} className="text-[#7c3aed]" />,
      iconBg: "bg-[#f3e8ff]",
      text: <><strong>{scheduledPosts}</strong> post{scheduledPosts !== 1 ? "s" : ""} scheduled for publishing</>,
      timestamp: "Upcoming",
    });
  }

  if (newStories > 0) {
    alerts.push({
      icon: <BookOpen size={14} className="text-[#059669]" />,
      iconBg: "bg-[#dcfce7]",
      text: <><strong>{newStories}</strong> new stor{newStories !== 1 ? "ies" : "y"} to triage</>,
      timestamp: "Now",
    });
  }

  // Workflow steps — publishing pipeline
  const workflowSteps: { label: string; status: "done" | "current" | "future" }[] = [
    { label: "Pipeline", status: "done" },
    { label: "Publishing Queue", status: scheduledPosts > 0 ? "current" : "future" },
    { label: "Published", status: "future" },
  ];

  // Activity feed — real data from recent posts and scripts
  const { data: recentPosts } = (await supabase
    .from("blog_posts")
    .select("id, title, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5)) as {
    data: { id: string; title: string; status: string; updated_at: string }[] | null;
  };

  const { data: recentScripts } = (await supabase
    .from("scripts")
    .select("id, title, status, created_at")
    .eq("platform", "reel")
    .eq("format", "talking_head")
    .order("created_at", { ascending: false })
    .limit(3)) as {
    data: { id: string; title: string; status: string; created_at: string }[] | null;
  };

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  }

  const postStatusLabel: Record<string, string> = {
    draft: "drafted",
    published: "published",
    scheduled: "scheduled",
  };

  const activityItems: {
    icon: React.ReactNode;
    iconColor: "gold" | "blue" | "green" | "red" | "purple";
    text: React.ReactNode;
    timestamp: string;
  }[] = [];

  for (const post of recentPosts ?? []) {
    activityItems.push({
      icon: <FileText size={16} />,
      iconColor: post.status === "published" ? "green" : post.status === "scheduled" ? "purple" : "blue",
      text: <><strong>Blog post</strong> &ldquo;{post.title}&rdquo; {postStatusLabel[post.status] ?? post.status}</>,
      timestamp: timeAgo(post.updated_at),
    });
  }

  for (const script of recentScripts ?? []) {
    activityItems.push({
      icon: <Film size={16} />,
      iconColor: script.status === "approved" ? "green" : "gold",
      text: <><strong>Script</strong> &ldquo;{script.title}&rdquo; {script.status}</>,
      timestamp: timeAgo(script.created_at),
    });
  }

  return (
    <>
      <PortalTopbar title="Dashboard" />
      <div className="p-8 max-[899px]:pt-16 space-y-6">
        {/* Stats — 4-column grid */}
        <StatGrid columns={4}>
          <StatCard label="Total Posts" value={totalPosts} />
          <StatCard label="Active Listings" value={activeListings} />
          <StatCard label="Upcoming Events" value={upcomingEvents} />
          <StatCard
            label="Pending Reviews"
            value={pendingReviews}
            badge={pendingReviews > 0 ? { text: "Action", variant: "red" } : undefined}
          />
          <StatCard
            label="New Stories"
            value={newStories}
            badge={newStories > 0 ? { text: "Triage", variant: "gold" } : undefined}
          />
          <StatCard label="Subscribers" value={totalUsers} />
          <StatCard label="Newsletters Sent" value={sentNewsletters} />
          <StatCard label="Active Sponsors" value={activeSponsors} />
        </StatGrid>

        {/* Publishing Pipeline */}
        <div>
          <h2 className="font-display text-[18px] font-semibold text-black mb-3">
            Publishing Pipeline
          </h2>
          <WorkflowBanner steps={workflowSteps} />
        </div>

        {/* Two-column: Alerts + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Needs Attention */}
          <div>
            <h2 className="font-display text-[18px] font-semibold text-black mb-3">
              Needs Attention
            </h2>
            {alerts.length > 0 ? (
              <div className="bg-white border border-[#e5e5e5]">
                {alerts.map((alert, i) => (
                  <AlertCard key={i} {...alert} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#e5e5e5] p-8 text-center">
                <p className="text-[13px] text-[#6b7280]">
                  All caught up — nothing needs attention right now.
                </p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="font-display text-[18px] font-semibold text-black mb-3">
              Recent Activity
            </h2>
            <ActivityFeed items={activityItems} />
          </div>
        </div>
      </div>
    </>
  );
}
