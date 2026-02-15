"use client";

import { useMemo } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { WorkflowBanner } from "@/components/portal/WorkflowBanner";

/* ============================================================
   AUTOMATION — Pipeline status, batches, story flow
   ============================================================ */

interface AutomationStats {
  newStories: number;
  scoredStories: number;
  inProgressStories: number;
  usedStories: number;
  draftScripts: number;
  approvedScripts: number;
  totalBatches: number;
  calendarEntries: number;
}

interface BatchRow {
  id: string;
  week_of: string;
  batch_name: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface StoryRow {
  id: string;
  headline: string;
  status: string;
  score: number | null;
  tier: string | null;
  created_at: string;
}

interface AutomationClientProps {
  stats: AutomationStats;
  batches: BatchRow[];
  recentStories: StoryRow[];
}

const storyStatusMap: Record<string, "green" | "gold" | "blue" | "gray" | "purple" | "orange"> = {
  new: "blue",
  scored: "gold",
  in_progress: "orange",
  used: "green",
  banked: "purple",
  expired: "gray",
};

const batchStatusMap: Record<string, "green" | "gold" | "gray" | "blue"> = {
  complete: "green",
  in_progress: "blue",
  draft: "gray",
  pending: "gold",
};

export function AutomationClient({ stats, batches, recentStories }: AutomationClientProps) {
  const workflowSteps = useMemo(
    () => [
      { label: `New (${stats.newStories})`, status: stats.newStories > 0 ? "current" as const : "future" as const },
      { label: `Scored (${stats.scoredStories})`, status: stats.scoredStories > 0 ? "current" as const : "future" as const },
      { label: `In Progress (${stats.inProgressStories})`, status: stats.inProgressStories > 0 ? "current" as const : "future" as const },
      { label: `Used (${stats.usedStories})`, status: "done" as const },
    ],
    [stats]
  );

  return (
    <>
      <PortalTopbar title="Automation" />
      <div className="p-8 max-[899px]:pt-16 space-y-6">
        <StatGrid columns={4}>
          <StatCard
            label="New Stories"
            value={stats.newStories}
            badge={stats.newStories > 0 ? { text: "Triage", variant: "blue" } : undefined}
          />
          <StatCard label="Draft Scripts" value={stats.draftScripts} />
          <StatCard label="Approved Scripts" value={stats.approvedScripts} />
          <StatCard label="Calendar Entries" value={stats.calendarEntries} />
        </StatGrid>

        {/* Pipeline Workflow */}
        <div>
          <h2 className="font-display text-[18px] font-semibold text-black mb-3">
            Story Pipeline
          </h2>
          <WorkflowBanner steps={workflowSteps} />
        </div>

        {/* Two-column: Batches + Stories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="font-display text-[18px] font-semibold text-black mb-3">
              Script Batches
            </h2>
            <AdminDataTable
              columns={[
                {
                  key: "week_of",
                  header: "Week",
                  render: (item: BatchRow) => (
                    <span className="text-[13px] font-semibold text-black">
                      {new Date(item.week_of).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  ),
                },
                {
                  key: "batch_name",
                  header: "Name",
                  render: (item: BatchRow) => (
                    <span className="text-[13px] text-[#374151]">{item.batch_name ?? "—"}</span>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (item: BatchRow) => (
                    <StatusBadge variant={batchStatusMap[item.status] ?? "gray"}>
                      {item.status}
                    </StatusBadge>
                  ),
                },
              ]}
              data={batches}
              emptyMessage="No script batches."
            />
          </div>

          <div>
            <h2 className="font-display text-[18px] font-semibold text-black mb-3">
              Recent Stories
            </h2>
            <AdminDataTable
              columns={[
                {
                  key: "headline",
                  header: "Headline",
                  width: "50%",
                  render: (item: StoryRow) => (
                    <span className="text-[13px] text-black line-clamp-1">{item.headline}</span>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (item: StoryRow) => (
                    <StatusBadge variant={storyStatusMap[item.status] ?? "gray"}>
                      {item.status}
                    </StatusBadge>
                  ),
                },
                {
                  key: "score",
                  header: "Score",
                  render: (item: StoryRow) => (
                    <span className="text-[13px] text-[#374151]">{item.score ?? "—"}</span>
                  ),
                },
              ]}
              data={recentStories}
              emptyMessage="No stories yet."
            />
          </div>
        </div>
      </div>
    </>
  );
}
