"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { WorkflowBanner } from "@/components/portal/WorkflowBanner";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { Pagination } from "@/components/portal/Pagination";
import { resetStoryToNew } from "@/app/admin/actions";

interface StoryRow {
  id: string;
  headline: string;
  source_name: string | null;
  status: string;
  score: number | null;
  tier: string | null;
  category_id: string | null;
  created_at: string;
  categories: { name: string } | null;
}

interface PipelineClientProps {
  stories: StoryRow[];
  categories: { id: string; name: string }[];
}

const ITEMS_PER_PAGE = 25;

const ASSIGNED_STATUSES = ["assigned_blog", "assigned_script", "assigned_dual", "assigned_social"];
const DRAFT_STATUSES = ["draft_script", "draft_social"];

const statusBadgeMap: Record<string, "yellow" | "blue" | "gray" | "green" | "red"> = {
  new: "yellow",
  scored: "yellow",
  reviewed: "yellow",
  queued: "yellow",
  assigned_blog: "blue",
  assigned_script: "blue",
  assigned_dual: "blue",
  assigned_social: "blue",
  draft_script: "blue",
  draft_social: "blue",
  banked: "gray",
  skipped: "gray",
  used: "green",
  discarded: "red",
};

const tierLabelMap: Record<string, { label: string; variant: "green" | "blue" | "gold" }> = {
  "1": { label: "Tier 1", variant: "green" },
  "2": { label: "Tier 2", variant: "blue" },
  "3": { label: "Tier 3", variant: "gold" },
  blog: { label: "Blog", variant: "green" },
  script: { label: "Script", variant: "blue" },
  social: { label: "Social", variant: "gold" },
};

export function PipelineClient({ stories, categories }: PipelineClientProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [page, setPage] = useState(1);
  const [activating, setActivating] = useState<string | null>(null);

  const handleActivate = useCallback(async (id: string) => {
    setActivating(id);
    const result = await resetStoryToNew(id);
    setActivating(null);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    router.refresh();
  }, [router]);

  // Stats
  const newCount = stories.filter((s) => s.status === "new").length;
  const assignedCount = stories.filter((s) => ASSIGNED_STATUSES.includes(s.status)).length;
  const inProgressCount = stories.filter((s) => DRAFT_STATUSES.includes(s.status)).length;
  const bankedCount = stories.filter((s) => s.status === "banked").length;
  const usedCount = stories.filter((s) => s.status === "used").length;

  // Filter
  const filtered = useMemo(() => {
    let items = stories;
    if (statusFilter) items = items.filter((s) => s.status === statusFilter);
    if (categoryFilter) items = items.filter((s) => s.category_id === categoryFilter);
    if (tierFilter) items = items.filter((s) => String(s.tier) === tierFilter);
    return items;
  }, [stories, statusFilter, categoryFilter, tierFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setStatusFilter(value);
    if (key === "category") setCategoryFilter(value);
    if (key === "tier") setTierFilter(value);
    setPage(1);
  };

  const columns = [
    {
      key: "headline",
      header: "Headline",
      width: "30%",
      render: (item: StoryRow) => (
        <span className="font-display text-[14px] font-semibold text-black">
          {item.headline}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: StoryRow) => (
        <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
          {item.status}
        </StatusBadge>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      render: (item: StoryRow) => {
        if (item.tier === null || item.tier === undefined) {
          return <span className="text-[13px] text-[#6b7280]">—</span>;
        }
        const tierInfo = tierLabelMap[String(item.tier)];
        return tierInfo ? (
          <StatusBadge variant={tierInfo.variant}>
            {tierInfo.label}
          </StatusBadge>
        ) : (
          <StatusBadge variant="gray">{item.tier}</StatusBadge>
        );
      },
    },
    {
      key: "score",
      header: "Score",
      render: (item: StoryRow) => (
        <span className="text-[13px]">{item.score ?? "—"}</span>
      ),
    },
    {
      key: "source_name",
      header: "Source",
      render: (item: StoryRow) => (
        <span className="text-[13px]">{item.source_name ?? "—"}</span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item: StoryRow) => (
        <span className="text-[13px]">{item.categories?.name ?? "—"}</span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (item: StoryRow) => (
        <span className="text-[12px] text-[#6b7280]">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const renderActions = (item: StoryRow) => {
    if (item.status === "new" || item.status === "used") {
      return null;
    }
    return (
      <button
        onClick={() => handleActivate(item.id)}
        disabled={activating === item.id}
        className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-50"
      >
        {activating === item.id ? "Resetting..." : "Reset to New"}
      </button>
    );
  };

  const workflowSteps = [
    { label: "Pipeline", status: "current" as const },
    { label: "Publishing Queue", status: "future" as const },
    { label: "Published", status: "future" as const },
  ];

  return (
    <>
      <PortalTopbar
        title="Pipeline — Story Bank"
        actions={
          <Link
            href="/admin/pipeline/new"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
          >
            + Add Story
          </Link>
        }
      />
      <div className="p-8 space-y-4">
        <WorkflowBanner steps={workflowSteps} />

        <StatGrid columns={4}>
          <StatCard label="New (Unscored)" value={newCount} />
          <StatCard label="Assigned" value={assignedCount} />
          <StatCard label="Banked" value={bankedCount} />
          <StatCard label="Used" value={usedCount} />
        </StatGrid>

        <FilterBar
          filters={[
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "new", label: "New" },
                { value: "scored", label: "Scored" },
                { value: "assigned_blog", label: "Assigned Blog" },
                { value: "assigned_script", label: "Assigned Script" },
                { value: "assigned_dual", label: "Assigned Dual" },
                { value: "assigned_social", label: "Assigned Social" },
                { value: "draft_script", label: "Draft Script" },
                { value: "draft_social", label: "Draft Social" },
                { value: "banked", label: "Banked" },
                { value: "skipped", label: "Skipped" },
                { value: "used", label: "Used" },
                { value: "discarded", label: "Discarded" },
              ],
            },
            {
              key: "tier",
              label: "All Tiers",
              value: tierFilter,
              options: [
                { value: "blog", label: "Blog" },
                { value: "script", label: "Script" },
                { value: "social", label: "Social" },
                { value: "1", label: "Tier 1" },
                { value: "2", label: "Tier 2" },
                { value: "3", label: "Tier 3" },
              ],
            },
            {
              key: "category",
              label: "All Categories",
              value: categoryFilter,
              options: categories.map((c) => ({ value: c.id, label: c.name })),
            },
          ]}
          onFilterChange={handleFilterChange}
        />

        <AdminDataTable
          columns={columns}
          data={paginated}
          actions={(item) => renderActions(item)}
          emptyMessage="No stories found."
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}
