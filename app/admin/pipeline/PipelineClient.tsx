"use client";

import { useState, useMemo } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { WorkflowBanner } from "@/components/portal/WorkflowBanner";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { Pagination } from "@/components/portal/Pagination";

interface StoryRow {
  id: string;
  headline: string;
  source_name: string | null;
  status: string;
  score: number | null;
  tier: number | null;
  category_id: string | null;
  created_at: string;
  categories: { name: string } | null;
}

interface PipelineClientProps {
  stories: StoryRow[];
  categories: { id: string; name: string }[];
}

const ITEMS_PER_PAGE = 25;

const statusBadgeMap: Record<string, "yellow" | "blue" | "gray" | "green" | "red"> = {
  new: "yellow",
  scored: "blue",
  banked: "gray",
  used: "green",
  expired: "red",
};

const tierBadgeMap: Record<number, "green" | "blue" | "gold"> = {
  1: "green",
  2: "blue",
  3: "gold",
};

export function PipelineClient({ stories, categories }: PipelineClientProps) {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [page, setPage] = useState(1);

  // Stats
  const newCount = stories.filter((s) => s.status === "new").length;
  const scoredCount = stories.filter((s) => s.status === "scored").length;
  const bankedCount = stories.filter((s) => s.status === "banked").length;
  const usedCount = stories.filter((s) => s.status === "used").length;

  // Filter
  const filtered = useMemo(() => {
    let items = stories;
    if (statusFilter) items = items.filter((s) => s.status === statusFilter);
    if (categoryFilter) items = items.filter((s) => s.category_id === categoryFilter);
    if (tierFilter) items = items.filter((s) => s.tier === Number(tierFilter));
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
      render: (item: StoryRow) => (
        item.tier !== null ? (
          <StatusBadge variant={tierBadgeMap[item.tier] ?? "gray"}>
            Tier {item.tier}
          </StatusBadge>
        ) : (
          <span className="text-[13px] text-[#6b7280]">—</span>
        )
      ),
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
    if (item.status === "new") {
      return (
        <button
          onClick={() => console.log("Score story:", item.id)}
          className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
        >
          Score
        </button>
      );
    }
    if (item.status === "scored") {
      return (
        <button
          onClick={() => console.log("Activate story:", item.id)}
          className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
        >
          Activate
        </button>
      );
    }
    if (item.status === "banked") {
      return (
        <button
          onClick={() => console.log("Activate banked story:", item.id)}
          className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
        >
          Activate
        </button>
      );
    }
    if (item.status === "used") {
      return (
        <span
          className="text-[#c1121f] text-xs font-semibold hover:underline cursor-pointer"
          onClick={() => console.log("View linked content:", item.id)}
        >
          View Content
        </span>
      );
    }
    return null;
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
          <span className="text-[12px] text-[#6b7280]">
            Scored stories from RSS intake · Activate to send to publishing
          </span>
        }
      />
      <div className="p-8 max-[899px]:pt-16 space-y-4">
        <WorkflowBanner steps={workflowSteps} />

        <StatGrid columns={4}>
          <StatCard label="New (Unscored)" value={newCount} />
          <StatCard label="Scored" value={scoredCount} />
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
                { value: "banked", label: "Banked" },
                { value: "used", label: "Used" },
                { value: "expired", label: "Expired" },
              ],
            },
            {
              key: "tier",
              label: "All Tiers",
              value: tierFilter,
              options: [
                { value: "1", label: "Tier 1 — Blog + Video" },
                { value: "2", label: "Tier 2 — Blog Only" },
                { value: "3", label: "Tier 3 — Social Only" },
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
