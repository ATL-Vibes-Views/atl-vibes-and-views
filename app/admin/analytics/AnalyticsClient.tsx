"use client";

import { useState, useMemo } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { TabNav } from "@/components/portal/TabNav";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { AdminDataTable } from "@/components/portal/AdminDataTable";

/* ============================================================
   ANALYTICS — 3 tabs: Overview, Content Performance, Traffic
   ============================================================ */

interface AnalyticsStats {
  totalPosts: number;
  publishedPosts: number;
  activeListings: number;
  totalEvents: number;
  mediaItems: number;
  sentNewsletters: number;
  totalUsers: number;
  totalReviews: number;
}

interface TopPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  category_id: string | null;
  published_at: string | null;
  categories: { name: string } | null;
}

interface PerformanceRow {
  post_id: string;
  page_views: number | null;
  unique_visitors: number | null;
  shares: number | null;
  avg_time_on_page: number | null;
  bounce_rate: number | null;
}

interface AnalyticsClientProps {
  stats: AnalyticsStats;
  topPosts: TopPost[];
  performance: PerformanceRow[];
}

const TABS = [
  { label: "Overview", key: "overview" },
  { label: "Content Performance", key: "content" },
  { label: "Traffic", key: "traffic" },
];

export function AnalyticsClient({ stats, topPosts, performance }: AnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const totalViews = useMemo(
    () => performance.reduce((sum, p) => sum + (p.page_views ?? 0), 0),
    [performance]
  );
  const totalVisitors = useMemo(
    () => performance.reduce((sum, p) => sum + (p.unique_visitors ?? 0), 0),
    [performance]
  );

  return (
    <>
      <PortalTopbar title="Analytics" />
      <div className="p-8 max-[899px]:pt-16 space-y-6">
        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <StatGrid columns={4}>
              <StatCard label="Published Posts" value={stats.publishedPosts} subtitle={`of ${stats.totalPosts} total`} />
              <StatCard label="Active Listings" value={stats.activeListings} />
              <StatCard label="Events" value={stats.totalEvents} />
              <StatCard label="Media Items" value={stats.mediaItems} />
              <StatCard label="Newsletters Sent" value={stats.sentNewsletters} />
              <StatCard label="Total Users" value={stats.totalUsers} />
              <StatCard label="Reviews" value={stats.totalReviews} />
              <StatCard label="Total Page Views" value={totalViews.toLocaleString()} />
            </StatGrid>

            <div>
              <h2 className="font-display text-[18px] font-semibold text-black mb-3">
                Recent Published Posts
              </h2>
              <AdminDataTable
                columns={[
                  {
                    key: "title",
                    header: "Title",
                    width: "40%",
                    render: (item: TopPost) => (
                      <span className="font-display text-[14px] font-semibold text-black">{item.title}</span>
                    ),
                  },
                  {
                    key: "category",
                    header: "Category",
                    render: (item: TopPost) => (
                      <span className="text-[13px] text-[#374151]">{item.categories?.name ?? "—"}</span>
                    ),
                  },
                  {
                    key: "published_at",
                    header: "Published",
                    render: (item: TopPost) => (
                      <span className="text-[12px] text-[#6b7280]">
                        {item.published_at
                          ? new Date(item.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "—"}
                      </span>
                    ),
                  },
                ]}
                data={topPosts}
                emptyMessage="No published posts yet."
              />
            </div>
          </div>
        )}

        {/* ── Content Performance Tab ── */}
        {activeTab === "content" && (
          <div className="space-y-4">
            <StatGrid columns={3}>
              <StatCard label="Total Page Views" value={totalViews.toLocaleString()} />
              <StatCard label="Unique Visitors" value={totalVisitors.toLocaleString()} />
              <StatCard
                label="Avg Bounce Rate"
                value={
                  performance.length > 0
                    ? `${Math.round(performance.reduce((s, p) => s + (p.bounce_rate ?? 0), 0) / performance.length)}%`
                    : "—"
                }
              />
            </StatGrid>

            <AdminDataTable
              columns={[
                {
                  key: "post_id",
                  header: "Post ID",
                  width: "25%",
                  render: (item: PerformanceRow) => (
                    <span className="text-[12px] text-[#6b7280] font-mono">{item.post_id.slice(0, 8)}...</span>
                  ),
                },
                {
                  key: "page_views",
                  header: "Views",
                  render: (item: PerformanceRow) => (
                    <span className="text-[13px] font-semibold text-[#374151]">{item.page_views?.toLocaleString() ?? "0"}</span>
                  ),
                },
                {
                  key: "unique_visitors",
                  header: "Visitors",
                  render: (item: PerformanceRow) => (
                    <span className="text-[13px] text-[#374151]">{item.unique_visitors?.toLocaleString() ?? "0"}</span>
                  ),
                },
                {
                  key: "shares",
                  header: "Shares",
                  render: (item: PerformanceRow) => (
                    <span className="text-[13px] text-[#374151]">{item.shares ?? 0}</span>
                  ),
                },
                {
                  key: "avg_time_on_page",
                  header: "Avg Time",
                  render: (item: PerformanceRow) => (
                    <span className="text-[13px] text-[#374151]">
                      {item.avg_time_on_page ? `${Math.round(item.avg_time_on_page)}s` : "—"}
                    </span>
                  ),
                },
                {
                  key: "bounce_rate",
                  header: "Bounce",
                  render: (item: PerformanceRow) => (
                    <span className="text-[13px] text-[#374151]">
                      {item.bounce_rate != null ? `${Math.round(item.bounce_rate)}%` : "—"}
                    </span>
                  ),
                },
              ]}
              data={performance}
              emptyMessage="No performance data yet."
            />
          </div>
        )}

        {/* ── Traffic Tab ── */}
        {activeTab === "traffic" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#e5e5e5] p-8 text-center">
              <p className="text-[13px] text-[#6b7280]">
                Traffic analytics will be available once Google Analytics integration is configured in Settings.
              </p>
              <p className="text-[11px] text-[#9ca3af] mt-2">
                Connect your GA4 property to see real-time traffic data, referral sources, and audience insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
