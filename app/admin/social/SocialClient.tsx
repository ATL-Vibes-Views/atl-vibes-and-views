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
  stories: { headline: string; tier: number | null } | null;
}

interface SocialStory {
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

interface SocialClientProps {
  scripts: ScriptRow[];
  socialStories: SocialStory[];
}

type SocialItem =
  | { kind: "script"; data: ScriptRow }
  | { kind: "story"; data: SocialStory };

const ITEMS_PER_PAGE = 15;

export function SocialClient({ scripts, socialStories }: SocialClientProps) {
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

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

  return (
    <>
      <PortalTopbar
        title="Social Queue"
        actions={
          <span className="text-[12px] text-[#6b7280]">
            Approved scripts and tier-3 stories ready for social distribution
          </span>
        }
      />
      <div className="p-8 max-[899px]:pt-16 space-y-4">
        <StatGrid columns={3}>
          <StatCard
            label="Approved Scripts"
            value={scripts.length}
            badge={scripts.length > 0 ? { text: "Ready", variant: "green" } : undefined}
          />
          <StatCard
            label="Tier-3 Stories"
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
                { value: "story", label: "Tier-3 Stories" },
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
              return (
                <div key={`script-${script.id}`} className="bg-white border border-[#e5e5e5] border-l-4 border-l-[#16a34a]">
                  <div className="px-5 py-4">
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
                      <StatusBadge variant="green">Script</StatusBadge>
                    </div>
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
                    <div className="flex items-center gap-2 mt-3">
                      <Link
                        href={`/admin/social/distribute/${script.id}`}
                        className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                      >
                        Distribute
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }

            const story = item.data;
            return (
              <div key={`story-${story.id}`} className="bg-white border border-[#e5e5e5] border-l-4 border-l-[#f59e0b]">
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-[16px] font-semibold text-black">
                        {story.headline}
                      </h3>
                      {story.source_name && (
                        <p className="text-[12px] text-[#6b7280] mt-0.5">
                          Source: {story.source_name}
                        </p>
                      )}
                    </div>
                    <StatusBadge variant="gold">Tier 3</StatusBadge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
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
