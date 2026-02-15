"use client";

import { useState, useMemo, useCallback } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { Modal } from "@/components/portal/Modal";
import { Pagination } from "@/components/portal/Pagination";
import { createBrowserClient } from "@/lib/supabase";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  counts: { pending: number; approved: number; published: number };
}

const ITEMS_PER_PAGE = 10;

const statusBadgeMap: Record<string, "yellow" | "green" | "red" | "blue" | "gray"> = {
  pending: "yellow",
  draft: "gray",
};

const PLATFORM_ORDER = ["youtube", "instagram", "tiktok", "linkedin", "facebook", "x"];

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  x: "X (Twitter)",
};

export function ScriptsClient({ filmingScripts, captions, batches, counts }: ScriptsClientProps) {
  const [scripts, setScripts] = useState(filmingScripts);
  const [batchFilter, setBatchFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expandedCaptions, setExpandedCaptions] = useState<Set<string>>(new Set());
  const [editModal, setEditModal] = useState<FilmingScript | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  // Group captions by story_id using Map
  const captionsByStory = useMemo(() => {
    const map = new Map<string, CaptionRow[]>();
    for (const cap of captions) {
      if (!cap.story_id) continue;
      const arr = map.get(cap.story_id) || [];
      arr.push(cap);
      map.set(cap.story_id, arr);
    }
    return map;
  }, [captions]);

  const filtered = useMemo(() => {
    let items = scripts;
    if (batchFilter) items = items.filter((s) => s.script_batch_id === batchFilter);
    return items;
  }, [scripts, batchFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "batch") setBatchFilter(value);
    setPage(1);
  };

  const toggleCaptions = (id: string) => {
    setExpandedCaptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApprove = useCallback(async (script: FilmingScript) => {
    setApproving(script.id);
    try {
      const supabase = createBrowserClient();

      // Update this script's status to approved
      const { error: scriptErr } = await supabase
        .from("scripts")
        .update({ status: "approved" } as never)
        .eq("id", script.id);

      if (scriptErr) {
        console.error("Failed to approve script:", scriptErr);
        setApproving(null);
        return;
      }

      // Also approve all caption rows for the same story
      if (script.story_id) {
        const { error: captionErr } = await supabase
          .from("scripts")
          .update({ status: "approved" } as never)
          .eq("story_id", script.story_id);

        if (captionErr) {
          console.error("Failed to approve captions:", captionErr);
        }
      }

      // Remove from local list — approved scripts belong in Social Queue now
      setScripts((prev) => prev.filter((s) => s.id !== script.id));
    } finally {
      setApproving(null);
    }
  }, []);

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
            value={counts.pending}
            badge={counts.pending > 0 ? { text: "Review", variant: "yellow" } : undefined}
          />
          <StatCard
            label="Approved"
            value={counts.approved}
            badge={counts.approved > 0 ? { text: "Ready", variant: "green" } : undefined}
          />
          <StatCard label="Published" value={counts.published} />
        </StatGrid>

        <FilterBar
          filters={[
            {
              key: "batch",
              label: "All Batches",
              value: batchFilter,
              options: batches.map((b) => ({ value: b.id, label: b.batch_name })),
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
            const scriptCaptions = captionsByStory.get(script.story_id ?? "") || [];
            const sortedCaptions = [...scriptCaptions].sort(
              (a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform)
            );
            const isExpanded = expandedCaptions.has(script.id);
            const borderColor = "border-l-[#f59e0b]";

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
                    <span className="text-[11px] text-[#6b7280]">
                      Captions: {sortedCaptions.length}/6
                    </span>
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

                  {/* Actions — NO Distribute button */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => toggleCaptions(script.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      View Captions
                    </button>
                    <button
                      onClick={() => setEditModal(script)}
                      className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => console.log("Scripts: Reject script", script.id)}
                      className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#c1121f] text-[#c1121f] hover:bg-[#fee2e2] transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(script)}
                      disabled={approving === script.id}
                      className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-50"
                    >
                      {approving === script.id ? "Approving..." : "Approve"}
                    </button>
                  </div>

                  {/* Expanded captions section */}
                  {isExpanded && (
                    <div className="mt-4 border-t border-[#e5e5e5] pt-4">
                      <span className="text-[12px] font-semibold text-[#374151]">
                        Platform Captions ({sortedCaptions.length}/6)
                      </span>
                      {sortedCaptions.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
                          {sortedCaptions.map((cap) => (
                            <div key={cap.id} className="bg-[#fafafa] border border-[#e5e5e5] p-3">
                              <span className="text-[11px] font-semibold text-[#374151]">
                                {PLATFORM_LABELS[cap.platform] ?? cap.platform}
                              </span>
                              {cap.caption ? (
                                <p className="text-[12px] text-[#6b7280] mt-1 line-clamp-2">
                                  {cap.caption}
                                </p>
                              ) : (
                                <p className="text-[12px] text-[#9ca3af] mt-1 italic">
                                  Awaiting generation
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#9ca3af] mt-2 italic">
                          Awaiting caption generation.
                        </p>
                      )}
                    </div>
                  )}
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

      {/* Edit Script Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit Script"
        footer={
          <>
            <button
              onClick={() => setEditModal(null)}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log("Scripts: Save edit for script", editModal?.id);
                setEditModal(null);
              }}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors"
            >
              Save
            </button>
          </>
        }
      >
        {editModal && (
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">Title</label>
              <p className="text-[14px] font-display font-semibold text-black">{editModal.title}</p>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">Filming Script</label>
              <textarea
                readOnly
                className="w-full h-[200px] p-3 text-[13px] border border-[#e5e5e5] bg-[#f5f5f5] text-[#374151] font-body resize-vertical"
                defaultValue={editModal.script_text ?? ""}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
