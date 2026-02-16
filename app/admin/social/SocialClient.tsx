"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { Pagination } from "@/components/portal/Pagination";

interface ScriptRow {
  id: string;
  title: string;
  story_id: string | null;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  script_batches: { batch_name: string | null } | null;
  stories: { headline: string; tier: string | null } | null;
}

interface SocialStory {
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

interface SocialClientProps {
  scripts: ScriptRow[];
  socialStories: SocialStory[];
  captionPreviews: { story_id: string; caption: string | null }[];
}

type SocialItem =
  | { kind: "script"; data: ScriptRow }
  | { kind: "story"; data: SocialStory };

const ITEMS_PER_PAGE = 15;

export function SocialClient({ scripts, socialStories, captionPreviews }: SocialClientProps) {
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  // Build caption preview map by story_id
  const captionMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cap of captionPreviews) {
      if (cap.story_id && cap.caption) {
        map.set(cap.story_id, cap.caption.slice(0, 100));
      }
    }
    return map;
  }, [captionPreviews]);

  const allItems: SocialItem[] = useMemo(() => {
    const items: SocialItem[] = [];
    scripts.forEach((s) => items.push({ kind: "script", data: s }));
    socialStories.forEach((s) => items.push({ kind: "story", data: s }));
    return items;
  }, [scripts, socialStories]);

  const filtered = useMemo(() => {
    let items = allItems;
    if (typeFilter === "script") items = items.filter((i) => i.kind === "script");
    if (typeFilter === "story") items = items.filter((i) => i.kind === "story");
    return items;
  }, [allItems, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "type") setTypeFilter(value);
    setPage(1);
  };

  const approvedScriptsCount = scripts.filter(s => s.status === "approved").length;

  return (
    <>
      <PortalTopbar
        title="Social Queue"
        actions={
          <span className="text-[12px] text-[#6b7280]">
            Approved scripts and social-tier stories ready for distribution
          </span>
        }
      />
      <div className="p-8 space-y-4">
        <StatGrid columns={3}>
          <StatCard
            label="Approved Scripts"
            value={approvedScriptsCount}
            badge={approvedScriptsCount > 0 ? { text: "Ready", variant: "green" } : undefined}
          />
          <StatCard
            label="Social-Tier Stories"
            value={socialStories.length}
            badge={socialStories.length > 0 ? { text: "Social", variant: "gold" } : undefined}
          />
          <StatCard label="Total Queue" value={allItems.length} />
        </StatGrid>

        <FilterBar
          filters={[
            {
              key: "type",
              label: "All Types",
              value: typeFilter,
              options: [
                { value: "script", label: "Scripts" },
                { value: "story", label: "Social-Tier Stories" },
              ],
            },
          ]}
          onFilterChange={handleFilterChange}
        />

        {/* Cards */}
        <div className="space-y-3">
          {paginated.length === 0 && (
            <div className="bg-white border border-[#e5e5e5] p-8 text-center">
              <p className="text-[13px] text-[#6b7280]">No items in the social queue.</p>
            </div>
          )}
          {paginated.map((item) => {
            if (item.kind === "script") {
              const script = item.data;
              const preview = script.story_id ? captionMap.get(script.story_id) : null;
              return (
                <div key={`script-${script.id}`} className="bg-white border border-[#e5e5e5] border-l-4 border-l-[#16a34a]">
                  <div className="px-5 py-4">
                    {/* Row 1: Title + Distribute */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-[16px] font-semibold text-black">
                        {script.title}
                      </h3>
                      <Link
                        href={`/admin/social/distribute/${script.id}`}
                        className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors flex-shrink-0"
                      >
                        Distribute
                      </Link>
                    </div>
                    {/* Row 2: Badge + batch + status */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <StatusBadge variant="green">Script / Video</StatusBadge>
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
                      <StatusBadge variant={script.status === "approved" ? "green" : "blue"}>
                        {script.status}
                      </StatusBadge>
                    </div>
                    {/* Row 3: Caption preview */}
                    {script.stories?.headline && (
                      <p className="text-[12px] text-[#6b7280] mt-2">
                        Story: {script.stories.headline}
                      </p>
                    )}
                    {preview && (
                      <p className="text-[12px] text-[#6b7280] mt-1 italic line-clamp-2">
                        {preview}{preview.length >= 100 ? "..." : ""}
                      </p>
                    )}
                  </div>
                </div>
              );
            }

            const story = item.data;
            return (
              <div key={`story-${story.id}`} className="bg-white border border-[#e5e5e5] border-l-4 border-l-[#f59e0b]">
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-[16px] font-semibold text-black">
                      {story.headline}
                    </h3>
                    <StatusBadge variant="gold">Social Post</StatusBadge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {story.source_name && (
                      <span className="text-[11px] text-[#6b7280]">Source: {story.source_name}</span>
                    )}
                    {story.categories?.name && (
                      <span className="text-[11px] text-[#6b7280]">{story.categories.name}</span>
                    )}
                    {story.score !== null && (
                      <span className="text-[11px] text-[#6b7280]">Score: {story.score}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => console.log("Create script for story:", story.id)}
                      className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                    >
                      Generate Script
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
