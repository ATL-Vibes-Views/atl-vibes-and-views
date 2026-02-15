"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { Pagination } from "@/components/portal/Pagination";

interface FilmingScript {
  id: string;
  title: string;
  script_text: string | null;
  script_batch_id: string | null;
  story_id: string | null;
  platform: string;
  format: string;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  script_batches: { batch_name: string | null } | null;
  stories: { headline: string } | null;
}

interface CaptionRow {
  id: string;
  story_id: string | null;
  platform: string;
  caption: string | null;
  description: string | null;
  tags: string | null;
  hashtags: string | null;
  status: string;
}

interface ScriptsClientProps {
  filmingScripts: FilmingScript[];
  captions: CaptionRow[];
  batches: { id: string; batch_name: string }[];
}

const ITEMS_PER_PAGE = 10;

const statusBadgeMap: Record<string, "yellow" | "green" | "red" | "blue" | "gray"> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
  published: "blue",
  draft: "gray",
};

const PLATFORM_ORDER = ["youtube", "instagram", "tiktok", "linkedin", "facebook", "x"];

export function ScriptsClient({ filmingScripts, captions, batches }: ScriptsClientProps) {
  const [statusFilter, setStatusFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [page, setPage] = useState(1);

  // Group captions by story_id
  const captionsByStory = useMemo(() => {
    const map: Record<string, CaptionRow[]> = {};
    captions.forEach((c) => {
      if (c.story_id) {
        if (!map[c.story_id]) map[c.story_id] = [];
        map[c.story_id].push(c);
      }
    });
    return map;
  }, [captions]);

  // Stats
  const pendingCount = filmingScripts.filter((s) => s.status === "pending").length;
  const approvedCount = filmingScripts.filter((s) => s.status === "approved").length;
  const publishedCount = filmingScripts.filter((s) => s.status === "published").length;

  const filtered = useMemo(() => {
    let items = filmingScripts;
    if (statusFilter) items = items.filter((s) => s.status === statusFilter);
    if (batchFilter) items = items.filter((s) => s.script_batch_id === batchFilter);
    return items;
  }, [filmingScripts, statusFilter, batchFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setStatusFilter(value);
    if (key === "batch") setBatchFilter(value);
    setPage(1);
  };

  return (
    <>
      <PortalTopbar
        title="Scripts"
        actions={
          <span className="text-[12px] text-[#6b7280]">
            Filming scripts and platform captions — delivered every Friday
          </span>
        }
      />
      <div className="p-8 max-[899px]:pt-16 space-y-4">
        <StatGrid columns={3}>
          <StatCard
            label="Pending Review"
            value={pendingCount}
            badge={pendingCount > 0 ? { text: "Review", variant: "yellow" } : undefined}
          />
          <StatCard
            label="Approved"
            value={approvedCount}
            badge={approvedCount > 0 ? { text: "Ready", variant: "green" } : undefined}
          />
          <StatCard label="Published" value={publishedCount} />
        </StatGrid>

        <FilterBar
          filters={[
            {
              key: "batch",
              label: "All Batches",
              value: batchFilter,
              options: batches.map((b) => ({ value: b.id, label: b.batch_name })),
            },
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "published", label: "Published" },
              ],
            },
          ]}
          onFilterChange={handleFilterChange}
        />

        {/* Script Cards */}
        <div className="space-y-4">
          {paginated.length === 0 && (
            <div className="bg-white border border-[#e5e5e5] p-8 text-center">
              <p className="text-[13px] text-[#6b7280]">No scripts found.</p>
            </div>
          )}
          {paginated.map((script) => {
            const storyCaptions = script.story_id ? captionsByStory[script.story_id] ?? [] : [];
            const sortedCaptions = [...storyCaptions].sort(
              (a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform)
            );
            const hasAnyCaptions = sortedCaptions.some((c) => c.caption !== null);
            const borderColor =
              script.status === "pending"
                ? "border-l-[#f59e0b]"
                : script.status === "approved"
                  ? "border-l-[#16a34a]"
                  : script.status === "rejected"
                    ? "border-l-[#c1121f]"
                    : "border-l-[#e5e5e5]";

            return (
              <div key={script.id} className={`bg-white border border-[#e5e5e5] border-l-4 ${borderColor}`}>
                <div className="px-5 py-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-[16px] font-semibold text-black">
                        {script.title}
                      </h3>
                      {script.stories?.headline && (
                        <p className="text-[12px] text-[#6b7280] mt-0.5">
                          Story: {script.stories.headline}
                        </p>
                      )}
                    </div>
                    <StatusBadge variant={statusBadgeMap[script.status] ?? "gray"}>
                      {script.status}
                    </StatusBadge>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {script.script_batches?.batch_name && (
                      <span className="text-[11px] text-[#6b7280]">
                        Batch: {script.script_batches.batch_name}
                      </span>
                    )}
                    {script.scheduled_date && (
                      <span className="text-[11px] text-[#6b7280]">
                        Scheduled: {new Date(script.scheduled_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Script text preview */}
                  {script.script_text && (
                    <div className="mt-3 bg-[#f5f5f5] border border-[#e5e5e5] p-3">
                      <span className="text-[11px] font-semibold text-[#6b7280]">Filming Script</span>
                      <p className="text-[12px] text-[#374151] mt-1 line-clamp-3">
                        {script.script_text}
                      </p>
                    </div>
                  )}

                  {/* Captions preview — real data from caption column */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-[#6b7280]">
                      Platform Captions ({sortedCaptions.length}/6)
                    </span>
                    {sortedCaptions.length > 0 ? (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-1.5">
                        {sortedCaptions.map((cap) => (
                          <div
                            key={cap.id}
                            className="bg-[#fafafa] border border-[#e5e5e5] p-2"
                          >
                            <span className="text-[10px] font-semibold text-[#374151] uppercase">
                              {cap.platform}
                            </span>
                            <p className="text-[11px] text-[#6b7280] mt-0.5 line-clamp-2">
                              {cap.caption ?? "Awaiting caption generation."}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#9ca3af] mt-1">
                        Awaiting caption generation.
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    {script.status === "pending" && (
                      <>
                        <button
                          onClick={() => console.log("Approve script:", script.id)}
                          className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => console.log("Reject script:", script.id)}
                          className="text-xs font-semibold text-[#c1121f] hover:text-[#a10e1a] transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {script.story_id && (
                      <Link
                        href={`/admin/social/distribute/${script.id}`}
                        className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
                      >
                        Distribute
                      </Link>
                    )}
                    <button
                      onClick={() => console.log("View full script:", script.id)}
                      className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
